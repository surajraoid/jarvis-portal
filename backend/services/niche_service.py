"""
niche_service.py — Auto-discover trending niches with affiliate potential.

Free data sources (no API keys needed):
  1. Google Trends Daily RSS  — trending US searches
  2. Reddit r/popular + tech  — what people are buzzing about
  3. Hacker News Top Stories  — tech community trends
  4. Product Hunt RSS         — trending new products

Each niche is scored 0-100 based on:
  - Affiliate program match (highest weight)
  - Trend velocity
  - Content difficulty (lower = easier to write)
  - Audience size
"""

from __future__ import annotations

import asyncio
import logging
import re
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import Any

import httpx

logger = logging.getLogger("jarvis.niche")
HTTP_TIMEOUT = httpx.Timeout(15.0)

# ── Affiliate niche keyword mapping ──────────────────────────────────────────
# Maps keywords → affiliate programs with commission details

AFFILIATE_NICHE_MAP = {
    "hosting":      {"programs": ["Hostinger", "WP Engine", "Kinsta"],    "score_bonus": 30, "commission": "$65–$500/sale",   "monthly_potential": "$500–$3,000"},
    "wordpress":    {"programs": ["WP Engine", "Kinsta", "Bluehost"],      "score_bonus": 28, "commission": "$65–$200/sale",   "monthly_potential": "$400–$2,000"},
    "vpn":          {"programs": ["NordVPN", "ExpressVPN", "Surfshark"],   "score_bonus": 25, "commission": "$40–$100/sale",   "monthly_potential": "$300–$1,500"},
    "ai":           {"programs": ["Jasper", "Copy.ai", "Writesonic"],      "score_bonus": 35, "commission": "30–40% recurring","monthly_potential": "$600–$4,000"},
    "automation":   {"programs": ["Zapier", "Make.com", "n8n"],            "score_bonus": 32, "commission": "20–30% recurring","monthly_potential": "$400–$2,500"},
    "productivity": {"programs": ["Notion", "Todoist", "Monday.com"],      "score_bonus": 22, "commission": "$30–$150/sale",   "monthly_potential": "$200–$1,200"},
    "seo":          {"programs": ["Semrush", "Ahrefs", "Ubersuggest"],     "score_bonus": 33, "commission": "$100–$200/sale",  "monthly_potential": "$500–$3,000"},
    "ecommerce":    {"programs": ["Shopify", "WooCommerce", "Gumroad"],    "score_bonus": 30, "commission": "$100–$150/sale",  "monthly_potential": "$400–$2,000"},
    "crypto":       {"programs": ["Coinbase", "Binance", "Ledger"],        "score_bonus": 20, "commission": "30–50% fees",    "monthly_potential": "$200–$1,500"},
    "finance":      {"programs": ["Wise", "Robinhood", "Personal Capital"],"score_bonus": 22, "commission": "$30–$100/referral","monthly_potential": "$200–$1,000"},
    "courses":      {"programs": ["Coursera", "Udemy", "Skillshare"],      "score_bonus": 20, "commission": "30–50%/sale",    "monthly_potential": "$150–$800"},
    "software":     {"programs": ["Semrush", "Canva Pro", "Adobe"],        "score_bonus": 25, "commission": "$50–$200/sale",  "monthly_potential": "$300–$1,500"},
    "security":     {"programs": ["NordVPN", "1Password", "Bitdefender"],  "score_bonus": 24, "commission": "$30–$80/sale",   "monthly_potential": "$200–$1,000"},
    "startup":      {"programs": ["Shopify", "DigitalOcean", "Stripe"],    "score_bonus": 26, "commission": "$50–$200/referral","monthly_potential": "$300–$1,500"},
    "python":       {"programs": ["DigitalOcean", "Vultr", "Linode"],      "score_bonus": 28, "commission": "$25–$100/referral","monthly_potential": "$200–$1,200"},
    "developer":    {"programs": ["GitHub Pro", "JetBrains", "Vercel"],    "score_bonus": 26, "commission": "$20–$100/referral","monthly_potential": "$150–$900"},
    "remote work":  {"programs": ["Turing.com", "Arc.dev", "Deel"],        "score_bonus": 29, "commission": "$50–$200/referral","monthly_potential": "$300–$1,500"},
    "freelance":    {"programs": ["Fiverr", "Upwork", "Toptal"],           "score_bonus": 22, "commission": "$15–$100/referral","monthly_potential": "$150–$800"},
    "marketing":    {"programs": ["Semrush", "HubSpot", "Mailchimp"],      "score_bonus": 27, "commission": "$50–$500/sale",  "monthly_potential": "$400–$2,500"},
    "cloud":        {"programs": ["DigitalOcean", "Vultr", "Linode"],      "score_bonus": 28, "commission": "$25–$100/referral","monthly_potential": "$200–$1,200"},
}

