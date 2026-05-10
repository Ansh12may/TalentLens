import os
import json
import re

from dotenv import load_dotenv
from openai import OpenAI

from models import JobRequirements

# Load environment variables
load_dotenv()

# Groq client
client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)


def fallback_parse_jd(jd_text: str) -> dict:
    """Simple fallback parser using regex and keywords."""

    text = jd_text.lower()

    common_skills = [
        "python",
        "java",
        "javascript",
        "typescript",
        "react",
        "node.js",
        "fastapi",
        "aws",
        "docker",
        "kubernetes",
        "sql",
        "postgresql",
        "mongodb",
        "redis",
        "machine learning",
        "tensorflow",
        "pytorch"
    ]

    found_skills = []

    for skill in common_skills:
        if skill.lower() in text:
            found_skills.append(skill)

    # Experience extraction
    exp_match = re.search(r'(\d+)\+?\s*years', text)

    min_exp = 0

    if exp_match:
        min_exp = int(exp_match.group(1))

    return {
        "title": "Software Engineer",
        "company": "",
        "required_skills": found_skills,
        "preferred_skills": [],
        "min_experience_years": min_exp,
        "max_experience_years": None,
        "education_requirements": [],
        "certifications": [],
        "responsibilities": [],
        "domain": "",
        "seniority_level": "Mid",
        "location": "",
        "summary": "Fallback JD parsing used."
    }


async def parse_job_description(
    jd_text: str
) -> JobRequirements:
    """Parse job description using Groq with fallback."""

    prompt = f"""
You are an expert HR analyst.

Parse the following Job Description and extract structured requirements.

Return ONLY valid JSON.

{{
  "title": "Job title",
  "company": "Company name if mentioned",
  "required_skills": ["skill1", "skill2"],
  "preferred_skills": ["skill1", "skill2"],
  "min_experience_years": 3,
  "max_experience_years": null,
  "education_requirements": ["Bachelor's in CS"],
  "certifications": ["AWS Certified"],
  "responsibilities": ["responsibility 1"],
  "domain": "FinTech",
  "seniority_level": "Mid",
  "location": "Remote",
  "summary": "Short summary"
}}

Job Description:
{jd_text[:3000]}
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

        text = response.choices[0].message.content.strip()

        # Remove markdown fences
        if text.startswith("```"):
            text = text.replace("```json", "")
            text = text.replace("```", "")

        text = text.strip()

        data = json.loads(text)

        return JobRequirements(**data)

    except Exception as e:

        print("\n========== GROQ ERROR ==========")
        print(str(e))
        print("================================\n")

    # Fallback parser
        fallback_data = fallback_parse_jd(jd_text)

        return JobRequirements(**fallback_data)