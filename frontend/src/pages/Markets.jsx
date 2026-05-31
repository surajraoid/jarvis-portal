/**
 * Markets.jsx — Global Stock Markets, Commodities & Forex.
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { MdTrendingUp, MdTrendingDown, MdRefresh, MdShowChart } from 'react-icons/md'
import { fetchMarket, fetchChart } from '../api/client'

const fmt = (n, dec = 2) => n == null ? '—' : Number(n).toLocaleString('en-US', { maximumFractionDigits: dec })

// ── Chart for a selected ticker ───────────────────────────────────────────────
function PriceChart({ symbol, name }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!symbol) return
    setLoading(true)
    fetchChart(symbol)
      .then(r => setData(r.history || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [symbol])

  if (loading) return <div className="h-40 shimmer rounded" />
  if (!data.length) return <p className="text-jarvis-dim text-sm text-center py-8">No chart data</p>

  const minClose = Math.min(...data.map(d => d.close))
  const maxClose = Math.max(...data.map(d => d.close))
  const isUp = data[data.length - 1]?.close >= data[0]?.close

  return (
    <div className="h-44">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={isUp ? '#00ff88' : '#ff3366'} stopOpacity={0.3} />
              <stop offset="95%" stopColor={isUp ? '#00ff88' : '#ff3366'} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.06)" />
          <XAxis dataKey="date" tick={{ fill: '#4a7a9b', fontSize: 10 }} tickLine={false} axisLine={false}
            tickFormatter={v => v.slice(5)} interval="preserveStartEnd" />
          <YAxis tick={{ fill: '#4a7a9b', fontSize: 10 }} tickLine={false} axisLine={false}
            domain={[minClose * 0.995, maxClose * 1.005]}
            tickFormatter={v => v > 1000 ? `${(v/1000).toFixed(1)}k` : v.toFixed(0)} />
          <Tooltip
            contentStyle={{ background: 'rgba(0,15,40,0.95)', border: '1px solid rgba(0,212,255,0.4)', borderRadius: 4, color: '#e0f0ff' }}
            formatter={(v) => [`$${fmt(v, 2)}`, 'Close']}
          />
          <Area type="monotone" dataKey="close" stroke={isUp ? '#00ff88' : '#ff3366'}
            fill="url(#chartGrad)" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Row in a data table ───────────────────────────────────────────────────────
function MarketRow({ item, onClick, active }) {
  return (
    <tr
      onClick={() => onClick(item)}
      className={`cursor-pointer transition-colors ${active ? 'bg-jarvis-cyan/10' : 'hover:bg-jarvis-cyan/5'}`}
    >
      <td className="font-exo text-jarvis-text text-sm">{item.name}</td>
      <td className="font-orbitron text-jarvis-text text-sm font-semibold">
        {item.price ? item.price.toLocaleString('en-US', { maximumFractionDigits: item.price > 100 ? 2 : 4 }) : '—'}
      </td>
      <td>
        <span className={`flex items-center gap-1 text-sm font-exo ${item.positive ? 'positive' : 'negative'}`}>
          {item.positive ? <MdTrendingUp size={14} /> : <MdTrendingDown size={14} />}
          {item.positive ? '+' : ''}{fmt(item.change_pct)}%
        </span>
      </td>
      <td className={`text-sm font-exo ${item.positive ? 'positive' : 'negative'}`}>
        {item.positive ? '+' : ''}{fmt(item.change, item.price > 100 ? 2 : 4)}
      </td>
    </tr>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Markets() {
  const [market,   setMarket]  = useState(null)
  const [loading,  setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [tab, setTab]          = useState('indices')

  const load = () => {
    setLoading(true)
    fetchMarket()
      .then(d => {
        setMarket(d)
        if (!selected && d.indices?.length) setSelected(d.indices[0])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const tabs = [
    { id: 'indices',     label: 'Global Indices', data: market?.indices      || [] },
    { id: 'commodities', label: 'Commodities',    data: market?.commodities  || [] },
    { id: 'forex',       label: 'Forex',          data: market?.forex        || [] },
    { id: 'stocks',      label: 'Top Stocks',     data: market?.top_stocks   || [] },
  ]
  const activeTab = tabs.find(t => t.id === tab)

  return (
    <div className="space-y-4 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-jarvis-cyan text-lg tracking-widest">GLOBAL MARKETS</h1>
          <p className="text-jarvis-dim text-xs font-exo">Live data via Yahoo Finance · 30-day charts</p>
        </div>
        <button onClick={load} className="jarvis-btn flex items-center gap-1" disabled={loading}>
          <MdRefresh size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="jarvis-panel h-32 shimmer" />)}</div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Left: tables */}
          <div className="xl:col-span-2 space-y-3">
            {/* Tabs */}
            <div className="flex gap-1 flex-wrap">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`jarvis-btn text-xs ${tab === t.id ? 'active' : ''}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="jarvis-panel overflow-hidden">
              <div className="jarvis-panel-header">
                <MdShowChart className="text-jarvis-cyan" />
                <h3>{activeTab?.label}</h3>
                <span className="ml-auto text-jarvis-dim text-xs font-exo">
                  {activeTab?.data.length} instruments
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="jarvis-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Change %</th>
                      <th>Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTab?.data.map((item, i) => (
                      <motion.tr
                        key={item.symbol || item.name}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => setSelected(item)}
                        className={`cursor-pointer transition-colors ${
                          selected?.symbol === item.symbol ? 'bg-jarvis-cyan/10' : 'hover:bg-jarvis-cyan/5'
                        }`}
                      >
                        <td className="font-exo text-jarvis-text text-sm">{item.name}</td>
                        <td className="font-orbitron text-jarvis-text text-sm font-semibold">
                          {item.price ? item.price.toLocaleString('en-US', { maximumFractionDigits: item.price > 100 ? 2 : 4 }) : '—'}
                        </td>
                        <td>
                          <span className={`flex items-center gap-1 text-sm ${item.positive ? 'positive' : 'negative'}`}>
                            {item.positive ? <MdTrendingUp size={13}/> : <MdTrendingDown size={13}/>}
                            {item.positive ? '+' : ''}{fmt(item.change_pct)}%
                          </span>
                        </td>
                        <td className={`text-sm font-exo ${item.positive ? 'positive' : 'negative'}`}>
                          {item.positive ? '+' : ''}{fmt(item.change, item.price > 100 ? 2 : 4)}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right: chart */}
          <div className="space-y-3">
            {selected && (
              <div className="jarvis-panel">
                <div className="jarvis-panel-header">
                  <h3>{selected.name}</h3>
                  <span className={`ml-auto text-sm font-exo ${selected.positive ? 'positive' : 'negative'}`}>
                    {selected.positive ? '+' : ''}{fmt(selected.change_pct)}%
                  </span>
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-end mb-3">
                    <span className="font-orbitron text-jarvis-text text-2xl font-bold">
                      {selected.price?.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </span>
                    <span className={`text-sm font-exo ${selected.positive ? 'positive' : 'negative'}`}>
                      {selected.positive ? '+' : ''}{fmt(selected.change, 2)}
                    </span>
                  </div>
                  <PriceChart symbol={selected.symbol} name={selected.name} />
                </div>
              </div>
            )}

            {/* Market summary */}
            <div className="jarvis-panel p-4">
              <div className="jarvis-panel-header -mx-4 -mt-4 mb-3">
                <h3>Market Pulse</h3>
              </div>
              <div className="space-y-2">
                {(market?.indices || []).slice(0, 5).map(idx => (
                  <div key={idx.symbol} className="flex justify-between items-center">
                    <span className="text-jarvis-dim text-xs font-exo">{idx.name}</span>
                    <span className={`text-xs font-orbitron ${idx.positive ? 'positive' : 'negative'}`}>
                      {idx.positive ? '+' : ''}{fmt(idx.change_pct)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
