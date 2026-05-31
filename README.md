# ⚡ JARVIS Wealth Intelligence Portal

> *"Sometimes you gotta run before you can walk." — Tony Stark*

A **real-time global wealth intelligence portal** inspired by Iron Man's J.A.R.V.I.S.
Track world markets, crypto, news, and receive AI-powered money-making guidance — all in a stunning holographic dark UI.

---

## 🌟 What Does This Portal Do?

| Section | What You Get |
|---------|-------------|
| **Command Center** | Dashboard: live indices, BTC/ETH, Fear & Greed, news headlines |
| **Markets** | S&P 500, NASDAQ, Dow, Nikkei, FTSE, Gold, Oil, Silver, Forex pairs |
| **Crypto** | Top 25 coins, sparklines, market cap, dominance, trending, Fear & Greed |
| **News Intel** | Business, Tech, Crypto & World news with AI sentiment tagging |
| **Opportunities** | AI-ranked money-making strategies (personalised to today's market) |
| **Money Guide** | 7 complete wealth-building playbooks with step-by-step instructions |

---

## 🏗️ Architecture

```
jarvis-portal/
├── backend/          ← Python FastAPI (data engine + AI)
│   ├── main.py
│   ├── config.py
│   ├── requirements.txt
│   └── services/
│       ├── market_service.py   ← yfinance (no key needed)
│       ├── crypto_service.py   ← CoinGecko (no key needed)
│       ├── news_service.py     ← RSS feeds + NewsAPI (optional key)
│       └── ai_service.py       ← Claude AI (optional key)
└── frontend/         ← React + Vite + Tailwind
    └── src/
        ├── pages/              ← 6 pages
        └── components/         ← JARVIS layout + UI components
```

**Data Sources (all free):**
- 📈 **Yahoo Finance** via `yfinance` — stocks, indices, forex, commodities
- 🔥 **CoinGecko API** — cryptocurrency (no API key required!)
- 📰 **RSS Feeds** — Reuters, BBC, CNBC, CoinDesk, TechCrunch (no key!)
- 😨 **alternative.me** — Fear & Greed Index (no key!)
- 🤖 **Anthropic Claude** — AI insights (optional, adds personalised analysis)
- 📰 **NewsAPI** — Enhanced news (optional free tier)

---

## 🚀 Quick Start (Local Setup)

### Prerequisites

| Software | Version | Download |
|----------|---------|----------|
| Python   | 3.11+   | https://python.org |
| Node.js  | 18+     | https://nodejs.org |
| Git      | Any     | https://git-scm.com |

---

### Step 1 — Clone / Navigate to the Project

```bash
cd "c:\workspace\New folder\jarvis-portal"
```

---

### Step 2 — Set Up the Python Backend

```bash
# Navigate into backend
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install all dependencies
pip install -r requirements.txt
```

#### Step 2a — Configure API Keys (Optional but Recommended)

```bash
# Copy the example env file
copy .env.example .env    # Windows
# OR
cp .env.example .env      # macOS/Linux
```

Now open `.env` in any text editor and fill in what you have:

```env
# HIGHLY RECOMMENDED — Get free key at https://console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-...

# OPTIONAL — Get free key at https://newsapi.org
NEWS_API_KEY=your_key_here
```

> **Note:** The portal works perfectly without any API keys!
> CoinGecko (crypto) and yfinance (stocks) and RSS feeds (news) are all free with no keys.
> Adding ANTHROPIC_API_KEY unlocks AI-personalised money-making opportunities.

#### Step 2b — Start the Backend Server

```bash
# Make sure you're in the backend/ directory with venv activated
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

You should see:
```
INFO:     Started server process [...]
INFO:     Waiting for application startup.
INFO:     🚀 JARVIS Portal starting up …
INFO:     Market data refreshed.
INFO:     Crypto data refreshed.
INFO:     News data refreshed.
INFO:     ✅ JARVIS Portal ready. Data cache warm.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Test it's working: open http://localhost:8000/api/health in your browser.

---

### Step 3 — Set Up the React Frontend

Open a **new terminal window** (keep the backend running):

```bash
# Navigate to frontend directory
cd "c:\workspace\New folder\jarvis-portal\frontend"

# Install Node dependencies (~2 min)
npm install

# Start the development server
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in 800 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://YOUR_IP:5173/
```

---

### Step 4 — Open the Portal

Open **http://localhost:5173** in your browser.

🎉 **JARVIS is now online!**

---

## 🖥️ Running Both Services (All-in-One)

On Windows, create a file `start-jarvis.bat` in the project root:

```batch
@echo off
echo Starting JARVIS Backend...
start "JARVIS Backend" cmd /k "cd backend && venv\Scripts\activate && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo Waiting for backend to start...
timeout /t 5 /nobreak

echo Starting JARVIS Frontend...
start "JARVIS Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ JARVIS is starting!
echo    Backend:  http://localhost:8000
echo    Frontend: http://localhost:5173
echo.
```

Double-click `start-jarvis.bat` to start everything at once.

---

## 🔌 API Reference

Once the backend is running, all endpoints are available:

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | System health + feature flags |
| `GET /api/summary` | Dashboard summary (key metrics) |
| `GET /api/market` | All market data (indices, forex, commodities, stocks) |
| `GET /api/market/chart/{symbol}` | 30-day price history for any ticker |
| `GET /api/crypto` | All crypto data (top 25, trending, Fear & Greed) |
| `GET /api/news?category=all` | News (categories: business/technology/crypto/world) |
| `GET /api/insights` | AI-powered money-making opportunities |
| `WS /ws/live` | WebSocket: live market updates every 30 seconds |

Interactive API docs: http://localhost:8000/docs

---

## 🎨 UI Features

- **JARVIS Dark Theme** — Near-black background with neon cyan/blue glow
- **Orbitron Font** — Futuristic monospace headings
- **Animated Scan Line** — Moving horizontal beam across the screen
- **Arc Reactor** — Animated spinning rings on the logo
- **Glassmorphism Panels** — Frosted-glass dark panels with glow borders
- **Real-time WebSocket** — Market data pushes every 30 seconds
- **Responsive** — Works on desktop and mobile
- **Shimmer Loading** — Elegant loading states

---

## 💰 Money-Making Strategies Covered

1. **Index Fund Investing** — S&P 500, set-and-forget, 8–12%/yr
2. **Dividend Growth Investing** — Passive income that grows annually
3. **Cryptocurrency HODLing** — BTC/ETH long-term holds
4. **Crypto Staking** — 4–20% APY passive yield
5. **Freelancing** — High-income skills (Python, AI, copywriting)
6. **Content Creation** — YouTube, newsletters, affiliate marketing
7. **E-Commerce** — Dropshipping and print-on-demand
8. **REITs** — Real estate income without owning property
9. **Options Trading** — Wheel strategy for monthly cash flow
10. **AI-Powered Insights** — Claude analyses live market data for you

---

## 🔧 Configuration

### Change Data Refresh Interval

In `backend/.env`:
```env
CACHE_TTL_SECONDS=300    # Default: 5 minutes
```

### Change Port

```env
PORT=8000               # Backend port
```

And in `frontend/vite.config.js`, update the proxy target URL.

---

## 📦 Production Build

To build the frontend for production:

```bash
cd frontend
npm run build
# Output goes to frontend/dist/
```

To serve the built frontend from the backend, install `aiofiles` and serve the dist folder via FastAPI's `StaticFiles`.

---

## 🛠️ Troubleshooting

### "yfinance has no data" for some symbols
Yahoo Finance occasionally blocks requests. This is normal — wait a few minutes and refresh.

### CoinGecko rate limit (429 error)
CoinGecko free API allows ~10-50 calls/minute. The portal caches data for 5 minutes, so this rarely triggers. If it does, wait 1 minute.

### CORS errors in browser
Make sure the backend is running on port 8000 (not another port). Check `vite.config.js` proxy settings.

### "Module not found" errors
Make sure you ran `pip install -r requirements.txt` with the virtual environment **activated**.

### Frontend won't connect to backend
Check that the backend terminal shows "Uvicorn running on http://0.0.0.0:8000". If not, restart the backend.

---

## 📚 Getting API Keys (All Free)

### Anthropic Claude (Best upgrade — enables AI insights)
1. Go to https://console.anthropic.com
2. Sign up (free account)
3. Go to API Keys → Create New Key
4. Copy key into `backend/.env` as `ANTHROPIC_API_KEY`
5. Free tier includes $5 credit — more than enough to use this portal

### NewsAPI (Better news coverage)
1. Go to https://newsapi.org
2. Sign up → Get API Key (it's instant)
3. Free tier: 1,000 requests/day — plenty for personal use
4. Copy key into `backend/.env` as `NEWS_API_KEY`

---

## 🤝 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11, FastAPI, uvicorn |
| Data | yfinance, httpx, feedparser |
| AI | Anthropic Claude API |
| Frontend | React 18, Vite 5 |
| Styling | Tailwind CSS 3, custom animations |
| Charts | Recharts |
| Animation | Framer Motion |
| Icons | React Icons |
| Routing | React Router v6 |

---

*Built with ❤️ and the spirit of Tony Stark. Use responsibly.*
