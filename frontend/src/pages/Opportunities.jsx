/**
 * Opportunities.jsx — AI-powered Money-Making Opportunities.
 *
 * Fetches personalised opportunities from the AI insights endpoint.
 * Each opportunity includes: risk level, potential return, step-by-step guide.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdTrendingUp, MdFlashOn, MdWarning, MdCheck, MdLightbulb,
  MdRefresh, MdExpandMore, MdExpandLess,
} from 'react-icons/md'
import { fetchInsights } from '../api/client'

// ── Risk badge ─────────────────────────────────────────────────────────────────
function RiskBadge({ risk }) {
  const cls = {
    'Low':    'badge-low',
    'Medium': 'badge-medium',
    'High':   'badge-high',
    'Very Low':'badge-low',
  }[risk] || 'badge-medium'
  return <span className={`badge ${cls}`}>{risk} Risk</span>
}

// ── Category badge ─────────────────────────────────────────────────────────────
function CategoryBadge({ category }) {
  const slug = (category || '').toLowerCase().replace(/\s+/g, '-')
  return <span className={`badge badge-${slug}`}>{category}</span>
}

// ── Single opportunity card ────────────────────────────────────────────────────
function OpportunityCard({ opp, idx }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.08 }}
      className="jarvis-panel overflow-hidden"
    >
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-jarvis-cyan/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <CategoryBadge category={opp.category} />
              <RiskBadge     risk={opp.risk} />
            </div>
            <h3 className="font-orbitron text-jarvis-cyan text-sm tracking-wide">
              {opp.title}
            </h3>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <div className="flex items-center gap-1 text-jarvis-green text-xs font-exo">
                <MdTrendingUp size={13} />
                <span>{opp.potential_return}</span>
              </div>
              <div className="text-jarvis-dim text-xs font-exo">
                ⏱ {opp.time_horizon}
              </div>
              <div className="text-jarvis-dim text-xs font-exo">
                💰 {opp.capital_needed}
              </div>
            </div>
          </div>
          <button className="text-jarvis-dim hover:text-jarvis-cyan transition-colors shrink-0 mt-1">
            {expanded ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
          </button>
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-jarvis-border/30"
          >
            <div className="p-4 space-y-4">
              {/* Description */}
              <p className="text-jarvis-text text-sm font-exo leading-relaxed">
                {opp.description}
              </p>

              {/* Steps */}
              {opp.steps?.length > 0 && (
                <div>
                  <div className="font-orbitron text-jarvis-dim text-xs tracking-wider mb-2">
                    STEP-BY-STEP PLAYBOOK
                  </div>
                  <div className="space-y-2">
                    {opp.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="shrink-0 w-5 h-5 rounded-full bg-jarvis-cyan/15 border border-jarvis-cyan/40 flex items-center justify-center">
                          <span className="font-orbitron text-jarvis-cyan text-xs">{i + 1}</span>
                        </div>
                        <p className="text-jarvis-text text-sm font-exo leading-snug">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tools */}
              {opp.tools?.length > 0 && (
                <div>
                  <div className="font-orbitron text-jarvis-dim text-xs tracking-wider mb-2">RECOMMENDED TOOLS</div>
                  <div className="flex flex-wrap gap-2">
                    {opp.tools.map((tool) => (
                      <span
                        key={tool}
                        className="px-3 py-1 bg-jarvis-surface border border-jarvis-border rounded text-jarvis-cyan text-xs font-exo"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Market sentiment banner ────────────────────────────────────────────────────
function SentimentBanner({ sentiment, outlook, source }) {
  return (
    <div className="jarvis-panel p-4 border-l-2 border-l-jarvis-cyan">
      <div className="flex items-start gap-3">
        <MdLightbulb size={20} className="text-jarvis-yellow shrink-0 mt-0.5" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-orbitron text-jarvis-cyan text-xs tracking-wider">AI MARKET ANALYSIS</span>
            <span className="text-jarvis-dim text-xs font-exo">· {source}</span>
          </div>
          <p className="text-jarvis-text text-sm font-exo leading-relaxed">{sentiment}</p>
          {outlook && (
            <p className="text-jarvis-dim text-sm font-exo leading-relaxed mt-1">{outlook}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Risk warnings ──────────────────────────────────────────────────────────────
function RiskWarnings({ warnings }) {
  if (!warnings?.length) return null
  return (
    <div className="jarvis-panel p-4 border border-jarvis-yellow/30">
      <div className="flex items-center gap-2 mb-3">
        <MdWarning size={16} className="text-jarvis-yellow" />
        <span className="font-orbitron text-jarvis-yellow text-xs tracking-wider">RISK DISCLOSURES</span>
      </div>
      <div className="space-y-1.5">
        {warnings.map((w, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-jarvis-yellow text-xs mt-0.5">⚠</span>
            <p className="text-jarvis-dim text-xs font-exo">{w}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Sectors to watch ──────────────────────────────────────────────────────────
function SectorsToWatch({ sectors }) {
  if (!sectors?.length) return null
  return (
    <div className="jarvis-panel p-4">
      <div className="font-orbitron text-jarvis-cyan text-xs tracking-wider mb-3">
        🎯 SECTORS TO WATCH
      </div>
      <div className="flex flex-wrap gap-2">
        {sectors.map((s) => (
          <span key={s} className="px-3 py-1.5 bg-jarvis-surface border border-jarvis-cyan/30 rounded text-jarvis-cyan text-xs font-exo">
            {s}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Opportunities() {
  const [insights, setInsights] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('all')

  const load = () => {
    setLoading(true)
    fetchInsights()
      .then(setInsights)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const opportunities = insights?.opportunities || []
  const categories    = ['all', ...new Set(opportunities.map(o => o.category))]

  const filtered = filter === 'all'
    ? opportunities
    : opportunities.filter(o => o.category === filter)

  return (
    <div className="space-y-4 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-jarvis-cyan text-lg tracking-widest">OPPORTUNITIES</h1>
          <p className="text-jarvis-dim text-xs font-exo">
            {insights?.source === 'Claude AI'
              ? '⚡ Powered by Claude AI · Personalised to today\'s market'
              : '📊 JARVIS Heuristic Engine · Curated strategies'}
          </p>
        </div>
        <button onClick={load} className="jarvis-btn flex items-center gap-1" disabled={loading}>
          <MdRefresh size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Analysing…' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="jarvis-panel h-24 shimmer" />)}
        </div>
      ) : (
        <>
          {/* Sentiment */}
          {insights?.market_sentiment && (
            <SentimentBanner
              sentiment={insights.market_sentiment}
              outlook={insights.economic_outlook}
              source={insights.source}
            />
          )}

          {/* Sectors */}
          <SectorsToWatch sectors={insights?.sectors_to_watch} />

          {/* Category filter */}
          <div className="flex gap-1 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`jarvis-btn text-xs capitalize ${filter === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Opportunity cards */}
          <div className="space-y-3">
            {filtered.map((opp, i) => (
              <OpportunityCard key={opp.title} opp={opp} idx={i} />
            ))}
          </div>

          {/* Risk warnings */}
          <RiskWarnings warnings={insights?.risk_warnings} />

          {insights?.updated_at && (
            <p className="text-jarvis-dim text-xs font-exo text-right">
              Analysis updated: {new Date(insights.updated_at).toLocaleString()}
            </p>
          )}
        </>
      )}
    </div>
  )
}
