"""
jobhunter_service.py — Real Remote Job Listings for Full Stack Engineers.

Sources (all free, no API key needed):
  1. RemoteOK        — remoteok.com/api  (public JSON API, ~200 jobs/call)
  2. Jobicy          — jobicy.com feed   (public JSON API)
  3. Turing.com      — static reference  (vetted platform, stable contracts)
  4. Arc.dev         — static reference  (vetted platform, US-rate pay)

Each job is normalised to the same schema so the frontend renders all
sources identically.
"""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime
from typing import Any

import httpx

logger = logging.getLogger("jarvis.jobhunter")

HTTP_TIMEOUT = httpx.Timeout(20.0)

# Skills that define a Full Stack / Backend engineer
FULLSTACK_TAGS = {
    "react", "node", "nodejs", "javascript", "typescript", "python",
    "fastapi", "django", "flask", "express", "nextjs", "next.js",
    "vue", "angular", "backend", "frontend", "fullstack", "full-stack",
    "api", "rest", "graphql", "postgresql", "mongodb", "mysql",
    "docker", "aws", "cloud", "devops", "kubernetes",
}

# Vetted talent platforms — these pay reliably and are NOT random freelancing
VETTED_PLATFORMS = [
    {
        "id":          "turing",
        "title":       "Full Stack Engineer (US-company remote contract)",
        "company":     "Turing.com",
        "salary":      "$30–$100/hr · $4,800–$16,000/month",
        "location":    "100% Remote · Worldwide",
        "type":        "Long-term Contract",
        "tags":        ["React", "Node.js", "Python", "Full Stack"],
        "url":         "https://developers.turing.com",
        "logo":        "https://developers.turing.com/favicon.ico",
        "description": "Turing matches vetted engineers with top US companies. Pass a 1-2 hr technical screening → get placed in a 6-12 month paid engagement. Most engineers earn $4,800–$8,000/month. Payments are reliable and on time every month.",
        "why_reliable":"Turing has placed 300,000+ engineers. Once placed, you have a stable monthly income — not project-by-project like Upwork.",
        "success_rate": "65% of applicants who complete screening get placed within 30 days",
        "how_to_apply": ["Go to developers.turing.com", "Register and submit your resume", "Complete the automated coding test (Python/JS — 90 min)", "Pass live interview with a Turing engineer", "Get matched to US company"],
        "source":      "Vetted Platform",
    },
    {
        "id":          "arc",
        "title":       "Remote Software Engineer (Contract or Full-time)",
        "company":     "Arc.dev",
        "salary":      "$60–$150/hr for contracts · $80k–$180k for full-time",
        "location":    "100% Remote · Worldwide",
        "type":        "Contract & Full-time",
        "tags":        ["React", "Node.js", "TypeScript", "Python", "AWS"],
        "url":         "https://arc.dev/developer",
        "logo":        "https://arc.dev/favicon.ico",
        "description": "Arc.dev vets engineers and connects them to startups and scale-ups globally. Unlike Upwork, Arc handles client acquisition — you just pass their screening and they find you work.",
        "why_reliable":"Arc screens clients too — no chasing invoices. You get paid within 7 days of invoice submission.",
        "success_rate": "Top 8% of applicants are accepted. Once in, 80% find work within 2 weeks.",
        "how_to_apply": ["Apply at arc.dev/developer", "Complete technical assessment (algorithmic + system design)", "Video interview with Arc team", "Profile listed to vetted companies", "Companies reach out to YOU"],
        "source":      "Vetted Platform",
    },
    {
        "id":          "toptal",
        "title":       "Freelance Software Engineer (Top 3%)",
        "company":     "Toptal",
        "salary":      "$80–$200/hr",
        "location":    "100% Remote · Worldwide",
        "type":        "Freelance Contract",
        "tags":        ["Full Stack", "React", "Node.js", "Python", "System Design"],
        "url":         "https://www.toptal.com/developers/join",
        "logo":        "https://www.toptal.com/favicon.ico",
        "description": "Toptal's rigorous screening (5 steps) filters to top 3% of talent. Premium clients, highest rates. If you pass, you earn $80–$200/hr from Fortune 500 companies.",
        "why_reliable":"Toptal handles all payments — no invoice chasing. Clients are pre-paid before your engagement starts.",
        "success_rate": "Difficult screening (3–6% pass rate) but 95% of those who pass get work within 2 weeks.",
        "how_to_apply": ["Apply at toptal.com/developers/join", "English screening call (30 min)", "Technical screening: algorithms + data structures (90 min)", "Live pair-programming session", "Test project (real client, paid)"],
        "source":      "Vetted Platform",
    },
    {
        "id":          "xteam",
        "title":       "Full Stack Developer (Retainer Model)",
        "company":     "X-Team",
        "salary":      "$50–$100/hr · Stable monthly retainer",
        "location":    "100% Remote · Worldwide",
        "type":        "Long-term Retainer",
        "tags":        ["React", "Node.js", "React Native", "TypeScript"],
        "url":         "https://x-team.com/join/",
        "logo":        "https://x-team.com/favicon.ico",
        "description": "X-Team provides vetted developers to major companies (Riot Games, FOX, Kaizen) on long-term monthly retainers. Community-focused with a stipend for learning/equipment.",
        "why_reliable":"Retainer model = same paycheck every month. X-Team has been operating 15+ years with zero payment issues.",
        "success_rate": "Selective but supportive community. Most accepted developers stay 2–5 years.",
        "how_to_apply": ["Apply at x-team.com/join", "Cultural fit video (record yourself answering 3 questions)", "Technical interview + code review", "Trial project (2 weeks paid)", "Join as X-Teamer"],
        "source":      "Vetted Platform",
    },
]