# Platform categories that do well on each social platform
PLATFORM_NICHE_FIT = {
    "twitter":   ["ai", "crypto", "startup", "developer", "automation", "seo"],
    "instagram": ["productivity", "finance", "courses", "ecommerce", "freelance", "marketing"],
    "linkedin":  ["remote work", "marketing", "seo", "startup", "courses", "automation"],
    "reddit":    ["developer", "python", "security", "cloud", "freelance", "vpn"],
}

# ── Data fetchers ─────────────────────────────────────────────────────────────

async def fetch_google_trends() -> list[dict]:
    """Fetch daily trending searches from Google Trends RSS feed."""
    url = "https://trends.google.com/trends/trendingsearches/daily/rss?geo=US"
    try:
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT, headers={"User-Agent": "Mozilla/5.0"}) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            root = ET.fromstring(resp.text)
            items = []
            for item in root.iter("item"):
                title_el = item.find("title")
                approx_el = item.find("{https://trends.google.com/trends/trendingsearches/daily}approx_traffic")
                if title_el is not None:
                    traffic_str = (approx_el.text or "0") if approx_el is not None else "0"
                    traffic = int(re.sub(r"[^\d]", "", traffic_str) or "0")
                    items.append({
                        "topic": title_el.text or "",
                        "traffic": traffic,
                        "source": "Google Trends",
                    })
            return items[:20]
    except Exception as exc:
        logger.warning("Google Trends fetch failed: %s", exc)
        return []


async def fetch_reddit_trending() -> list[dict]:
    """Fetch trending topics from Reddit tech/business subreddits."""
    subreddits = ["technology", "entrepreneur", "productivity", "learnprogramming", "webdev", "artificial"]
    results = []
    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT, headers={"User-Agent": "JARVIS/1.0"}) as client:
        for sub in subreddits[:4]:   # Limit to avoid rate-limiting
            try:
                resp = await client.get(f"https://www.reddit.com/r/{sub}/hot.json?limit=5")
                if resp.status_code == 200:
                    data = resp.json()
                    posts = data.get("data", {}).get("children", [])
                    for p in posts:
                        pd = p.get("data", {})
                        results.append({
                            "topic": pd.get("title", "")[:100],
                            "upvotes": pd.get("ups", 0),
                            "subreddit": sub,
                            "source": "Reddit",
                        })
            except Exception as exc:
                logger.warning("Reddit r/%s failed: %s", sub, exc)
            await asyncio.sleep(0.5)  # be polite
    return results


async def fetch_hackernews_trending() -> list[dict]:
    """Fetch top stories from Hacker News (free Firebase API)."""
    try:
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            resp = await client.get("https://hacker-news.firebaseio.com/v0/topstories.json")
            ids = resp.json()[:8]
            stories = []
            for sid in ids:
                try:
                    sr = await client.get(f"https://hacker-news.firebaseio.com/v0/item/{sid}.json")
                    s = sr.json()
                    if s.get("type") == "story" and s.get("title"):
                        stories.append({
                            "topic": s["title"],
                            "score": s.get("score", 0),
                            "source": "Hacker News",
                        })
                except Exception:
                    pass
            return stories
    except Exception as exc:
        logger.warning("HN fetch failed: %s", exc)
        return []


# ── Niche scoring ─────────────────────────────────────────────────────────────

def _extract_keywords(text: str) -> list[str]:
    """Extract relevant keyword categories from a topic string."""
    text_lower = text.lower()
    matched = []
    for keyword in AFFILIATE_NICHE_MAP:
        if keyword in text_lower or any(w in text_lower for w in keyword.split()):
            matched.append(keyword)
    return matched


