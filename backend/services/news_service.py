"""
news_service.py — World news aggregation.

Primary source: NewsAPI.org (requires API key — free tier = 1,000 req/day).
Fallback:       A curated list of public RSS feeds parsed with feedparser.

Both sources return the same normalised article schema.
"""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime
from typing import Any
from concurrent.futures import ThreadPoolExecutor

import httpx
import feedparser

from config import settings

logger = logging.getLogger(__name__)
_executor = ThreadPoolExecutor(max_workers=4)

# ── RSS Feed Sources (free, no key) ──────────────────────────────────────────

RSS_SOURCES: dict[str, list[tuple[str, str]]] = {
    "business": [
        ("Reuters Business",    "https://feeds.reuters.com/reuters/businessNews"),
        ("BBC Business",        "https://feeds.bbci.co.uk/news/business/rss.xml"),
        ("CNBC",                "https://www.cnbc.com/id/10001147/device/rss/rss.html"),
    ],
    "technology": [
        ("TechCrunch",          "https://techcrunch.com/feed/"),
        ("The Verge",           "https://www.theverge.com/rss/index.xml"),
        ("Ars Technica",        "https://feeds.arstechnica.com/arstechnica/index"),
    ],
    "crypto": [
        ("CoinDesk",            "https://www.coindesk.com/arc/outboundfeeds/rss/"),
        ("CoinTelegraph",       "https://cointelegraph.com/rss"),
        ("Decrypt",             "https://decrypt.co/feed"),
    ],
    "world": [
        ("BBC World",           "https://feeds.bbci.co.uk/news/world/rss.xml"),
        ("Reuters Top News",    "https://feeds.reuters.com/reuters/topNews"),
        ("Al Jazeera",          "https://www.aljazeera.com/xml/rss/all.xml"),
    ],
}

# Simple keyword-based sentiment scoring
POSITIVE_WORDS = {"surge", "gain", "rise", "rally", "growth", "profit", "boost",
                  "record", "soar", "recover", "strong", "upgrade", "bull"}
NEGATIVE_WORDS = {"crash", "fall", "drop", "loss", "risk", "decline", "tumble",
                  "crisis", "warn", "bear", "recession", "inflation", "debt"}


def _sentiment(text: str) -> str:
    words = text.lower().split()
    pos = sum(1 for w in words if w in POSITIVE_WORDS)
    neg = sum(1 for w in words if w in NEGATIVE_WORDS)
    if pos > neg:
        return "positive"
    if neg > pos:
        return "negative"
    return "neutral"


def _parse_feed(source_name: str, url: str, category: str) -> list[dict]:
    """Parse a single RSS feed synchronously (blocking I/O)."""
    try:
        feed = feedparser.parse(url)
        articles = []
        for entry in feed.entries[:5]:          # max 5 per source
            title   = entry.get("title", "").strip()
            summary = entry.get("summary", entry.get("description", "")).strip()
            # Strip HTML tags naively
            import re
            summary = re.sub(r"<[^>]+>", " ", summary).strip()[:300]
            published = entry.get("published", "")
            link      = entry.get("link", "")
            if not title or not link:
                continue
            articles.append({
                "title":     title,
                "summary":   summary,
                "url":       link,
                "source":    source_name,
                "category":  category,
                "sentiment": _sentiment(f"{title} {summary}"),
                "published": published,
                "image":     None,
            })
        return articles
    except Exception as exc:
        logger.warning("RSS parse failed [%s]: %s", source_name, exc)
        return []


def _fetch_rss_category(category: str) -> list[dict]:
    articles = []
    for source_name, url in RSS_SOURCES.get(category, []):
        articles.extend(_parse_feed(source_name, url, category))
    return articles


async def _fetch_rss_all() -> dict[str, list[dict]]:
    loop = asyncio.get_event_loop()
    tasks = {
        cat: loop.run_in_executor(_executor, _fetch_rss_category, cat)
        for cat in RSS_SOURCES
    }
    results = {}
    for cat, task in tasks.items():
        results[cat] = await task
    return results


# ── NewsAPI (enhanced, requires key) ─────────────────────────────────────────

async def _fetch_newsapi(category: str, page_size: int = 10) -> list[dict]:
    if not settings.news_api_key:
        return []
    query_map = {
        "business":   "business",
        "technology": "technology",
        "crypto":     "cryptocurrency OR bitcoin OR ethereum",
        "world":      "general",
    }
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                "https://newsapi.org/v2/top-headlines",
                params={
                    "apiKey":   settings.news_api_key,
                    "category": query_map.get(category, "general"),
                    "pageSize": page_size,
                    "language": "en",
                },
            )
            resp.raise_for_status()
            data = resp.json()
        articles = []
        for a in data.get("articles", []):
            if a.get("title") == "[Removed]":
                continue
            title   = a.get("title", "")
            summary = (a.get("description") or "")[:300]
            articles.append({
                "title":     title,
                "summary":   summary,
                "url":       a.get("url", ""),
                "source":    a.get("source", {}).get("name", "Unknown"),
                "category":  category,
                "sentiment": _sentiment(f"{title} {summary}"),
                "published": a.get("publishedAt", ""),
                "image":     a.get("urlToImage"),
            })
        return articles
    except Exception as exc:
        logger.warning("NewsAPI fetch failed [%s]: %s", category, exc)
        return []


# ── Public API ────────────────────────────────────────────────────────────────

async def get_all_news() -> dict:
    """
    Returns categorised news from NewsAPI (if key present) falling back to RSS.
    Result shape:
      {
        "business":   [...],
        "technology": [...],
        "crypto":     [...],
        "world":      [...],
        "updated_at": "ISO-8601"
      }
    """
    categories = list(RSS_SOURCES.keys())

    if settings.news_api_key:
        tasks = [_fetch_newsapi(cat) for cat in categories]
        results = await asyncio.gather(*tasks)
        data = dict(zip(categories, results))
    else:
        data = await _fetch_rss_all()

    # Ensure each category has at least a few articles
    for cat in categories:
        if not data.get(cat):
            data[cat] = await asyncio.get_event_loop().run_in_executor(
                _executor, _fetch_rss_category, cat
            )

    data["updated_at"] = datetime.utcnow().isoformat()
    return data
