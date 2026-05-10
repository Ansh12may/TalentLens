import os
import json

from dotenv import load_dotenv
from openai import OpenAI

from models import (
    CandidateProfile,
    WorkExperience,
    Education
)

# Load environment variables
load_dotenv()

# Groq client
client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)


def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF using pdfplumber."""

    try:

        import pdfplumber

        text = ""

        with pdfplumber.open(file_path) as pdf:

            for page in pdf.pages:

                extracted = page.extract_text()

                if extracted:
                    text += extracted + "\n"

        return text

    except Exception as e:

        return f"Error extracting PDF: {e}"


def extract_text_from_docx(file_path: str) -> str:
    """Extract text from DOCX using python-docx."""

    try:

        from docx import Document

        doc = Document(file_path)

        text = "\n".join(
            [para.text for para in doc.paragraphs]
        )

        return text

    except Exception as e:

        return f"Error extracting DOCX: {e}"


async def parse_resume(
    file_path: str,
    filename: str,
    ext: str
) -> CandidateProfile:
    """Parse resume into structured profile."""

    if ext == ".pdf":

        raw_text = extract_text_from_pdf(file_path)

    elif ext in [".docx", ".doc"]:

        raw_text = extract_text_from_docx(file_path)

    else:

        with open(
            file_path,
            "r",
            encoding="utf-8",
            errors="ignore"
        ) as f:

            raw_text = f.read()

    return await llm_parse_profile(
        raw_text,
        filename,
        "resume"
    )


async def parse_linkedin_dict(
    profile: dict
) -> CandidateProfile:
    """Parse LinkedIn profile."""

    raw_text = json.dumps(
        profile,
        indent=2
    )

    name = (
        profile.get("firstName", "")
        + " "
        + profile.get("lastName", "")
    ).strip()

    return await llm_parse_profile(
        raw_text,
        f"linkedin_{name}",
        "linkedin"
    )


async def llm_parse_profile(
    raw_text: str,
    filename: str,
    source: str
) -> CandidateProfile:
    """Use Groq Llama to parse profile."""

    prompt = f"""
You are an expert resume parser.

Extract structured information from this {'resume' if source == 'resume' else 'LinkedIn profile'}.

Return ONLY valid JSON.

{{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "+1234567890",
  "location": "City, Country",
  "skills": ["Python", "React", "AWS"],
  "total_experience_years": 5.5,
  "work_experience": [
    {{
      "company": "Company Name",
      "title": "Software Engineer",
      "duration_months": 24,
      "description": "Worked on backend APIs",
      "domain": "FinTech"
    }}
  ],
  "education": [
    {{
      "institution": "University Name",
      "degree": "Bachelor of Technology",
      "field": "Computer Science",
      "year": 2020
    }}
  ],
  "certifications": ["AWS Certified"],
  "projects": ["Project description"],
  "summary": "Short professional summary"
}}

Content:

{raw_text[:3000]}
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

        # Normalize null/string fields

        data["name"] = (
            data.get("name")
            or filename.replace(".pdf", "")
        )

        data["email"] = (
            data.get("email")
            or ""
        )

        data["phone"] = (
            data.get("phone")
            or ""
        )

        data["location"] = (
            data.get("location")
            or ""
        )

        data["summary"] = (
            data.get("summary")
            or ""
        )

        data["total_experience_years"] = (
            data.get("total_experience_years")
            or 0
        )

        # Ensure list fields exist

        data["skills"] = (
            data.get("skills")
            or []
        )

        data["certifications"] = (
            data.get("certifications")
            or []
        )

        data["projects"] = (
            data.get("projects")
            or []
        )

        data["work_experience"] = (
            data.get("work_experience")
            or []
        )

        data["education"] = (
            data.get("education")
            or []
        )

        # Normalize projects into strings

        normalized_projects = []

        for project in data.get(
            "projects",
            []
        ):

            # Already string
            if isinstance(project, str):

                normalized_projects.append(
                    project
                )

            # Convert dict -> string
            elif isinstance(project, dict):

                name = project.get(
                    "name",
                    ""
                )

                description = project.get(
                    "description",
                    ""
                )

                github = project.get(
                    "github",
                    ""
                )

                tech_stack = project.get(
                    "tech_stack",
                    ""
                )

                combined = " | ".join(
                    str(x)
                    for x in [
                        name,
                        description,
                        tech_stack,
                        github
                    ]
                    if x
                )

                normalized_projects.append(
                    combined
                )

        data["projects"] = (
            normalized_projects
        )

    except Exception as e:

        print(
            f"Resume parsing error: {e}"
        )

        # Fallback profile
        data = {

            "name": (
                filename
                .replace(".pdf", "")
                .replace(".docx", "")
            ),

            "email": "",

            "phone": "",

            "location": "",

            "skills": [],

            "total_experience_years": 0,

            "work_experience": [],

            "education": [],

            "certifications": [],

            "projects": [],

            "summary": ""
        }

    # Build nested objects safely

    work_exp = []

    for w in data.pop(
        "work_experience",
        []
    ):

        try:

            work_exp.append(
                WorkExperience(**w)
            )

        except Exception as e:

            print(
                f"Skipping invalid work experience: {e}"
            )

    education = []

    for e in data.pop(
        "education",
        []
    ):

        try:

            # Normalize year
            if isinstance(
                e.get("year"),
                str
            ):

                year_text = e["year"]

                digits = "".join(
                    c for c in year_text
                    if c.isdigit()
                )

                e["year"] = (
                    int(digits[:4])
                    if len(digits) >= 4
                    else None
                )

            education.append(
                Education(**e)
            )

        except Exception as ex:

            print(
                f"Skipping invalid education: {ex}"
            )

    profile = CandidateProfile(

        **data,

        filename=filename,

        source=source,

        raw_text=raw_text[:2000],

        work_experience=work_exp,

        education=education
    )

    return profile