def _score_niche(topic: str, source_score: int, source: str) -> dict:
    """Score a niche topic and return enriched niche object."""
    keywords = _extract_keywords(topic)
    if not keywords:
        # Generic tech topic — still useful but lower score
        keywords = ["software"]

    best_kw = max(keywords, key=lambda k: AFFILIATE_NICHE_MAP.get(k, {}).get("score_bonus", 0))
    info = AFFILIATE_NICHE_MAP.get(best_kw, AFFILIATE_NICHE_MAP["software"])

    base_score = min(source_score, 60)
    affiliate_bonus = info["score_bonus"]
    total_score = min(base_score + affiliate_bonus, 99)

    # Determine best platforms
    best_platforms = []
    for platform, niches in PLATFORM_NICHE_FIT.items():
        if any(k in niches for k in keywords):
            best_platforms.append(platform)
    if not best_platforms:
        best_platforms = ["twitter", "linkedin"]

    return {
        "topic": topic,
        "category": best_kw,
        "score": total_score,
        "affiliate_programs": info["programs"],
        "commission": info["commission"],
        "monthly_potential": info["monthly_potential"],
        "best_platforms": best_platforms[:3],
        "source": source,
        "content_angle": _generate_angle(topic, best_kw),
        "difficulty": "Easy" if total_score > 75 else "Medium" if total_score > 55 else "Hard",
    }


def _generate_angle(topic: str, category: str) -> str:
    """Generate a compelling content angle for a niche topic."""
    angles = {
        "ai": f"How to use AI for {topic.lower()} (with tools that actually work in 2025)",
        "automation": f"Automate {topic.lower()} and save 10+ hours a week",
        "productivity": f"The {topic} system I use to get more done in less time",
        "hosting": f"Best hosting for {topic.lower()} — I tested 8 options so you don't have to",
        "courses": f"Top free + paid resources to master {topic.lower()} in 30 days",
        "seo": f"How I ranked for {topic.lower()} — exact strategy + tools",
        "developer": f"The {topic} tools every developer needs in 2025",
        "remote work": f"How to land remote {topic.lower()} jobs paying $80k–$160k",
        "software": f"Best tools for {topic.lower()} — tested and ranked",
        "crypto": f"{topic} explained simply — how to get started safely",
        "finance": f"The {topic.lower()} strategy that changed my finances",
        "marketing": f"Steal my exact {topic.lower()} strategy (worked for 10k+ followers)",
    }
    return angles.get(category, f"The complete guide to {topic.lower()} in 2025")


# ── Deduplication + ranking ───────────────────────────────────────────────────

def _deduplicate(niches: list[dict]) -> list[dict]:
    """Remove duplicates by topic similarity."""
    seen: set[str] = set()
    unique = []
    for n in sorted(niches, key=lambda x: x["score"], reverse=True):
        key = re.sub(r"\W", "", n["topic"].lower()[:30])
        if key not in seen:
            seen.add(key)
            unique.append(n)
    return unique


# ── Main public API ───────────────────────────────────────────────────────────

async def get_trending_niches() -> dict:
    """
    Fetch trends from all sources, score by affiliate potential, return top 15.
    This is the main entry point for the niche research feature.
    """
    # Fetch concurrently
    results = await asyncio.gather(
        fetch_google_trends(),
        fetch_reddit_trending(),
        fetch_hackernews_trending(),
        return_exceptions=True,
    )

    all_topics: list[dict] = []

    # Process Google Trends
    if isinstance(results[0], list):
        for item in results[0]:
            score = min(int(item["traffic"] / 10_000), 60) if item["traffic"] else 20
            all_topics.append(_score_niche(item["topic"], score, "Google Trends"))

    # Process Reddit
    if isinstance(results[1], list):
        for item in results[1]:
            score = min(int(item["upvotes"] / 100), 50)
            all_topics.append(_score_niche(item["topic"], score, f"Reddit r/{item['subreddit']}"))

    # Process HN
    if isinstance(results[2], list):
        for item in results[2]:
            score = min(int(item["score"] / 5), 55)
            all_topics.append(_score_niche(item["topic"], score, "Hacker News"))

    # Fallback static niches (always included to ensure results)
    fallback_niches = [
        {"topic": "AI productivity tools for developers", "score": 55, "source": "Curated"},
        {"topic": "Best web hosting 2025 comparison",     "score": 50, "source": "Curated"},
        {"topic": "Remote work tools and setup",          "score": 45, "source": "Curated"},
        {"topic": "Python automation scripts",            "score": 48, "source": "Curated"},
        {"topic": "SEO tools free vs paid",               "score": 52, "source": "Curated"},
    ]
    for fb in fallback_niches:
        all_topics.append(_score_niche(fb["topic"], fb["score"], fb["source"]))

    # Deduplicate and return top 15
    top_niches = _deduplicate(all_topics)[:15]

    return {
        "niches": top_niches,
        "total_found": len(all_topics),
        "top_pick": top_niches[0] if top_niches else None,
        "updated_at": datetime.utcnow().isoformat(),
        "sources": ["Google Trends", "Reddit", "Hacker News", "Curated"],
    }
