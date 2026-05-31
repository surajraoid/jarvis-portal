/**
 * JobHunter.jsx — Real remote job listings + AI cover letter generator.
 *
 * Sections:
 *  1. Vetted Platforms — Turing, Arc, Toptal, X-Team
 *  2. Live Job Feed    — RemoteOK + Jobicy (real-time)
 *  3. Cover Letter AI  — Paste job, get tailored letter
 *  4. Application Tracker — Local state checklist
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import {
  MdWork, MdStar, MdOpenInNew, MdContentCopy, MdCheck,
  MdSearch, MdFilterList, MdRefresh, MdExpandMore, MdExpandLess,
  MdAttachMoney, MdLocationOn, MdTimer, MdAutoAwesome,
  MdCheckCircle, MdRadioButtonUnchecked, MdTrendingUp,
} from 'react-icons/md'

const api = axios.create({ baseURL: '' })

// ── Helpers ───────────────────────────────────────────────────────────────────

function useCopy(text) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return [copied, copy]
}

function TagBadge({ tag }) {
  const colors = {
    react: 'bg-blue-900/50 text-blue-300',
    python: 'bg-yellow-900/50 text-yellow-300',
    node: 'bg-green-900/50 text-green-300',
    typescript: 'bg-blue-900/50 text-blue-400',
    aws: 'bg-orange-900/50 text-orange-300',
    docker: 'bg-cyan-900/50 text-cyan-300',
  }
  const key = tag.toLowerCase().replace(/[^a-z]/g, '')
  const cls = colors[key] || 'bg-jarvis-border/50 text-jarvis-dim'
  return <span className={`px-2 py-0.5 rounded text-xs font-exo ${cls}`}>{tag}</span>
}

// ── Vetted Platform Card ──────────────────────────────────────────────────────

function VettedCard({ platform }) {
  const [expanded, setExpanded] = useState(false)

  const tierColors = {
    'Turing.com':  'border-jarvis-cyan/60 shadow-jarvis',
    'Arc.dev':     'border-jarvis-green/60 shadow-[0_0_15px_rgba(0,255,136,0.15)]',
    'Toptal':      'border-yellow-500/60 shadow-[0_0_15px_rgba(255,204,0,0.15)]',
    'X-Team':      'border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.15)]',
  }
  const border = tierColors[platform.company] || 'border-jarvis-border'

  return (
    <motion.div
      layout
      className={`jarvis-panel border ${border} rounded-lg overflow-hidden`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src={platform.logo} alt={platform.company}
              className="w-8 h-8 rounded object-contain bg-white/10 p-1"
              onError={(e) => { e.target.style.display = 'none' }}
            />
            <div>
              <div className="font-orbitron text-jarvis-cyan text-sm font-bold">{platform.company}</div>
              <div className="text-jarvis-text text-xs font-exo mt-0.5">{platform.title}</div>
            </div>
          </div>
          <span className="text-jarvis-green font-orbitron text-xs whitespace-nowrap">{platform.salary}</span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-exo">
          <div className="flex items-center gap-1 text-jarvis-dim">
            <MdLocationOn size={12} />
            <span>{platform.location}</span>
          </div>
          <div className="flex items-center gap-1 text-jarvis-dim">
            <MdTimer size={12} />
            <span>{platform.type}</span>
          </div>
        </div>

        <p className="mt-3 text-jarvis-dim text-xs font-exo leading-relaxed line-clamp-2">
          {platform.description}
        </p>

        {platform.success_rate && (
          <div className="mt-2 px-3 py-1.5 bg-jarvis-green/10 border border-jarvis-green/30 rounded text-jarvis-green text-xs font-exo">
            📊 {platform.success_rate}
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-1">
          {platform.tags.map(t => <TagBadge key={t} tag={t} />)}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1 text-jarvis-cyan text-xs font-exo hover:text-jarvis-cyan/80 transition-colors"
        >
          {expanded ? <MdExpandLess size={16} /> : <MdExpandMore size={16} />}
          {expanded ? 'Hide' : 'Show'} Application Steps
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-jarvis-border overflow-hidden"
          >
            <div className="p-4">
              <div className="text-jarvis-cyan text-xs font-orbitron mb-2">HOW TO APPLY</div>
              <div className="space-y-2">
                {platform.how_to_apply.map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs font-exo">
                    <span className="w-5 h-5 rounded-full bg-jarvis-cyan/20 text-jarvis-cyan flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="text-jarvis-text">{step}</span>
                  </div>
                ))}
              </div>
              {platform.why_reliable && (
                <div className="mt-3 p-3 bg-jarvis-blue/10 border border-jarvis-blue/30 rounded text-xs font-exo text-jarvis-dim">
                  💡 <strong className="text-jarvis-text">Why reliable:</strong> {platform.why_reliable}
                </div>
              )}
              <a
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 jarvis-btn flex items-center justify-center gap-2 text-xs"
              >
                <MdOpenInNew size={14} />
                Apply Now — {platform.company}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Live Job Card ─────────────────────────────────────────────────────────────

function JobCard({ job }) {
  const [expanded, setExpanded] = useState(false)
  const [applied, setApplied] = useState(false)

  return (
    <motion.div
      layout
      className="jarvis-panel border border-jarvis-border rounded-lg p-4 hover:border-jarvis-cyan/40 transition-colors"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          {job.logo && (
            <img src={job.logo} alt={job.company}
              className="w-8 h-8 rounded object-contain flex-shrink-0 bg-white/10 p-1"
              onError={(e) => { e.target.style.display = 'none' }}
            />
          )}
          <div className="min-w-0">
            <div className="font-orbitron text-jarvis-cyan text-xs font-bold truncate">{job.title}</div>
            <div className="text-jarvis-dim text-xs font-exo">{job.company}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-jarvis-green text-xs font-exo whitespace-nowrap">{job.salary}</span>
          <span className="text-jarvis-dim text-xs">{job.source}</span>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        {(job.tags || []).slice(0, 6).map((t, i) => <TagBadge key={i} tag={t} />)}
      </div>

      {job.description && (
        <p className="mt-2 text-jarvis-dim text-xs font-exo leading-relaxed line-clamp-2">
          {job.description}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-3 py-1.5 bg-jarvis-cyan/10 border border-jarvis-cyan/40 rounded text-jarvis-cyan text-xs font-exo hover:bg-jarvis-cyan/20 transition-colors"
        >
          <MdOpenInNew size={12} />
          View Job
        </a>
        <button
          onClick={() => setApplied(!applied)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-exo transition-colors ${
            applied
              ? 'bg-jarvis-green/20 border border-jarvis-green/40 text-jarvis-green'
              : 'bg-jarvis-border/30 border border-jarvis-border text-jarvis-dim hover:text-jarvis-text'
          }`}
        >
          {applied ? <MdCheckCircle size={12} /> : <MdRadioButtonUnchecked size={12} />}
          {applied ? 'Applied ✓' : 'Mark Applied'}
        </button>
        {job.date && (
          <span className="ml-auto text-jarvis-dim text-xs font-exo">
            {new Date(job.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || job.date}
          </span>
        )}
      </div>
    </motion.div>
  )
}

// ── Cover Letter Generator ────────────────────────────────────────────────────

function CoverLetterGenerator() {
  const [form, setForm] = useState({
    job_title: '',
    company: '',
    job_description: '',
    your_skills: 'Python, React, Node.js, FastAPI, TypeScript',
    years_experience: 3,
  })
  const [letter, setLetter] = useState('')
  const [loading, setLoading] = useState(false)
  const [source, setSource] = useState('')
  const [copied, copy] = useCopy(letter)

  const generate = async () => {
    if (!form.job_title || !form.company) return
    setLoading(true)
    try {
      const payload = {
        ...form,
        your_skills: form.your_skills.split(',').map(s => s.trim()).filter(Boolean),
        years_experience: parseInt(form.years_experience) || 3,
      }
      const { data } = await api.post('/api/jobs/cover-letter', payload)
      setLetter(data.cover_letter)
      setSource(data.source)
    } catch (e) {
      setLetter('Error generating cover letter. Please check your connection.')
    }
    setLoading(false)
  }

  return (
    <div className="jarvis-panel border border-jarvis-border rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <MdAutoAwesome className="text-jarvis-green" size={18} />
        <h3 className="font-orbitron text-jarvis-cyan text-sm font-bold">AI COVER LETTER GENERATOR</h3>
      </div>
      <p className="text-jarvis-dim text-xs font-exo mb-4">
        Paste any job description → get a tailored, professional cover letter in seconds.
        Add your ANTHROPIC_API_KEY for Claude-powered personalisation.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-jarvis-dim text-xs font-exo block mb-1">Job Title *</label>
          <input
            className="w-full bg-jarvis-bg/80 border border-jarvis-border rounded px-3 py-2 text-jarvis-text text-xs font-exo focus:border-jarvis-cyan outline-none"
            placeholder="e.g. Senior Full Stack Engineer"
            value={form.job_title}
            onChange={e => setForm(p => ({ ...p, job_title: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-jarvis-dim text-xs font-exo block mb-1">Company Name *</label>
          <input
            className="w-full bg-jarvis-bg/80 border border-jarvis-border rounded px-3 py-2 text-jarvis-text text-xs font-exo focus:border-jarvis-cyan outline-none"
            placeholder="e.g. Stripe"
            value={form.company}
            onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-jarvis-dim text-xs font-exo block mb-1">Your Skills (comma-separated)</label>
          <input
            className="w-full bg-jarvis-bg/80 border border-jarvis-border rounded px-3 py-2 text-jarvis-text text-xs font-exo focus:border-jarvis-cyan outline-none"
            value={form.your_skills}
            onChange={e => setForm(p => ({ ...p, your_skills: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-jarvis-dim text-xs font-exo block mb-1">Years of Experience</label>
          <input
            type="number" min={0} max={30}
            className="w-full bg-jarvis-bg/80 border border-jarvis-border rounded px-3 py-2 text-jarvis-text text-xs font-exo focus:border-jarvis-cyan outline-none"
            value={form.years_experience}
            onChange={e => setForm(p => ({ ...p, years_experience: e.target.value }))}
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="text-jarvis-dim text-xs font-exo block mb-1">Job Description (paste here)</label>
        <textarea
          rows={4}
          className="w-full bg-jarvis-bg/80 border border-jarvis-border rounded px-3 py-2 text-jarvis-text text-xs font-exo focus:border-jarvis-cyan outline-none resize-none"
          placeholder="Paste the job description here for better personalisation..."
          value={form.job_description}
          onChange={e => setForm(p => ({ ...p, job_description: e.target.value }))}
        />
      </div>

      <button
        onClick={generate}
        disabled={loading || !form.job_title || !form.company}
        className="jarvis-btn flex items-center gap-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <><span className="animate-spin">⚙</span> Generating…</>
        ) : (
          <><MdAutoAwesome size={14} /> Generate Cover Letter</>
        )}
      </button>

      {letter && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-jarvis-cyan text-xs font-orbitron">GENERATED LETTER</span>
            <div className="flex items-center gap-2">
              <span className="text-jarvis-dim text-xs font-exo">{source}</span>
              <button
                onClick={copy}
                className="flex items-center gap-1 px-2 py-1 bg-jarvis-cyan/10 border border-jarvis-cyan/30 rounded text-jarvis-cyan text-xs font-exo hover:bg-jarvis-cyan/20 transition-colors"
              >
                {copied ? <MdCheck size={12} /> : <MdContentCopy size={12} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <div className="bg-jarvis-bg/80 border border-jarvis-border rounded p-4 text-jarvis-text text-xs font-exo leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">
            {letter}
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function JobHunter() {
  const [tab, setTab] = useState('vetted')
  const [vettedData, setVettedData] = useState(null)
  const [liveJobs, setLiveJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadVetted()
  }, [])

  useEffect(() => {
    if (tab === 'live' && liveJobs.length === 0) loadLiveJobs()
  }, [tab])

  const loadVetted = async () => {
    try {
      const { data } = await api.get('/api/jobs/vetted')
      setVettedData(data)
    } catch (e) {
      console.error('Vetted fetch error', e)
    }
  }

  const loadLiveJobs = async (kw) => {
    setLoading(true)
    try {
      const params = kw ? { keywords: kw } : {}
      const { data } = await api.get('/api/jobs', { params })
      setLiveJobs(data.live_jobs || [])
    } catch (e) {
      console.error('Live jobs fetch error', e)
    }
    setLoading(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    loadLiveJobs(search || undefined)
  }

  const refresh = async () => {
    setRefreshing(true)
    await loadLiveJobs(search || undefined)
    setRefreshing(false)
  }

  const tabs = [
    { id: 'vetted', label: '⭐ Vetted Platforms', desc: 'Reliable income, stable contracts' },
    { id: 'live',   label: '📡 Live Job Feed',    desc: 'Real-time remote listings' },
    { id: 'cover',  label: '✉️ Cover Letter AI',   desc: 'AI-powered applications' },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="jarvis-panel border border-jarvis-cyan/30 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <MdWork className="text-jarvis-cyan" size={22} />
          <h1 className="font-orbitron text-jarvis-cyan text-lg font-bold tracking-wider">JOB HUNTER</h1>
          <span className="badge badge-high text-xs">LIVE</span>
        </div>
        <p className="text-jarvis-dim text-sm font-exo">
          Real remote engineering jobs from RemoteOK &amp; Jobicy, plus vetted talent platforms
          that guarantee reliable monthly income — not random freelancing.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-jarvis-cyan/10 rounded border border-jarvis-cyan/20">
            <div className="font-orbitron text-jarvis-cyan text-sm">$4K-16K</div>
            <div className="text-jarvis-dim text-xs font-exo">Monthly via Turing</div>
          </div>
          <div className="text-center p-2 bg-jarvis-green/10 rounded border border-jarvis-green/20">
            <div className="font-orbitron text-jarvis-green text-sm">$60-150/hr</div>
            <div className="text-jarvis-dim text-xs font-exo">via Arc.dev</div>
          </div>
          <div className="text-center p-2 bg-yellow-900/20 rounded border border-yellow-500/20">
            <div className="font-orbitron text-yellow-400 text-sm">$80-200/hr</div>
            <div className="text-jarvis-dim text-xs font-exo">via Toptal</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-shrink-0 px-4 py-2 rounded font-orbitron text-xs transition-all ${
              tab === t.id
                ? 'bg-jarvis-cyan/20 border border-jarvis-cyan text-jarvis-cyan'
                : 'bg-jarvis-surface/30 border border-jarvis-border text-jarvis-dim hover:text-jarvis-text'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Vetted Platforms Tab */}
      {tab === 'vetted' && (
        <div>
          {vettedData?.why_vetted && (
            <div className="p-3 bg-jarvis-blue/10 border border-jarvis-blue/30 rounded mb-4 text-jarvis-dim text-xs font-exo">
              💡 <strong className="text-jarvis-text">Why these platforms?</strong> {vettedData.why_vetted}
            </div>
          )}
          {vettedData?.recommendation && (
            <div className="p-3 bg-jarvis-green/10 border border-jarvis-green/30 rounded mb-4 text-jarvis-green text-xs font-exo">
              🎯 <strong>Recommendation:</strong> {vettedData.recommendation}
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {(vettedData?.platforms || []).map(p => <VettedCard key={p.id} platform={p} />)}
          </div>
        </div>
      )}

      {/* Live Jobs Tab */}
      {tab === 'live' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <input
                className="flex-1 bg-jarvis-bg/80 border border-jarvis-border rounded px-3 py-2 text-jarvis-text text-xs font-exo focus:border-jarvis-cyan outline-none"
                placeholder="Search: python, react, typescript, aws..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button type="submit" className="jarvis-btn flex items-center gap-1 text-xs px-3 py-2">
                <MdSearch size={14} /> Search
              </button>
            </form>
            <button
              onClick={refresh}
              className={`px-3 py-2 border border-jarvis-border rounded text-jarvis-dim hover:text-jarvis-cyan transition-colors ${refreshing ? 'animate-spin' : ''}`}
            >
              <MdRefresh size={16} />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-jarvis-cyan/30 border-t-jarvis-cyan rounded-full animate-spin mx-auto mb-3" />
              <div className="text-jarvis-dim text-xs font-exo">Fetching live jobs from RemoteOK & Jobicy…</div>
            </div>
          ) : liveJobs.length === 0 ? (
            <div className="text-center py-12 text-jarvis-dim font-exo text-sm">
              No jobs found. Try different keywords or check your connection.
            </div>
          ) : (
            <div>
              <div className="text-jarvis-dim text-xs font-exo mb-3">
                Found <span className="text-jarvis-cyan">{liveJobs.length}</span> remote engineering jobs
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {liveJobs.map((job, i) => <JobCard key={job.id || i} job={job} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cover Letter Tab */}
      {tab === 'cover' && <CoverLetterGenerator />}
    </div>
  )
}
