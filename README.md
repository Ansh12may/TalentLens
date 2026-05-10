# HR Resume & LinkedIn Shortlisting Agent

An AI-powered recruitment copilot that automates resume screening, semantic candidate evaluation, and intelligent shortlisting using Large Language Models (LLMs).

The system ingests:
- Job Descriptions (JDs)
- Candidate resumes (PDF/DOCX)
- LinkedIn-style profile data

and generates:
- AI-based candidate scoring
- Explainable hiring recommendations
- Ranked candidate shortlists
- Recruiter-friendly evaluation reports

Unlike traditional ATS systems that rely only on exact keyword matching, this platform performs context-aware semantic evaluation using LLM reasoning.

---

# Project Overview

Traditional Applicant Tracking Systems (ATS) primarily use keyword matching, which often rejects qualified candidates whose experience is semantically relevant but phrased differently.

This project solves that limitation using:
- AI-powered semantic evaluation
- Context-aware skill matching
- Multi-dimensional candidate scoring
- Explainable AI-generated justifications
- Automated candidate ranking

The platform acts as an AI HR copilot that assists recruiters in evaluating candidates more efficiently and consistently.

---

# Core Features

## AI-Powered JD Parsing

Extracts:
- Required skills
- Preferred skills
- Experience requirements
- Education requirements
- Certifications
- Seniority level

---

## Resume & LinkedIn Ingestion

Supports:
- PDF resumes
- DOCX resumes
- Structured LinkedIn-style profile data

Extracts:
- Skills
- Experience
- Education
- Certifications
- Projects
- Candidate summaries

---

## Semantic Candidate Evaluation

Uses LLM reasoning for:
- Semantic skill matching
- Transferable skill detection
- Domain relevance analysis
- Project relevance evaluation
- Context-aware experience scoring

Example:
- A candidate with PyTorch experience may still score well for TensorFlow-related jobs because the model understands semantic relationships within the ML ecosystem.

---

## Weighted AI Scoring

Candidates are evaluated across five dimensions:

| Dimension | Weight |
|---|---|
| Skills Match | 30% |
| Experience Relevance | 25% |
| Education & Certifications | 15% |
| Project Portfolio | 20% |
| Communication Quality | 10% |

---

## Explainable Hiring Recommendations

The system generates:
- Strong Hire
- Hire
- Maybe
- No Hire

recommendations along with detailed AI-generated justifications.

---

# Agent Architecture Diagram

```text
                           ┌────────────────────┐
                           │    Recruiter UI    │
                           │ React + Tailwind   │
                           └─────────┬──────────┘
                                     │
                                     ▼
                           ┌────────────────────┐
                           │   FastAPI Backend  │
                           └─────────┬──────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
         ▼                           ▼                           ▼

┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  JD Parser Agent │      │ Resume Parser    │      │ LinkedIn Parser  │
│ Extracts Job Req │      │ Extracts Profile │      │ Profile Importer │
└────────┬─────────┘      └────────┬─────────┘      └────────┬─────────┘
         │                         │                         │
         └─────────────────────────┼─────────────────────────┘
                                   ▼
                      ┌──────────────────────────┐
                      │ Candidate Profile Builder│
                      │ Structured Pydantic Data │
                      └────────────┬─────────────┘
                                   ▼
                      ┌──────────────────────────┐
                      │   AI Scoring Agent       │
                      │ LLM Semantic Evaluation  │
                      └────────────┬─────────────┘
                                   ▼
                      ┌──────────────────────────┐
                      │ Ranking & Recommendation │
                      │ Weighted Score Engine    │
                      └────────────┬─────────────┘
                                   ▼
                      ┌──────────────────────────┐
                      │ Reports & Dashboard      │
                      └──────────────────────────┘
