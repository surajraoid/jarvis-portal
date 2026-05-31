/**
 * Dashboard.jsx — JARVIS Command Center.
 *
 * The main landing page showing:
 *  • Hero arc-reactor panel with key metrics
 *  • Live index cards (S&P, NASDAQ, BTC, ETH)
 *  • Fear & Greed gauge
 *  • Latest news headlines
 *  • Quick opportunity snapshot
 */

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import {
  MdTrendingUp, MdTrendingDown, MdFlashOn, MdNewspaper,
  MdArrowForward, MdRefresh,
} from 'react-icons/md'
import { fetchSummary, fetchMarket, fetchNews, createMarketSocket } from '../api/client'

// ── Helper utilities ──────────────────────────────────────────────────────────
const fmt = (n, dec=2) => n == null ? '—' : Number(n).toLocaleString('en-US', { maximumFractionDigits: dec })
const fmtLarge = (n) => {
  if (n == null) return '—'
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(1)}M`
  return `$${fmt(n)}`
}

// ── Sub-components ────────────────────────────────────────────────────────────

function HeroPanel({ summary }) {
  const fg = summary?.fear_greed || {}
  const fgVal = fg.value ?? 50
  const fgLabel = fg.label || 'Neutral'

  // Gauge colour
  const fgColor = fgVal < 25 ? '#ff3366' : fgVal < 45 ? '#ff9500' : fgVal < 55 ? '#ffcc00' : fgVal < 75 ? '#00d4ff' : '#00ff88'

  return (
    <div className="jarvis-panel relative p-4 md:p-6 flex flex-col md:flex-row items-center gap-6">
      {/* Arc reactor */}
      <div className="relative shrink-0 w-36 h-36">
        {/* Outer rings */}
        <svg viewBox="0 0 160 160" className="w-full h-full absolute inset-0 arc-spin" style={{ animationDuration: '12s' }}>
          <circle cx="80" cy="80" r="72" fill="none" stroke="rgba(0,212,255,0.2)" strokeWidth="1" strokeDasharray="6 3"/>
          <circle cx="80" cy="80" r="60" fill="none" stroke="rgba(0,102,255,0.2)" strokeWidth="1" strokeDasharray="3 6"/>
        </svg>
        <svg viewBox="0 0 160 160" className="w-full h-full absolute inset-0 arc-spin-reverse" style={{ animationDuration: '20s' }}>
          <circle cx="80" cy="80" r="50" fill="none" stroke="rgba(0,212,255,0.3)" strokeWidth="2" strokeDasharray="12 4"/>
        </svg>

        {/* Fear & Greed gauge ring */}
        <svg viewBox="0 0 160 160" className="w-full h-full absolute inset-0">
          <circle cx="80" cy="80" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6"/>
          <circle
            cx="80" cy="80" r="36"
            fill="none"
            stroke={fgColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${(fgVal / 100) * 226} 226`}
            transform="rotate(-90 80 80)"
            style={{ filter: `drop-shadow(0 0 6px ${fgColor})`, transition: 'stroke-dasharray 1s ease' }}
          />
        </svg>

        {/* Centre text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-orbitron text-2xl font-bold" style={{ color: fgColor }}>{fgVal}</span>
          <span className="font-exo text-xs text-jarvis-dim mt-0.5 text-center leading-tight">{fgLabel}</span>
        </div>
      </div>

      {/* Summary text */}
      <div className="flex-1 text-center md:text-left">
        <h1 className="font-orbitron text-jarvis-cyan text-xl md:text-2xl font-bold tracking-widest glitch-text mb-1">
          WEALTH INTELLIGENCE
        </h1>
        <p className="text-jarvis-dim text-sm font-exo mb-4">
          Real-time global market analysis · AI-powered insights · {summary?.active_coins?.toLocaleString() || '—'} active cryptocurrencies tracked
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'S&P 500', val: summary?.sp500?.price, chg: summary?.sp500?.change_pct, pos: summary?.sp500?.positive },
            { label: 'BTC', val: summary?.btc?.price, chg: summary?.btc?.change_24h, pos: (summary?.btc?.change_24h||0)>=0 },
            { label: 'ETH', val: summary?.eth?.price, chg: summary?.eth?.change_24h, pos: (summary?.eth?.change_24h||0)>=0 },
            { label: 'NEWS', val: summary?.total_news, chg: null, pos: true, isCount: true },
          ].map(({ label, val, chg, pos, isCount }) => (
            <div key={label} className="bg-jarvis-surface/60 border border-jarvis-border rounded p-3 text-center">
              <div className="text-jarvis-dim text-xs font-orbitron tracking-wider mb-1">{label}</div>
              <div className={`font-orbitron text-base font-bold ${isCount ? 'num-glow-cyan' : pos ? 'num-glow-green' : 'num-glow-red'}`}>
                {isCount ? val || '—' : val ? `$${fmt(val, val > 100 ? 0 : 2)}` : '—'}
              </div>
              {chg != null && (
                <div className={`text-xs mt-0.5 ${pos ? 'positive' : 'negative'}`}>
                  {pos ? '+' : ''}{fmt(chg, 2)}%
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function IndexCard({ item }) {
  const Icon = item.positive ? MdTrendingUp : MdTrendingDown
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="jarvis-panel p-3 flex items-center justify-between"
    >
      <div>
        <div className="font-orbitron text-jarvis-cyan text-xs tracking-wider">{item.name}</div>
        <div className="font-orbitron text-jarvis-text text-lg font-bold mt-0.5">
          {item.price ? item.price.toLocaleString('en-US', { maximumFractionDigits: item.price > 1000 ? 0 : 2 }) : '—'}
        </div>
      </div>
      <div className={`flex flex-col items-end ${item.positive ? 'text-jarvis-green' : 'text-jarvis-red'}`}>
        <Icon size={20} />
        <span className="font-exo text-sm font-semibold">
          {item.positive ? '+' : ''}{fmt(item.change_pct)}%
        </span>
        <span className="font-exo text-xs opacity-60">
          {item.positive ? '+' : ''}{fmt(item.change, item.price > 100 ? 2 : 4)}
        </span>
      </div>
    </motion.div>
  )
}

function FearGreedBar({ value, label }) {
  const segments = [
    { label: 'Extreme Fear',   color: '#ff3366', range: [0,  25] },
    { label: 'Fear',           color: '#ff9500', range: [25, 45] },
    { label: 'Neutral',        color: '#ffcc00', range: [45, 55] },
    { label: 'Greed',          color: '#00d4ff', range: [55, 75] },
    { label: 'Extreme Greed',  color: '#00ff88', range: [75, 100] },
  ]
  const active = segments.find(s => value >= s.range[0] && value < s.range[1]) || segments[2]
  return (
    <div className="jarvis-panel p-4">
      <div className="jarvis-panel-header -mx-4 -mt-4 mb-4">
        <h3>Fear &amp; Greed Index</h3>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="font-orbitron text-3xl font-bold" style={{ color: active.color }}>{value}</span>
        <span className="font-exo text-sm text-jarvis-dim">{label}</span>
      </div>
      <div className="relative h-3 rounded-full overflow-hidden flex">
        {segments.map(s => (
          <div
            key={s.label}
            className="h-full"
            style={{ width: `${s.range[1] - s.range[0]}%`, background: s.color, opacity: 0.7 }}
          />
        ))}
        {/* Needle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-white"
          style={{ left: `${value}%`, boxShadow: '0 0 6px white' }}
        />
      </div>
      <div className="flex justify-between mt-1 text-jarvis-dim text-xs font-exo">
        <span>Extreme Fear</span>
        <span>Extreme Greed</span>
      </div>
    </div>
  )
}

function NewsHeadlines({ articles }) {
  if (!articles?.length) return null
  return (
    <div className="jarvis-panel">
      <div className="jarvis-panel-header flex items-center justify-between">
        <h3>Latest Intelligence</h3>
        <Link to="/news" className="text-jarvis-cyan text-xs font-exo flex items-center gap-1 hover:underline">
          All news <MdArrowForward size={12} />
        </Link>
      </div>
      <div className="divide-y divide-jarvis-border/30">
        {articles.slice(0, 5).map((a, i) => (
          <motion.a
            key={i}
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-start gap-3 px-4 py-3 hover:bg-jarvis-cyan/5 transition-colors block"
          >
            <span className={`shrink-0 mt-1 w-1.5 h-1.5 rounded-full ${
              a.sentiment === 'positive' ? 'bg-jarvis-green' :
              a.sentiment === 'negative' ? 'bg-jarvis-red' : 'bg-jarvis-yellow'
            }`} />
            <div>
              <p className="text-jarvis-text text-sm font-exo leading-snug line-clamp-2">{a.title}</p>
              <p className="text-jarvis-dim text-xs mt-0.5">{a.source}</p>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  )
}

// ── Main Dashboard page ───────────────────────────────────────────────────────

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [market,  setMarket]  = useState(null)
  const [news,    setNews]    = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const wsRef = useRef(null)

  const load = async () => {
    try {
      const [s, m, n] = await Promise.allSettled([
        fetchSummary(), fetchMarket(), fetchNews('business'),
      ])
      if (s.status === 'fulfilled') setSummary(s.value)
      if (m.status === 'fulfilled') setMarket(m.value)
      if (n.status === 'fulfilled') setNews(n.value?.business || [])
      setLastUpdate(new Date())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()

    // WebSocket live updates
    wsRef.current = createMarketSocket((data) => {
      if (data.type === 'market_update') {
        setLastUpdate(new Date())
      }
    })
    return () => wsRef.current?.close()
  }, [])

  const indices = market?.indices || []
  const topIndices = indices.slice(0, 4)

  return (
    <div className="space-y-4 fade-in">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-jarvis-cyan text-lg tracking-widest">COMMAND CENTER</h1>
          <p className="text-jarvis-dim text-xs font-exo mt-0.5">
            Global wealth intelligence · Auto-refreshes every 5 min
          </p>
        </div>
        <button
          onClick={load}
          className="jarvis-btn flex items-center gap-1"
          disabled={loading}
        >
          <MdRefresh size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="jarvis-panel h-32 shimmer" />
          ))}
        </div>
      ) : (
        <>
          {/* Hero */}
          {summary && <HeroPanel summary={summary} />}

          {/* Index cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {topIndices.map((item) => (
              <IndexCard key={item.symbol} item={item} />
            ))}
          </div>

          {/* Second row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary?.fear_greed && (
              <FearGreedBar
                value={summary.fear_greed.value}
                label={summary.fear_greed.label}
              />
            )}

            {/* Quick links */}
            <div className="jarvis-panel p-4">
              <div className="jarvis-panel-header -mx-4 -mt-4 mb-4">
                <h3>Quick Access</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { to: '/markets',       icon: MdTrendingUp,         label: 'Markets',       desc: 'Stocks & Forex' },
                  { to: '/crypto',        icon: MdFlashOn,             label: 'Crypto',        desc: 'Top 25 Coins' },
                  { to: '/news',          icon: MdNewspaper,           label: 'News Intel',    desc: 'World News' },
                  { to: '/opportunities', icon: MdTrendingUp,          label: 'Opportunities', desc: 'Make Money Now' },
                ].map(({ to, icon: Icon, label, desc }) => (
                  <Link
                    key={to}
                    to={to}
                    className="jarvis-panel p-3 flex flex-col gap-1 hover:border-jarvis-cyan/60 transition-all group"
                  >
                    <Icon size={20} className="text-jarvis-cyan group-hover:text-jarvis-green transition-colors" />
                    <span className="font-orbitron text-xs text-jarvis-text tracking-wide">{label}</span>
                    <span className="font-exo text-xs text-jarvis-dim">{desc}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* News */}
          <NewsHeadlines articles={news} />
        </>
      )}

      {lastUpdate && (
        <p className="text-jarvis-dim text-xs font-exo text-right">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </p>
      )}
    </div>
  )
}
