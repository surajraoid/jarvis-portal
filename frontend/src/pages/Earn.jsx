/**
 * Earn.jsx — Software Engineer's Complete Earning Launchpad
 *
 * Personalised for: Full Stack / Backend Developer · 10-20 hrs/week
 *
 * Sections:
 *  1. Hero banner with income potential
 *  2. Interactive income calculator
 *  3. Strategy tabs: Freelancing | Micro-SaaS | Content | Remote
 *  4. Upwork Profile Bio Generator
 *  5. 30-Day Action Plan with interactive checklist
 *  6. Resource library
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdMonetizationOn, MdCode, MdRocketLaunch, MdVideoLibrary,
  MdWork, MdCheck, MdArrowForward, MdLightbulb, MdStar,
  MdExpandMore, MdExpandLess, MdCopyAll, MdCalculate,
  MdTimer, MdTrendingUp, MdWarning, MdOpenInNew,
} from 'react-icons/md'

// ═══════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════

const SKILLS = [
  { id: 'react',     label: 'React / Frontend',        upwork: 65,  toptal: 100, fiverr: 250 },
  { id: 'fullstack', label: 'Full Stack (React+Node)',  upwork: 80,  toptal: 120, fiverr: 400 },
  { id: 'backend',   label: 'Node.js / Python Backend', upwork: 75,  toptal: 115, fiverr: 350 },
  { id: 'mobile',    label: 'React Native / Flutter',   upwork: 75,  toptal: 120, fiverr: 350 },
  { id: 'devops',    label: 'DevOps / AWS / Azure',     upwork: 90,  toptal: 140, fiverr: 500 },
  { id: 'ai',        label: 'AI / ML / Python Data',    upwork: 100, toptal: 160, fiverr: 600 },
]

const EXP_MULTIPLIER = { '0-1': 0.6, '1-3': 0.8, '3-5': 1.0, '5+': 1.25 }

// 10 Micro-SaaS ideas for full-stack engineers
const SAAS_IDEAS = [
  {
    id: 1, title: 'Webhook Debugger',
    desc: 'Inspect, replay, and debug incoming webhooks in real time. Developers hate debugging webhooks — this is a painkiller tool.',
    difficulty: 'Easy', buildTime: '1–2 weeks', price: '$15/mo',
    targetUsers: '300 developers', revenue: '$4,500/mo',
    tech: 'Node.js + React + WebSockets',
    steps: ['Build a URL endpoint that logs all incoming requests', 'Show them in a live dashboard', 'Add replay, filter, and share features', 'List on Product Hunt'],
    competitors: 'webhook.site (free only)', edge: 'Add replay + team sharing',
  },
  {
    id: 2, title: 'Developer Invoice & Time Tracker',
    desc: 'Freelancers need invoicing. Build a simple timer → invoice → PDF tool designed for developers (GitHub integration, hourly billing).',
    difficulty: 'Easy', buildTime: '1–2 weeks', price: '$9/mo',
    targetUsers: '500 freelancers', revenue: '$4,500/mo',
    tech: 'React + Node + Stripe + PDF generation',
    steps: ['Start timer per project/task', 'Calculate billable hours automatically', 'Generate PDF invoice with one click', 'Charge via Stripe — 14-day free trial'],
    competitors: 'FreshBooks, Harvest', edge: 'Developer-specific (GitHub PR link, tech rates)',
  },
  {
    id: 3, title: 'API Mock Server (SaaS)',
    desc: 'Teams need to mock APIs during development. Host a service where developers define mock API endpoints without any backend setup.',
    difficulty: 'Medium', buildTime: '2–3 weeks', price: '$19/mo',
    targetUsers: '200 teams', revenue: '$3,800/mo',
    tech: 'Node.js + MongoDB + React',
    steps: ['User defines endpoint + response JSON in UI', 'Generate unique mock URL (mock.yourapp.com/abc123/users)', 'Support GET/POST/PUT/DELETE with custom responses', 'Add delay simulation + error simulation'],
    competitors: 'Mockoon (desktop only), Beeceptor', edge: 'Team sharing + persistence + URL',
  },
  {
    id: 4, title: 'Changelog Widget',
    desc: 'Every SaaS needs a changelog. Build an embeddable widget + hosted page so developers can publish updates without building it themselves.',
    difficulty: 'Easy', buildTime: '1 week', price: '$9/mo',
    targetUsers: '500 SaaS companies', revenue: '$4,500/mo',
    tech: 'React + Node + embed script',
    steps: ['Dashboard to write changelog entries', 'Embeddable popup widget (1 line of JS)', 'Hosted public changelog page', 'Email notification to subscribers'],
    competitors: 'Headwayapp.co, Beamer', edge: 'Simpler, cheaper, developer-first',
  },
  {
    id: 5, title: 'README & Docs Generator',
    desc: 'AI-powered README.md generator from GitHub repo. Developers hate writing docs — this does it for them in 30 seconds.',
    difficulty: 'Easy', buildTime: '1 week', price: '$9/mo',
    targetUsers: '1,000 developers', revenue: '$9,000/mo',
    tech: 'React + Claude/OpenAI API + GitHub API',
    steps: ['User pastes GitHub repo URL', 'Scrape code + package.json + file structure', 'Generate README via AI (Claude API)', 'Let them edit and download as .md'],
    competitors: 'readme.so (manual only)', edge: 'Actually AI-generated from real code',
  },
  {
    id: 6, title: 'Uptime Monitor + Status Page',
    desc: 'Monitor websites every minute and host a public status page. Simple business, recurring revenue, very low churn.',
    difficulty: 'Medium', buildTime: '2 weeks', price: '$19/mo',
    targetUsers: '200 businesses', revenue: '$3,800/mo',
    tech: 'Node.js + cron jobs + React + Twilio SMS',
    steps: ['User adds URLs to monitor', 'Check every 1 minute with cron', 'Send SMS/email alert on downtime', 'Auto-generate status.yoursite.com page'],
    competitors: 'Freshping, UptimeRobot', edge: 'Custom status page + affordable',
  },
  {
    id: 7, title: 'Feature Flag Service',
    desc: 'Let developers toggle features on/off without redeploying. Simple SDK + dashboard. LaunchDarkly charges $400/mo — yours could be $29.',
    difficulty: 'Medium', buildTime: '2–3 weeks', price: '$29/mo',
    targetUsers: '100 startups', revenue: '$2,900/mo',
    tech: 'Node.js + Redis + React + SDK (JS/Python)',
    steps: ['Dashboard to create boolean/string flags', 'REST API: GET /flags?env=production', 'JS SDK: flagr.isEnabled("new-ui")', 'Environments: dev/staging/production'],
    competitors: 'LaunchDarkly ($400/mo!), Flagsmith', edge: 'Affordable, simple, self-serve',
  },
  {
    id: 8, title: 'Code Interview Prep Platform',
    desc: 'Daily LeetCode-style problems with AI explanations. Charge for premium problem sets, company-specific packs, and 1-on-1 mock interviews.',
    difficulty: 'Hard', buildTime: '4–6 weeks', price: '$19/mo',
    targetUsers: '500 developers', revenue: '$9,500/mo',
    tech: 'React + Node + Monaco Editor + AI API',
    steps: ['Build code editor (Monaco) + test runner', 'Seed 50 curated problems with test cases', 'AI explains solution when stuck', 'Premium: FAANG-specific packs + mock interviews'],
    competitors: 'LeetCode, AlgoExpert', edge: 'AI explanations + affordable premium',
  },
  {
    id: 9, title: 'Environment Variable Manager',
    desc: 'Teams lose .env files, share them over Slack, expose secrets. Build a secure vault for team environment variables.',
    difficulty: 'Easy–Medium', buildTime: '2 weeks', price: '$19/mo',
    targetUsers: '200 teams', revenue: '$3,800/mo',
    tech: 'React + Node + AES-256 encryption + CLI',
    steps: ['Dashboard: create projects + environments', 'Store encrypted key-value pairs', 'CLI: dotenv-vault pull (like Heroku config vars)', 'Team sharing with role permissions'],
    competitors: 'Doppler, 1Password Teams', edge: 'Simpler UI, developer CLI',
  },
  {
    id: 10, title: 'SQL Query Explainer',
    desc: 'Paste any SQL query and get a plain-English explanation + performance tips + suggested indexes. Junior devs and non-technical folks pay for this.',
    difficulty: 'Easy', buildTime: '3–5 days', price: '$9/mo',
    targetUsers: '500 users', revenue: '$4,500/mo',
    tech: 'React + Node + Claude/OpenAI API',
    steps: ['Text area to paste SQL', 'Call Claude API to explain in plain English', 'Show performance warnings (missing indexes, N+1)', 'Add schema upload for smarter analysis'],
    competitors: 'None strong', edge: 'First-mover, very low competition',
  },
]

const THIRTY_DAY_PLAN = [
  {
    week: 'Week 1 — Setup (Days 1–7)',
    color: '#00d4ff',
    tasks: [
      { day: 'Day 1', task: 'Create Upwork account and fill 100% of profile (photo, bio, skills)' },
      { day: 'Day 2', task: 'Create Fiverr account, list 3 gigs (Full Stack Dev, API Development, React UI)' },
      { day: 'Day 3', task: 'Build 1 portfolio project: a demo app showcasing your best skill' },
      { day: 'Day 4', task: 'Write your professional bio (use the Bio Generator below!)' },
      { day: 'Day 5', task: 'Apply to 10 Upwork jobs. Write personalised proposals (no copy-paste)' },
      { day: 'Day 6–7', task: 'Continue applying. Aim for 20 total proposals by end of week' },
    ],
  },
  {
    week: 'Week 2 — First Contact (Days 8–14)',
    color: '#00ff88',
    tasks: [
      { day: 'Day 8', task: 'Review proposal responses. Follow up on all applications' },
      { day: 'Day 9', task: 'Apply 10 more jobs. Focus on smaller $100–$500 fixed-price projects' },
      { day: 'Day 10', task: 'If no response yet — revise your profile bio and skills section' },
      { day: 'Day 11', task: 'Join 3 relevant Facebook groups / LinkedIn groups for your niche' },
      { day: 'Day 12', task: 'Post your first value-add post on LinkedIn (tip/tutorial/insight)' },
      { day: 'Day 13–14', task: 'Apply 10 more. Total: 40 proposals. Accept ANY first project for review' },
    ],
  },
  {
    week: 'Week 3 — First Client (Days 15–21)',
    color: '#ffcc00',
    tasks: [
      { day: 'Day 15', task: 'You should have 1–2 interviews by now. Prepare: show portfolio, ask good questions' },
      { day: 'Day 16', task: 'Accept your first project. Even if rate is low — the review is worth $1,000' },
      { day: 'Day 17', task: 'Over-deliver on first client: add a small extra feature they didn\'t ask for' },
      { day: 'Day 18', task: 'Start validating your Micro-SaaS idea: Google Trends + Reddit search' },
      { day: 'Day 19', task: 'Set up a landing page for your SaaS idea (use Carrd.co — free)' },
      { day: 'Day 20–21', task: 'Continue freelance project. Talk to 5 potential SaaS customers on Reddit/LinkedIn' },
    ],
  },
  {
    week: 'Week 4 — Scale (Days 22–30)',
    color: '#ff9500',
    tasks: [
      { day: 'Day 22', task: 'Deliver first project → ASK for 5-star review immediately after delivery' },
      { day: 'Day 23', task: 'Raise your Upwork rate by 20%. Apply to 10 more (better quality) jobs' },
      { day: 'Day 24', task: 'Start building your SaaS MVP if you got validation from customers' },
      { day: 'Day 25', task: 'Post second LinkedIn article. Share your first freelance win story' },
      { day: 'Day 26', task: 'Secure 2nd client at higher rate (use first review as social proof)' },
      { day: 'Day 27–30', task: 'Set a 90-day goal: $2,000/month by day 90. Plan your rate increases' },
    ],
  },
]

const UPWORK_TEMPLATES = {
  fullstack: `I'm a Full Stack Developer with [X] years of experience building scalable web applications using React, Node.js, and PostgreSQL/MongoDB.

I specialise in:
• Building RESTful and GraphQL APIs from scratch
• React/Next.js frontends with clean, maintainable code
• Database design, optimisation, and migrations
• Deploying on AWS / Vercel / Railway with CI/CD pipelines

What sets me apart:
I don't just write code — I think about your business problem first. Every project gets a technical brief upfront so there are zero surprises at delivery.

Recent wins:
• Built a SaaS dashboard for a startup that handles 10k+ daily users
• Reduced API response time by 60% through query optimisation
• Delivered 3 projects 2 days ahead of schedule (check my reviews!)

I respond within 2 hours and will send you a detailed plan before charging a single dollar. Let's talk about your project.`,

  backend: `I'm a Backend Engineer specialising in Node.js, Python (FastAPI/Django), and cloud infrastructure (AWS/GCP).

My expertise:
• Building high-performance REST & GraphQL APIs
• Microservices architecture and system design
• PostgreSQL, MongoDB, Redis — schema design to query optimisation
• Docker, Kubernetes, CI/CD pipelines

I've helped businesses:
• Cut backend costs by 40% through infrastructure optimisation
• Migrate monolithic apps to microservices
• Build real-time features (WebSockets, SSE) at scale

I write documentation as I build, so your team can maintain everything long-term. Clean code, tested, production-ready.

Let's discuss your project — I'll share a technical approach doc before we start.`,
}

const RESOURCES = [
  { category: 'Freelancing', items: [
    { name: 'Upwork', url: 'https://upwork.com', desc: 'Best platform for long-term clients, hourly contracts' },
    { name: 'Toptal', url: 'https://toptal.com', desc: 'Elite network, $100–$200/hr, rigorous screening' },
    { name: 'Fiverr Pro', url: 'https://pro.fiverr.com', desc: 'Project-based, great for fixed-scope work' },
    { name: 'Gun.io', url: 'https://gun.io', desc: 'Curated remote engineering contracts' },
  ]},
  { category: 'Micro-SaaS Launch', items: [
    { name: 'Stripe', url: 'https://stripe.com', desc: 'Accept payments in minutes — subscriptions, one-time' },
    { name: 'Supabase', url: 'https://supabase.com', desc: 'Free Postgres + Auth + Storage backend to start' },
    { name: 'Vercel', url: 'https://vercel.com', desc: 'Free frontend hosting, auto-deploy from GitHub' },
    { name: 'Railway', url: 'https://railway.app', desc: '$5/mo backend hosting — better than Heroku' },
    { name: 'Carrd.co', url: 'https://carrd.co', desc: 'Free landing page in 30 minutes. Validate before building.' },
    { name: 'Lemon Squeezy', url: 'https://lemonsqueezy.com', desc: 'Sell SaaS with built-in payments + VAT handling' },
  ]},
  { category: 'Learning', items: [
    { name: 'Indie Hackers', url: 'https://indiehackers.com', desc: 'Real stories from solo founders earning $1k–$50k/mo' },
    { name: 'MicroSaaSIdeas.com', url: 'https://microsaasideas.com', desc: 'Weekly curated micro-SaaS opportunities' },
    { name: 'Marc Lou\'s blog', url: 'https://marclou.beehiiv.com', desc: 'Solo dev who shipped 15 SaaS products in 1 year' },
    { name: 'r/freelance', url: 'https://reddit.com/r/freelance', desc: 'Real advice from working freelancers' },
  ]},
]

// ═══════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════

// ── Income Calculator ──────────────────────────────────────────────
function IncomeCalculator() {
  const [skill,   setSkill]   = useState('fullstack')
  const [hours,   setHours]   = useState(15)
  const [exp,     setExp]     = useState('1-3')
  const [platform,setPlatform]= useState('upwork')

  const s    = SKILLS.find(x => x.id === skill) || SKILLS[1]
  const mult = EXP_MULTIPLIER[exp] || 1
  const rate = Math.round((platform === 'upwork' ? s.upwork : platform === 'toptal' ? s.toptal : s.fiverr / 8) * mult)
  const weekly   = platform === 'fiverr' ? Math.round(s.fiverr * mult * (hours / 20)) : rate * hours
  const monthly  = Math.round(weekly * 4.3)
  const annual   = Math.round(monthly * 12)

  const barWidth = Math.min(100, (monthly / 10000) * 100)
  const barColor = monthly >= 5000 ? '#00ff88' : monthly >= 2000 ? '#00d4ff' : '#ffcc00'

  return (
    <div className="jarvis-panel">
      <div className="jarvis-panel-header">
        <MdCalculate className="text-jarvis-cyan" />
        <h3>Income Calculator — See Your Earning Potential</h3>
      </div>
      <div className="p-4 space-y-4">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Skill */}
          <div>
            <label className="text-jarvis-dim text-xs font-orbitron tracking-wider block mb-1.5">YOUR SKILL</label>
            <select
              value={skill}
              onChange={e => setSkill(e.target.value)}
              className="w-full bg-jarvis-surface border border-jarvis-border rounded px-3 py-2 text-jarvis-text text-sm font-exo outline-none focus:border-jarvis-cyan"
            >
              {SKILLS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          {/* Experience */}
          <div>
            <label className="text-jarvis-dim text-xs font-orbitron tracking-wider block mb-1.5">EXPERIENCE</label>
            <select
              value={exp}
              onChange={e => setExp(e.target.value)}
              className="w-full bg-jarvis-surface border border-jarvis-border rounded px-3 py-2 text-jarvis-text text-sm font-exo outline-none focus:border-jarvis-cyan"
            >
              <option value="0-1">0–1 year</option>
              <option value="1-3">1–3 years</option>
              <option value="3-5">3–5 years</option>
              <option value="5+">5+ years</option>
            </select>
          </div>
          {/* Platform */}
          <div>
            <label className="text-jarvis-dim text-xs font-orbitron tracking-wider block mb-1.5">PLATFORM</label>
            <select
              value={platform}
              onChange={e => setPlatform(e.target.value)}
              className="w-full bg-jarvis-surface border border-jarvis-border rounded px-3 py-2 text-jarvis-text text-sm font-exo outline-none focus:border-jarvis-cyan"
            >
              <option value="upwork">Upwork (hourly)</option>
              <option value="toptal">Toptal (premium)</option>
              <option value="fiverr">Fiverr (per project)</option>
            </select>
          </div>
          {/* Hours per week */}
          <div>
            <label className="text-jarvis-dim text-xs font-orbitron tracking-wider block mb-1.5">
              HOURS/WEEK: <span className="text-jarvis-cyan">{hours}h</span>
            </label>
            <input
              type="range" min={5} max={40} value={hours}
              onChange={e => setHours(Number(e.target.value))}
              className="w-full accent-jarvis-cyan"
            />
            <div className="flex justify-between text-jarvis-dim text-xs font-exo mt-1">
              <span>5h (evenings)</span><span>40h (full-time)</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-3 gap-3 mt-2">
          {[
            { label: 'Per Week',  val: `$${weekly.toLocaleString()}`,  color: '#4a7a9b' },
            { label: 'Per Month', val: `$${monthly.toLocaleString()}`, color: barColor  },
            { label: 'Per Year',  val: `$${annual.toLocaleString()}`,  color: barColor  },
          ].map(({ label, val, color }) => (
            <div key={label} className="bg-jarvis-surface border border-jarvis-border rounded p-4 text-center">
              <div className="text-jarvis-dim text-xs font-exo mb-1">{label}</div>
              <div className="font-orbitron text-2xl font-bold" style={{ color }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs font-exo mb-1">
            <span className="text-jarvis-dim">$0</span>
            <span className="font-orbitron text-xs" style={{ color: barColor }}>
              {platform === 'toptal' ? '' : `@ $${rate}/hr`} ← Your estimated rate
            </span>
            <span className="text-jarvis-dim">$10,000/mo</span>
          </div>
          <div className="h-3 bg-jarvis-surface rounded-full overflow-hidden border border-jarvis-border">
            <motion.div
              className="h-full rounded-full"
              style={{ background: barColor, boxShadow: `0 0 8px ${barColor}` }}
              initial={{ width: 0 }}
              animate={{ width: `${barWidth}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        <p className="text-jarvis-dim text-xs font-exo">
          ℹ️ Based on market rates for {exp} year(s) experience on {platform}. Rates increase as you build reviews and reputation.
        </p>
      </div>
    </div>
  )
}

// ── Upwork Bio Generator ──────────────────────────────────────────
function BioGenerator() {
  const [name,      setName]      = useState('')
  const [years,     setYears]     = useState('2')
  const [role,      setRole]      = useState('fullstack')
  const [win1,      setWin1]      = useState('')
  const [generated, setGenerated] = useState('')
  const [copied,    setCopied]    = useState(false)

  const generate = () => {
    const template = UPWORK_TEMPLATES[role] || UPWORK_TEMPLATES.fullstack
    let bio = template
    if (name) bio = `Hi, I'm ${name}. ` + bio
    if (years) bio = bio.replace('[X]', years)
    if (win1)  bio = bio.replace('Built a SaaS dashboard for a startup that handles 10k+ daily users', win1)
    setGenerated(bio)
  }

  const copy = () => {
    navigator.clipboard.writeText(generated)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="jarvis-panel">
      <div className="jarvis-panel-header">
        <MdWork className="text-jarvis-cyan" />
        <h3>Upwork / Fiverr Profile Bio Generator</h3>
        <span className="ml-auto text-jarvis-dim text-xs font-exo">Fill in → Click Generate → Copy</span>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-jarvis-dim text-xs font-exo block mb-1">Your Name (optional)</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Suraj"
              className="w-full bg-jarvis-surface border border-jarvis-border rounded px-3 py-2 text-jarvis-text text-sm font-exo outline-none focus:border-jarvis-cyan placeholder:text-jarvis-dim/50" />
          </div>
          <div>
            <label className="text-jarvis-dim text-xs font-exo block mb-1">Years of Experience</label>
            <input value={years} onChange={e => setYears(e.target.value)} placeholder="e.g. 3"
              className="w-full bg-jarvis-surface border border-jarvis-border rounded px-3 py-2 text-jarvis-text text-sm font-exo outline-none focus:border-jarvis-cyan" />
          </div>
          <div>
            <label className="text-jarvis-dim text-xs font-exo block mb-1">Primary Role</label>
            <select value={role} onChange={e => setRole(e.target.value)}
              className="w-full bg-jarvis-surface border border-jarvis-border rounded px-3 py-2 text-jarvis-text text-sm font-exo outline-none focus:border-jarvis-cyan">
              <option value="fullstack">Full Stack Developer</option>
              <option value="backend">Backend Engineer</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-jarvis-dim text-xs font-exo block mb-1">Your Best Achievement (optional, replace the example)</label>
          <input value={win1} onChange={e => setWin1(e.target.value)}
            placeholder="e.g. Built a payment system processing $2M/month for a fintech startup"
            className="w-full bg-jarvis-surface border border-jarvis-border rounded px-3 py-2 text-jarvis-text text-sm font-exo outline-none focus:border-jarvis-cyan placeholder:text-jarvis-dim/50" />
        </div>
        <button onClick={generate} className="jarvis-btn flex items-center gap-2">
          <MdRocketLaunch size={14} /> Generate My Bio
        </button>

        {generated && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <div className="relative bg-jarvis-surface border border-jarvis-cyan/40 rounded p-4">
              <pre className="text-jarvis-text text-sm font-exo whitespace-pre-wrap leading-relaxed">{generated}</pre>
              <button onClick={copy}
                className="absolute top-3 right-3 jarvis-btn flex items-center gap-1 text-xs">
                {copied ? <><MdCheck size={12} /> Copied!</> : <><MdCopyAll size={12} /> Copy</>}
              </button>
            </div>
            <p className="text-jarvis-dim text-xs font-exo">
              ✅ Paste this directly into your Upwork Overview / Fiverr Profile Description. Customise the numbers and achievements with your real experience.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// ── Micro-SaaS Idea Card ──────────────────────────────────────────
function SaaSCard({ idea, idx }) {
  const [open, setOpen] = useState(false)
  const diffColor = { Easy: '#00ff88', 'Easy–Medium': '#00d4ff', Medium: '#ffcc00', Hard: '#ff9500' }[idea.difficulty] || '#4a7a9b'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.06 }}
      className="jarvis-panel overflow-hidden"
    >
      <div className="p-4 cursor-pointer hover:bg-jarvis-cyan/5 transition-colors" onClick={() => setOpen(!open)}>
        <div className="flex items-start gap-3">
          <div className="font-orbitron text-jarvis-dim text-sm w-6 shrink-0 mt-0.5">#{idx + 1}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h4 className="font-orbitron text-jarvis-cyan text-sm">{idea.title}</h4>
              <span className="text-xs font-exo px-2 py-0.5 rounded border" style={{ color: diffColor, borderColor: diffColor + '40', background: diffColor + '15' }}>
                {idea.difficulty}
              </span>
            </div>
            <p className="text-jarvis-text text-sm font-exo leading-snug">{idea.desc}</p>
            <div className="flex items-center gap-4 mt-2 flex-wrap text-xs font-exo">
              <span className="text-jarvis-green">💰 {idea.revenue}</span>
              <span className="text-jarvis-dim">⏱ {idea.buildTime}</span>
              <span className="text-jarvis-cyan">{idea.price}</span>
              <span className="text-jarvis-dim">{idea.tech}</span>
            </div>
          </div>
          <button className="text-jarvis-dim hover:text-jarvis-cyan transition-colors shrink-0">
            {open ? <MdExpandLess size={18} /> : <MdExpandMore size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
            className="border-t border-jarvis-border/30 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="font-orbitron text-jarvis-dim text-xs tracking-wider mb-2">HOW TO BUILD IT</div>
                  <div className="space-y-2">
                    {idea.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm font-exo">
                        <span className="text-jarvis-cyan shrink-0 font-orbitron text-xs mt-0.5">{i + 1}.</span>
                        <span className="text-jarvis-text">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="font-orbitron text-jarvis-dim text-xs tracking-wider mb-1">COMPETITION</div>
                    <p className="text-jarvis-text text-sm font-exo">{idea.competitors}</p>
                  </div>
                  <div>
                    <div className="font-orbitron text-jarvis-dim text-xs tracking-wider mb-1">YOUR EDGE</div>
                    <p className="text-jarvis-green text-sm font-exo">{idea.edge}</p>
                  </div>
                  <div>
                    <div className="font-orbitron text-jarvis-dim text-xs tracking-wider mb-1">TARGET CUSTOMER</div>
                    <p className="text-jarvis-text text-sm font-exo">{idea.targetUsers}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Freelancing Guide ─────────────────────────────────────────────
function FreelancingGuide() {
  const platforms = [
    { name: 'Upwork', rate: '$60–$120/hr', time: '2–4 weeks to first client', pro: 'Best for long-term relationships, hourly billing, protected payments', con: 'High competition. Upwork takes 20% (drops to 5% at $10k+)', url: 'https://upwork.com', recommended: true },
    { name: 'Toptal', rate: '$100–$200/hr', time: '2–4 weeks screening process', pro: 'Top 3% of talent. Premium clients. Highest rates.', con: 'Rigorous 3-step screening (skill test + live interview + trial project)', url: 'https://toptal.com', recommended: false },
    { name: 'Fiverr Pro', rate: '$200–$2,000/project', time: '1–3 weeks', pro: 'Fixed-price projects, good for packaged services', con: 'Fiverr takes 20%. Race-to-bottom pricing if not careful', url: 'https://pro.fiverr.com', recommended: false },
    { name: 'Gun.io', rate: '$70–$130/hr', time: '1–2 weeks screening', pro: 'Remote-only, vetted clients, US market rates', con: 'Smaller volume than Upwork', url: 'https://gun.io', recommended: false },
  ]

  const proposalTips = [
    { tip: 'Read the FULL job post', detail: 'Mention a specific detail from their post in your first sentence. 90% of freelancers send generic proposals — this alone makes you stand out.' },
    { tip: 'Lead with a solution, not your CV', detail: 'Don\'t start with "I am a developer with 5 years of experience." Start with: "I can solve your [specific problem] by doing [specific approach]."' },
    { tip: 'Keep it short (3–5 paragraphs)', detail: 'Clients read 50+ proposals. A concise proposal that directly addresses their needs beats a long one every time.' },
    { tip: 'Ask a relevant question', detail: 'End with one smart question about their project. It shows you\'re thinking about their problem and often triggers a reply.' },
    { tip: 'Include one relevant link', detail: 'Link to your most relevant GitHub project or portfolio item. One specific example beats a portfolio of 20 random projects.' },
    { tip: 'Bid smart in the beginning', detail: 'For your first 3 jobs, bid 20–30% below your target rate. Reviews are worth more than money at the start.' },
  ]

  return (
    <div className="space-y-5">
      {/* Platform comparison */}
      <div>
        <h3 className="font-orbitron text-jarvis-cyan text-sm tracking-wider mb-3">PLATFORM COMPARISON</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {platforms.map(p => (
            <div key={p.name} className={`jarvis-panel p-4 ${p.recommended ? 'border-jarvis-green/50' : ''}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-orbitron text-jarvis-cyan text-sm">{p.name}</span>
                {p.recommended && <span className="badge badge-low text-xs">START HERE</span>}
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="ml-auto text-jarvis-dim hover:text-jarvis-cyan">
                  <MdOpenInNew size={14} />
                </a>
              </div>
              <div className="text-jarvis-green text-sm font-exo font-semibold mb-2">{p.rate}</div>
              <div className="text-jarvis-dim text-xs font-exo mb-2">⏱ {p.time}</div>
              <div className="text-xs font-exo space-y-1">
                <div className="flex gap-1"><span className="text-jarvis-green shrink-0">✓</span><span className="text-jarvis-text">{p.pro}</span></div>
                <div className="flex gap-1"><span className="text-jarvis-red shrink-0">✗</span><span className="text-jarvis-dim">{p.con}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Proposal tips */}
      <div>
        <h3 className="font-orbitron text-jarvis-cyan text-sm tracking-wider mb-3">HOW TO WIN YOUR FIRST CLIENT — 6 RULES</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {proposalTips.map((t, i) => (
            <div key={i} className="jarvis-panel p-3 flex gap-3">
              <div className="w-6 h-6 rounded-full bg-jarvis-cyan/15 border border-jarvis-cyan/40 flex items-center justify-center shrink-0">
                <span className="font-orbitron text-jarvis-cyan text-xs">{i + 1}</span>
              </div>
              <div>
                <div className="font-exo text-jarvis-cyan text-sm font-semibold">{t.tip}</div>
                <div className="font-exo text-jarvis-dim text-xs mt-0.5 leading-relaxed">{t.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gig ideas for full stack */}
      <div>
        <h3 className="font-orbitron text-jarvis-cyan text-sm tracking-wider mb-3">BEST FIVERR GIGS FOR FULL STACK ENGINEERS</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { gig: 'Build a REST API with Node.js + Express', price: '$150–$500', demand: 'Very High' },
            { gig: 'Create a React dashboard with charts', price: '$200–$800', demand: 'High' },
            { gig: 'Fix bugs in your React / Node.js app', price: '$50–$200', demand: 'Very High' },
            { gig: 'Set up CI/CD pipeline on GitHub Actions', price: '$100–$300', demand: 'High' },
            { gig: 'Build a full CRUD app with authentication', price: '$300–$1,000', demand: 'High' },
            { gig: 'Integrate Stripe payments into your app', price: '$150–$400', demand: 'Very High' },
          ].map((g, i) => (
            <div key={i} className="bg-jarvis-surface border border-jarvis-border rounded p-3">
              <div className="text-jarvis-text text-sm font-exo leading-snug mb-2">{g.gig}</div>
              <div className="flex items-center justify-between">
                <span className="text-jarvis-green text-xs font-orbitron">{g.price}</span>
                <span className={`text-xs font-exo ${g.demand === 'Very High' ? 'text-jarvis-green' : 'text-jarvis-cyan'}`}>
                  📈 {g.demand}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── 30-Day Plan ───────────────────────────────────────────────────
function ThirtyDayPlan() {
  const [checked, setChecked] = useState({})
  const toggle = (key) => setChecked(prev => ({ ...prev, [key]: !prev[key] }))
  const totalTasks = THIRTY_DAY_PLAN.reduce((a, w) => a + w.tasks.length, 0)
  const doneCount  = Object.values(checked).filter(Boolean).length
  const pct        = Math.round((doneCount / totalTasks) * 100)

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="jarvis-panel p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-orbitron text-jarvis-cyan text-xs tracking-wider">YOUR PROGRESS</span>
          <span className="font-orbitron text-jarvis-green text-sm">{doneCount}/{totalTasks} tasks · {pct}%</span>
        </div>
        <div className="h-2 bg-jarvis-surface border border-jarvis-border rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-jarvis-green rounded-full"
            style={{ boxShadow: '0 0 8px #00ff88' }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        {pct === 100 && (
          <p className="text-jarvis-green text-xs font-exo mt-2">🎉 All tasks complete! You've launched your freelance career.</p>
        )}
      </div>

      {/* Weeks */}
      {THIRTY_DAY_PLAN.map((week, wi) => (
        <div key={wi} className="jarvis-panel overflow-hidden">
          <div className="jarvis-panel-header" style={{ borderBottomColor: week.color + '30' }}>
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: week.color, boxShadow: `0 0 6px ${week.color}` }} />
            <h3 style={{ color: week.color }}>{week.week}</h3>
            <span className="ml-auto text-jarvis-dim text-xs font-exo">
              {week.tasks.filter((_, i) => checked[`${wi}-${i}`]).length}/{week.tasks.length}
            </span>
          </div>
          <div className="divide-y divide-jarvis-border/20">
            {week.tasks.map((t, ti) => {
              const key = `${wi}-${ti}`
              const done = checked[key]
              return (
                <button
                  key={ti}
                  onClick={() => toggle(key)}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-jarvis-cyan/5 transition-colors"
                >
                  <div className={`shrink-0 mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all ${
                    done ? 'bg-jarvis-green border-jarvis-green' : 'border-jarvis-dim'
                  }`}>
                    {done && <MdCheck size={12} className="text-jarvis-bg" />}
                  </div>
                  <div className={done ? 'opacity-50 line-through' : ''}>
                    <span className="font-orbitron text-xs tracking-wider mr-2" style={{ color: week.color }}>{t.day}</span>
                    <span className="text-jarvis-text text-sm font-exo">{t.task}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════

const TABS = [
  { id: 'freelancing', icon: MdWork,         label: 'Freelancing'   },
  { id: 'saas',        icon: MdRocketLaunch, label: 'Micro-SaaS'    },
  { id: 'bio',         icon: MdCode,         label: 'Bio Generator' },
  { id: 'plan',        icon: MdTimer,        label: '30-Day Plan'   },
  { id: 'resources',   icon: MdStar,         label: 'Resources'     },
]

export default function Earn() {
  const [tab, setTab] = useState('freelancing')

  return (
    <div className="space-y-4 fade-in">
      {/* Header */}
      <div className="jarvis-panel p-5 border-l-2 border-l-jarvis-green">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-jarvis-green/10 border border-jarvis-green/40 flex items-center justify-center shrink-0">
            <MdMonetizationOn size={26} className="text-jarvis-green" />
          </div>
          <div className="flex-1">
            <h1 className="font-orbitron text-jarvis-green text-xl font-bold tracking-widest glitch-text">
              EARN AS A SOFTWARE ENGINEER
            </h1>
            <p className="text-jarvis-text font-exo text-sm mt-1">
              You are a <span className="text-jarvis-cyan font-semibold">Full Stack / Backend Engineer</span> with part-time availability.
              This is your personalised roadmap from <span className="text-jarvis-green font-semibold">$0 → $5,000/month</span> online.
            </p>
            <div className="flex flex-wrap gap-3 mt-3">
              {[
                { label: 'Fastest income', val: 'Freelancing (Week 1)', color: '#00d4ff' },
                { label: 'Passive income', val: 'Micro-SaaS (Month 2+)', color: '#00ff88' },
                { label: 'First goal',     val: '$1,000 in 30 days',   color: '#ffcc00' },
              ].map(({ label, val, color }) => (
                <div key={label} className="bg-jarvis-surface border border-jarvis-border rounded px-3 py-2">
                  <div className="text-jarvis-dim text-xs font-exo">{label}</div>
                  <div className="font-orbitron text-xs font-bold" style={{ color }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Warning: Zero to hero note */}
      <div className="jarvis-panel p-3 border border-jarvis-yellow/40 flex items-start gap-3">
        <MdLightbulb size={18} className="text-jarvis-yellow shrink-0 mt-0.5" />
        <p className="text-jarvis-text text-sm font-exo leading-relaxed">
          <strong className="text-jarvis-yellow">Zero knowledge? That's fine.</strong> Every strategy here starts from scratch.
          The calculator below shows your real earning potential. The 30-Day Plan tells you exactly what to do each day.
          You already have the skills — you just need to package and sell them.
        </p>
      </div>

      {/* Income Calculator */}
      <IncomeCalculator />

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap">
        {TABS.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setTab(id)} className={`jarvis-btn flex items-center gap-1.5 ${tab === id ? 'active' : ''}`}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 'freelancing' && <FreelancingGuide />}

          {tab === 'saas' && (
            <div className="space-y-3">
              <div className="jarvis-panel p-4 border-l-2 border-l-jarvis-cyan">
                <p className="text-jarvis-text text-sm font-exo leading-relaxed">
                  <strong className="text-jarvis-cyan">Micro-SaaS</strong> = small software product you build once, then customers pay every month.
                  Best part: as a software engineer, <strong>you can build all of these yourself</strong>.
                  Start small. Validate first (get 5 people to say "I'd pay for this"), then build.
                </p>
              </div>
              {SAAS_IDEAS.map((idea, i) => <SaaSCard key={idea.id} idea={idea} idx={i} />)}
            </div>
          )}

          {tab === 'bio' && <BioGenerator />}

          {tab === 'plan' && <ThirtyDayPlan />}

          {tab === 'resources' && (
            <div className="space-y-4">
              {RESOURCES.map(({ category, items }) => (
                <div key={category} className="jarvis-panel">
                  <div className="jarvis-panel-header">
                    <h3>{category}</h3>
                  </div>
                  <div className="divide-y divide-jarvis-border/20">
                    {items.map(r => (
                      <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-jarvis-cyan/5 transition-colors group">
                        <div className="flex-1">
                          <div className="font-exo text-jarvis-cyan text-sm font-semibold group-hover:underline">{r.name}</div>
                          <div className="font-exo text-jarvis-dim text-xs mt-0.5">{r.desc}</div>
                        </div>
                        <MdOpenInNew size={14} className="text-jarvis-dim group-hover:text-jarvis-cyan" />
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Disclaimer */}
      <p className="text-jarvis-dim text-xs font-exo text-center pb-4">
        ⚠️ Income figures are estimates based on market rates. Individual results vary based on skill level,
        effort, and market conditions. These are genuine strategies — not get-rich-quick schemes.
        Consistent effort over 90 days is what makes the difference.
      </p>
    </div>
  )
}
