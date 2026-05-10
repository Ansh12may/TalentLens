from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid


class JobRequirements(BaseModel):
    title: Optional[str] = ""
    company: Optional[str] = ""

    required_skills: List[str] = []
    preferred_skills: List[str] = []

    min_experience_years: int = 0
    max_experience_years: Optional[int] = None

    education_requirements: List[str] = []
    certifications: List[str] = []
    responsibilities: List[str] = []

    domain: Optional[str] = ""
    seniority_level: Optional[str] = ""
    location: Optional[str] = ""

    summary: Optional[str] = ""


class WorkExperience(BaseModel):
    company: str = ""
    title: str = ""
    duration_months: int = 0
    description: str = ""
    domain: str = ""


class Education(BaseModel):
    institution: str = ""
    degree: str = ""
    field: str = ""
    year: Optional[str] = None

class Project(BaseModel):
    name: str = ""
    description: str = ""
   


class CandidateProfile(BaseModel):

    id: str = Field(
        default_factory=lambda:
        str(uuid.uuid4())[:8]
    )

    name: str = ""

    email: str = ""

    phone: str = ""

    location: str = ""

    source: str = "resume"

    filename: str = ""

    skills: List[str] = []

    total_experience_years: Optional[float] = 0

    work_experience: List[WorkExperience] = []

    education: List[Education] = []

    certifications: List[str] = []

    projects: List[str] = []

    summary: Optional[str] = ""

    raw_text: str = ""


class DimensionScore(BaseModel):
    score: float  # 0-10
    weight: float
    weighted_score: float
    justification: str
    overridden: bool = False


class ScoredCandidate(BaseModel):
    id: str
    name: str
    email: str
    filename: str
    source: str
    total_score: float  # 0-10 weighted
    recommendation: str  # "Strong Hire", "Hire", "Maybe", "No Hire"
    scores: Dict[str, DimensionScore]
    profile: CandidateProfile
    hr_override: bool = False
    override_reason: str = ""
    overrides: List[Dict] = []
    rank: int = 0


class OverrideRequest(BaseModel):
    session_id: str
    candidate_id: str
    dimension: str  # dimension name or "total"
    new_score: float
    reason: str