def _match_score(job: dict, keywords: list[str]) -> int:
    """Return how many keywords match this job (for relevance sorting)."""
    text = " ".join([
        job.get("position", ""),
        job.get("company", ""),
        " ".join(job.get("tags", [])),
    ]).lower()
    return sum(1 for kw in keywords if kw.lower() in text)


def _normalise_remoteok(raw: dict) -> dict | None:
    """Convert RemoteOK job object to our standard schema."""
    try:
        tags = [t.strip() for t in raw.get("tags", [])]
        # Only include if matches our skill set
        tag_set = {t.lower() for t in tags}
        if not tag_set.intersection(FULLSTACK_TAGS):
            return None

        sal_min = raw.get("salary_min")
        sal_max = raw.get("salary_max")
        if sal_min and sal_max:
            salary = f"${int(sal_min):,}–${int(sal_max):,}/yr"
        elif sal_min:
            salary = f"${int(sal_min):,}+/yr"
        else:
            salary = "Not specified"

        return {
            "id":          str(raw.get("id", "")),
            "title":       raw.get("position", "Software Engineer"),
            "company":     raw.get("company", "Unknown"),
            "salary":      salary,
            "location":    raw.get("location") or "Remote",
            "type":        "Full-time / Contract",
            "tags":        tags[:8],
            "url":         raw.get("url", ""),
            "logo":        raw.get("logo", ""),
            "description": (raw.get("description") or "")[:400].strip(),
            "date":        raw.get("date", ""),
            "source":      "RemoteOK",
        }
    except Exception:
        return None


def _normalise_jobicy(raw: dict) -> dict | None:
    """Convert Jobicy job object to our standard schema."""
    try:
        tags = [raw.get("jobType", ""), raw.get("jobIndustry", "")]
        tags = [t for t in tags if t]
        title = raw.get("jobTitle", "")
        # Filter to tech roles only
        tech_keywords = {"engineer", "developer", "devops", "software", "full stack", "backend", "frontend", "python", "react", "node"}
        if not any(kw in title.lower() for kw in tech_keywords):
            return None
        return {
            "id":          str(raw.get("id", "")),
            "title":       title,
            "company":     raw.get("companyName", "Unknown"),
            "salary":      raw.get("annualSalaryMin", "") or "Not specified",
            "location":    raw.get("jobGeo", "Remote"),
            "type":        raw.get("jobType", "Full-time"),
            "tags":        tags,
            "url":         raw.get("url", ""),
            "logo":        raw.get("companyLogo", ""),
            "description": (raw.get("jobDescription") or "")[:400].strip(),
            "date":        raw.get("pubDate", ""),
            "source":      "Jobicy",
        }
    except Exception:
        return None


# ── Public API ────────────────────────────────────────────────────────────────

async def fetch_remoteok_jobs(keywords: list[str] | None = None) -> list[dict]:
    """Pull live jobs from RemoteOK public API (no key required)."""
    kw = keywords or list(FULLSTACK_TAGS)[:10]
    try:
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT, headers={"User-Agent": "Mozilla/5.0"}) as client:
            resp = await client.get("https://remoteok.com/api")
            resp.raise_for_status()
            raw_jobs = resp.json()
            if isinstance(raw_jobs, list) and raw_jobs:
                raw_jobs = raw_jobs[1:]   # First item is meta object
    except Exception as exc:
        logger.warning("RemoteOK fetch failed: %s", exc)
        return []

    jobs = []
    for raw in raw_jobs:
        job = _normalise_remoteok(raw)
        if job:
            job["relevance"] = _match_score(raw, kw)
            jobs.append(job)

    return sorted(jobs, key=lambda j: j["relevance"], reverse=True)[:60]


async def fetch_jobicy_jobs() -> list[dict]:
    """Pull live jobs from Jobicy public API (no key required)."""
    try:
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            resp = await client.get(
                "https://jobicy.com/api/v2/remote-jobs",
                params={"count": 50, "tag": "engineering", "industry": "engineering"},
            )
            resp.raise_for_status()
            data = resp.json()
            raw_jobs = data.get("jobs", [])
    except Exception as exc:
        logger.warning("Jobicy fetch failed: %s", exc)
        return []

    return [j for raw in raw_jobs if (j := _normalise_jobicy(raw))]


async def get_all_jobs(keywords: list[str] | None = None) -> dict:
    """
    Fetch jobs from all sources concurrently and return combined results.
    Always includes the vetted platforms (static but highly reliable).
    """
    live_jobs_results = await asyncio.gather(
        fetch_remoteok_jobs(keywords),
        fetch_jobicy_jobs(),
        return_exceptions=True,
    )

    live_jobs: list[dict] = []
    for result in live_jobs_results:
        if isinstance(result, list):
            live_jobs.extend(result)

    return {
        "live_jobs":        live_jobs,
        "vetted_platforms": VETTED_PLATFORMS,
        "total_live":       len(live_jobs),
        "updated_at":       datetime.utcnow().isoformat(),
        "sources":          ["RemoteOK", "Jobicy", "Vetted Platforms"],
    }
