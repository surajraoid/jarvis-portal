"""
market_service.py — Real-time global market data via yfinance (no API key needed).

Provides:
  • Major stock indices   (S&P 500, NASDAQ, Dow Jones, FTSE, Nikkei …)
  • Commodities           (Gold, Oil, Silver, Natural Gas, Copper)
  • Forex pairs           (EUR/USD, GBP/USD, USD/JPY, USD/INR …)
  • Top US stock movers   (biggest gainers / losers)
  • 30-day price history  for chart rendering
"""

from __future__ import annotations

import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
from typing import Any

import yfinance as yf
import pandas as pd

logger = logging.getLogger(__name__)
_executor = ThreadPoolExecutor(max_workers=6)

# ── Symbol maps ──────────────────────────────────────────────────────────────

INDICES: dict[str, str] = {
    "S&P 500":        "^GSPC",
    "NASDAQ":         "^IXIC",
    "Dow Jones":      "^DJI",
    "Russell 2000":   "^RUT",
    "FTSE 100":       "^FTSE",
    "Nikkei 225":     "^N225",
    "DAX":            "^GDAXI",
    "Hang Seng":      "^HSI",
    "VIX (Fear)":     "^VIX",
}

COMMODITIES: dict[str, str] = {
    "Gold":         "GC=F",
    "Crude Oil":    "CL=F",
    "Silver":       "SI=F",
    "Natural Gas":  "NG=F",
    "Copper":       "HG=F",
}

FOREX: dict[str, str] = {
    "EUR/USD":  "EURUSD=X",
    "GBP/USD":  "GBPUSD=X",
    "USD/JPY":  "JPY=X",
    "USD/INR":  "INR=X",
    "USD/CNY":  "CNY=X",
    "USD/CAD":  "CAD=X",
    "AUD/USD":  "AUDUSD=X",
}

TOP_STOCKS: list[str] = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA",
    "META", "TSLA", "NFLX", "AMD", "PLTR",
]


# ── Helpers ──────────────────────────────────────────────────────────────────

def _safe_round(val: Any, digits: int = 2) -> float | None:
    try:
        return round(float(val), digits)
    except (TypeError, ValueError):
        return None


def _ticker_snapshot(name: str, symbol: str) -> dict | None:
    """Fetch current price + 1-day change for a single ticker (blocking)."""
    try:
        t = yf.Ticker(symbol)
        hist = t.history(period="5d", auto_adjust=True)
        if hist.empty or len(hist) < 2:
            return None
        close = hist["Close"]
        current = float(close.iloc[-1])
        prev    = float(close.iloc[-2])
        change  = current - prev
        change_pct = (change / prev) * 100 if prev else 0.0
        return {
            "name":       name,
            "symbol":     symbol,
            "price":      _safe_round(current),
            "change":     _safe_round(change),
            "change_pct": _safe_round(change_pct),
            "positive":   change >= 0,
            "volume":     int(hist["Volume"].iloc[-1]) if "Volume" in hist.columns else 0,
            "timestamp":  datetime.utcnow().isoformat(),
        }
    except Exception as exc:
        logger.warning("Ticker %s (%s) failed: %s", symbol, name, exc)
        return None


def _fetch_history_30d(symbol: str) -> list[dict]:
    """Return 30-day OHLCV history as a list of dicts for chart rendering."""
    try:
        t = yf.Ticker(symbol)
        hist = t.history(period="30d", auto_adjust=True)
        if hist.empty:
            return []
        records = []
        for ts, row in hist.iterrows():
            records.append({
                "date":   ts.strftime("%Y-%m-%d"),
                "open":   _safe_round(row["Open"]),
                "high":   _safe_round(row["High"]),
                "low":    _safe_round(row["Low"]),
                "close":  _safe_round(row["Close"]),
                "volume": int(row["Volume"]) if pd.notna(row["Volume"]) else 0,
            })
        return records
    except Exception as exc:
        logger.warning("History fetch for %s failed: %s", symbol, exc)
        return []


def _fetch_all_snapshots(symbol_map: dict[str, str]) -> list[dict]:
    results = []
    for name, sym in symbol_map.items():
        snap = _ticker_snapshot(name, sym)
        if snap:
            results.append(snap)
    return results


def _fetch_top_stocks() -> list[dict]:
    results = []
    for sym in TOP_STOCKS:
        snap = _ticker_snapshot(sym, sym)
        if snap:
            # add extra info
            try:
                info = yf.Ticker(sym).fast_info
                snap["market_cap"] = getattr(info, "market_cap", None)
            except Exception:
                snap["market_cap"] = None
            results.append(snap)
    return sorted(results, key=lambda x: abs(x.get("change_pct") or 0), reverse=True)


# ── Public async API ─────────────────────────────────────────────────────────

async def _run(fn, *args):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_executor, fn, *args)


async def get_market_overview() -> dict:
    """
    Returns a comprehensive snapshot of global markets:
      indices, commodities, forex, and top stocks.
    """
    indices, commodities, forex, top_stocks = await asyncio.gather(
        _run(_fetch_all_snapshots, INDICES),
        _run(_fetch_all_snapshots, COMMODITIES),
        _run(_fetch_all_snapshots, FOREX),
        _run(_fetch_top_stocks),
    )
    return {
        "indices":    indices,
        "commodities": commodities,
        "forex":      forex,
        "top_stocks": top_stocks,
        "updated_at": datetime.utcnow().isoformat(),
    }


async def get_chart_history(symbol: str) -> dict:
    """Return 30-day price history for a given ticker symbol."""
    data = await _run(_fetch_history_30d, symbol)
    return {"symbol": symbol, "history": data}
