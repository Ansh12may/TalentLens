from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import json
import os
import tempfile
import shutil
from typing import List, Optional
import asyncio

from agents.jd_parser import parse_job_description
from agents.resume_parser import parse_resume
from agents.scorer import score_candidate
from agents.ranker import rank_candidates
from reports.html_report import generate_html_report
from models import JobRequirements, CandidateProfile, ScoredCandidate, OverrideRequest

app = FastAPI(title="HR AI Agent API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store (use Redis in production)
sessions = {}


@app.get("/health")
async def health():
    return {"status": "ok", "message": "HR AI Agent is running"}


@app.post("/api/parse-jd")
async def parse_jd(jd_text: str = Form(...), session_id: str = Form(...)):
    """Parse job description and extract structured requirements."""
    try:
        requirements = await parse_job_description(jd_text)
        existing = sessions.get(session_id, {})
        sessions[session_id] = {
            "jd_text": jd_text,
            "requirements": requirements.dict(),
            # Preserve candidates if session already had uploads
            "candidates": existing.get("candidates", []),
            "scored_candidates": existing.get("scored_candidates", [])
        }
        return {"success": True, "requirements": requirements.dict()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/upload-resumes")
async def upload_resumes(
    session_id: str = Form(...),
    files: List[UploadFile] = File(...)
):
    """Upload and parse multiple resume files."""
    if session_id not in sessions:
        raise HTTPException(status_code=400, detail="Session not found. Parse JD first.")

    session = sessions[session_id]
    parsed_candidates = []
    errors = []

    for file in files:
        try:
            content = await file.read()
            ext = os.path.splitext(file.filename)[1].lower()

            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
                tmp.write(content)
                tmp_path = tmp.name

            try:
                candidate = await parse_resume(tmp_path, file.filename, ext)
                parsed_candidates.append(candidate.dict())
            finally:
                os.unlink(tmp_path)

        except Exception as e:
            errors.append({"file": file.filename, "error": str(e)})

    existing_names = {c.get("source_file", "") for c in session["candidates"]}
    new_candidates = [c for c in parsed_candidates if c.get("source_file", "") not in existing_names]
    session["candidates"].extend(new_candidates)

    return {
        "success": True,
        "parsed": len(new_candidates),
        "duplicates_skipped": len(parsed_candidates) - len(new_candidates),
        "errors": errors,
        "candidates": new_candidates
    }


@app.post("/api/upload-linkedin")
async def upload_linkedin(
    session_id: str = Form(...),
    linkedin_data: str = Form(...)
):
    """Accept LinkedIn profile JSON data."""
    if session_id not in sessions:
        raise HTTPException(status_code=400, detail="Session not found. Parse JD first.")

    try:
        profiles = json.loads(linkedin_data)
        if isinstance(profiles, dict):
            profiles = [profiles]

        session = sessions[session_id]
        parsed_candidates = []

        for profile in profiles:
            candidate = await parse_linkedin_profile(profile)
            parsed_candidates.append(candidate.dict())

        session["candidates"].extend(parsed_candidates)

        return {
            "success": True,
            "parsed": len(parsed_candidates),
            "candidates": parsed_candidates
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/score-candidates")
async def score_candidates_endpoint(session_id: str = Form(...)):
    """Score all candidates against JD requirements."""
    if session_id not in sessions:
        raise HTTPException(status_code=400, detail="Session not found.")

    session = sessions[session_id]
    if not session.get("candidates"):
        raise HTTPException(status_code=400, detail="No candidates to score.")

    requirements = JobRequirements(**session["requirements"])

    # Preserve any existing HR overrides by keying on candidate id
    existing_overrides = {
        c["id"]: c.get("overrides", [])
        for c in session.get("scored_candidates", [])
        if c.get("overrides")
    }

    scored = []
    for candidate_data in session["candidates"]:
        candidate = CandidateProfile(**candidate_data)
        scored_candidate = await score_candidate(candidate, requirements, session["jd_text"])
        sc_dict = scored_candidate.dict()
        # Re-apply any saved overrides
        if sc_dict["id"] in existing_overrides:
            sc_dict["overrides"] = existing_overrides[sc_dict["id"]]
        scored.append(sc_dict)

    ranked = rank_candidates(scored)
    session["scored_candidates"] = ranked

    return {"success": True, "total": len(ranked), "ranked_candidates": ranked}


@app.get("/api/results/{session_id}")
async def get_results(session_id: str):
    """Get ranked results for a session."""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found.")

    session = sessions[session_id]
    return {
        "requirements": session.get("requirements"),
        "total_uploaded": len(session.get("candidates", [])),
        "ranked_candidates": session.get("scored_candidates", [])
    }


@app.post("/api/override")
async def override_score(request: OverrideRequest):
    """HR override for a candidate's score."""
    session_id = request.session_id
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found.")

    session = sessions[session_id]
    candidates = session.get("scored_candidates", [])

    for candidate in candidates:
        if candidate["id"] == request.candidate_id:
            # Log the override
            if "overrides" not in candidate:
                candidate["overrides"] = []

            candidate["overrides"].append({
                "dimension": request.dimension,
                "original_score": candidate["scores"].get(request.dimension, {}).get("score"),
                "new_score": request.new_score,
                "reason": request.reason,
                "timestamp": asyncio.get_event_loop().time()
            })

            # Apply override
            if request.dimension == "total":
                candidate["total_score"] = request.new_score
                candidate["hr_override"] = True
                candidate["override_reason"] = request.reason
            else:
                candidate["scores"][request.dimension]["score"] = request.new_score
                candidate["scores"][request.dimension]["overridden"] = True
                # Recalculate total
                weights = {
                    "skills_match": 0.30,
                    "experience_relevance": 0.25,
                    "education_certs": 0.15,
                    "project_portfolio": 0.20,
                    "communication_quality": 0.10
                }
                total = sum(
                    candidate["scores"][dim]["score"] * weights.get(dim, 0)
                    for dim in candidate["scores"]
                )
                candidate["total_score"] = round(total, 2)

            # Re-rank
            session["scored_candidates"] = rank_candidates(candidates)
            return {"success": True, "updated_candidate": candidate}

    raise HTTPException(status_code=404, detail="Candidate not found.")


@app.get("/api/report/{session_id}")
async def generate_report(session_id: str, format: str = "html"):
    """Generate downloadable report."""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found.")

    session = sessions[session_id]
    if not session.get("scored_candidates"):
        raise HTTPException(status_code=400, detail="No scored candidates.")

    if format == "html":
        report_path = generate_html_report(
            session["requirements"],
            session["scored_candidates"],
            session_id
        )
        return FileResponse(
            report_path,
            media_type="text/html",
            filename=f"shortlist_report_{session_id}.html"
        )
    elif format == "json":
        return {
            "requirements": session["requirements"],
            "candidates": session["scored_candidates"],
            "generated_at": str(asyncio.get_event_loop().time())
        }

    raise HTTPException(status_code=400, detail="Unsupported format.")


async def parse_linkedin_profile(profile: dict) -> CandidateProfile:
    """Convert LinkedIn JSON to CandidateProfile."""
    from agents.resume_parser import parse_linkedin_dict
    return await parse_linkedin_dict(profile)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
