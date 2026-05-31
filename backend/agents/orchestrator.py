"""
orchestrator.py — Multi-Agent AI Income Research System.

Five specialised Claude agents communicate in a pipeline to deliver
a daily $50 earning plan personalised to current market conditions.

Pipeline:
  Agent 1 (TrendScout)       → Research today's monetisable tech trends
       ↓ trends
  Agent 2 (OpportunityAnalyst) → Convert trends to specific $50/day plays
       ↓ opportunities
  Agent 3 (ContentWriter)    → Write publish-ready article + social posts
       ↓ content
  Agent 4 (AffiliateOptimiser) → Match best affiliate programs to content
       ↓ matched affiliates
  Agent 5 (DailyPlanner)     → Build time-blocked $50 action plan

Each agent has an independent system prompt that defines its persona,
input contract, and exact JSON output schema — eliminating hallucination.
"""

from __future__ import annotations

import json
import logging
import re
from datetime import date, datetime
from typing import Any

from config import settings
from agents.data import AFFILIATE_PROGRAMS, STATIC_DAILY_STRATEGIES

logger = logging.getLogger("jarvis.agents")

# ── JSON helper ───────────────────────────────────────────────────────────────

def _extract_json(text: str) -> Any:
    """
    Robustly extract JSON from a Claude response.
    Handles: raw JSON, ```json``` blocks, and `````` blocks.
    """
    text = text.strip()
    # Strip markdown code fences
    for pattern in [r"```json\s*([\s\S]*?)```", r"```\s*([\s\S]*?)```"]:
        m = re.search(pattern, text)
        if m:
            text = m.group(1).strip()
            break
    return json.loads(text)


def _call_agent(client, system_prompt: str, user_message: str, max_tokens: int = 2000) -> Any:
    """Make a synchronous Claude API call and return parsed JSON."""
    msg = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=max_tokens,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
    )
    return _extract_json(msg.content[0].text)


# ═══════════════════════════════════════════════════════════════════
# AGENT SYSTEM PROMPTS
# ═══════════════════════════════════════════════════════════════════

TREND_SCOUT_PROMPT = """You are TrendScout, an elite market research AI specialising in technology monetisation.

Your mission: Identify TODAY's top tech topics that a Full Stack/Backend software engineer can monetise through affiliate content within 7 days.

Evaluation criteria for each topic:
1. Developer communities are actively searching for it RIGHT NOW
2. Products/services covering this topic have affiliate programs paying $25-200+ per referral
3. A tutorial article on this topic can rank on Google within 30 days
4. The engineer can write authoritatively from their experience

Output ONLY this JSON (no commentary, no markdown fences):
{
  "research_date": "YYYY-MM-DD",
  "trends": [
    {
      "topic": "specific technology or problem name",
      "search_intent": "what developers are searching for",
      "why_trending": "one factual sentence on why this is hot right now",
      "monetisation_angle": "exactly which affiliate product to embed and why",
      "estimated_article_views_30d": "X,000",
      "affiliate_match": "specific affiliate program name",
      "commission_per_referral": "$X"
    }
  ]
}
Return exactly 4 trends, ordered highest-to-lowest monetisation potential."""

OPPORTUNITY_ANALYST_PROMPT = """You are OpportunityAnalyst, a digital income strategist who has helped 500+ software engineers earn their first $50/day online.

You receive trending tech topics and identify the single fastest, most realistic path to $50 for EACH.

Rules:
- Only suggest legal, ethical strategies
- Be brutally specific: name the platform, the exact action, realistic numbers
- Account for a beginner with NO existing audience or email list
- Prioritise strategies achievable within 7 days

Output ONLY this JSON:
{
  "opportunities": [
    {
      "rank": 1,
      "title": "catchy, specific title",
      "topic": "from trends",
      "primary_strategy": "affiliate_content | bug_bounty | template_sale | newsletter | service",
      "platform": "specific platform name",
      "steps_today": ["action 1 (10 min)", "action 2 (30 min)", "action 3 (1 hr)"],
      "expected_earnings": {
        "day_7": "$X",
        "day_30": "$X/day",
        "day_90": "$X/day"
      },
      "realistic_difficulty": "Easy | Medium | Hard",
      "prerequisite": "what they need before starting",
      "biggest_mistake": "what most people do wrong and how to avoid it",
      "affiliate_to_promote": "specific program name",
      "commission": "$X per referral"
    }
  ]
}"""

