"""
config.py — Centralised application settings loaded from environment / .env file.
All settings have safe defaults so the app runs even without a .env file.
"""

from __future__ import annotations
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Immutable application settings resolved at import time."""

    # ── API keys (all optional) ──────────────────────────────────────────────
    anthropic_api_key: str | None = os.getenv("ANTHROPIC_API_KEY")
    news_api_key: str | None = os.getenv("NEWS_API_KEY")
    alpha_vantage_key: str | None = os.getenv("ALPHA_VANTAGE_KEY")

    # ── Cache ────────────────────────────────────────────────────────────────
    cache_ttl: int = int(os.getenv("CACHE_TTL_SECONDS", "300"))

    # ── Server ───────────────────────────────────────────────────────────────
    port: int = int(os.getenv("PORT", "8000"))
    log_level: str = os.getenv("LOG_LEVEL", "INFO").upper()

    # ── Feature flags ────────────────────────────────────────────────────────
    @property
    def ai_enabled(self) -> bool:
        return bool(self.anthropic_api_key)

    @property
    def news_api_enabled(self) -> bool:
        return bool(self.news_api_key)

    @property
    def alpha_vantage_enabled(self) -> bool:
        return bool(self.alpha_vantage_key)

    def feature_report(self) -> dict:
        return {
            "ai_insights": self.ai_enabled,
            "news_api": self.news_api_enabled,
            "alpha_vantage": self.alpha_vantage_enabled,
            "yfinance": True,          # always available
            "coingecko": True,         # always available
            "rss_feeds": True,         # always available
        }


settings = Settings()
