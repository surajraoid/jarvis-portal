/**
 * AutoEarn.jsx — Automated $50/Day Income System
 *
 * 5 AI agents run in sequence, each feeding the next:
 *   Agent 1 TrendScout      → Today's monetisable tech trends
 *   Agent 2 OpportunityAnalyst → Convert trends to $50/day plays
 *   Agent 3 ContentWriter   → Publish-ready article + social posts
 *   Agent 4 AffiliateOptimiser → Best affiliate programs matched to content
 *   Agent 5 DailyPlanner    → Time-blocked $50 action plan
 *
 * Also includes:
 *   • Full affiliate program browser (always available, no API key)
 *   • Bug bounty hunting tracker
 *   • Daily income logger
 */

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdRocketLaunch, MdCheck, MdCopyAll, MdRefresh,
  MdMonetizationOn, MdBugReport, MdOpenInNew,
  MdTrendingUp, MdTimer, MdAdd, MdDelete,
  MdExpandMore, MdExpandLess, MdAutoAwesome,
  MdSecurity, MdArticle, MdLink,
} from 'react-icons/md'
import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:8000', timeout: 120_000 })

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmtMoney = (n) => `$${Number(n).toFixed(2)}`
function useCopy(text) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return [copied, copy]
}

// ═══════════════════════════════════════════════════════════════════
// AGENT STATUS DISPLAY
// ═══════════════════════════════════════════════════════════════════

const AGENTS = [
  { id: 1, name: 'TrendScout',          role: 'Research today\'s monetisable trends',      icon: '🔍' },
  { id: 2, name: 'OpportunityAnalyst',  role: 'Convert trends to $50/day opportunities',   icon: '💡' },
  { id: 3, name: 'ContentWriter',       role: 'Write publish-ready article + social posts', icon: '✍️' },
  { id: 4, name: 'AffiliateOptimiser',  role: 'Match best affiliate programs to content',   icon: '🔗' },
  { id: 5, name: 'DailyPlanner',        role: 'Build your time-blocked $50 action plan',   icon: '📅' },
]

