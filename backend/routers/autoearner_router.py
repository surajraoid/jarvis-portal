"""
autoearner_router.py — AutoEarner REST API endpoints.

Routes:
  POST /api/autoearner/research       Run the full 5-agent pipeline
  GET  /api/autoearner/research       Return cached research (or trigger if empty)
  GET  /api/autoearner/affiliates     Full affiliate program database
  GET  /api/autoearner/bugbounty      Bug bounty platform list
  GET  /api/autoearner/strategies     Static earning strategies (always available)
  POST /api/autoearner/income         Log an income entry
  GET  /api/autoearner/income         Get all logged income entries
"""

from __future__ import annotations

import asyncio
import logging
import time
from datetime import datetime
from typing import Any

from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel

from agents.orchestrator import run_full_pipeline
from agents.data import AFFILIATE_PROGRAMS, BUG_BOUNTY_PLATFORMS, STATIC_DAILY_STRATEGIES

logger = logging.getLogger("jarvis.autoearner")

router = APIRouter(prefix="/api/autoearner", tags=["AutoEarner"])

# ── In-memory stores ──────────────────────────────────────────────────────────
_research_cache: dict[str, Any] = {}
_research_running: bool = False
_income_log: list[dict] = []       # persists for the session


# ── Research endpoints ────────────────────────────────────────────────────────

@router.get("/research")
async def get_research():
    """Return cached research. If none exists, return placeholder."""
    if _research_cache:
        return _research_cache
    return {
        "status": "not_started",
        "message": "Click 'Run Daily Research' to start the 5-agent pipeline.",
        "ai_enabled": True,
    }


@router.post("/research")
async def start_research(background_tasks: BackgroundTasks):
    """
    Trigger the multi-agent research pipeline.
    Returns immediately; results stored in cache and retrievable via GET.
    """
    global _research_running
    if _research_running:
        return {"status": "running", "message": "Research pipeline already in progress…"}

    _research_running = True

    async def _run():
        global _research_running, _research_cache
        try:
            _research_cache["status"] = "running"
            _research_cache["started_at"] = datetime.utcnow().isoformat()
            result = await run_full_pipeline()
            result["status"] = "complete"
            _research_cache.update(result)
        except Exception as e:
            logger.error("Pipeline failed: %s", e)
            _research_cache["status"] = "error"
            _research_cache["error"] = str(e)
        finally:
            _research_running = False

    background_tasks.add_task(_run)
    return {"status": "started", "message": "5-agent pipeline launched. Poll GET /api/autoearner/research for results."}


@router.get("/status")
async def get_status():
    """Quick status check for the pipeline."""
    return {
        "running": _research_running,
        "has_results": bool(_research_cache.get("trends")),
        "agents_completed": _research_cache.get("agents_completed", 0),
        "total_agents": 5,
        "status": _research_cache.get("status", "idle"),
        "research_date": _research_cache.get("research_date"),
    }


# ── Static data endpoints ─────────────────────────────────────────────────────

@router.get("/affiliates")
async def get_affiliates(category: str = "all", tier: str = "all"):
    """Return curated affiliate programs, optionally filtered by category or tier."""
    programs = AFFILIATE_PROGRAMS
    if category != "all":
        programs = [p for p in programs if p["category"].lower() == category.lower()]
    if tier != "all":
        programs = [p for p in programs if p.get("tier", "B") == tier.upper()]
    return {
        "programs": programs,
        "total": len(programs),
        "categories": list({p["category"] for p in AFFILIATE_PROGRAMS}),
    }


@router.get("/bugbounty")
async def get_bug_bounty():
    """Return bug bounty platforms with getting-started checklists."""
    return {
        "platforms": BUG_BOUNTY_PLATFORMS,
        "intro": "Bug bounty hunting is the fastest way to earn $50-500 as a developer. As a Full Stack/Backend engineer you already understand how web apps work — that's your biggest advantage.",
        "first_week_plan": [
            "Day 1: Create HackerOne account, complete profile (30 min)",
            "Day 2: Install Burp Suite Community Edition (free) and follow 1 tutorial (2 hrs)",
            "Day 3-4: Read OWASP Top 10 vulnerabilities — focus on IDOR and XSS",
            "Day 5-7: Pick one beginner program (Shopify or GitHub). Test their API endpoints for IDOR vulnerabilities.",
            "Day 7+: Submit your first report, even if you're not 100% sure — the worst they say is 'not a bug'",
        ],
    }


@router.get("/strategies")
async def get_strategies():
    """Return all static earning strategies."""
    return {"strategies": STATIC_DAILY_STRATEGIES}


# ── Income tracker ────────────────────────────────────────────────────────────

class IncomeEntry(BaseModel):
    amount: float
    source: str          # e.g., "Affiliate - DigitalOcean", "Bug Bounty - HackerOne"
    description: str
    date: str            # ISO date


@router.post("/income")
async def log_income(entry: IncomeEntry):
    """Log an income entry."""
    record = {
        "id": len(_income_log) + 1,
        "amount": entry.amount,
        "source": entry.source,
        "description": entry.description,
        "date": entry.date,
        "logged_at": datetime.utcnow().isoformat(),
    }
    _income_log.append(record)
    total = sum(e["amount"] for e in _income_log)
    return {"record": record, "total_logged": total, "toward_50": min(100, (total / 50) * 100)}


@router.get("/income")
async def get_income():
    """Return all logged income entries with summary."""
    total = sum(e["amount"] for e in _income_log)
    today_str = datetime.utcnow().date().isoformat()
    today_total = sum(e["amount"] for e in _income_log if e["date"] == today_str)
    return {
        "entries": _income_log,
        "today_total": today_total,
        "all_time_total": total,
        "today_goal": 50.0,
        "today_progress_pct": min(100, (today_total / 50) * 100),
    }


@router.delete("/income/{entry_id}")
async def delete_income(entry_id: int):
    """Delete an income entry by ID."""
    global _income_log
    _income_log = [e for e in _income_log if e["id"] != entry_id]
    return {"deleted": entry_id}
