/**
 * News.jsx — Global News Intelligence.
 *
 * Displays categorised world news (business, tech, crypto, world)
 * with sentiment indicators. Data from RSS / NewsAPI.
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MdNewspaper, MdOpenInNew, MdRefresh, MdSearch } from 'react-icons/md'
import { fetchNews } from '../api/client'

const CATEGORIES = [
  { id: 'all',        label: 'All' },
  { id: 'business',   label: 'Business' },
  { id: 'technology', label: 'Technology' },
  { id: 'crypto',     label: 'Crypto' },
  { id: 'world',      label: 'World' },
]

// ── Sentiment badge ──────────────────────────────────────────────────────────
function SentimentBadge({ sentiment }) {
  const cls = {
    positive: 'bg-jarvis-green/10 text-jarvis-green border-jarvis-green/30',
    negative: 'bg-jarvis-red/10 text-jarvis-red border-jarvis-red/30',
    neutral:  'bg-jarvis-yellow/10 text-jarvis-yellow border-jarvis-yellow/30',
  }[sentiment] || 'bg-jarvis-dim/10 text-jarvis-dim border-jarvis-dim/30'

  return (
    <span className={`badge border text-xs ${cls}`}>
      {sentiment === 'positive' ? '▲ Bullish' : sentiment === 'negative' ? '▼ Bearish' : '● Neutral'}
    </span>
  )
}

// ── Article card ──────────────────────────────────────────────────────────────
function ArticleCard({ article, idx }) {
  const sentimentBorder = {
    positive: 'border-l-jarvis-green',
    negative: 'border-l-jarvis-red',
    neutral:  'border-l-jarvis-yellow',
  }[article.sentiment] || 'border-l-jarvis-dim'

  return (
    <motion.a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className={`jarvis-panel p-4 block border-l-2 ${sentimentBorder} hover:bg-jarvis-cyan/5 transition-all group`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-jarvis-cyan text-xs font-orbitron tracking-wider">
              {article.source}
            </span>
            <span className="text-jarvis-dim text-xs font-exo">·</span>
            <span className="text-jarvis-dim text-xs font-exo">
              {article.category?.toUpperCase()}
            </span>
            <SentimentBadge sentiment={article.sentiment} />
          </div>

          <h3 className="font-exo text-jarvis-text text-sm leading-snug group-hover:text-jarvis-cyan transition-colors font-semibold mb-2">
            {article.title}
          </h3>

          {article.summary && (
            <p className="font-exo text-jarvis-dim text-xs leading-relaxed line-clamp-2">
              {article.summary}
            </p>
          )}
        </div>

        {article.image && (
          <img
            src={article.image}
            alt=""
            className="w-16 h-16 object-cover rounded shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
            onError={e => e.target.style.display = 'none'}
          />
        )}
      </div>

      <div className="flex items-center gap-1 mt-2 text-jarvis-dim text-xs font-exo">
        <MdOpenInNew size={11} />
        <span className="opacity-50 group-hover:opacity-100">Read full article</span>
      </div>
    </motion.a>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function News() {
  const [allNews,  setAllNews]  = useState({})
  const [loading,  setLoading]  = useState(true)
  const [category, setCategory] = useState('all')
  const [search,   setSearch]   = useState('')

  const load = () => {
    setLoading(true)
    fetchNews('all')
      .then(setAllNews)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  // Gather articles based on selected category
  const getArticles = () => {
    if (category === 'all') {
      return [
        ...(allNews.business   || []),
        ...(allNews.technology || []),
        ...(allNews.crypto     || []),
        ...(allNews.world      || []),
      ]
    }
    return allNews[category] || []
  }

  const filtered = getArticles().filter(a => {
    if (!search) return true
    const q = search.toLowerCase()
    return a.title?.toLowerCase().includes(q) || a.summary?.toLowerCase().includes(q)
  })

  // Sentiment summary
  const sentimentCounts = getArticles().reduce((acc, a) => {
    acc[a.sentiment] = (acc[a.sentiment] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-4 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-jarvis-cyan text-lg tracking-widest">NEWS INTELLIGENCE</h1>
          <p className="text-jarvis-dim text-xs font-exo">Aggregated from Reuters, BBC, CNBC, CoinDesk & more</p>
        </div>
        <button onClick={load} className="jarvis-btn flex items-center gap-1" disabled={loading}>
          <MdRefresh size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {/* Sentiment overview */}
      {!loading && (
        <div className="jarvis-panel p-4">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="text-jarvis-dim text-xs font-orbitron tracking-wider">MARKET SENTIMENT</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-jarvis-green" />
              <span className="text-jarvis-green text-xs font-exo">{sentimentCounts.positive || 0} Bullish</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-jarvis-red" />
              <span className="text-jarvis-red text-xs font-exo">{sentimentCounts.negative || 0} Bearish</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-jarvis-yellow" />
              <span className="text-jarvis-yellow text-xs font-exo">{sentimentCounts.neutral || 0} Neutral</span>
            </div>
            <span className="ml-auto text-jarvis-dim text-xs font-exo">
              {filtered.length} articles
            </span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`jarvis-btn text-xs ${category === c.id ? 'active' : ''}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-jarvis-surface border border-jarvis-border rounded px-3 py-1.5 ml-auto">
          <MdSearch size={14} className="text-jarvis-dim" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search news…"
            className="bg-transparent text-jarvis-text text-xs font-exo w-40 outline-none placeholder:text-jarvis-dim"
          />
        </div>
      </div>

      {/* Articles */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="jarvis-panel h-28 shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="jarvis-panel p-8 text-center">
          <MdNewspaper size={32} className="text-jarvis-dim mx-auto mb-2" />
          <p className="text-jarvis-dim font-exo">No articles found. Try refreshing.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((article, i) => (
            <ArticleCard key={`${article.url}-${i}`} article={article} idx={i} />
          ))}
        </div>
      )}
    </div>
  )
}