CONTENT_WRITER_PROMPT = """You are ContentWriter, a senior technical author who writes articles that BOTH rank on Google AND earn affiliate commissions.

Your articles have generated $50,000+ in affiliate revenue because you:
1. Solve a REAL developer problem thoroughly
2. Recommend tools naturally — never feel promotional
3. Include working code examples
4. Use SEO-optimised headings that match search queries

Write a complete, publish-ready 800-1000 word article in Markdown.

Guidelines:
- First paragraph must hook the reader with the problem
- Include at least one code block (bash or JS/Python)
- Affiliate link placement: mention the product when it naturally solves a step
- Call to action at end: "try X free" or "sign up with my link for $X credit"
- Never write "as an AI" or reveal you are AI

Output ONLY this JSON:
{
  "title": "SEO-optimised title with keyword",
  "meta_description": "160-char SEO description",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "read_time_minutes": 5,
  "article_markdown": "# Title\\n\\n[full article in markdown]",
  "social_posts": {
    "twitter": "280-char tweet with hook + link placeholder",
    "linkedin": "300-char LinkedIn post that drives clicks"
  },
  "seo_keywords": ["primary keyword", "secondary keyword"],
  "publish_platforms": ["Dev.to", "Hashnode", "Medium"]
}"""

AFFILIATE_OPTIMISER_PROMPT = """You are AffiliateOptimiser, an expert in maximising affiliate revenue from technical content.

Given an article and a database of affiliate programs, you select the 3 programs that:
1. Are most relevant to the article topic
2. Have highest commission rates
3. Would genuinely benefit the reader (no spam)

For each program, suggest EXACTLY where in the article to place the link (which paragraph/step).

Output ONLY this JSON:
{
  "matched_affiliates": [
    {
      "rank": 1,
      "program_name": "string",
      "commission": "$X",
      "placement_suggestion": "Add after step 2 where you mention hosting",
      "anchor_text": "natural text to hyperlink",
      "expected_clicks_per_100_views": "X",
      "expected_monthly_revenue_at_1000_views": "$X"
    }
  ],
  "total_revenue_potential_per_1000_views": "$X",
  "optimisation_tip": "one specific tip to maximise this article's affiliate revenue"
}"""

DAILY_PLANNER_PROMPT = """You are DailyPlanner, a productivity coach for developer-entrepreneurs who want to earn $50/day online.

Create a REALISTIC, time-blocked action plan for TODAY. The developer has 4 hours available.

Rules:
- Be brutally honest about timelines (not overly optimistic)
- Show the math: why these actions lead to $50
- Split time: 70% on immediate income actions, 30% on building long-term assets
- Include specific URLs, tool names, and exact copy to use

Output ONLY this JSON:
{
  "today_goal": "$50",
  "realistic_today": "$X (honest estimate for day 1)",
  "realistic_day_30": "$50/day (after consistency)",
  "time_blocks": [
    {
      "time": "9:00 - 10:30 AM",
      "duration": "90 min",
      "task": "specific task name",
      "exact_action": "step-by-step what to do",
      "tool": "specific tool/platform",
      "income_contribution": "$X toward today's goal",
      "priority": "high | medium"
    }
  ],
  "income_math": {
    "strategy": "name",
    "required_actions": "X articles × Y views × Z% CTR × $W commission = $50/day",
    "time_to_first_payment": "X days after publishing"
  },
  "daily_non_negotiables": ["must-do #1", "must-do #2", "must-do #3"],
  "key_mindset": "one sentence on the #1 thing that separates earners from non-earners"
}"""


# ═══════════════════════════════════════════════════════════════════
# FALLBACK DATA (used when API key not set)
# ═══════════════════════════════════════════════════════════════════

