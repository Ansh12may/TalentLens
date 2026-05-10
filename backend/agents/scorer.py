import os
import json

from dotenv import load_dotenv
from openai import OpenAI

from models import (
    CandidateProfile,
    JobRequirements,
    ScoredCandidate,
    DimensionScore
)

# Load environment variables
load_dotenv()

# Groq client
client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

WEIGHTS = {
    "skills_match": 0.30,
    "experience_relevance": 0.25,
    "education_certs": 0.15,
    "project_portfolio": 0.20,
    "communication_quality": 0.10
}

RUBRIC = """
SCORING RUBRIC:

1. Skills Match
2. Experience Relevance
3. Education & Certifications
4. Project / Portfolio
5. Communication Quality
"""


async def score_candidate(
    candidate: CandidateProfile,
    requirements: JobRequirements,
    jd_text: str
) -> ScoredCandidate:
    """Score candidate using Groq."""

    prompt = f"""
You are an expert HR evaluator.

Evaluate this candidate against the job requirements.

JOB REQUIREMENTS:

Title:
{requirements.title}

Domain:
{requirements.domain}

Seniority:
{requirements.seniority_level}

Required Skills:
{', '.join(requirements.required_skills)}

Preferred Skills:
{', '.join(requirements.preferred_skills)}

Minimum Experience:
{requirements.min_experience_years} years

Education:
{', '.join(requirements.education_requirements)}

Certifications:
{', '.join(requirements.certifications)}

CANDIDATE PROFILE:

Name:
{candidate.name}

Skills:
{', '.join(candidate.skills)}

Experience:
{candidate.total_experience_years} years

Work History:
{json.dumps([w.model_dump() for w in candidate.work_experience], indent=2)}

Education:
{json.dumps([e.model_dump() for e in candidate.education], indent=2)}

Certifications:
{', '.join(candidate.certifications)}

Projects:
{json.dumps(candidate.projects, indent=2)}

Summary:
{candidate.summary}

{RUBRIC}

Return ONLY valid JSON.

{{
  "skills_match": {{
    "score": 7.5,
    "justification": "Skill alignment explanation"
  }},
  "experience_relevance": {{
    "score": 8.0,
    "justification": "Experience fit explanation"
  }},
  "education_certs": {{
    "score": 6.0,
    "justification": "Education alignment explanation"
  }},
  "project_portfolio": {{
    "score": 7.0,
    "justification": "Project quality explanation"
  }},
  "communication_quality": {{
    "score": 8.0,
    "justification": "Communication explanation"
  }},
  "recommendation": "Strong Hire",
  "overall_notes": "2-3 sentence summary"
}}
"""

    try:

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.1
        )

        text = (
            response
            .choices[0]
            .message
            .content
            .strip()
        )

        # Remove markdown fences
        if text.startswith("```"):

            text = text.replace(
                "```json",
                ""
            )

            text = text.replace(
                "```",
                ""
            )

        text = text.strip()

        data = json.loads(text)

    except Exception as e:

        print(f"Scoring error: {e}")

        data = {
            d: {
                "score": 5.0,
                "justification": "Parsing failed"
            }
            for d in WEIGHTS
        }

        data["recommendation"] = "Maybe"

        data["overall_notes"] = (
            "Automated scoring encountered an error."
        )

    # Build dimension scores
    scores = {}

    total = 0.0

    for dim, weight in WEIGHTS.items():

        dim_data = data.get(
            dim,
            {
                "score": 5.0,
                "justification": "N/A"
            }
        )

        try:

            score_val = float(
                dim_data.get("score", 5.0)
            )

        except Exception:

            score_val = 5.0

        score_val = max(
            0.0,
            min(10.0, score_val)
        )

        weighted = score_val * weight

        total += weighted

        scores[dim] = DimensionScore(

            score=score_val,

            weight=weight,

            weighted_score=round(
                weighted,
                3
            ),

            justification=dim_data.get(
                "justification",
                ""
            )
        )

    # Recommendation normalization
    if total >= 8.0:

        recommendation = "Strong Hire"

    elif total >= 6.5:

        recommendation = "Hire"

    elif total >= 5.0:

        recommendation = "Maybe"

    else:

        recommendation = "No Hire"

    return ScoredCandidate(

        id=candidate.id,

        name=(
            candidate.name
            or candidate.filename
        ),

        email=candidate.email,

        filename=candidate.filename,

        source=candidate.source,

        total_score=round(total, 2),

        recommendation=recommendation,

        scores=scores,

        profile=candidate
    )