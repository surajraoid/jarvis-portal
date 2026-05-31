/**
 * Guide.jsx — Comprehensive Money-Making Guide.
 *
 * A fully static, educational resource covering 8 wealth-building strategies.
 * No API calls required — always available.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdMenuBook, MdShowChart, MdCurrencyBitcoin, MdWork, MdVideoLibrary,
  MdStore, MdAccountBalance, MdHome, MdExpandMore, MdExpandLess,
  MdCheck, MdStar, MdArrowForward,
} from 'react-icons/md'

// ── Guide data ─────────────────────────────────────────────────────────────────
const GUIDES = [
  {
    id:    'stocks',
    icon:  MdShowChart,
    color: '#00d4ff',
    title: 'Stock Market Investing',
    tagline: 'Build generational wealth through equity ownership',
    difficulty: 'Beginner–Intermediate',
    timeToFirstReturn: '1 month (dividends) to 1+ year (growth)',
    capitalMin: '$10',
    summary: 'Invest in companies listed on stock exchanges. Your money grows as companies grow. This is how most millionaires build wealth passively.',
    strategies: [
      {
        name: 'Index Fund Investing (Recommended for Beginners)',
        desc: 'Buy ETFs that track the S&P 500 (VOO, SPY, IVV). Historically returns ~10%/year. Set and forget.',
        steps: ['Open a brokerage (Fidelity, Schwab — free)', 'Buy VOO or IVV monthly', 'Enable dividend reinvestment (DRIP)', 'Never sell during market crashes'],
      },
      {
        name: 'Dividend Growth Investing',
        desc: 'Buy companies that pay and grow dividends annually. Creates a rising passive income stream.',
        steps: ['Screen for Dividend Aristocrats (25+ years of raises)', 'Target yield 2–5%, payout ratio <60%', 'Diversify across 8–12 sectors', 'Reinvest dividends for compounding'],
      },
      {
        name: 'Growth Stock Investing',
        desc: 'Buy high-growth companies (tech, AI, biotech). Higher risk, higher reward.',
        steps: ['Look for revenue growth >20% YoY', 'Check for expanding margins', 'Buy in tranches, not all at once', 'Set 25% stop-loss to protect capital'],
      },
    ],
    resources: ['Investopedia.com', 'Seeking Alpha', 'Yahoo Finance', 'Morningstar'],
    pros: ['Passive income from dividends', 'Proven long-term wealth builder', 'Tax advantages in retirement accounts', 'No special skills needed'],
    cons: ['Short-term volatility', 'Requires patience (years not weeks)', 'Needs consistent capital'],
  },
  {
    id:    'crypto',
    icon:  MdCurrencyBitcoin,
    color: '#ff9500',
    title: 'Cryptocurrency',
    tagline: 'High-risk, high-reward digital assets',
    difficulty: 'Beginner–Advanced',
    timeToFirstReturn: 'Immediate (trading) to 1+ year (hodling)',
    capitalMin: '$10',
    summary: 'Cryptocurrencies are digital assets that can provide outsized returns but carry significant risk. Treat as a high-risk allocation (max 10–20% of portfolio).',
    strategies: [
      {
        name: 'HODLing (Long-term holding)',
        desc: 'Buy Bitcoin or Ethereum and hold for 4+ years through market cycles. Historically outperforms most assets.',
        steps: ['Buy BTC/ETH on Coinbase or Kraken', 'Move to a hardware wallet (Ledger)', 'Set a target (e.g., sell 25% at 3x)', 'Ignore daily price movements'],
      },
      {
        name: 'Staking for Yield',
        desc: 'Lock your crypto to validate transactions and earn 4–20% APY passively.',
        steps: ['Choose: ETH (4–6%), SOL (6–8%), ADA (4–5%)', 'Use Lido for liquid ETH staking', 'Compound rewards monthly', 'NEVER stake on unaudited protocols'],
      },
      {
        name: 'DCA (Dollar-Cost Averaging)',
        desc: 'Buy a fixed dollar amount of BTC/ETH every week regardless of price.',
        steps: ['Set up recurring $25–$100/week buy on Coinbase', 'This removes emotion from the process', 'Review and adjust quarterly', 'Track cost basis for taxes'],
      },
    ],
    resources: ['CoinGecko.com', 'DeFiLlama.com', 'Messari.io', 'CoinDesk'],
    pros: ['Massive upside potential', 'Operates 24/7 globally', 'Staking generates passive income', 'Low barrier to entry'],
    cons: ['Extreme volatility (-90% drawdowns happen)', 'Regulatory uncertainty', 'Scam risk is high', 'Tax complexity'],
  },
  {
    id:    'freelance',
    icon:  MdWork,
    color: '#cc66ff',
    title: 'Freelancing',
    tagline: 'Sell your skills online with zero startup cost',
    difficulty: 'Beginner',
    timeToFirstReturn: '1–4 weeks',
    capitalMin: '$0',
    summary: 'The fastest path to online income. Platforms like Upwork and Fiverr connect you with global clients. Top skills in 2025: AI engineering, data analysis, cloud architecture, copywriting.',
    strategies: [
      {
        name: 'High-Income Tech Skills',
        desc: 'Python, React, Machine Learning, and Cloud AWS/Azure command $80–$200/hr.',
        steps: ['Identify your strongest skill', 'Create profiles on Upwork + Toptal', 'Build 3 portfolio projects', 'Apply to 10 jobs/day for first 2 weeks'],
      },
      {
        name: 'Content & Copywriting',
        desc: 'AI-enhanced copywriting for ads, SEO articles, and email sequences pays $50–$150/hr.',
        steps: ['Learn Claude/ChatGPT for content acceleration', 'Niche down (finance, SaaS, health)', 'Pitch 5 clients/day on LinkedIn + Upwork', 'Raise rates 20% every 3 months'],
      },
      {
        name: 'AI Prompt Engineering',
        desc: 'The newest high-demand skill. Help companies integrate AI into workflows.',
        steps: ['Master Claude, GPT-4, and Midjourney', 'Build automations with n8n or Zapier', 'Create case studies showing ROI', 'Charge $100–$250/hr for consulting'],
      },
    ],
    resources: ['Upwork.com', 'Toptal.com', 'Fiverr.com', 'LinkedIn Premium'],
    pros: ['Zero startup cost', 'Work from anywhere', 'Income from day 1', 'Skill compounds over time'],
    cons: ['Income is not passive (time = money)', 'Client acquisition takes time', 'Feast-or-famine cycles', 'Must manage taxes yourself'],
  },
  {
    id:    'content',
    icon:  MdVideoLibrary,
    color: '#ff3366',
    title: 'Content Creation',
    tagline: 'Build an audience that generates money while you sleep',
    difficulty: 'Beginner–Intermediate',
    timeToFirstReturn: '3–12 months',
    capitalMin: '$0',
    summary: 'Create content (YouTube, blog, newsletter, podcast) around a topic you know. Monetise with ads, sponsorships, and affiliate links. Scales to millions with zero marginal cost.',
    strategies: [
      {
        name: 'YouTube Channel',
        desc: 'Long-form video content earns ad revenue + sponsorships. Finance/tech niches pay $5–$30 per 1,000 views.',
        steps: ['Choose a niche: personal finance, AI tools, productivity', 'Publish 1 video/week consistently', 'Optimise thumbnails and titles (CTR matters most)', 'Apply for monetisation at 1,000 subscribers + 4,000 watch hours'],
      },
      {
        name: 'Newsletter / Substack',
        desc: 'Email newsletters have 40% open rates vs 5% for social media. Paid subscriptions at $10/month.',
        steps: ['Pick a niche you can write about weekly', 'Start on Substack (free, takes 10% of revenue)', 'Grow on Twitter/LinkedIn by sharing insights', 'Upsell premium tier at $10–$20/month'],
      },
      {
        name: 'Affiliate Marketing',
        desc: 'Recommend products and earn 5–50% commissions on every sale.',
        steps: ['Join Amazon Associates (up to 10% commission)', 'Find high-ticket offers on ClickBank or Impact.com', 'Create honest review content', 'Track conversions and double-down on winners'],
      },
    ],
    resources: ['YouTube Studio', 'Substack.com', 'ConvertKit.com', 'Amazon Associates'],
    pros: ['True passive income once established', 'Global reach', 'Multiple monetisation streams', 'Builds personal brand'],
    cons: ['Takes 6–12 months to see income', 'Consistency is critical', 'Algorithm changes can kill traffic', 'Requires content creation skills'],
  },
  {
    id:    'ecommerce',
    icon:  MdStore,
    color: '#00ffcc',
    title: 'E-Commerce',
    tagline: 'Sell products online without a physical store',
    difficulty: 'Intermediate',
    timeToFirstReturn: '1–3 months',
    capitalMin: '$200',
    summary: 'Build an online store without holding inventory (dropshipping) or with your own products (print-on-demand). Use AI to find winning products and write compelling copy.',
    strategies: [
      {
        name: 'Dropshipping',
        desc: 'Sell products without holding inventory. Supplier ships directly to customer.',
        steps: ['Find trending products on TikTok + Google Trends', 'Source from AliExpress / CJ Dropshipping', 'Build Shopify store (free trial)', 'Run $20/day Facebook or TikTok ads'],
      },
      {
        name: 'Print on Demand',
        desc: 'Design t-shirts, mugs, phone cases. Printful/Printify prints and ships on demand.',
        steps: ['Create designs using Canva or Midjourney AI', 'Connect Printful to your Etsy/Shopify store', 'Research trending niches on Etsy', 'Launch 20+ designs per month'],
      },
    ],
    resources: ['Shopify.com', 'Etsy.com', 'DSers.com', 'Printful.com'],
    pros: ['No inventory needed', 'Automated once running', 'Scalable with ad spend', 'Global market access'],
    cons: ['Paid ads required ($200+ to test)', 'Low margins on dropshipping (15–30%)', 'High competition', 'Customer service overhead'],
  },
  {
    id:    'options',
    icon:  MdShowChart,
    color: '#6699ff',
    title: 'Options Trading',
    tagline: 'Advanced strategies for weekly cash flow',
    difficulty: 'Advanced',
    timeToFirstReturn: 'Weekly',
    capitalMin: '$2,000',
    summary: 'Options are contracts that give you the right (not obligation) to buy/sell stocks at a set price. Advanced but powerful — the Wheel Strategy generates 2–5% monthly cash flow on stocks you already own.',
    strategies: [
      {
        name: 'The Wheel Strategy (Safest)',
        desc: 'Sell cash-secured puts to get paid while waiting to buy stock at a discount. Then sell covered calls for income.',
        steps: ['Choose a quality stock you\'d want to own (AAPL, MSFT)', 'Sell 30-day put option 10% below current price', 'If assigned, sell covered call above your cost basis', 'Repeat — collect premium every 30 days'],
      },
    ],
    resources: ['Tastytrade.com', 'ThetaGang subreddit', 'OptionStrat.com', 'Investopedia Options Guide'],
    pros: ['2–5% monthly returns possible', 'Generate income from stocks you own', 'Defined risk strategies exist', 'Works in sideways markets'],
    cons: ['Complex — steep learning curve', 'Can amplify losses if misused', 'Requires significant capital', 'Time-consuming to manage'],
  },
  {
    id:    'realestate',
    icon:  MdHome,
    color: '#ff9500',
    title: 'Real Estate (Online)',
    tagline: 'Earn rental income without buying property',
    difficulty: 'Beginner',
    timeToFirstReturn: 'Quarterly dividends',
    capitalMin: '$10',
    summary: 'Invest in real estate without managing tenants via REITs (Real Estate Investment Trusts) on the stock market, or real estate crowdfunding platforms.',
    strategies: [
      {
        name: 'REITs (Real Estate Investment Trusts)',
        desc: 'Buy REITs on the stock market like any stock. REITs must pay 90% of income as dividends (4–8% yield).',
        steps: ['Research REITs: O, STAG, VNQ, SCHH', 'Focus on net lease REITs (most stable)', 'Buy monthly and reinvest dividends', 'Diversify across property types'],
      },
      {
        name: 'Real Estate Crowdfunding',
        desc: 'Invest in specific properties alongside other investors for as little as $10.',
        steps: ['Join Fundrise (min $10) or CrowdStreet (accredited only)', 'Choose diversified eREIT for beginners', 'Target 8–12% annual returns', 'Hold for 5+ years — illiquid'],
      },
    ],
    resources: ['Fundrise.com', 'NAREIT.com', 'CrowdStreet.com', 'BiggerPockets.com'],
    pros: ['Passive income from dividends', 'Low minimum investment', 'Inflation hedge', 'Professional management'],
    cons: ['Less control than physical property', 'Crowdfunding is illiquid', 'REITs fall with stock market', 'Dividend taxes are higher rate'],
  },
]

// ── Guide Card ─────────────────────────────────────────────────────────────────
function GuideCard({ guide }) {
  const [expanded, setExpanded] = useState(false)
  const Icon = guide.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="jarvis-panel overflow-hidden"
    >
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-jarvis-cyan/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 rounded flex items-center justify-center shrink-0"
            style={{ background: `${guide.color}18`, border: `1px solid ${guide.color}40` }}
          >
            <Icon size={20} style={{ color: guide.color }} />
          </div>
          <div className="flex-1">
            <h3 className="font-orbitron text-sm tracking-wide" style={{ color: guide.color }}>
              {guide.title}
            </h3>
            <p className="text-jarvis-dim text-xs font-exo">{guide.tagline}</p>
          </div>
          <div className="hidden md:flex items-center gap-3 text-xs">
            <span className="text-jarvis-dim font-exo">Min: <span className="text-jarvis-green font-semibold">{guide.capitalMin}</span></span>
            <span className="text-jarvis-dim font-exo">Level: <span className="text-jarvis-cyan">{guide.difficulty}</span></span>
          </div>
          <button className="text-jarvis-dim hover:text-jarvis-cyan transition-colors shrink-0">
            {expanded ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
          </button>
        </div>
      </div>

      {/* Expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-jarvis-border/30"
          >
            <div className="p-4 space-y-5">
              {/* Summary */}
              <p className="text-jarvis-text text-sm font-exo leading-relaxed">{guide.summary}</p>

              {/* Meta */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: 'Difficulty',       val: guide.difficulty },
                  { label: 'Capital Needed',   val: guide.capitalMin },
                  { label: 'Time to Return',   val: guide.timeToFirstReturn },
                ].map(({ label, val }) => (
                  <div key={label} className="bg-jarvis-surface border border-jarvis-border rounded p-3">
                    <div className="text-jarvis-dim text-xs font-exo mb-1">{label}</div>
                    <div className="text-jarvis-cyan text-sm font-orbitron">{val}</div>
                  </div>
                ))}
              </div>

              {/* Strategies */}
              <div>
                <div className="font-orbitron text-jarvis-dim text-xs tracking-wider mb-3">STRATEGIES</div>
                <div className="space-y-4">
                  {guide.strategies.map((s) => (
                    <div key={s.name} className="bg-jarvis-surface/50 border border-jarvis-border/50 rounded p-3">
                      <h4 className="font-exo text-jarvis-cyan text-sm font-semibold mb-1">{s.name}</h4>
                      <p className="text-jarvis-dim text-xs font-exo mb-3">{s.desc}</p>
                      <div className="space-y-1.5">
                        {s.steps.map((step, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs font-exo">
                            <MdArrowForward size={12} className="text-jarvis-cyan shrink-0 mt-0.5" />
                            <span className="text-jarvis-text">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pros/Cons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="font-orbitron text-jarvis-dim text-xs tracking-wider mb-2">PROS</div>
                  <div className="space-y-1.5">
                    {guide.pros.map((p) => (
                      <div key={p} className="flex items-start gap-2 text-xs font-exo">
                        <MdCheck size={13} className="text-jarvis-green shrink-0 mt-0.5" />
                        <span className="text-jarvis-text">{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="font-orbitron text-jarvis-dim text-xs tracking-wider mb-2">CONS</div>
                  <div className="space-y-1.5">
                    {guide.cons.map((c) => (
                      <div key={c} className="flex items-start gap-2 text-xs font-exo">
                        <span className="text-jarvis-red text-xs shrink-0 mt-0.5">✕</span>
                        <span className="text-jarvis-text">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resources */}
              <div>
                <div className="font-orbitron text-jarvis-dim text-xs tracking-wider mb-2">RESOURCES</div>
                <div className="flex flex-wrap gap-2">
                  {guide.resources.map((r) => (
                    <span key={r} className="px-3 py-1 bg-jarvis-surface border border-jarvis-border/60 rounded text-jarvis-dim text-xs font-exo hover:text-jarvis-cyan hover:border-jarvis-cyan/40 transition-colors cursor-pointer">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Guide() {
  const [search, setSearch] = useState('')

  const filtered = GUIDES.filter(g => {
    if (!search) return true
    const q = search.toLowerCase()
    return g.title.toLowerCase().includes(q) || g.tagline.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-4 fade-in">
      {/* Header */}
      <div>
        <h1 className="font-orbitron text-jarvis-cyan text-lg tracking-widest">MONEY-MAKING GUIDE</h1>
        <p className="text-jarvis-dim text-xs font-exo">
          {GUIDES.length} proven strategies · Click any card to expand full playbook
        </p>
      </div>

      {/* Golden rule banner */}
      <div className="jarvis-panel p-4 border-l-2 border-l-jarvis-yellow">
        <div className="flex items-start gap-3">
          <MdStar size={18} className="text-jarvis-yellow shrink-0 mt-0.5" />
          <div>
            <div className="font-orbitron text-jarvis-yellow text-xs tracking-wider mb-1">
              THE JARVIS GOLDEN RULE
            </div>
            <p className="text-jarvis-text text-sm font-exo leading-relaxed">
              <strong>Diversify across at least 3 strategies.</strong> Start with Index Funds (passive baseline) +
              one active strategy (freelancing/content) + a small crypto allocation (max 10%). This combination
              provides both stable growth and income from day 1.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search strategies…"
        className="w-full bg-jarvis-surface border border-jarvis-border rounded px-4 py-2 text-jarvis-text text-sm font-exo outline-none placeholder:text-jarvis-dim focus:border-jarvis-cyan/60"
      />

      {/* Guide cards */}
      <div className="space-y-3">
        {filtered.map(guide => <GuideCard key={guide.id} guide={guide} />)}
      </div>

      {/* Disclaimer */}
      <div className="text-jarvis-dim text-xs font-exo text-center pb-4 leading-relaxed">
        ⚠ This guide is for educational purposes only. Not financial advice. Always do your own research
        and consider consulting a qualified financial advisor before investing.
      </div>
    </div>
  )
}