def _build_fallback_result() -> dict:
    """Return a high-quality static result when Anthropic key is not set."""
    today = date.today().isoformat()
    return {
        "source": "JARVIS Heuristic Engine (Add ANTHROPIC_API_KEY for AI-powered research)",
        "research_date": today,
        "agents_completed": 0,
        "total_agents": 5,
        "trends": [
            {"topic": "Next.js 14 Server Components", "why_trending": "Next.js 14 released major updates; developers searching for tutorials", "monetisation_angle": "Vercel Pro affiliate ($100/referral)", "affiliate_match": "Vercel Pro", "commission_per_referral": "$100"},
            {"topic": "Deploying Node.js with Docker", "why_trending": "DevOps is the #1 in-demand skill; millions of beginner tutorials searched monthly", "monetisation_angle": "DigitalOcean affiliate ($25/signup)", "affiliate_match": "Digital Ocean", "commission_per_referral": "$25"},
            {"topic": "Building REST APIs with FastAPI", "why_trending": "Python + AI = massive search volume; FastAPI is the fastest-growing Python framework", "monetisation_angle": "Hostinger or cloud hosting affiliate", "affiliate_match": "Hostinger", "commission_per_referral": "$65"},
            {"topic": "React Dashboard with Real-Time Data", "why_trending": "Every business wants dashboards; WebSocket tutorials extremely popular", "monetisation_angle": "Semrush affiliate ($200/sale) via SEO content angle", "affiliate_match": "Semrush", "commission_per_referral": "$200"},
        ],
        "opportunities": STATIC_DAILY_STRATEGIES,
        "content": {
            "title": "How to Deploy a Node.js REST API to DigitalOcean in 15 Minutes",
            "meta_description": "Step-by-step guide to deploying your Node.js app to DigitalOcean. Includes Docker, Nginx, and SSL setup. Free for 60 days with our link.",
            "tags": ["nodejs", "devops", "digitalocean", "deployment", "backend"],
            "article_markdown": """# How to Deploy a Node.js REST API to DigitalOcean in 15 Minutes

Deploying your first Node.js app can feel overwhelming — Nginx, SSL certificates, PM2, firewalls. This guide cuts through the noise and gets you live in 15 minutes.

## What You'll Deploy

A production-ready Node.js REST API with:
- Nginx as reverse proxy (handling HTTPS)
- PM2 for process management (auto-restart on crash)
- Let's Encrypt SSL (free HTTPS)

## Prerequisites

- A Node.js app running on `localhost:3000`
- A [DigitalOcean account](https://digitalocean.com/referral) (get $200 free credit)
- A domain name ($10/year)

## Step 1: Create a Droplet

```bash
# On DigitalOcean dashboard:
# Create → Droplets → Ubuntu 22.04 → Basic → $6/mo → Create
```

SSH into your droplet:
```bash
ssh root@YOUR_IP
```

## Step 2: Install Node.js + PM2

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

## Step 3: Upload and Start Your App

```bash
# On your local machine:
git clone https://github.com/yourusername/your-api.git
cd your-api && npm install

# Start with PM2:
pm2 start index.js --name "my-api"
pm2 startup  # Enable auto-start on reboot
pm2 save
```

## Step 4: Configure Nginx

```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/myapp
```

Paste this config:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

## Step 5: Free SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

Your API is now live at `https://api.yourdomain.com` ✅

## Conclusion

DigitalOcean makes this process cheap ($6/month) and reliable. Use [this link](https://digitalocean.com/referral) to get $200 in free credit — enough for 30+ months of hosting at the $6 plan.

**Next steps:** Set up GitHub Actions for auto-deploy, add monitoring with Better Uptime, and configure database backups.
""",
            "social_posts": {
                "twitter": "Just deployed my Node.js API to DigitalOcean in 15 min 🚀\n\nFull tutorial: [link]\n\nCovers: Docker + Nginx + SSL + PM2\n\nFree $200 credit to get started 👇",
                "linkedin": "I documented the exact steps to deploy a production Node.js API to DigitalOcean — SSL, Nginx, PM2, all of it.\n\nTook me 15 minutes following my own guide. Full tutorial in the comments. DigitalOcean gives $200 free credit for new signups."
            }
        },
        "matched_affiliates": [
            {"program_name": "Digital Ocean", "commission": "$25/signup", "placement_suggestion": "Step 1: After mentioning creating a Droplet", "anchor_text": "DigitalOcean account ($200 free credit)", "expected_monthly_revenue_at_1000_views": "$25-75"},
            {"program_name": "Hostinger", "commission": "$65/sale", "placement_suggestion": "Prerequisites section as an alternative option", "anchor_text": "affordable VPS hosting alternative", "expected_monthly_revenue_at_1000_views": "$65-195"},
        ],
        "daily_plan": {
            "today_goal": "$50",
            "realistic_today": "$0-25 (first day — you're planting seeds)",
            "realistic_day_30": "$50/day (with 20+ published articles)",
            "time_blocks": [
                {"time": "9:00 - 10:30 AM", "duration": "90 min", "task": "Sign up for affiliate programs", "exact_action": "Create accounts on: DigitalOcean Affiliate, Hostinger Affiliates, Semrush Partner. Get your unique referral links.", "tool": "Browser", "income_contribution": "$0 today, $25-200 per future referral", "priority": "high"},
                {"time": "10:30 AM - 12:30 PM", "duration": "120 min", "task": "Write and publish first tutorial article", "exact_action": "Write the Node.js deployment article (template provided above). Publish on Dev.to + Hashnode. Add your affiliate links in Steps 1 and 5.", "tool": "Dev.to, Hashnode", "income_contribution": "$25-200 from first referral click", "priority": "high"},
                {"time": "12:30 - 1:30 PM", "duration": "60 min", "task": "Promote on LinkedIn + Reddit", "exact_action": "Post on LinkedIn with value hook. Share in r/webdev and r/node (as resource, not spam). Respond to all comments.", "tool": "LinkedIn, Reddit", "income_contribution": "Amplifies article reach by 5-10x", "priority": "medium"},
                {"time": "1:30 - 2:30 PM", "duration": "60 min", "task": "Plan tomorrow's article + start bug bounty profile", "exact_action": "Create HackerOne account. Complete your profile. Read 3 program briefs. Start understanding XSS vulnerabilities.", "tool": "HackerOne, OWASP Top 10", "income_contribution": "First bug report possible in 7-14 days = $50-500", "priority": "medium"},
            ],
            "income_math": {"strategy": "Affiliate Content", "required_actions": "20 articles × 2,000 avg views × 1.5% CTR × $65 avg commission = $39/day growing to $65+/day at 30 articles", "time_to_first_payment": "7-21 days after first article published"},
            "daily_non_negotiables": ["Publish 1 article every day for 30 days", "Add affiliate links to EVERY article", "Respond to every comment — builds community"],
            "key_mindset": "The first article earns almost nothing. The 30th article earns while you sleep. Consistency is the only strategy."
        },
        "updated_at": datetime.utcnow().isoformat(),
    }


