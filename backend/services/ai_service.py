"""
ai_service.py — AI-powered market analysis and money-making insights.

Uses Anthropic Claude to analyse live market + crypto data and return:
  • Market sentiment summary
  • Ranked money-making opportunities (with risk and steps)
  • Risk warnings
  • Economic outlook

Falls back to a rule-based heuristic engine when no API key is set,
so the Opportunities page always has content.
"""

from __future__ import annotations

import json
import logging
from datetime import datetime
from typing import Any

from config import settings

logger = logging.getLogger(__name__)

# ── Rule-based fallback opportunities ────────────────────────────────────────

STATIC_OPPORTUNITIES: list[dict] = [
    {
        "title":            "Index Fund Dollar-Cost Averaging",
        "category":         "Investing",
        "risk":             "Low",
        "potential_return": "8–12% / year (historical average)",
        "time_horizon":     "Long-term (3–10 years)",
        "capital_needed":   "$50 minimum",
        "description":      (
            "Invest a fixed amount into S&P 500 index funds (e.g., SPY, VOO) "
            "every month regardless of price. Over time this smooths volatility "
            "and compounds into significant wealth."
        ),
        "steps": [
            "Open a brokerage account (Fidelity, Schwab, or Robinhood are free).",
            "Choose an S&P 500 ETF: VOO, SPY, or IVV.",
            "Set up automatic monthly contributions ($50–$500).",
            "Reinvest all dividends automatically.",
            "Review annually — do NOT panic-sell during dips.",
        ],
        "tools": ["Fidelity", "Vanguard", "Schwab", "Robinhood"],
    },
    {
        "title":            "High-Yield Crypto Staking",
        "category":         "Crypto",
        "risk":             "Medium",
        "potential_return": "4–20% APY depending on protocol",
        "time_horizon":     "Short to medium (1–12 months)",
        "capital_needed":   "$100 minimum",
        "description":      (
            "Stake proof-of-stake cryptocurrencies (ETH, SOL, ADA, DOT) to earn "
            "yield without selling. Your coins validate transactions and you receive "
            "rewards automatically."
        ),
        "steps": [
            "Buy ETH, SOL, or ADA on Coinbase / Kraken.",
            "Transfer to a self-custody wallet (MetaMask, Phantom, Yoroi).",
            "Stake via official protocol or reputable liquid staking (Lido for ETH).",
            "Track rewards weekly and compound them.",
            "NEVER stake more than you can afford to lose.",
        ],
        "tools": ["Coinbase", "Kraken", "Lido Finance", "Rocket Pool"],
    },
    {
        "title":            "Freelance High-Income Skills Online",
        "category":         "Freelancing",
        "risk":             "Very Low",
        "potential_return": "$50–$200 / hour",
        "time_horizon":     "Immediate to 3 months",
        "capital_needed":   "$0",
        "description":      (
            "The highest-paid freelance skills in 2025 are: AI prompt engineering, "
            "data analysis, cloud architecture, and no-code automation. "
            "Platforms pay premium rates for these remotely."
        ),
        "steps": [
            "Identify your strongest existing skill (coding, design, writing, data).",
            "Create profiles on Upwork, Toptal, and Fiverr.",
            "Build a portfolio of 3 projects (real or self-initiated).",
            "Set competitive rates and gradually raise them every 3 months.",
            "Aim for 5-star reviews in the first month — offer a slight discount.",
        ],
        "tools": ["Upwork", "Toptal", "Fiverr", "LinkedIn Premium"],
    },
    {
        "title":            "Content Creation + Affiliate Marketing",
        "category":         "Online Business",
        "risk":             "Low",
        "potential_return": "$500–$10,000 / month (scalable)",
        "time_horizon":     "Medium (3–12 months to first $1k)",
        "capital_needed":   "$0–$100",
        "description":      (
            "Build a niche content channel (YouTube, blog, newsletter) around a "
            "topic you know. Monetise via affiliate links (Amazon, ClickBank) and "
            "eventually brand deals."
        ),
        "steps": [
            "Pick a profitable niche: personal finance, AI tools, fitness, travel.",
            "Create 20 quality pieces of content before expecting income.",
            "Join Amazon Associates or ClickBank for affiliate links.",
            "Publish consistently: 2× per week minimum.",
            "Build an email list from day 1 — it is your most valuable asset.",
        ],
        "tools": ["YouTube", "Substack", "ConvertKit", "Amazon Associates"],
    },
    {
        "title":            "Dividend Growth Portfolio",
        "category":         "Investing",
        "risk":             "Low–Medium",
        "potential_return": "3–7% dividend yield + capital gains",
        "time_horizon":     "Long-term (5+ years)",
        "capital_needed":   "$500 minimum",
        "description":      (
            "Build a portfolio of Dividend Aristocrats — companies that have raised "
            "dividends for 25+ consecutive years. This creates a growing passive "
            "income stream that outpaces inflation."
        ),
        "steps": [
            "Research Dividend Aristocrats: JNJ, KO, PG, MMM, ABBV.",
            "Aim for yield 2–6% and payout ratio below 60%.",
            "Reinvest dividends (DRIP) to accelerate compounding.",
            "Diversify across sectors: healthcare, consumer staples, utilities.",
            "Review holdings semi-annually for dividend safety.",
        ],
        "tools": ["Seeking Alpha", "Dividend.com", "M1 Finance"],
    },
    {
        "title":            "AI-Powered Dropshipping",
        "category":         "E-Commerce",
        "risk":             "Medium",
        "potential_return": "20–40% margins on successful products",
        "time_horizon":     "Short to medium (1–6 months)",
        "capital_needed":   "$200–$1,000 for ads",
        "description":      (
            "Use AI tools (ChatGPT, Midjourney) to find trending products, write "
            "compelling copy, and create ads. List on Shopify + run Facebook/TikTok ads "
            "for profitable dropshipping without holding inventory."
        ),
        "steps": [
            "Use Google Trends and TikTok to find viral products.",
            "Source from AliExpress or CJ Dropshipping with fast shipping.",
            "Build a Shopify store using a clean, minimal theme.",
            "Write AI-powered product descriptions and run A/B tests.",
            "Start with $20/day ad budget, scale winners aggressively.",
        ],
        "tools": ["Shopify", "DSers", "TikTok Ads", "Facebook Ads"],
    },
]


