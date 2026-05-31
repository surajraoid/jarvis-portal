/**
 * Crypto.jsx — Cryptocurrency Intelligence Dashboard.
 *
 * Shows: market overview, top 25 coins table, trending coins,
 * Fear & Greed index, and sparkline mini-charts.
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts'
import { MdTrendingUp, MdTrendingDown, MdFlashOn, MdRefresh } from 'react-icons/md'
import { fetchCrypto } from '../api/client'

const fmt = (n, dec = 2) => n == null ? '—' : Number(n).toLocaleString('en-US', { maximumFractionDigits: dec })
const fmtLarge = (n) => {
  if (n == null) return '—'
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(0)}M`
  return `$${fmt(n, 0)}`
}

const changeCls = (v) => (v == null ? 'text-jarvis-dim' : v >= 0 ? 'positive' : 'negative')
const changeStr = (v) => v == null ? '—' : `${v >= 0 ? '+' : ''}${fmt(v, 2)}%`

// ── Sparkline mini-chart ──────────────────────────────────────────────────────
function Sparkline({ data, positive }) {
  if (!data?.length) return <span className="text-jarvis-dim text-xs">no data</span>
  const pts = data.map((v, i) => ({ i, v }))
  return (
    <div style={{ width: 80, height: 32 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={pts}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={positive ? '#00ff88' : '#ff3366'}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Market overview stats ─────────────────────────────────────────────────────
function MarketOverview({ overview, fearGreed }) {
  if (!overview) return null
  const fgVal = fearGreed?.value ?? 50
  const fgColor = fgVal < 25 ? '#ff3366' : fgVal < 45 ? '#ff9500' : fgVal < 55 ? '#ffcc00' : fgVal < 75 ? '#00d4ff' : '#00ff88'

  const stats = [
    { label: 'Total Market Cap', val: fmtLarge(overview.total_market_cap_usd), color: 'num-glow-cyan' },
    { label: '24h Volume',       val: fmtLarge(overview.total_volume_24h_usd), color: 'num-glow-cyan' },
    { label: 'BTC Dominance',    val: `${overview.btc_dominance}%`,            color: 'num-glow-green' },
    { label: 'ETH Dominance',    val: `${overview.eth_dominance}%`,            color: 'num-glow-green' },
    { label: 'Active Coins',     val: overview.active_cryptocurrencies?.toLocaleString(), color: 'text-jarvis-cyan' },
    { label: 'Fear & Greed',     val: `${fgVal} · ${fearGreed?.label}`,        color: '' },
  ]

  return (
    <div className="jarvis-panel p-4">
      <div className="jarvis-panel-header -mx-4 -mt-4 mb-4">
        <MdFlashOn className="text-jarvis-yellow" />
        <h3>Crypto Market Overview</h3>
        <span className={`ml-auto text-sm font-orbitron ${(overview.market_cap_change_24h || 0) >= 0 ? 'positive' : 'negative'}`}>
          {(overview.market_cap_change_24h || 0) >= 0 ? '+' : ''}{fmt(overview.market_cap_change_24h)}% 24h
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {stats.map(({ label, val, color }) => (
          <div key={label} className="bg-jarvis-surface/60 border border-jarvis-border rounded p-3">
            <div className="text-jarvis-dim text-xs font-exo mb-1">{label}</div>
            <div className={`font-orbitron text-sm font-bold ${color}`}
              style={label === 'Fear & Greed' ? { color: fgColor } : {}}>
              {val}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Coin row ──────────────────────────────────────────────────────────────────
function CoinRow({ coin, idx }) {
  const isPositive24h = (coin.change_24h || 0) >= 0
  return (
    <motion.tr
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.03 }}
      className="hover:bg-jarvis-cyan/5 transition-colors"
    >
      <td className="text-jarvis-dim text-xs w-8">{coin.rank}</td>
      <td>
        <div className="flex items-center gap-2">
          <img src={coin.image} alt={coin.symbol} className="w-5 h-5 rounded-full" onError={e => e.target.style.display='none'} />
          <div>
            <div className="font-exo text-jarvis-text text-sm font-semibold">{coin.name}</div>
            <div className="font-orbitron text-jarvis-dim text-xs">{coin.symbol}</div>
          </div>
        </div>
      </td>
      <td className="font-orbitron text-jarvis-text text-sm font-bold">
        ${coin.price > 1 ? fmt(coin.price, 2) : fmt(coin.price, 6)}
      </td>
      <td className={`text-sm font-exo ${changeCls(coin.change_24h)}`}>
        {changeStr(coin.change_24h)}
      </td>
      <td className={`text-sm font-exo hidden md:table-cell ${changeCls(coin.change_7d)}`}>
        {changeStr(coin.change_7d)}
      </td>
      <td className="text-jarvis-dim text-sm font-exo hidden lg:table-cell">
        {fmtLarge(coin.market_cap)}
      </td>
      <td className="hidden xl:table-cell">
        <Sparkline data={coin.sparkline} positive={isPositive24h} />
      </td>
    </motion.tr>
  )
}

// ── Trending coins ────────────────────────────────────────────────────────────
function TrendingCoins({ coins }) {
  if (!coins?.length) return null
  return (
    <div className="jarvis-panel">
      <div className="jarvis-panel-header">
        <MdTrendingUp className="text-jarvis-green" />
        <h3>Trending (24h)</h3>
      </div>
      <div className="divide-y divide-jarvis-border/20">
        {coins.map((c, i) => (
          <div key={c.id} className="flex items-center gap-3 px-4 py-2 hover:bg-jarvis-cyan/5">
            <span className="text-jarvis-dim text-xs w-4">{i + 1}</span>
            {c.image && <img src={c.image} alt={c.symbol} className="w-5 h-5 rounded-full" />}
            <div className="flex-1">
              <div className="text-jarvis-text text-sm font-exo">{c.name}</div>
              <div className="text-jarvis-dim text-xs font-orbitron">{c.symbol}</div>
            </div>
            <div className="text-jarvis-dim text-xs">#{c.rank || '—'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Dominance pie chart ───────────────────────────────────────────────────────
function DominancePie({ overview }) {
  if (!overview) return null
  const btc = overview.btc_dominance || 0
  const eth = overview.eth_dominance || 0
  const other = Math.max(0, 100 - btc - eth)
  const data = [
    { name: 'BTC',   value: btc,   fill: '#ff9500' },
    { name: 'ETH',   value: eth,   fill: '#0066ff' },
    { name: 'Other', value: other, fill: '#4a7a9b' },
  ]
  return (
    <div className="jarvis-panel p-4">
      <div className="jarvis-panel-header -mx-4 -mt-4 mb-4">
        <h3>Market Dominance</h3>
      </div>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width={100} height={100}>
          <PieChart>
            <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={28} outerRadius={45} strokeWidth={0}>
              {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-2">
          {data.map(d => (
            <div key={d.name} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.fill }} />
              <span className="font-exo text-xs text-jarvis-dim">{d.name}</span>
              <span className="font-orbitron text-xs text-jarvis-text ml-auto">{d.value.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Crypto() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    fetchCrypto()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const coins    = data?.top_coins  || []
  const trending = data?.trending   || []
  const overview = data?.overview
  const fg       = data?.fear_greed

  return (
    <div className="space-y-4 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-jarvis-cyan text-lg tracking-widest">CRYPTO INTELLIGENCE</h1>
          <p className="text-jarvis-dim text-xs font-exo">Real-time data via CoinGecko · No API key required</p>
        </div>
        <button onClick={load} className="jarvis-btn flex items-center gap-1" disabled={loading}>
          <MdRefresh size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4">{[...Array(3)].map((_, i) => <div key={i} className="jarvis-panel h-40 shimmer" />)}</div>
      ) : (
        <>
          <MarketOverview overview={overview} fearGreed={fg} />

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            {/* Coin table (takes 3 cols) */}
            <div className="xl:col-span-3">
              <div className="jarvis-panel overflow-hidden">
                <div className="jarvis-panel-header">
                  <MdFlashOn className="text-jarvis-yellow" />
                  <h3>Top Cryptocurrencies</h3>
                  <span className="ml-auto text-jarvis-dim text-xs font-exo">{coins.length} coins</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="jarvis-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Coin</th>
                        <th>Price</th>
                        <th>24h %</th>
                        <th className="hidden md:table-cell">7d %</th>
                        <th className="hidden lg:table-cell">Market Cap</th>
                        <th className="hidden xl:table-cell">7d Chart</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coins.map((coin, i) => <CoinRow key={coin.id} coin={coin} idx={i} />)}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-4">
              <DominancePie overview={overview} />
              <TrendingCoins coins={trending} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
