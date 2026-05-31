"""
content_router.py — Automated Content Creation API endpoints.

Routes:
  GET  /api/content/niches            — Live trending niches with affiliate scores
  POST /api/content/generate          — Run 5-agent pipeline (async)
  GET  /api/content/status            — Pipeline status
  GET  /api/content/results           — Latest pipeline results
  GET  /api/content/calendar          — 30-day content calendar
  POST /api/content/calendar          — Save planned content
  GET  /api/content/tips              — Daily posting tips
"""

from __future__ import annotations

import asyncio
import logging
import time
from typing import Any, Optional

from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel

from services.niche_service import get_trending_niches
from agents.content_pipeline import run_content_pipeline

logger = logging.getLogger("jarvis.content")

router = APIRouter(prefix="/api/content", tags=["Content Studio"])

# ── In-memory state ───────────────────────────────────────────────────────────

_niche_cache: dict = {}
_niche_ts: float = 0
_pipeline_state: dict = {
    "running": False,
    "agents_completed": {},  # agent_name -> "pending"|"running"|"completed"|"failed"
    "result": None,
    "started_at": None,
    "completed_at": None,
}
_content_history: list[dict] = []
_content_calendar: list[dict] = []

# ── Models ────────────────────────────────────────────────────────────────────

class CalendarEntry(BaseModel):
    date: str
    platform: str
    niche: str
    content_type: str
    status: str = "planned"
    content: Optional[dict] = None

# ── Background pipeline ───────────────────────────────────────────────────────

async def _status_callback(agent: str, status: str):
    """Update agent status during pipeline run."""
    _pipeline_state["agents_completed"][agent] = status


async def _run_pipeline_background(niche_data: dict):
    """Run pipeline in background and store results."""
    global _pipeline_state
    _pipeline_state["running"] = True
    _pipeline_state["agents_completed"] = {
        "NicheScout": "pending",
        "AudienceAnalyst": "pending",
        "ContentArchitect": "pending",
        "CopyWriter": "pending",
        "AffiliateWeaver": "pending",
    }
    _pipeline_state["started_at"] = time.time()

    try:
        result = await run_content_pipeline(niche_data, status_callback=_status_callback)
        _pipeline_state["result"] = result
        _pipeline_state["completed_at"] = time.time()

        # Add to history
        _content_history.insert(0, {
            "id": f"content_{int(time.time())}",
            "result": result,
            "timestamp": _pipeline_state["completed_at"],
        })
        if len(_content_history) > 30:
            _content_history.pop()

    except Exception as exc:
        logger.error("Pipeline background task failed: %s", exc)
    finally:
        _pipeline_state["running"] = False


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/niches")
async def get_niches():
    """
    Return trending niches scored by affiliate potential.
    Cached for 1 hour to avoid rate-limiting free APIs.
    """
    global _niche_cache, _niche_ts
    cache_ttl = 3600  # 1 hour
    if _niche_cache and (time.time() - _niche_ts) < cache_ttl:
        return _niche_cache

    data = await get_trending_niches()
    _niche_cache = data
    _niche_ts = time.time()
    return data


@router.post("/generate")
async def generate_content(background_tasks: BackgroundTasks):
    """
    Trigger the 5-agent content pipeline.
    Runs asynchronously — poll /api/content/status for progress.
    """
    if _pipeline_state["running"]:
        return {"message": "Pipeline already running", "status": "running"}

    # Get latest niches for the pipeline
    global _niche_cache, _niche_ts
    if not _niche_cache or (time.time() - _niche_ts) > 3600:
        niche_data = await get_trending_niches()
        _niche_cache = niche_data
        _niche_ts = time.time()
    else:
        niche_data = _niche_cache

    background_tasks.add_task(_run_pipeline_background, niche_data)
    return {
        "message": "Content pipeline started",
        "status": "started",
        "agents": ["NicheScout", "AudienceAnalyst", "ContentArchitect", "CopyWriter", "AffiliateWeaver"],
    }


@router.get("/status")
async def get_pipeline_status():
    """Return current pipeline status and per-agent progress."""
    elapsed = None
    if _pipeline_state["started_at"]:
        end = _pipeline_state.get("completed_at") or time.time()
        elapsed = round(end - _pipeline_state["started_at"], 1)

    return {
        "running": _pipeline_state["running"],
        "agents": _pipeline_state["agents_completed"],
        "elapsed_seconds": elapsed,
        "completed_at": _pipeline_state.get("completed_at"),
        "has_results": _pipeline_state["result"] is not None,
    }