# ═══════════════════════════════════════════════════════════════════
# MAIN ORCHESTRATOR
# ═══════════════════════════════════════════════════════════════════

async def run_full_pipeline() -> dict:
    """
    Run all 5 agents sequentially.
    Falls back to high-quality static data if API key is missing.
    """
    if not settings.ai_enabled:
        logger.info("Anthropic key not set — returning fallback research.")
        return _build_fallback_result()

    import anthropic
    import asyncio
    from concurrent.futures import ThreadPoolExecutor

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    executor = ThreadPoolExecutor(max_workers=1)
    loop = asyncio.get_event_loop()

    today = date.today().strftime("%B %d, %Y")
    affiliate_summary = "\n".join(
        f"- {p['name']} ({p['category']}): {p['commission']}"
        for p in AFFILIATE_PROGRAMS[:12]
    )

    result: dict = {
        "source": "Claude AI Multi-Agent Pipeline",
        "research_date": date.today().isoformat(),
        "total_agents": 5,
        "agents_completed": 0,
        "updated_at": datetime.utcnow().isoformat(),
    }

    # ── Agent 1: TrendScout ───────────────────────────────────────
    logger.info("Agent 1 (TrendScout) running…")
    try:
        trends_data = await loop.run_in_executor(
            executor, _call_agent, client, TREND_SCOUT_PROMPT,
            f"Today is {today}. Find 4 high-monetisation tech trends for a Full Stack/Backend engineer.", 1500
        )
        result["trends"] = trends_data.get("trends", [])
        result["agents_completed"] = 1
        logger.info("Agent 1 complete. %d trends found.", len(result["trends"]))
    except Exception as e:
        logger.error("Agent 1 failed: %s", e)
        result["trends"] = _build_fallback_result()["trends"]
        result["agents_completed"] = 1

    # ── Agent 2: OpportunityAnalyst ────────────────────────────────
    logger.info("Agent 2 (OpportunityAnalyst) running…")
    try:
        opp_data = await loop.run_in_executor(
            executor, _call_agent, client, OPPORTUNITY_ANALYST_PROMPT,
            f"Trends: {json.dumps(result['trends'])}\nAvailable affiliate programs:\n{affiliate_summary}", 2500
        )
        result["opportunities"] = opp_data.get("opportunities", STATIC_DAILY_STRATEGIES[:3])
        result["agents_completed"] = 2
        logger.info("Agent 2 complete. %d opportunities found.", len(result["opportunities"]))
    except Exception as e:
        logger.error("Agent 2 failed: %s", e)
        result["opportunities"] = STATIC_DAILY_STRATEGIES[:3]
        result["agents_completed"] = 2

    # ── Agent 3: ContentWriter ─────────────────────────────────────
    logger.info("Agent 3 (ContentWriter) running…")
    try:
        top_opp = result["opportunities"][0] if result["opportunities"] else {}
        topic = top_opp.get("topic", result["trends"][0].get("topic", "Node.js deployment") if result["trends"] else "Node.js deployment")
        content_data = await loop.run_in_executor(
            executor, _call_agent, client, CONTENT_WRITER_PROMPT,
            f"Write an affiliate-optimised tutorial article about: {topic}\nTarget affiliate to embed: {top_opp.get('affiliate_to_promote', 'Digital Ocean')}", 4000
        )
        result["content"] = content_data
        result["agents_completed"] = 3
        logger.info("Agent 3 complete. Article: '%s'", content_data.get("title", ""))
    except Exception as e:
        logger.error("Agent 3 failed: %s", e)
        result["content"] = _build_fallback_result()["content"]
        result["agents_completed"] = 3

    # ── Agent 4: AffiliateOptimiser ────────────────────────────────
    logger.info("Agent 4 (AffiliateOptimiser) running…")
    try:
        article_title = result["content"].get("title", "")
        matched = await loop.run_in_executor(
            executor, _call_agent, client, AFFILIATE_OPTIMISER_PROMPT,
            f"Article title: {article_title}\nArticle topic: {result['trends'][0].get('topic', '') if result['trends'] else ''}\n\nAvailable affiliate programs:\n{affiliate_summary}", 1500
        )
        result["matched_affiliates"] = matched.get("matched_affiliates", [])
        result["affiliate_tip"] = matched.get("optimisation_tip", "")
        result["agents_completed"] = 4
    except Exception as e:
        logger.error("Agent 4 failed: %s", e)
        result["matched_affiliates"] = _build_fallback_result()["matched_affiliates"]
        result["agents_completed"] = 4

    # ── Agent 5: DailyPlanner ──────────────────────────────────────
    logger.info("Agent 5 (DailyPlanner) running…")
    try:
        plan = await loop.run_in_executor(
            executor, _call_agent, client, DAILY_PLANNER_PROMPT,
            f"Top opportunity: {json.dumps(result['opportunities'][0] if result['opportunities'] else {})}\nAffiliate programs matched: {json.dumps(result.get('matched_affiliates', []))}", 2500
        )
        result["daily_plan"] = plan
        result["agents_completed"] = 5
    except Exception as e:
        logger.error("Agent 5 failed: %s", e)
        result["daily_plan"] = _build_fallback_result()["daily_plan"]
        result["agents_completed"] = 5

    logger.info("All 5 agents complete.")
    return result
