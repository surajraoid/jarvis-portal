"""
crypto_service.py — Cryptocurrency data via CoinGecko public API.

No API key required.  Free tier: ~30 calls/minute.

Provides:
  • Top 25 coins by market cap with sparkline data
  • Market overview (total cap, BTC dominance, active coins)
  • Trending search coins
  • Fear & Greed Index (via alternative.me — free, no key)
"""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime
from typing import Any

import httpx

logger = logging.getLogger(__name__)

COINGECKO   = "https://api.coingecko.com/api/v3"
FEAR_GREED  = "https://api.alternative.me/fng/"

# shared async HTTP client (reused across calls)
_HTTP_TIMEOUT = httpx.Timeout(20.0)


async def _get(url: str, params: dict | None = None) -> Any:
    """Minimal async GET with error handling."""
    async with httpx.AsyncClient(timeout=_HTTP_TIMEOUT) as client:
        resp = await client.get(url, params=params or {})
        resp.raise_for_status()
        return resp.json()


# ── Market Overview ───────────────────────────────────────────────────────────

async def get_market_overview() -> dict:
    """Global cryptocurrency market statistics."""
    try:
        data = await _get(f"{COINGECKO}/global")
        d = data.get("data", {})
        return {
            "total_market_cap_usd":  d.get("total_market_cap", {}).get("usd"),
            "total_volume_24h_usd":  d.get("total_volume", {}).get("usd"),
            "btc_dominance":         round(d.get("market_cap_percentage", {}).get("btc", 0), 1),
            "eth_dominance":         round(d.get("market_cap_percentage", {}).get("eth", 0), 1),
            "active_cryptocurrencies": d.get("active_cryptocurrencies"),
            "markets":               d.get("markets"),
            "market_cap_change_24h": round(d.get("market_cap_change_percentage_24h_usd", 0), 2),
            "updated_at":            datetime.utcnow().isoformat(),
        }
    except Exception as exc:
        logger.error("Crypto global overview failed: %s", exc)
        return {}


# ── Top Coins ─────────────────────────────────────────────────────────────────

async def get_top_coins(limit: int = 25) -> list[dict]:
    """Top `limit` coins by market cap with sparkline history."""
    try:
        data = await _get(
            f"{COINGECKO}/coins/markets",
            params={
                "vs_currency":              "usd",
                "order":                    "market_cap_desc",
                "per_page":                 limit,
                "page":                     1,
                "sparkline":                "true",
                "price_change_percentage":  "1h,24h,7d",
            },
        )
        coins = []
        for c in data:
            sparkline = (c.get("sparkline_in_7d") or {}).get("price", [])
            # Downsample sparkline to ~50 pts for the UI chart
            step = max(1, len(sparkline) // 50)
            coins.append({
                "id":         c["id"],
                "name":       c["name"],
                "symbol":     c["symbol"].upper(),
                "rank":       c["market_cap_rank"],
                "price":      c["current_price"],
                "market_cap": c["market_cap"],
                "volume_24h": c["total_volume"],
                "change_1h":  c.get("price_change_percentage_1h_in_currency"),
                "change_24h": c.get("price_change_percentage_24h"),
                "change_7d":  c.get("price_change_percentage_7d_in_currency"),
                "ath":        c["ath"],
                "ath_change": c["ath_change_percentage"],
                "image":      c["image"],
                "sparkline":  sparkline[::step],
            })
        return coins
    except Exception as exc:
        logger.error("Top coins fetch failed: %s", exc)
        return []


# ── Trending Coins ────────────────────────────────────────────────────────────

async def get_trending_coins() -> list[dict]:
    """CoinGecko's trending search coins (past 24 h)."""
    try:
        data = await _get(f"{COINGECKO}/search/trending")
        return [
            {
                "id":     item["item"]["id"],
                "name":   item["item"]["name"],
                "symbol": item["item"]["symbol"],
                "rank":   item["item"]["market_cap_rank"],
                "image":  item["item"].get("small"),
                "score":  item["item"].get("score"),
            }
            for item in data.get("coins", [])
        ]
    except Exception as exc:
        logger.error("Trending coins failed: %s", exc)
        return []


# ── Fear & Greed Index ────────────────────────────────────────────────────────

async def get_fear_greed() -> dict:
    """Crypto Fear & Greed Index from alternative.me."""
    try:
        data = await _get(FEAR_GREED, params={"limit": 7})
        items = data.get("data", [])
        if not items:
            return {}
        latest = items[0]
        history = [
            {"date": i.get("timestamp"), "value": int(i.get("value", 0))}
            for i in items
        ]
        return {
            "value":       int(latest.get("value", 0)),
            "label":       latest.get("value_classification", "Unknown"),
            "history":     history,
            "updated_at":  datetime.utcnow().isoformat(),
        }
    except Exception as exc:
        logger.error("Fear & Greed fetch failed: %s", exc)
        return {"value": 50, "label": "Neutral", "history": [], "updated_at": datetime.utcnow().isoformat()}


# ── Aggregated Crypto Data ────────────────────────────────────────────────────

async def get_all_crypto_data() -> dict:
    """Single call that fetches all crypto data concurrently."""
    overview, top_coins, trending, fear_greed = await asyncio.gather(
        get_market_overview(),
        get_top_coins(),
        get_trending_coins(),
        get_fear_greed(),
    )
    return {
        "overview":    overview,
        "top_coins":   top_coins,
        "trending":    trending,
        "fear_greed":  fear_greed,
        "updated_at":  datetime.utcnow().isoformat(),
    }