# ── AI-generated insights via Claude ─────────────────────────────────────────

async def _ai_generate_insights(market_data: dict, crypto_data: dict) -> dict:
    """Call Claude to produce structured market analysis."""
    import anthropic

    # Build a concise market summary to stay within token budget
    indices_summary = ", ".join(
        f"{i['name']} {'+' if i['positive'] else ''}{i['change_pct']}%"
        for i in market_data.get("indices", [])[:5]
    )
    top_crypto = ", ".join(
        f"{c['symbol']} ${c['price']:,.0f} ({'+' if (c['change_24h'] or 0) > 0 else ''}{c.get('change_24h', 0):.1f}%)"
        for c in crypto_data.get("top_coins", [])[:5]
    )
    fear_greed = crypto_data.get("fear_greed", {})
    fg_label   = fear_greed.get("label", "Unknown")
    fg_value   = fear_greed.get("value", 50)

    prompt = f"""You are JARVIS, an elite financial AI. Analyse the live data below and return a JSON object.

LIVE MARKET DATA ({datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}):
- Global indices: {indices_summary}
- Top crypto: {top_crypto}
- Fear & Greed Index: {fg_value}/100 ({fg_label})

Return ONLY valid JSON (no markdown, no prose outside JSON):
{{
  "market_sentiment": "one sentence global market mood",
  "economic_outlook": "two sentences on macro outlook",
  "opportunities": [
    {{
      "title": "...",
      "category": "Crypto|Investing|Freelancing|Online Business|Trading",
      "risk": "Low|Medium|High",
      "potential_return": "X–Y% timeframe",
      "time_horizon": "...",
      "capital_needed": "$X",
      "description": "2–3 sentence explanation tied to current data",
      "steps": ["step 1", "step 2", "step 3", "step 4"],
      "tools": ["tool1", "tool2"]
    }}
  ],
  "risk_warnings": ["warning 1", "warning 2", "warning 3"],
  "top_sectors_to_watch": ["sector 1", "sector 2", "sector 3"]
}}

Generate exactly 4 opportunities personalised to today's market conditions."""

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}],
    )
    raw = message.content[0].text.strip()
    # Extract JSON if wrapped
    if "```" in raw:
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw)


# ── Public API ────────────────────────────────────────────────────────────────

async def get_insights(market_data: dict, crypto_data: dict) -> dict:
    """
    Returns money-making insights.

    If Anthropic key is set → AI-generated, personalised to live data.
    Otherwise             → curated static opportunities always available.
    """
    if settings.ai_enabled:
        try:
            ai_result = await _ai_generate_insights(market_data, crypto_data)
            return {
                "source":           "Claude AI",
                "market_sentiment": ai_result.get("market_sentiment", ""),
                "economic_outlook": ai_result.get("economic_outlook", ""),
                "opportunities":    ai_result.get("opportunities", STATIC_OPPORTUNITIES[:4]),
                "risk_warnings":    ai_result.get("risk_warnings", []),
                "sectors_to_watch": ai_result.get("top_sectors_to_watch", []),
                "updated_at":       datetime.utcnow().isoformat(),
            }
        except Exception as exc:
            logger.error("AI insights generation failed: %s", exc)

    # ── Rule-based fallback ───────────────────────────────────────────────────
    indices = market_data.get("indices", [])
    sp500 = next((i for i in indices if "S&P" in i["name"]), None)
    market_up = sp500["positive"] if sp500 else True
    fg = crypto_data.get("fear_greed", {})
    fg_val = fg.get("value", 50)

    sentiment = (
        "Markets showing strength — risk appetite is elevated."
        if market_up else
        "Markets under pressure — defensive positioning and value hunting recommended."
    )
    outlook = (
        "Crypto sentiment is in " + fg.get("label", "Neutral").lower() +
        f" territory ({fg_val}/100). "
        "Global equities reflect mixed macro signals; diversification is key."
    )
    warnings = [
        "Past performance does not guarantee future results.",
        "Never invest more than you can afford to lose.",
        "Always do your own research (DYOR) before allocating capital.",
        "Crypto markets are extremely volatile — position size responsibly.",
    ]

    return {
        "source":           "JARVIS Heuristic Engine",
        "market_sentiment": sentiment,
        "economic_outlook": outlook,
        "opportunities":    STATIC_OPPORTUNITIES,
        "risk_warnings":    warnings,
        "sectors_to_watch": ["AI & Semiconductors", "Clean Energy", "Healthcare Tech"],
        "updated_at":       datetime.utcnow().isoformat(),
    }
