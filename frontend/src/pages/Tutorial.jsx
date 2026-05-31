/**
 * Tutorial.jsx — Beginner-friendly learning guide for the JARVIS portal.
 *
 * Modules:
 *  1. Portal Setup          — Install & run in 5 steps
 *  2. Using the Portal      — What each page does
 *  3. Job Hunting Guide     — Get your first remote job
 *  4. Affiliate Marketing   — Earn passive income
 *  5. Bug Bounty Basics     — Get paid finding bugs
 *  6. 90-Day Roadmap        — Week-by-week income plan
 *  7. Free Learning Links   — Best free resources
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdMenuBook, MdCheckCircle, MdRadioButtonUnchecked, MdPlayArrow,
  MdExpandMore, MdExpandLess, MdOpenInNew, MdLightbulb, MdStar,
  MdTimer, MdAttachMoney, MdSchool, MdWork, MdBugReport,
  MdTrendingUp, MdEmojiEvents, MdRocketLaunch,
} from 'react-icons/md'

// ── Checkbox Hook ─────────────────────────────────────────────────────────────

function useChecks(id, count) {
  const key = `tutorial_checks_${id}`
  const [checks, setChecks] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key) || '{}') }
    catch { return {} }
  })
  const toggle = (i) => {
    const next = { ...checks, [i]: !checks[i] }
    setChecks(next)
    localStorage.setItem(key, JSON.stringify(next))
  }
  const done = Object.values(checks).filter(Boolean).length
  return [checks, toggle, done, count]
}

// ── Section Components ────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, color = 'text-jarvis-cyan', subtitle }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className={`p-2 rounded ${color.replace('text-', 'bg-').replace('jarvis-', 'jarvis-')}/10 border border-current/20 ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <h2 className={`font-orbitron text-sm font-bold ${color}`}>{title}</h2>
        {subtitle && <p className="text-jarvis-dim text-xs font-exo mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

function Step({ number, title, desc, code, tip, time }) {
  return (
    <div className="flex gap-3 p-3 bg-jarvis-surface/20 border border-jarvis-border rounded-lg">
      <div className="w-7 h-7 rounded-full bg-jarvis-cyan/20 border border-jarvis-cyan/40 text-jarvis-cyan font-orbitron text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
        {number}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-orbitron text-jarvis-text text-xs font-bold">{title}</span>
          {time && (
            <span className="flex items-center gap-1 text-jarvis-dim text-xs font-exo">
              <MdTimer size={11} /> {time}
            </span>
          )}
        </div>
        {desc && <p className="text-jarvis-dim text-xs font-exo mt-1 leading-relaxed">{desc}</p>}
        {code && (
          <code className="block mt-2 bg-black/50 border border-jarvis-border/50 rounded px-3 py-2 text-jarvis-green text-xs font-mono">
            {code}
          </code>
        )}
        {tip && (
          <div className="mt-2 flex items-start gap-1 text-jarvis-yellow text-xs font-exo">
            <MdLightbulb size={12} className="flex-shrink-0 mt-0.5" />
            <span>{tip}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function CheckList({ id, items, title }) {
  const [checks, toggle, done] = useChecks(id, items.length)
  return (
    <div className="jarvis-panel border border-jarvis-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="font-orbitron text-jarvis-cyan text-xs">{title}</span>
        <span className="text-jarvis-dim text-xs font-exo">{done}/{items.length} done</span>
      </div>
      <div className="w-full bg-jarvis-border/30 rounded-full h-1 mb-3">
        <div
          className="bg-jarvis-cyan h-1 rounded-full transition-all"
          style={{ width: `${(done / items.length) * 100}%` }}
        />
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className={`w-full flex items-start gap-2 text-left p-2 rounded transition-colors ${
              checks[i] ? 'bg-jarvis-green/10 border border-jarvis-green/20' : 'hover:bg-jarvis-surface/20'
            }`}
          >
            {checks[i]
              ? <MdCheckCircle className="text-jarvis-green flex-shrink-0 mt-0.5" size={14} />
              : <MdRadioButtonUnchecked className="text-jarvis-dim flex-shrink-0 mt-0.5" size={14} />
            }
            <span className={`text-xs font-exo ${checks[i] ? 'text-jarvis-dim line-through' : 'text-jarvis-text'}`}>
              {item}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function ResourceCard({ title, url, desc, free = true, type = 'Website' }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-3 bg-jarvis-surface/20 border border-jarvis-border rounded-lg hover:border-jarvis-cyan/40 transition-colors group"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-orbitron text-jarvis-cyan text-xs group-hover:text-jarvis-cyan/80">{title}</span>
        <div className="flex items-center gap-1">
          {free && <span className="text-jarvis-green text-xs font-exo">FREE</span>}
          <MdOpenInNew size={12} className="text-jarvis-dim" />
        </div>
      </div>
      <div className="text-jarvis-dim text-xs font-exo">{desc}</div>
      <div className="mt-1 text-jarvis-dim/60 text-xs font-exo">{type}</div>
    </a>
  )
}

function AccordionSection({ id, icon: Icon, title, color, badge, children }) {
  const [open, setOpen] = useState(id === 'setup')
  return (
    <div className="jarvis-panel border border-jarvis-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between p-4 hover:bg-jarvis-surface/20 transition-colors`}
      >
        <div className="flex items-center gap-3">
          <Icon size={18} className={color} />
          <span className={`font-orbitron text-sm font-bold ${color}`}>{title}</span>
          {badge && <span className="badge badge-high text-xs">{badge}</span>}
        </div>
        {open ? <MdExpandLess className="text-jarvis-dim" size={18} /> : <MdExpandMore className="text-jarvis-dim" size={18} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-jarvis-border overflow-hidden"
          >
            <div className="p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main Tutorial Page ────────────────────────────────────────────────────────

export default function Tutorial() {
  return (
    <div className="space-y-4 max-w-4xl mx-auto">

      {/* Hero */}
      <div className="jarvis-panel border border-jarvis-cyan/40 rounded-lg p-5">
        <div className="flex items-center gap-3 mb-3">
          <MdMenuBook className="text-jarvis-cyan" size={24} />
          <div>
            <h1 className="font-orbitron text-jarvis-cyan text-xl font-bold tracking-wider">JARVIS ACADEMY</h1>
            <p className="text-jarvis-dim text-xs font-exo">Complete beginner guide — zero to online income</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {[
            { label: '7 Modules', icon: MdMenuBook, color: 'text-jarvis-cyan' },
            { label: 'Step-by-Step', icon: MdPlayArrow, color: 'text-jarvis-green' },
            { label: '90-Day Plan', icon: MdTrendingUp, color: 'text-yellow-400' },
            { label: 'Free Resources', icon: MdSchool, color: 'text-purple-400' },
          ].map(({ label, icon: Icon, color }) => (
            <div key={label} className="flex items-center gap-2 p-2 bg-jarvis-surface/20 rounded border border-jarvis-border">
              <Icon size={14} className={color} />
              <span className={`text-xs font-exo ${color}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── MODULE 1: Portal Setup ─────────────────────────────────────────────── */}
      <AccordionSection id="setup" icon={MdRocketLaunch} title="MODULE 1 — PORTAL SETUP" color="text-jarvis-cyan" badge="START HERE">
        <SectionHeader
          icon={MdRocketLaunch}
          title="Get JARVIS Running in 10 Minutes"
          subtitle="Follow these steps exactly. Each step has a time estimate."
        />
        <div className="space-y-3">
          <Step number={1} title="Install Python 3.11+" time="5 min"
            desc="Download Python from the official website. During install, CHECK the box 'Add Python to PATH' — this is critical!"
            code="python.org/downloads → Download Python 3.11.x → Install"
            tip="Windows: After install, open a new terminal and run: python --version. Should show 3.11+"
          />
          <Step number={2} title="Install Node.js 18+" time="3 min"
            desc="Node.js is needed to run the React frontend."
            code="nodejs.org/en/download → Download LTS version → Install"
          />
          <Step number={3} title="Install backend dependencies" time="2 min"
            desc="Open a terminal, navigate to the backend folder, and run:"
            code="cd jarvis-portal/backend && pip install -r requirements.txt"
            tip="If pip is not found, try: python -m pip install -r requirements.txt"
          />
          <Step number={4} title="Install frontend dependencies" time="2 min"
            desc="In a second terminal, navigate to the frontend folder:"
            code="cd jarvis-portal/frontend && npm install"
          />
          <Step number={5} title="Start both servers" time="30 sec"
            desc="You can either double-click start-jarvis.bat (Windows) or run manually:"
            code={'# Terminal 1 (backend):\ncd backend && uvicorn main:app --reload --port 8000\n\n# Terminal 2 (frontend):\ncd frontend && npm run dev'}
            tip="Open http://localhost:5173 in your browser. JARVIS should load!"
          />
        </div>

        <CheckList id="setup_checks" title="SETUP CHECKLIST" items={[
          'Python 3.11+ installed and in PATH',
          'Node.js 18+ LTS installed',
          'pip install -r requirements.txt completed',
          'npm install completed',
          'Backend server running on port 8000',
          'Frontend running on port 5173',
          'JARVIS portal loads in browser',
        ]} />

        <div className="mt-4 p-3 bg-jarvis-green/10 border border-jarvis-green/30 rounded">
          <p className="text-jarvis-green text-xs font-orbitron mb-1">🎉 OPTIONAL: Unlock AI Features</p>
          <p className="text-jarvis-dim text-xs font-exo">
            Get a FREE API key from console.anthropic.com (generous free tier). Create backend/.env file:
          </p>
          <code className="block mt-2 bg-black/50 rounded px-3 py-2 text-jarvis-green text-xs font-mono">
            ANTHROPIC_API_KEY=your_key_here
          </code>
          <p className="text-jarvis-dim text-xs font-exo mt-1">This unlocks AI cover letters, AI job analysis, and smarter opportunity detection.</p>
        </div>
      </AccordionSection>

      {/* ── MODULE 2: Using the Portal ──────────────────────────────────────────── */}
      <AccordionSection id="portal" icon={MdMenuBook} title="MODULE 2 — USING THE PORTAL" color="text-jarvis-cyan">
        <SectionHeader icon={MdMenuBook} title="What Each Page Does" subtitle="A tour of all 9 modules in the portal" />
        <div className="space-y-2">
          {[
            { page: 'Command Center', path: '/', icon: '🎯', desc: 'Your daily dashboard. Shows S&P 500, Bitcoin price, Fear & Greed index, and top news. Check this every morning to understand today\'s market conditions.' },
            { page: 'Markets', path: '/markets', icon: '📈', desc: 'Real-time stock indices, commodities (gold, oil), forex pairs (USD/EUR), and top 10 stocks. Use this to spot which sectors are rising.' },
            { page: 'Crypto', path: '/crypto', icon: '₿', desc: 'Top 25 coins, market dominance pie chart, trending coins. The Fear & Greed gauge tells you if the market is in panic (buy) or euphoria (be careful).' },
            { page: 'News Intel', path: '/news', icon: '📰', desc: 'Aggregated news from 20+ sources, categorised by Business, Tech, Crypto, World. Uses sentiment analysis to flag positive/negative news.' },
            { page: 'Opportunities', path: '/opportunities', icon: '💡', desc: 'AI-powered analysis of current market opportunities. If you have an Anthropic API key, Claude generates real-time actionable ideas.' },
            { page: 'Auto-Earn 🤖', path: '/autoearn', icon: '🤖', desc: 'The 5-agent AI pipeline: TrendScout → Analyst → ContentWriter → AffiliateOptimiser → DailyPlanner. Generates a full daily income action plan.' },
            { page: 'Job Hunter', path: '/jobs', icon: '💼', desc: 'Real remote job listings from RemoteOK + Jobicy. Vetted platforms with reliable monthly income. AI cover letter generator.' },
            { page: 'Earn Guide', path: '/earn', icon: '💰', desc: 'Interactive income calculator, Upwork profile generator, 30 SaaS ideas, freelancing guide with proposal templates, 30-day plan.' },
            { page: 'Money Guide', path: '/guide', icon: '📚', desc: 'Educational guide to 7 income streams: stocks, crypto, freelance, content, e-commerce, options trading, real estate.' },
            { page: 'Tutorial', path: '/tutorial', icon: '🎓', desc: 'This page! Complete learning guide with 90-day roadmap, free resources, and interactive checklists.' },
          ].map(item => (
            <div key={item.page} className="flex gap-3 p-3 bg-jarvis-surface/20 border border-jarvis-border rounded hover:border-jarvis-cyan/30 transition-colors">
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-orbitron text-jarvis-cyan text-xs">{item.page}</span>
                  <code className="text-jarvis-dim text-xs font-mono bg-black/30 px-1 rounded">{item.path}</code>
                </div>
                <p className="text-jarvis-dim text-xs font-exo mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </AccordionSection>

      {/* ── MODULE 3: Job Hunting Guide ─────────────────────────────────────────── */}
      <AccordionSection id="jobs" icon={MdWork} title="MODULE 3 — GET A REMOTE JOB" color="text-jarvis-green" badge="HIGHEST INCOME">
        <SectionHeader icon={MdWork} title="Land a $4,000–$16,000/Month Remote Contract" color="text-jarvis-green"
          subtitle="As a Full Stack / Backend engineer, this is your fastest path to reliable online income." />

        <div className="p-3 mb-4 bg-jarvis-green/10 border border-jarvis-green/30 rounded">
          <p className="text-jarvis-green text-xs font-orbitron mb-1">💡 THE KEY INSIGHT</p>
          <p className="text-jarvis-dim text-xs font-exo">
            Upwork and Fiverr = you fight for projects.
            Vetted platforms (Turing, Arc, Toptal) = they find projects FOR YOU once you pass their screening.
            The upfront investment is worth it.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-orbitron text-jarvis-green text-xs mb-3">PHASE 1 — PREPARE (Week 1-2)</h3>
            <div className="space-y-2">
              {[
                { title: 'Update your GitHub', desc: 'Pin 3-5 good projects. Make sure READMEs are clear and professional. Recruiters check this first.' },
                { title: 'Build a 1-page portfolio site', desc: 'Use GitHub Pages (free). Just your name, skills, 3 projects, and contact. Takes 2 hours with a template.' },
                { title: 'Polish your LinkedIn', desc: 'Professional photo, strong headline (e.g. "Full Stack Engineer | Python + React | Open to Remote"), list all skills.' },
                { title: 'Prepare your tech skills', desc: 'Review: Data structures (arrays, trees, hashmaps), system design basics (databases, caching, APIs), React + Node.js fundamentals.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-2 p-2 bg-jarvis-surface/20 rounded">
                  <span className="w-5 h-5 rounded-full bg-jarvis-green/20 text-jarvis-green text-xs flex items-center justify-center flex-shrink-0 font-bold">{i+1}</span>
                  <div>
                    <div className="text-jarvis-text text-xs font-orbitron">{item.title}</div>
                    <div className="text-jarvis-dim text-xs font-exo mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-orbitron text-jarvis-green text-xs mb-3">PHASE 2 — APPLY (Week 2-4)</h3>
            <p className="text-jarvis-dim text-xs font-exo mb-2">Apply to all 4 platforms simultaneously. Each has different screening styles — diversify.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                { name: 'Turing.com', priority: '1st', desc: 'Easiest screening. 90min coding test. Most placements.', url: 'https://developers.turing.com' },
                { name: 'Arc.dev', priority: '2nd', desc: 'Best hourly rates. Strong technical bar. Worth it.', url: 'https://arc.dev/developer' },
                { name: 'Toptal', priority: '3rd', desc: 'Highest pay, hardest screening. Apply after practice.', url: 'https://www.toptal.com/developers/join' },
                { name: 'X-Team', priority: '4th', desc: 'Great community. Retainer model. Stable long-term.', url: 'https://x-team.com/join/' },
              ].map(p => (
                <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
                  className="p-3 bg-jarvis-surface/20 border border-jarvis-border rounded hover:border-jarvis-green/40 transition-colors block">
                  <div className="flex items-center justify-between">
                    <span className="font-orbitron text-jarvis-green text-xs">{p.name}</span>
                    <span className="text-jarvis-cyan text-xs font-exo">{p.priority} priority</span>
                  </div>
                  <p className="text-jarvis-dim text-xs font-exo mt-1">{p.desc}</p>
                </a>
              ))}
            </div>
          </div>
        </div>

        <CheckList id="job_checks" title="JOB HUNT CHECKLIST" items={[
          'GitHub profile updated with 3+ pinned projects',
          'Portfolio website live (GitHub Pages)',
          'LinkedIn optimised with remote keywords',
          'Applied to Turing.com',
          'Applied to Arc.dev',
          'Applied to Toptal',
          'Applied to X-Team',
          'Completed at least one platform\'s screening',
          'First interview scheduled',
        ]} />
      </AccordionSection>

      {/* ── MODULE 4: Affiliate Marketing ──────────────────────────────────────── */}
      <AccordionSection id="affiliate" icon={MdAttachMoney} title="MODULE 4 — AFFILIATE MARKETING" color="text-yellow-400">
        <SectionHeader icon={MdAttachMoney} title="Earn $200–$1,000/Month Passively" color="text-yellow-400"
          subtitle="Write once. Earn for years. Best for engineers who can write technical content." />

        <div className="p-3 mb-4 bg-yellow-900/20 border border-yellow-500/20 rounded">
          <p className="text-yellow-400 text-xs font-orbitron mb-1">HOW AFFILIATE MARKETING WORKS</p>
          <p className="text-jarvis-dim text-xs font-exo">
            You recommend tools/products online. When someone buys through your link, you earn a commission.
            Example: One blog post about "Best Web Hosting" → someone clicks your Hostinger link → you earn $65.
            That post keeps earning for years.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="font-orbitron text-yellow-400 text-xs mb-2">STEP 1 — Pick Your Platform</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {[
                { name: 'Dev.to', desc: 'Free tech blog. Massive audience. Perfect for engineers.', url: 'https://dev.to' },
                { name: 'Hashnode', desc: 'Free blog with your own domain. SEO-friendly.', url: 'https://hashnode.com' },
                { name: 'Medium', desc: 'Largest audience. Partner program pays extra.', url: 'https://medium.com' },
              ].map(p => (
                <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
                  className="p-2 bg-jarvis-surface/20 border border-jarvis-border rounded hover:border-yellow-500/40 transition-colors block">
                  <div className="text-yellow-400 text-xs font-orbitron">{p.name}</div>
                  <p className="text-jarvis-dim text-xs font-exo mt-0.5">{p.desc}</p>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-orbitron text-yellow-400 text-xs mb-2">STEP 2 — Best Programs for Engineers</h3>
            <div className="space-y-2">
              {[
                { name: 'Hostinger', commission: '$65/sale', type: 'Web Hosting', url: 'https://www.hostinger.com/affiliates' },
                { name: 'WP Engine', commission: '$200/sale', type: 'Managed Hosting', url: 'https://wpengine.com/affiliates/' },
                { name: 'Kinsta', commission: '$500+/sale', type: 'Premium Hosting', url: 'https://kinsta.com/affiliates/' },
                { name: 'Semrush', commission: '$200/sale', type: 'SEO Tool', url: 'https://www.semrush.com/lp/affiliate/' },
                { name: 'Coursera', commission: '45% per course', type: 'Online Learning', url: 'https://about.coursera.org/affiliates' },
              ].map(p => (
                <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 bg-jarvis-surface/20 border border-jarvis-border rounded hover:border-yellow-500/40 transition-colors">
                  <div>
                    <span className="text-jarvis-text text-xs font-orbitron">{p.name}</span>
                    <span className="text-jarvis-dim text-xs font-exo ml-2">({p.type})</span>
                  </div>
                  <span className="text-jarvis-green text-xs font-orbitron">{p.commission}</span>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-orbitron text-yellow-400 text-xs mb-2">STEP 3 — Article Ideas That Convert</h3>
            <div className="space-y-1">
              {[
                '"Best Web Hosting for Developers in 2025" → Hostinger, WP Engine, Kinsta links',
                '"How to Deploy a React App (Cheapest Options)" → DigitalOcean, Vultr links',
                '"Best Tools for Remote Engineers" → Semrush, Notion, Figma links',
                '"Python Courses Worth Taking" → Coursera, Udemy links',
                '"How I Built a SaaS and What I Used" → every tool you used',
              ].map((idea, i) => (
                <div key={i} className="flex gap-2 text-xs font-exo text-jarvis-dim p-1">
                  <span className="text-yellow-400 flex-shrink-0">→</span>
                  <span>{idea}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <CheckList id="affiliate_checks" title="AFFILIATE CHECKLIST" items={[
          'Created account on Dev.to or Hashnode',
          'Signed up for Hostinger affiliate program',
          'Signed up for at least 2 more programs',
          'Written first technical article (600+ words)',
          'Added affiliate links naturally in article',
          'Published article and shared on LinkedIn/Twitter',
          'Written 3 total articles',
          'Earned first commission',
        ]} />
      </AccordionSection>

      {/* ── MODULE 5: Bug Bounty ────────────────────────────────────────────────── */}
      <AccordionSection id="bugbounty" icon={MdBugReport} title="MODULE 5 — BUG BOUNTY HUNTING" color="text-red-400">
        <SectionHeader icon={MdBugReport} title="Get Paid Finding Security Bugs" color="text-red-400"
          subtitle="Companies pay $100–$10,000+ for security vulnerabilities you find in their websites." />

        <div className="p-3 mb-4 bg-red-900/20 border border-red-500/20 rounded">
          <p className="text-red-400 text-xs font-orbitron mb-1">IS THIS LEGAL?</p>
          <p className="text-jarvis-dim text-xs font-exo">
            Yes! Companies invite researchers to test their systems through bug bounty programs.
            You only test systems that are in the program scope. It's completely legal and companies
            WANT you to find bugs. Major companies (Google, Facebook, Apple) all run programs.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="font-orbitron text-red-400 text-xs mb-2">START HERE — Free Learning Path</h3>
            <div className="space-y-2">
              {[
                { title: 'Web Security Basics', desc: 'Learn OWASP Top 10: SQL Injection, XSS, CSRF, IDOR. Free on OWASP website and PortSwigger Web Academy.' },
                { title: 'Practice Labs', desc: 'HackTheBox (free tier), TryHackMe (beginner-friendly), DVWA (Damn Vulnerable Web App — run locally).' },
                { title: 'Tools to Learn', desc: 'Burp Suite Community (free). Browser DevTools. OWASP ZAP (free). Nmap for network scanning.' },
                { title: 'Start with Open Bug Bounty', desc: 'Open Bug Bounty is free to join with no screening. Good place to get your first submissions accepted.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-2 p-2 bg-jarvis-surface/20 rounded">
                  <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-xs flex items-center justify-center flex-shrink-0 font-bold">{i+1}</span>
                  <div>
                    <div className="text-jarvis-text text-xs font-orbitron">{item.title}</div>
                    <div className="text-jarvis-dim text-xs font-exo mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-orbitron text-red-400 text-xs mb-2">WHERE TO START — Best Platforms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                { name: 'Open Bug Bounty', desc: 'No screening. Free. Good for beginners. Start here.', url: 'https://www.openbugbounty.org' },
                { name: 'HackerOne', desc: 'Largest platform. Many free programs. Apply after basics.', url: 'https://www.hackerone.com' },
                { name: 'Bugcrowd', desc: 'Many educational programs. Good community.', url: 'https://www.bugcrowd.com' },
                { name: 'PortSwigger Academy', desc: 'FREE web security training from Burp Suite makers.', url: 'https://portswigger.net/web-security' },
              ].map(p => (
                <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
                  className="p-2 bg-jarvis-surface/20 border border-jarvis-border rounded hover:border-red-500/40 transition-colors block">
                  <div className="text-red-400 text-xs font-orbitron">{p.name}</div>
                  <p className="text-jarvis-dim text-xs font-exo mt-0.5">{p.desc}</p>
                </a>
              ))}
            </div>
          </div>
        </div>

        <CheckList id="bugbounty_checks" title="BUG BOUNTY STARTER CHECKLIST" items={[
          'Completed OWASP Top 10 overview (free, owasp.org)',
          'Started PortSwigger Web Security Academy (free)',
          'Installed Burp Suite Community Edition',
          'Completed TryHackMe beginner path',
          'Created HackerOne account',
          'Found and reported first bug (even a low severity)',
          'Received first bounty payment',
        ]} />
      </AccordionSection>

      {/* ── MODULE 6: 90-Day Roadmap ────────────────────────────────────────────── */}
      <AccordionSection id="roadmap" icon={MdTrendingUp} title="MODULE 6 — 90-DAY INCOME ROADMAP" color="text-jarvis-cyan">
        <SectionHeader icon={MdTrendingUp} title="Week-by-Week Plan to First $1,000 Online" />
        <div className="space-y-4">
          {[
            {
              weeks: 'WEEKS 1-2: Foundation',
              color: 'border-jarvis-cyan/40',
              labelColor: 'text-jarvis-cyan',
              goal: 'Goal: Setup + First Applications',
              actions: [
                'Install JARVIS portal and run it daily (10 min/day habit)',
                'Update GitHub, LinkedIn, portfolio website',
                'Apply to Turing.com (most important first step)',
                'Apply to Arc.dev',
                'Create Dev.to account and write first article',
                'Sign up for Hostinger affiliate program',
                'Read OWASP Top 10 overview',
              ]
            },
            {
              weeks: 'WEEKS 3-4: Build Momentum',
              color: 'border-jarvis-green/40',
              labelColor: 'text-jarvis-green',
              goal: 'Goal: Complete screenings + 3 articles published',
              actions: [
                'Complete Turing.com coding test (practice: LeetCode easy/medium)',
                'Complete Arc.dev technical assessment',
                'Write and publish 2 more affiliate articles',
                'Start PortSwigger Web Security Academy (1hr/day)',
                'Run JARVIS Auto-Earn pipeline daily and read the output',
                'Share your articles on LinkedIn (builds audience)',
              ]
            },
            {
              weeks: 'WEEKS 5-8: First Income',
              color: 'border-yellow-500/40',
              labelColor: 'text-yellow-400',
              goal: 'Goal: First paid engagement or first affiliate commission',
              actions: [
                'Follow up on Turing/Arc applications if no response after 2 weeks',
                'Apply to Toptal (now that you\'ve practiced)',
                'Write 2 more articles (aim for 5 total by week 8)',
                'Submit first bug bounty report on Open Bug Bounty',
                'Complete HackerOne beginner learning path',
                'Track all income in JARVIS IncomeTracker',
                'Start applying to live jobs from JobHunter page',
              ]
            },
            {
              weeks: 'WEEKS 9-12: Scale Up',
              color: 'border-purple-500/40',
              labelColor: 'text-purple-400',
              goal: 'Goal: $500-$2,000 monthly recurring income',
              actions: [
                'If placed by Turing/Arc → stable monthly income achieved!',
                'Scale affiliate articles to 10+ total',
                'Apply to X-Team for additional retainer income',
                'Submit bug bounty reports weekly',
                'Use AI cover letter generator for direct job applications',
                'Join freelance platforms as backup income stream',
                'Review JARVIS Opportunities daily for investing insights',
              ]
            },
          ].map(phase => (
            <div key={phase.weeks} className={`border ${phase.color} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`font-orbitron text-xs font-bold ${phase.labelColor}`}>{phase.weeks}</span>
              </div>
              <p className="text-jarvis-dim text-xs font-exo mb-3">🎯 {phase.goal}</p>
              <div className="space-y-1">
                {phase.actions.map((action, i) => (
                  <div key={i} className="flex gap-2 text-xs font-exo text-jarvis-dim">
                    <span className={`${phase.labelColor} flex-shrink-0`}>→</span>
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-jarvis-cyan/10 border border-jarvis-cyan/30 rounded text-center">
          <MdEmojiEvents className="text-yellow-400 mx-auto mb-2" size={24} />
          <p className="font-orbitron text-jarvis-cyan text-sm">BY DAY 90</p>
          <p className="text-jarvis-dim text-xs font-exo mt-1">
            Realistic outcome: <span className="text-jarvis-green">$1,000–$5,000/month</span> from 2-3 income streams<br />
            Best case: <span className="text-jarvis-green">$4,000–$16,000/month</span> with a Turing/Toptal placement
          </p>
        </div>
      </AccordionSection>

      {/* ── MODULE 7: Free Resources ────────────────────────────────────────────── */}
      <AccordionSection id="resources" icon={MdSchool} title="MODULE 7 — FREE LEARNING RESOURCES" color="text-purple-400">
        <SectionHeader icon={MdSchool} title="Best Free Resources to Level Up" color="text-purple-400"
          subtitle="All links below are 100% free. No credit card needed." />

        <div className="space-y-4">
          <div>
            <h3 className="font-orbitron text-purple-400 text-xs mb-2">CODING PRACTICE (for screening tests)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <ResourceCard title="LeetCode" url="https://leetcode.com" free desc="Algorithm practice. Do Easy+Medium problems. Turing/Arc test this." type="Practice Platform" />
              <ResourceCard title="NeetCode.io" url="https://neetcode.io" free desc="Best curated list of LeetCode problems. Free roadmap." type="Study Guide" />
              <ResourceCard title="freeCodeCamp" url="https://www.freecodecamp.org" free desc="Full curriculum for web development. HTML to React to Node." type="Course Platform" />
              <ResourceCard title="The Odin Project" url="https://www.theodinproject.com" free desc="Best free full-stack curriculum. Project-based learning." type="Curriculum" />
            </div>
          </div>

          <div>
            <h3 className="font-orbitron text-purple-400 text-xs mb-2">SECURITY LEARNING</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <ResourceCard title="PortSwigger Web Academy" url="https://portswigger.net/web-security" free desc="Best free web security training. From the makers of Burp Suite." type="Course + Labs" />
              <ResourceCard title="TryHackMe" url="https://tryhackme.com" free desc="Gamified cybersecurity training. Free tier available. Beginner-friendly." type="Interactive Platform" />
              <ResourceCard title="OWASP" url="https://owasp.org" free desc="Industry standard security reference. Start with OWASP Top 10." type="Reference" />
              <ResourceCard title="HackTheBox Academy" url="https://academy.hackthebox.com" free desc="Professional hacking training. Free starting modules." type="Course Platform" />
            </div>
          </div>

          <div>
            <h3 className="font-orbitron text-purple-400 text-xs mb-2">AFFILIATE MARKETING</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <ResourceCard title="Authority Hacker" url="https://www.authorityhacker.com/blog/" free desc="Best blog on affiliate marketing. Practical and data-driven." type="Blog" />
              <ResourceCard title="Pat Flynn - Smart Passive Income" url="https://www.smartpassiveincome.com" free desc="Beginners guide to passive income. Real income reports." type="Blog + Podcast" />
              <ResourceCard title="Neil Patel Blog" url="https://neilpatel.com/blog/" free desc="SEO and content marketing mastery. Essential for affiliate content." type="Blog" />
              <ResourceCard title="Google Search Console" url="https://search.google.com/search-console" free desc="Track your article rankings in Google. Essential SEO tool." type="Tool" />
            </div>
          </div>

          <div>
            <h3 className="font-orbitron text-purple-400 text-xs mb-2">YOUTUBE CHANNELS (Free Video Learning)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <ResourceCard title="Traversy Media" url="https://www.youtube.com/@TraversyMedia" free desc="Best web dev tutorials. React, Node, Python, everything." type="YouTube Channel" />
              <ResourceCard title="Fireship" url="https://www.youtube.com/@Fireship" free desc="Fast-paced tech explanations. 100 seconds videos. Great for concepts." type="YouTube Channel" />
              <ResourceCard title="NetworkChuck" url="https://www.youtube.com/@NetworkChuck" free desc="Cybersecurity and networking made fun. Great for bug bounty prep." type="YouTube Channel" />
              <ResourceCard title="Tech With Tim" url="https://www.youtube.com/@TechWithTim" free desc="Python + AI projects. Practical coding tutorials." type="YouTube Channel" />
            </div>
          </div>
        </div>
      </AccordionSection>

    </div>
  )
}
