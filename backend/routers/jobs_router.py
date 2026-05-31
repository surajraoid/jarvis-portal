"""
jobs_router.py — Job Hunter API endpoints.

Routes:
  GET  /api/jobs              — Live job listings (RemoteOK + Jobicy, filtered by keywords)
  GET  /api/jobs/vetted       — Vetted platforms (Turing, Arc, Toptal, X-Team)
  POST /api/jobs/cover-letter — AI-powered cover letter generator
"""

from __future__ import annotations

import logging
import os
from typing import Optional

from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel

from services.jobhunter_service import get_all_jobs, VETTED_PLATFORMS

logger = logging.getLogger("jarvis.jobs")

router = APIRouter(prefix="/api/jobs", tags=["Job Hunter"])

# ── Models ────────────────────────────────────────────────────────────────────

class CoverLetterRequest(BaseModel):
    job_title: str
    company: str
    job_description: str
    your_skills: list[str] = ["Python", "React", "Node.js", "FastAPI"]
    years_experience: int = 3

# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("")
async def get_jobs(
    keywords: Optional[str] = Query(None, description="Comma-separated keywords e.g. python,react"),
    source: Optional[str] = Query(None, description="remoteok|jobicy|all"),
):
    """Fetch live remote job listings for full stack / backend engineers."""
    kw_list = [k.strip() for k in keywords.split(",")] if keywords else None
    data = await get_all_jobs(kw_list)

    if source == "remoteok":
        data["live_jobs"] = [j for j in data["live_jobs"] if j.get("source") == "RemoteOK"]
    elif source == "jobicy":
        data["live_jobs"] = [j for j in data["live_jobs"] if j.get("source") == "Jobicy"]

    return data


@router.get("/vetted")
async def get_vetted_platforms():
    """Return the curated list of vetted talent platforms with full application guides."""
    return {
        "platforms": VETTED_PLATFORMS,
        "why_vetted": (
            "These platforms pre-screen clients, handle contracts, and guarantee payment. "
            "Unlike Upwork/Fiverr, you get stable monthly income — not project-by-project."
        ),
        "recommendation": "Start with Turing.com (easiest to get in) or Arc.dev (best rates for strong engineers).",
    }


@router.post("/cover-letter")
async def generate_cover_letter(req: CoverLetterRequest):
    """
    Generate an AI-powered cover letter for a remote engineering job.
    Uses Claude when ANTHROPIC_API_KEY is set; falls back to a strong template.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY", "")

    if api_key:
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=api_key)
            prompt = f"""You are an expert technical recruiter and writer.
Generate a compelling, concise cover letter (250-300 words) for a software engineer applying remotely.

Job: {req.job_title} at {req.company}
Job Description: {req.job_description[:500]}
Applicant Skills: {', '.join(req.your_skills)}
Years of Experience: {req.years_experience}

Write a cover letter that:
1. Opens with a strong hook (not "I am applying for...")
2. Shows specific technical value matching the job
3. Mentions 2-3 concrete achievements or skills
4. Closes with a confident call to action
5. Is professional but not robotic

Return ONLY the cover letter text, no extra commentary."""

            message = client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=600,
                messages=[{"role": "user", "content": prompt}]
            )
            letter = message.content[0].text
            return {"cover_letter": letter, "source": "AI-generated (Claude)"}
        except Exception as e:
            logger.warning("Claude cover letter failed: %s", e)

    # Fallback — high quality template
    skills_str = ", ".join(req.your_skills[:3])
    letter = f"""Dear Hiring Team at {req.company},

Building scalable, production-ready applications is what I do best — and your {req.job_title} role is exactly the kind of challenge I thrive in.

With {req.years_experience}+ years of hands-on experience in {skills_str}, I've consistently delivered high-impact solutions that perform at scale. I've architected REST APIs handling thousands of requests per second, built React frontends that improved user engagement by 40%, and deployed containerised microservices to production with zero downtime.

What draws me to {req.company} specifically is the opportunity to work with a team that values engineering excellence and remote-first collaboration. I've worked fully remote for the past {min(req.years_experience, 3)} years and understand how to communicate clearly, ship independently, and stay aligned with distributed teams across time zones.

My core strengths align directly with what you're looking for:
• {req.your_skills[0] if len(req.your_skills) > 0 else 'Full-stack development'} — production experience with complex systems
• {req.your_skills[1] if len(req.your_skills) > 1 else 'API design'} — clean, well-documented, maintainable code
• Problem-solving — I debug fast, iterate faster

I'd love to discuss how I can contribute to your team. I'm available for an interview at your convenience and can start within 2 weeks of an offer.

Best regards,
[Your Name]
[your.email@example.com] | [LinkedIn URL] | [GitHub URL]"""

    return {"cover_letter": letter, "source": "Template-generated (add ANTHROPIC_API_KEY for AI version)"}
