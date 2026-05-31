"""
main.py — JARVIS Wealth Portal — FastAPI Application Entry Point.

Starts a FastAPI server that:
  • Serves REST endpoints for market, crypto, news and AI insight data
  • Exposes a WebSocket for real-time 30-second market updates
  • Pre-warms the data cache on startup and refreshes every 5 minutes
  • Enables CORS so the React frontend (port 5173) can connect freely

Run with:
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

from __future__ import annotations

import asyncio
import json
import logging
import time
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import settings
from services.market_service import get_market_overview, get_chart_history
from services.crypto_service import get_all_crypto_data
from services.news_service import get_all_news
from services.ai_service import get_insights
from routers.autoearner_router import router as autoearner_router

# ── Logging ──────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=getattr(logging, settings.log_level, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("jarvis")

# ── In-memory data cache ─────────────────────────────────────────────────────

_cache: dict[str, Any] = {}
_cache_ts: dict[str, float] = {}


def _cache_fresh(key: str) -> bool:
    return key in _cache and (time.time() - _cache_ts.get(key, 0)) < settings.cache_ttl


async def _refresh_market():
    try:
        _cache["market"] = await get_market_overview()
        _cache_ts["market"] = time.time()
        logger.info("Market data refreshed.")
    except Exception as e:
        logger.error("Market refresh failed: %s", e)


async def _refresh_crypto():
    try:
        _cache["crypto"] = await get_all_crypto_data()
        _cache_ts["crypto"] = time.time()
        logger.info("Crypto data refreshed.")
    except Exception as e:
        logger.error("Crypto refresh failed: %s", e)


async def _refresh_news():
    try:
        _cache["news"] = await get_all_news()
        _cache_ts["news"] = time.time()
        logger.info("News data refreshed.")
    except Exception as e:
        logger.error("News refresh failed: %s", e)


async def _background_refresh_loop():
    """Refresh all data every CACHE_TTL seconds in the background."""
    while True:
        await asyncio.sleep(settings.cache_ttl)
        await asyncio.gather(_refresh_market(), _refresh_crypto(), _refresh_news())


# ── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 JARVIS Portal starting up …")
    logger.info("Active features: %s", settings.feature_report())

    # Pre-warm cache concurrently
    await asyncio.gather(_refresh_market(), _refresh_crypto(), _refresh_news())

    # Start background refresh task
    task = asyncio.create_task(_background_refresh_loop())
    logger.info("✅ JARVIS Portal ready. Data cache warm.")

    yield  # ← application runs here

    task.cancel()
    logger.info("JARVIS Portal shutting down.")


# ── FastAPI App ───────────────────────────────────────────────────────────────

app = FastAPI(
    title="JARVIS Wealth Portal API",
    description="Real-time global market intelligence + AI money-making insights.",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(autoearner_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",   # CRA dev server
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── REST Endpoints ────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
async def root():
    return {"status": "online", "service": "JARVIS Wealth Portal", "version": "1.0.0"}


@app.get("/api/health", tags=["Health"])
async def health():
    return {
        "status": "healthy",
        "features": settings.feature_report(),
        "cache_keys": list(_cache.keys()),
        "cache_ttl":  settings.cache_ttl,
    }


@app.get("/api/market", tags=["Market"])
async def get_market():
    """Global stock indices, commodities, forex, and top stocks."""
    if not _cache_fresh("market"):
        await _refresh_market()
    return _cache.get("market", {})


@app.get("/api/market/chart/{symbol}", tags=["Market"])
async def market_chart(symbol: str):
    """30-day price history for any Yahoo Finance ticker symbol."""
    return await get_chart_history(symbol)


@app.get("/api/crypto", tags=["Crypto"])
async def get_crypto():
    """Top 25 coins, market overview, trending, Fear & Greed index."""
    if not _cache_fresh("crypto"):
        await _refresh_crypto()
    return _cache.get("crypto", {})


@app.get("/api/news", tags=["News"])
async def get_news(
    category: str = Query(default="all", description="business|technology|crypto|world|all"),
):
    """Categorised world news from RSS / NewsAPI."""
    if not _cache_fresh("news"):
        await _refresh_news()
    news = _cache.get("news", {})
    if category == "all":
        return news
    return {category: news.get(category, []), "updated_at": news.get("updated_at")}


@app.get("/api/insights", tags=["AI Insights"])
async def get_ai_insights():
    """
    AI-powered money-making opportunities and market analysis.
    Uses Claude when ANTHROPIC_API_KEY is set; falls back to heuristic engine.
    """
    market = _cache.get("market", {})
    crypto = _cache.get("crypto", {})
    # Insights are expensive — cache for longer (2× TTL)
    if not _cache_fresh("insights"):
        _cache["insights"] = await get_insights(market, crypto)
        _cache_ts["insights"] = time.time()
    return _cache.get("insights", {})


@app.get("/api/summary", tags=["Dashboard"])
async def get_dashboard_summary():
    """
    Single endpoint that returns a lightweight summary for the dashboard hero panel.
    Combines key metrics from all data sources.
    """
    market = _cache.get("market", {})
    crypto = _cache.get("crypto", {})
    news   = _cache.get("news",   {})

    indices  = market.get("indices", [])
    sp500    = next((i for i in indices if "S&P" in i["name"]), {})
    btc      = next((c for c in crypto.get("top_coins", []) if c["symbol"] == "BTC"), {})
    eth      = next((c for c in crypto.get("top_coins", []) if c["symbol"] == "ETH"), {})
    fg       = crypto.get("fear_greed", {})

    total_articles = sum(
        len(v) for k, v in news.items() if k != "updated_at" and isinstance(v, list)
    )

    return {
        "sp500":         sp500,
        "btc":           btc,
        "eth":           eth,
        "fear_greed":    fg,
        "market_up":     sp500.get("positive", True),
        "total_news":    total_articles,
        "active_coins":  crypto.get("overview", {}).get("active_cryptocurrencies"),
        "updated_at":    market.get("updated_at"),
    }


# ── WebSocket — Real-time Feed ────────────────────────────────────────────────

@app.websocket("/ws/live")
async def websocket_live(websocket: WebSocket):
    """
    Push lightweight market updates to the client every 30 seconds.
    Clients receive: top index prices + BTC/ETH prices + Fear & Greed.
    """
    await websocket.accept()
    logger.info("WebSocket client connected.")
    try:
        while True:
            market = _cache.get("market", {})
            crypto = _cache.get("crypto", {})

            payload = {
                "type":    "market_update",
                "indices": market.get("indices", [])[:5],
                "crypto":  crypto.get("top_coins", [])[:5],
                "fg":      crypto.get("fear_greed", {}),
                "ts":      time.time(),
            }
            await websocket.send_text(json.dumps(payload))
            await asyncio.sleep(30)
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected.")
    except Exception as exc:
        logger.warning("WebSocket error: %s", exc)