function AgentStatusGrid({ completed, running }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
      {AGENTS.map((agent) => {
        const done   = completed >= agent.id
        const active = running && completed === agent.id - 1
        return (
          <motion.div
            key={agent.id}
            animate={active ? { borderColor: ['rgba(0,212,255,0.3)', 'rgba(0,212,255,0.8)', 'rgba(0,212,255,0.3)'] } : {}}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className={`jarvis-panel p-3 text-center transition-all ${done ? 'border-jarvis-green/60' : active ? 'border-jarvis-cyan/60' : 'opacity-50'}`}
          >
            <div className="text-xl mb-1">{done ? '✅' : active ? '⚡' : agent.icon}</div>
            <div className={`font-orbitron text-xs tracking-wide ${done ? 'text-jarvis-green' : active ? 'text-jarvis-cyan' : 'text-jarvis-dim'}`}>
              {agent.name}
            </div>
            <div className="text-jarvis-dim text-xs font-exo mt-1 leading-tight hidden sm:block">{agent.role}</div>
            <div className={`text-xs font-exo mt-1 ${done ? 'text-jarvis-green' : active ? 'text-jarvis-yellow' : 'text-jarvis-dim'}`}>
              {done ? 'Complete' : active ? 'Running…' : 'Waiting'}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TODAY'S OPPORTUNITIES
// ═══════════════════════════════════════════════════════════════════

function OpportunityCard({ opp, idx }) {
  const [open, setOpen] = useState(idx === 0)
  const diffColor = { Easy: '#00ff88', Medium: '#ffcc00', Hard: '#ff9500' }[opp.realistic_difficulty || opp.difficulty] || '#4a7a9b'

  // Support both AI-generated (steps_today) and static (steps) shapes
  const steps = opp.steps_today || opp.steps || []
  const earning = opp.expected_earnings?.day_30 || opp.daily_target || '—'
  const platform = opp.platform || (opp.platforms || []).join(', ')

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}
      className="jarvis-panel overflow-hidden">
      <div className="p-4 cursor-pointer hover:bg-jarvis-cyan/5 transition-colors" onClick={() => setOpen(!open)}>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-jarvis-cyan/10 border border-jarvis-cyan/40 flex items-center justify-center shrink-0 font-orbitron text-jarvis-cyan text-sm">
            {idx + 1}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h4 className="font-orbitron text-jarvis-cyan text-sm">{opp.title}</h4>
              <span className="text-xs font-exo px-2 py-0.5 rounded border"
                style={{ color: diffColor, borderColor: diffColor + '40', background: diffColor + '15' }}>
                {opp.realistic_difficulty || opp.difficulty}
              </span>
            </div>
            <p className="text-jarvis-text text-sm font-exo leading-snug">{opp.description || opp.why_works}</p>
            <div className="flex flex-wrap gap-3 mt-2 text-xs font-exo">
              <span className="text-jarvis-green">💰 {earning}</span>
              <span className="text-jarvis-dim">⏱ {opp.time_per_day || opp.time_required}</span>
              {platform && <span className="text-jarvis-cyan">📌 {platform}</span>}
            </div>
          </div>
          <button className="text-jarvis-dim hover:text-jarvis-cyan transition-colors shrink-0">
            {open ? <MdExpandLess size={18} /> : <MdExpandMore size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
            className="border-t border-jarvis-border/30 overflow-hidden">
            <div className="p-4 space-y-4">
              {steps.length > 0 && (
                <div>
                  <div className="font-orbitron text-jarvis-dim text-xs tracking-wider mb-2">
                    {opp.steps_today ? "DO THIS TODAY" : "STEP-BY-STEP"}
                  </div>
                  <div className="space-y-2">
                    {steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm font-exo">
                        <MdCheck size={14} className="text-jarvis-green shrink-0 mt-0.5" />
                        <span className="text-jarvis-text">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {(opp.income_example || opp.biggest_mistake) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {opp.income_example && (
                    <div className="bg-jarvis-green/5 border border-jarvis-green/20 rounded p-3">
                      <div className="text-jarvis-green text-xs font-orbitron mb-1">INCOME MATH</div>
                      <div className="text-jarvis-text text-xs font-exo">{opp.income_example}</div>
                    </div>
                  )}
                  {opp.biggest_mistake && (
                    <div className="bg-jarvis-red/5 border border-jarvis-red/20 rounded p-3">
                      <div className="text-jarvis-red text-xs font-orbitron mb-1">BIGGEST MISTAKE</div>
                      <div className="text-jarvis-text text-xs font-exo">{opp.biggest_mistake}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// GENERATED CONTENT VIEWER
// ═══════════════════════════════════════════════════════════════════

function ContentViewer({ content }) {
  const [tab, setTab] = useState('article')
  const [copiedArticle, copyArticle] = useCopy(content?.article_markdown || '')
  const [copiedTw, copyTw] = useCopy(content?.social_posts?.twitter || '')
  const [copiedLi, copyLi] = useCopy(content?.social_posts?.linkedin || '')

  if (!content?.title) return (
    <div className="jarvis-panel p-8 text-center">
      <MdArticle size={32} className="text-jarvis-dim mx-auto mb-2" />
      <p className="text-jarvis-dim font-exo text-sm">Run the AI research to generate a ready-to-publish article.</p>
    </div>
  )

  return (
    <div className="jarvis-panel">
      <div className="jarvis-panel-header">
        <MdArticle className="text-jarvis-cyan" />
        <h3>Generated Content — Ready to Publish</h3>
        <span className="ml-auto text-jarvis-green text-xs font-exo">⏱ {content.read_time_minutes || 5} min read</span>
      </div>
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="bg-jarvis-surface border border-jarvis-cyan/30 rounded p-3">
          <div className="text-jarvis-dim text-xs font-orbitron mb-1">ARTICLE TITLE</div>
          <div className="text-jarvis-cyan font-exo text-base font-semibold">{content.title}</div>
          <div className="text-jarvis-dim text-xs font-exo mt-1">{content.meta_description}</div>
          <div className="flex flex-wrap gap-1 mt-2">
            {(content.tags || []).map(t => (
              <span key={t} className="px-2 py-0.5 bg-jarvis-cyan/10 border border-jarvis-cyan/20 rounded text-jarvis-cyan text-xs font-exo">#{t}</span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {['article', 'twitter', 'linkedin'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`jarvis-btn text-xs capitalize ${tab === t ? 'active' : ''}`}>{t}</button>
          ))}
        </div>

        {/* Article */}
        {tab === 'article' && (
          <div className="relative">
            <div className="bg-jarvis-surface border border-jarvis-border rounded p-4 max-h-80 overflow-y-auto">
              <pre className="text-jarvis-text text-xs font-exo whitespace-pre-wrap leading-relaxed">
                {content.article_markdown}
              </pre>
            </div>
            <button onClick={copyArticle} className="absolute top-2 right-2 jarvis-btn flex items-center gap-1 text-xs">
              {copiedArticle ? <><MdCheck size={12}/> Copied!</> : <><MdCopyAll size={12}/> Copy All</>}
            </button>
            <div className="flex gap-2 mt-2">
              <span className="text-jarvis-dim text-xs font-exo">Publish on:</span>
              {(content.publish_platforms || ['Dev.to', 'Hashnode', 'Medium']).map(p => (
                <span key={p} className="text-jarvis-cyan text-xs font-exo border border-jarvis-cyan/30 px-2 py-0.5 rounded">{p}</span>
              ))}
            </div>
          </div>
        )}
        {tab === 'twitter' && (
          <div className="relative">
            <div className="bg-jarvis-surface border border-jarvis-border rounded p-4">
              <pre className="text-jarvis-text text-sm font-exo whitespace-pre-wrap">{content.social_posts?.twitter}</pre>
            </div>
            <button onClick={copyTw} className="absolute top-2 right-2 jarvis-btn flex items-center gap-1 text-xs">
              {copiedTw ? <><MdCheck size={12}/> Copied!</> : <><MdCopyAll size={12}/> Copy</>}
            </button>
          </div>
        )}
        {tab === 'linkedin' && (
          <div className="relative">
            <div className="bg-jarvis-surface border border-jarvis-border rounded p-4">
              <pre className="text-jarvis-text text-sm font-exo whitespace-pre-wrap">{content.social_posts?.linkedin}</pre>
            </div>
            <button onClick={copyLi} className="absolute top-2 right-2 jarvis-btn flex items-center gap-1 text-xs">
              {copiedLi ? <><MdCheck size={12}/> Copied!</> : <><MdCopyAll size={12}/> Copy</>}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// AFFILIATE PROGRAMS BROWSER
// ═══════════════════════════════════════════════════════════════════

function AffiliateBrowser() {
  const [programs, setPrograms] = useState([])
  const [categories, setCategories] = useState([])
  const [filter, setFilter] = useState('all')
  const [tierFilter, setTierFilter] = useState('all')

  useEffect(() => {
    api.get('/api/autoearner/affiliates').then(r => {
      setPrograms(r.data.programs || [])
      setCategories(r.data.categories || [])
    }).catch(() => {})
  }, [])

  const filtered = programs.filter(p => {
    const catOk  = filter === 'all' || p.category === filter
    const tierOk = tierFilter === 'all' || p.tier === tierFilter
    return catOk && tierOk
  })

  const tierColor = { S: '#00ff88', A: '#00d4ff', B: '#ffcc00' }

  return (
    <div className="space-y-3">
      <div className="jarvis-panel p-3 border-l-2 border-l-jarvis-green">
        <p className="text-jarvis-text text-sm font-exo leading-relaxed">
          <strong className="text-jarvis-green">How to use:</strong> Sign up for 3-5 programs below → write tutorials about those tools → embed your affiliate link naturally → earn commission when readers sign up. <strong>You don't need an audience to start.</strong>
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1 flex-wrap">
          <button onClick={() => setFilter('all')} className={`jarvis-btn text-xs ${filter === 'all' ? 'active' : ''}`}>All</button>
          {categories.map(c => (
            <button key={c} onClick={() => setFilter(c)} className={`jarvis-btn text-xs ${filter === c ? 'active' : ''}`}>{c}</button>
          ))}
        </div>
        <div className="flex gap-1 ml-auto">
          {['all', 'S', 'A', 'B'].map(t => (
            <button key={t} onClick={() => setTierFilter(t)}
              className={`jarvis-btn text-xs ${tierFilter === t ? 'active' : ''}`}
              style={t !== 'all' && tierFilter === t ? { color: tierColor[t], borderColor: tierColor[t] } : {}}>
              {t === 'all' ? 'All Tiers' : `Tier ${t}`}
            </button>
          ))}
        </div>
      </div>

      {/* Program cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((prog, i) => (
          <motion.div key={prog.name} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }} className="jarvis-panel p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-orbitron text-jarvis-cyan text-sm">{prog.name}</span>
                  {prog.tier && (
                    <span className="text-xs font-orbitron px-1.5 py-0.5 rounded border"
                      style={{ color: tierColor[prog.tier], borderColor: tierColor[prog.tier] + '40', background: tierColor[prog.tier] + '15' }}>
                      {prog.tier}
                    </span>
                  )}
                </div>
                <div className="text-jarvis-dim text-xs font-exo mt-0.5">{prog.category}</div>
              </div>
              {prog.signup_url && (
                <a href={prog.signup_url} target="_blank" rel="noopener noreferrer"
                  className="jarvis-btn text-xs flex items-center gap-1 shrink-0">
                  Sign Up <MdOpenInNew size={11} />
                </a>
              )}
            </div>
            <div className="text-jarvis-green font-orbitron text-sm font-bold mb-1">{prog.commission}</div>
            <div className="text-jarvis-dim text-xs font-exo mb-2">Cookie: {prog.cookie_days} days · Avg: {prog.avg_payout}</div>
            <div className="text-jarvis-text text-xs font-exo leading-relaxed mb-2">{prog.why}</div>
            {prog.content_angle && (
              <div className="bg-jarvis-cyan/5 border border-jarvis-cyan/20 rounded p-2">
                <div className="text-jarvis-cyan text-xs font-orbitron mb-0.5">CONTENT IDEA</div>
                <div className="text-jarvis-text text-xs font-exo">{prog.content_angle}</div>
              </div>
            )}
            {prog.monthly_if_3_sales && (
              <div className="text-jarvis-green text-xs font-exo mt-2">
                📈 3 referrals/month = <strong>{prog.monthly_if_3_sales}</strong>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// BUG BOUNTY TRACKER
// ═══════════════════════════════════════════════════════════════════

function BugBountyTracker() {
  const [data, setData] = useState(null)
  const [checked, setChecked] = useState({})

  useEffect(() => {
    api.get('/api/autoearner/bugbounty').then(r => setData(r.data)).catch(() => {})
  }, [])

  if (!data) return <div className="jarvis-panel h-32 shimmer" />

  return (
    <div className="space-y-4">
      <div className="jarvis-panel p-4 border-l-2 border-l-jarvis-red">
        <p className="text-jarvis-text text-sm font-exo leading-relaxed">{data.intro}</p>
      </div>

      {/* First week plan */}
      <div className="jarvis-panel">
        <div className="jarvis-panel-header">
          <MdSecurity className="text-jarvis-yellow" />
          <h3>Your First Week Bug Bounty Plan</h3>
        </div>
        <div className="divide-y divide-jarvis-border/20">
          {(data.first_week_plan || []).map((step, i) => (
            <button key={i} onClick={() => setChecked(p => ({ ...p, [`fw-${i}`]: !p[`fw-${i}`] }))}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-jarvis-cyan/5 transition-colors text-left">
              <div className={`shrink-0 mt-0.5 w-4 h-4 rounded border flex items-center justify-center ${checked[`fw-${i}`] ? 'bg-jarvis-green border-jarvis-green' : 'border-jarvis-dim'}`}>
                {checked[`fw-${i}`] && <MdCheck size={11} className="text-jarvis-bg" />}
              </div>
              <span className={`text-sm font-exo ${checked[`fw-${i}`] ? 'opacity-50 line-through text-jarvis-dim' : 'text-jarvis-text'}`}>{step}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {(data.platforms || []).map((plat, i) => (
          <div key={plat.name} className={`jarvis-panel p-4 ${plat.beginner_friendly ? 'border-jarvis-green/40' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-orbitron text-jarvis-cyan text-sm">{plat.name}</span>
                {plat.beginner_friendly && <span className="ml-2 badge badge-low text-xs">Beginner Friendly</span>}
              </div>
              <a href={plat.url} target="_blank" rel="noopener noreferrer" className="text-jarvis-dim hover:text-jarvis-cyan">
                <MdOpenInNew size={14} />
              </a>
            </div>
            <div className="text-jarvis-green font-orbitron text-sm font-bold mb-1">
              ${plat.avg_payout_low}–${plat.avg_payout_high} per bug
            </div>
            <div className="text-jarvis-dim text-xs font-exo mb-2">{plat.programs.toLocaleString()}+ programs</div>
            <p className="text-jarvis-text text-xs font-exo leading-relaxed mb-3">{plat.description}</p>

            {plat.top_programs && (
              <div className="mb-3">
                <div className="text-jarvis-cyan text-xs font-orbitron mb-1">TOP PROGRAMS</div>
                <div className="flex flex-wrap gap-1">
                  {plat.top_programs.map(p => (
                    <span key={p} className="px-2 py-0.5 bg-jarvis-surface border border-jarvis-border rounded text-jarvis-text text-xs font-exo">{p}</span>
                  ))}
                </div>
              </div>
            )}

            {plat.checklist && (
              <div>
                <div className="text-jarvis-cyan text-xs font-orbitron mb-1">GETTING STARTED</div>
                <div className="space-y-1">
                  {plat.checklist.slice(0, 3).map((step, si) => (
                    <div key={si} className="flex items-start gap-1.5 text-xs font-exo">
                      <MdCheck size={11} className="text-jarvis-green shrink-0 mt-0.5" />
                      <span className="text-jarvis-dim">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// INCOME TRACKER
// ═══════════════════════════════════════════════════════════════════

function IncomeTracker() {
  const [entries, setEntries] = useState([])
  const [todayTotal, setTodayTotal] = useState(0)
  const [allTime, setAllTime] = useState(0)
  const [form, setForm] = useState({ amount: '', source: 'Affiliate', description: '' })

  const fetchIncome = () => {
    api.get('/api/autoearner/income').then(r => {
      setEntries(r.data.entries || [])
      setTodayTotal(r.data.today_total || 0)
      setAllTime(r.data.all_time_total || 0)
    }).catch(() => {})
  }

  useEffect(() => { fetchIncome() }, [])

  const addEntry = async () => {
    if (!form.amount || !form.description) return
    const today = new Date().toISOString().split('T')[0]
    await api.post('/api/autoearner/income', { ...form, amount: parseFloat(form.amount), date: today })
    setForm({ amount: '', source: 'Affiliate', description: '' })
    fetchIncome()
  }

  const deleteEntry = async (id) => {
    await api.delete(`/api/autoearner/income/${id}`)
    fetchIncome()
  }

  const progress = Math.min(100, (todayTotal / 50) * 100)
  const progressColor = progress >= 100 ? '#00ff88' : progress >= 50 ? '#00d4ff' : '#ffcc00'

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="jarvis-panel p-5">
        <div className="flex items-center gap-6">
          {/* Gauge ring */}
          <div className="relative shrink-0 w-28 h-28">
            <svg viewBox="0 0 120 120" className="w-full h-full">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
              <circle cx="60" cy="60" r="50" fill="none" stroke={progressColor}
                strokeWidth="10" strokeLinecap="round"
                strokeDasharray={`${(progress / 100) * 314} 314`}
                transform="rotate(-90 60 60)"
                style={{ filter: `drop-shadow(0 0 6px ${progressColor})`, transition: 'stroke-dasharray 0.8s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-orbitron text-xl font-bold" style={{ color: progressColor }}>{Math.round(progress)}%</div>
              <div className="text-jarvis-dim text-xs font-exo">of $50</div>
            </div>
          </div>
          <div className="flex-1">
            <div className="font-orbitron text-jarvis-cyan text-lg font-bold">TODAY'S EARNINGS</div>
            <div className="font-orbitron text-4xl font-bold text-jarvis-green mt-1">{fmtMoney(todayTotal)}</div>
            <div className="text-jarvis-dim text-sm font-exo mt-1">Goal: $50.00 · All-time: {fmtMoney(allTime)}</div>
            {progress >= 100 && (
              <div className="text-jarvis-green text-sm font-exo mt-1 font-semibold">🎉 Daily goal achieved!</div>
            )}
          </div>
        </div>
      </div>

      {/* Add income */}
      <div className="jarvis-panel p-4">
        <div className="font-orbitron text-jarvis-dim text-xs tracking-wider mb-3">LOG INCOME EARNED</div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input type="number" placeholder="Amount ($)" value={form.amount}
            onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
            className="bg-jarvis-surface border border-jarvis-border rounded px-3 py-2 text-jarvis-text text-sm font-exo outline-none focus:border-jarvis-cyan" />
          <select value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))}
            className="bg-jarvis-surface border border-jarvis-border rounded px-3 py-2 text-jarvis-text text-sm font-exo outline-none focus:border-jarvis-cyan">
            <option>Affiliate</option>
            <option>Bug Bounty</option>
            <option>Template Sale</option>
            <option>Newsletter</option>
            <option>Freelance</option>
            <option>Other</option>
          </select>
          <input placeholder="Description" value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            className="bg-jarvis-surface border border-jarvis-border rounded px-3 py-2 text-jarvis-text text-sm font-exo outline-none focus:border-jarvis-cyan sm:col-span-1" />
          <button onClick={addEntry} className="jarvis-btn flex items-center justify-center gap-1">
            <MdAdd size={16} /> Log It
          </button>
        </div>
      </div>

      {/* Entries */}
      {entries.length > 0 ? (
        <div className="jarvis-panel">
          <div className="jarvis-panel-header">
            <h3>Income Log</h3>
            <span className="ml-auto text-jarvis-dim text-xs font-exo">{entries.length} entries</span>
          </div>
          <div className="divide-y divide-jarvis-border/20">
            {[...entries].reverse().map(e => (
              <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-jarvis-green font-orbitron text-sm font-bold">{fmtMoney(e.amount)}</span>
                    <span className="badge badge-investing text-xs">{e.source}</span>
                  </div>
                  <div className="text-jarvis-dim text-xs font-exo mt-0.5">{e.description} · {e.date}</div>
                </div>
                <button onClick={() => deleteEntry(e.id)} className="text-jarvis-dim hover:text-jarvis-red transition-colors">
                  <MdDelete size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="jarvis-panel p-6 text-center">
          <MdMonetizationOn size={28} className="text-jarvis-dim mx-auto mb-2" />
          <p className="text-jarvis-dim text-sm font-exo">No income logged yet. Every dollar counts — log it here to track progress toward $50.</p>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// DAILY PLAN DISPLAY
// ═══════════════════════════════════════════════════════════════════

function DailyPlan({ plan }) {
  const [checked, setChecked] = useState({})
  if (!plan?.time_blocks) return (
    <div className="jarvis-panel p-8 text-center">
      <MdTimer size={32} className="text-jarvis-dim mx-auto mb-2" />
      <p className="text-jarvis-dim font-exo text-sm">Run AI research to get your personalised daily plan.</p>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Goal summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: 'Goal Today',    val: plan.today_goal,       color: '#00d4ff' },
          { label: 'Realistic D1',  val: plan.realistic_today,  color: '#ffcc00' },
          { label: 'At Day 30',     val: plan.realistic_day_30, color: '#00ff88' },
        ].map(({ label, val, color }) => (
          <div key={label} className="bg-jarvis-surface border border-jarvis-border rounded p-4 text-center">
            <div className="text-jarvis-dim text-xs font-exo mb-1">{label}</div>
            <div className="font-orbitron text-sm font-bold" style={{ color }}>{val || '—'}</div>
          </div>
        ))}
      </div>

      {/* Time blocks */}
      <div className="space-y-2">
        {(plan.time_blocks || []).map((block, i) => (
          <button key={i} onClick={() => setChecked(p => ({ ...p, [i]: !p[i] }))}
            className={`w-full jarvis-panel p-4 text-left transition-all ${checked[i] ? 'opacity-50' : 'hover:bg-jarvis-cyan/5'}`}>
            <div className="flex items-start gap-3">
              <div className={`shrink-0 mt-0.5 w-4 h-4 rounded border flex items-center justify-center ${checked[i] ? 'bg-jarvis-green border-jarvis-green' : 'border-jarvis-dim'}`}>
                {checked[i] && <MdCheck size={11} className="text-jarvis-bg" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-orbitron text-jarvis-cyan text-xs">{block.time}</span>
                  <span className="text-jarvis-dim text-xs font-exo">({block.duration})</span>
                  <span className={`ml-auto text-xs font-exo ${block.priority === 'high' ? 'text-jarvis-green' : 'text-jarvis-dim'}`}>
                    {block.priority === 'high' ? '🔥 High Priority' : '📌 Medium'}
                  </span>
                </div>
                <div className="font-exo text-jarvis-text text-sm font-semibold">{block.task}</div>
                <div className="font-exo text-jarvis-dim text-xs mt-1 leading-relaxed">{block.exact_action}</div>
                {block.income_contribution && (
                  <div className="text-jarvis-green text-xs font-exo mt-1">💰 {block.income_contribution}</div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Income math */}
      {plan.income_math && (
        <div className="jarvis-panel p-4 border border-jarvis-green/30">
          <div className="font-orbitron text-jarvis-green text-xs tracking-wider mb-2">THE MATH TO $50/DAY</div>
          <p className="text-jarvis-text text-sm font-exo">{plan.income_math.required_actions}</p>
          <p className="text-jarvis-dim text-xs font-exo mt-1">⏱ First payment: {plan.income_math.time_to_first_payment}</p>
        </div>
      )}

      {/* Key mindset */}
      {plan.key_mindset && (
        <div className="jarvis-panel p-4 border-l-2 border-l-jarvis-yellow">
          <div className="font-orbitron text-jarvis-yellow text-xs tracking-wider mb-1">KEY MINDSET</div>
          <p className="text-jarvis-text text-sm font-exo italic">"{plan.key_mindset}"</p>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════

const TABS = [
  { id: 'opportunities', icon: MdTrendingUp,     label: 'Opportunities'  },
  { id: 'content',       icon: MdArticle,         label: 'AI Content'     },
  { id: 'affiliates',    icon: MdLink,             label: 'Affiliates'     },
  { id: 'bugbounty',     icon: MdBugReport,        label: 'Bug Bounty'     },
  { id: 'plan',          icon: MdTimer,            label: 'Daily Plan'     },
  { id: 'tracker',       icon: MdMonetizationOn,  label: 'Income Tracker' },
]

export default function AutoEarn() {
  const [research,    setResearch]    = useState(null)
  const [running,     setRunning]     = useState(false)
  const [tab,         setTab]         = useState('opportunities')
  const [statusData,  setStatusData]  = useState({ agents_completed: 0, running: false })
  const pollRef = useRef(null)

  const fetchResearch = async () => {
    try {
      const r = await api.get('/api/autoearner/research')
      if (r.data?.trends) setResearch(r.data)
      return r.data
    } catch { return null }
  }

  const fetchStatus = async () => {
    try {
      const r = await api.get('/api/autoearner/status')
      setStatusData(r.data)
      setRunning(r.data.running)
      return r.data
    } catch { return null }
  }

  const startResearch = async () => {
    setRunning(true)
    try {
      await api.post('/api/autoearner/research')
      // Poll every 4 seconds until done
      pollRef.current = setInterval(async () => {
        const status = await fetchStatus()
        if (!status?.running) {
          clearInterval(pollRef.current)
          setRunning(false)
          await fetchResearch()
        }
      }, 4000)
    } catch {
      setRunning(false)
    }
  }

  useEffect(() => {
    fetchResearch()
    fetchStatus()
    return () => clearInterval(pollRef.current)
  }, [])

  const opportunities = research?.opportunities || []
  const content       = research?.content
  const daily_plan    = research?.daily_plan

  return (
    <div className="space-y-4 fade-in">
      {/* Header */}
      <div className="jarvis-panel p-5 border-l-2 border-l-jarvis-green">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-orbitron text-jarvis-green text-xl font-bold tracking-widest">
              AUTO-EARN SYSTEM ⚡
            </h1>
            <p className="text-jarvis-text font-exo text-sm mt-1">
              5 AI agents research, write content, match affiliates, and plan your <strong className="text-jarvis-green">$50 daily action</strong> — automatically.
            </p>
            <p className="text-jarvis-dim font-exo text-xs mt-1">
              Works immediately without API key (curated data). Add ANTHROPIC_API_KEY for live AI research.
            </p>
          </div>
          <button
            onClick={startResearch}
            disabled={running}
            className={`jarvis-btn flex items-center gap-2 shrink-0 ${running ? 'opacity-60' : 'border-jarvis-green text-jarvis-green hover:bg-jarvis-green/10'}`}
          >
            {running
              ? <><MdRefresh size={16} className="animate-spin" /> Agents Running…</>
              : <><MdAutoAwesome size={16} /> Run Daily Research</>}
          </button>
        </div>
      </div>

      {/* Agent status */}
      <div className="jarvis-panel">
        <div className="jarvis-panel-header">
          <MdAutoAwesome className="text-jarvis-yellow" />
          <h3>Multi-Agent Pipeline</h3>
          <span className="ml-auto text-jarvis-dim text-xs font-exo">
            {statusData.agents_completed}/5 agents complete
            {research?.source && ` · ${research.source}`}
          </span>
        </div>
        <div className="p-3">
          <AgentStatusGrid completed={statusData.agents_completed} running={running} />
        </div>
      </div>

      {/* Trend scan */}
      {research?.trends?.length > 0 && (
        <div className="jarvis-panel">
          <div className="jarvis-panel-header">
            <MdTrendingUp className="text-jarvis-green" />
            <h3>Today's Trending Opportunities ({research.research_date})</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 p-3">
            {research.trends.slice(0, 4).map((t, i) => (
              <div key={i} className="bg-jarvis-surface border border-jarvis-border rounded p-3">
                <div className="font-orbitron text-jarvis-cyan text-xs mb-1 leading-snug">{t.topic}</div>
                <div className="text-jarvis-dim text-xs font-exo leading-relaxed mb-2">{t.why_trending}</div>
                {t.commission_per_referral && (
                  <div className="text-jarvis-green text-xs font-orbitron">💰 {t.commission_per_referral}/referral</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab nav */}
      <div className="flex flex-wrap gap-1">
        {TABS.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setTab(id)} className={`jarvis-btn flex items-center gap-1 text-xs ${tab === id ? 'active' : ''}`}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          {tab === 'opportunities' && (
            <div className="space-y-3">
              {opportunities.length === 0 ? (
                <div className="jarvis-panel p-8 text-center">
                  <MdAutoAwesome size={32} className="text-jarvis-dim mx-auto mb-2" />
                  <p className="text-jarvis-dim font-exo">Click "Run Daily Research" above to get today's personalised opportunities.</p>
                </div>
              ) : (
                opportunities.map((opp, i) => <OpportunityCard key={opp.title || i} opp={opp} idx={i} />)
              )}
            </div>
          )}
          {tab === 'content'      && <ContentViewer content={content} />}
          {tab === 'affiliates'   && <AffiliateBrowser />}
          {tab === 'bugbounty'    && <BugBountyTracker />}
          {tab === 'plan'         && <DailyPlan plan={daily_plan} />}
          {tab === 'tracker'      && <IncomeTracker />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