@router.get("/results")
async def get_results():
    """Return the latest pipeline results."""
    if not _pipeline_state["result"]:
        raise HTTPException(status_code=404, detail="No content generated yet. POST /api/content/generate first.")
    return _pipeline_state["result"]


@router.get("/history")
async def get_history():
    """Return the last 30 generated content packages."""
    return {
        "history": [
            {
                "id": h["id"],
                "timestamp": h["timestamp"],
                "niche": h["result"].get("niche_scout", {}).get("selected_niche", "Unknown"),
                "platforms": list(h["result"].get("copy_writer", {}).keys()),
            }
            for h in _content_history
        ],
        "total": len(_content_history),
    }


@router.get("/history/{content_id}")
async def get_history_item(content_id: str):
    """Return a specific historical content package."""
    for h in _content_history:
        if h["id"] == content_id:
            return h["result"]
    raise HTTPException(status_code=404, detail="Content not found")


@router.get("/calendar")
async def get_calendar():
    """Return the 30-day content calendar."""
    return {"calendar": _content_calendar, "total": len(_content_calendar)}


@router.post("/calendar")
async def add_to_calendar(entry: CalendarEntry):
    """Add a planned content item to the calendar."""
    item = entry.dict()
    item["id"] = f"cal_{int(time.time())}"
    _content_calendar.append(item)
    return {"message": "Added to calendar", "id": item["id"]}


@router.delete("/calendar/{entry_id}")
async def remove_from_calendar(entry_id: str):
    """Remove a calendar entry."""
    global _content_calendar
    original_len = len(_content_calendar)
    _content_calendar = [e for e in _content_calendar if e.get("id") != entry_id]
    if len(_content_calendar) == original_len:
        raise HTTPException(status_code=404, detail="Calendar entry not found")
    return {"message": "Removed from calendar"}


@router.get("/tips")
async def get_daily_tips():
    """Return daily content creation tips and best practices."""
    return {
        "posting_schedule": {
            "monday":    {"best_platform": "LinkedIn", "time": "9 AM EST", "content_type": "Professional insight"},
            "tuesday":   {"best_platform": "Twitter",  "time": "8 AM EST", "content_type": "Thread/tips"},
            "wednesday": {"best_platform": "Instagram","time": "12 PM EST","content_type": "Carousel"},
            "thursday":  {"best_platform": "LinkedIn", "time": "9 AM EST", "content_type": "Story/case study"},
            "friday":    {"best_platform": "Twitter",  "time": "9 AM EST", "content_type": "Week roundup"},
            "saturday":  {"best_platform": "Instagram","time": "11 AM EST","content_type": "Motivational/lifestyle"},
            "sunday":    {"best_platform": "Reddit",   "time": "2 PM EST", "content_type": "Discussion/AMA"},
        },
        "affiliate_tips": [
            "Never put affiliate links in your first post of the day — build trust first",
            "Add (affiliate link) disclosure naturally in the text, not as a hashtag",
            "Share personal results: 'I use this tool and here's what happened' converts 3x better",
            "Pin your affiliate tweet as a reply to your thread — stays visible as people reshare",
            "Post your affiliate content Tuesday-Thursday — 40% higher conversion rates",
            "Instagram bio link > post affiliate links. Tools like Linktree let you manage multiple",
            "Reddit hates obvious affiliate posts — provide genuine value, mention tools as references",
        ],
        "growth_tips": [
            "Reply to EVERY comment within 2 hours — Twitter algorithm rewards this heavily",
            "Retweet your own thread after 24 hours with 'in case you missed this'",
            "Use 2-3 niche hashtags on Twitter (not 20) — quality > quantity",
            "Instagram Reels get 3x more reach than static posts — film yourself explaining the topic",
            "Cross-post LinkedIn articles to Medium with a canonical link — doubles your reach",
            "Comment on 5-10 posts from bigger accounts in your niche daily — builds visibility",
        ],
        "income_milestones": {
            "week_1_2":  "Setup complete, first posts live, first 50-100 followers",
            "month_1":   "100-500 followers, first affiliate clicks, $0-$100 earned",
            "month_2":   "500-2,000 followers, consistent clicks, $100-$500/month",
            "month_3":   "2,000-5,000 followers, 2-3 affiliate sales/week, $300-$1,500/month",
            "month_6":   "5,000-15,000 followers, daily affiliate income, $1,000-$5,000/month",
        },
    }
