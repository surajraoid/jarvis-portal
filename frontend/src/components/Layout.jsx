/**
 * Layout.jsx — JARVIS-style application shell.
 *
 * Structure:
 *   ┌──────────────────────────────────────────────┐
 *   │  TOP BAR  (logo + system status + clock)     │
 *   ├────────┬─────────────────────────────────────┤
 *   │        │                                     │
 *   │SIDEBAR │     MAIN CONTENT                    │
 *   │        │                                     │
 *   └────────┴─────────────────────────────────────┘
 */

import { useState, useEffect } from 'react'
import { NavLink }             from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdDashboard, MdShowChart, MdCurrencyBitcoin,
  MdNewspaper, MdTrendingUp, MdLightbulb,
  MdMenuBook, MdMenu, MdClose, MdWifi,
  MdMonetizationOn, MdAutoAwesome, MdWork, MdSchool,
} from 'react-icons/md'
import { fetchHealth } from '../api/client'

// ── Navigation items ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { to: '/',              icon: MdDashboard,        label: 'Command Center' },
  { to: '/markets',       icon: MdShowChart,         label: 'Markets'        },
  { to: '/crypto',        icon: MdCurrencyBitcoin,  label: 'Crypto'         },
  { to: '/news',          icon: MdNewspaper,         label: 'News Intel'     },
  { to: '/opportunities', icon: MdTrendingUp,        label: 'Opportunities'  },
  { to: '/autoearn',      icon: MdAutoAwesome,       label: 'Auto-Earn 🤖',  highlight: true },
  { to: '/jobs',          icon: MdWork,              label: 'Job Hunter',    highlight: true },
  { to: '/earn',          icon: MdMonetizationOn,   label: 'Earn Guide',     highlight: false },
  { to: '/guide',         icon: MdMenuBook,          label: 'Money Guide'    },
  { to: '/tutorial',      icon: MdSchool,            label: 'Tutorial 🎓'    },
]

// ── Clock component ───────────────────────────────────────────────────────────
function JarvisClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="text-right leading-tight">
      <div className="font-orbitron text-jarvis-cyan text-sm tracking-widest">
        {now.toLocaleTimeString('en-US', { hour12: false })}
      </div>
      <div className="font-exo text-jarvis-dim text-xs tracking-wide">
        {now.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric' })}
      </div>
    </div>
  )
}

// ── System Status ─────────────────────────────────────────────────────────────
function SystemStatus() {
  const [status, setStatus] = useState(null)

  useEffect(() => {
    fetchHealth()
      .then(setStatus)
      .catch(() => setStatus(null))
    const id = setInterval(() => {
      fetchHealth().then(setStatus).catch(() => setStatus(null))
    }, 60_000)
    return () => clearInterval(id)
  }, [])

  const online = status?.status === 'healthy'

  return (
    <div className="flex items-center gap-2 text-xs font-exo">
      <span className={`status-dot ${online ? 'online' : 'offline'}`} />
      <span className={online ? 'text-jarvis-green' : 'text-jarvis-red'}>
        {online ? 'SYSTEMS ONLINE' : 'CONNECTING…'}
      </span>
      {status?.features?.ai_insights && (
        <span className="ml-1 badge badge-low">AI</span>
      )}
    </div>
  )
}

// ── Main Layout ───────────────────────────────────────────────────────────────
export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="jarvis-grid-bg flex flex-col h-screen overflow-hidden">
      {/* Scan line overlay */}
      <div className="jarvis-scanline-wrapper" />

      {/* ── TOP BAR ────────────────────────────────────────────────────────── */}
      <header className="relative z-20 flex items-center justify-between px-4 py-2 border-b border-jarvis-border bg-jarvis-bg/90 backdrop-blur-sm shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-jarvis-cyan"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <MdClose size={22} /> : <MdMenu size={22} />}
          </button>

          {/* Arc-reactor icon */}
          <div className="relative w-8 h-8 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full arc-spin" style={{ animationDuration: '10s' }}>
              <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(0,212,255,0.3)" strokeWidth="2" strokeDasharray="8 4" />
            </svg>
            <svg viewBox="0 0 100 100" className="w-full h-full arc-spin-reverse absolute inset-0" style={{ animationDuration: '15s' }}>
              <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(0,102,255,0.4)" strokeWidth="2" strokeDasharray="4 8" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-jarvis-cyan shadow-glow-cyan" />
            </div>
          </div>

          <div>
            <div className="font-orbitron text-jarvis-cyan text-sm font-bold tracking-widest glitch-text">
              J.A.R.V.I.S
            </div>
            <div className="font-exo text-jarvis-dim text-xs tracking-wide">
              Wealth Intelligence Portal
            </div>
          </div>
        </div>

        {/* Center status */}
        <div className="hidden md:block">
          <SystemStatus />
        </div>

        {/* Clock */}
        <JarvisClock />
      </header>

      {/* ── BODY ─────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative z-10">

        {/* ── SIDEBAR (desktop) ───────────────────────────────────────────── */}
        <aside
          className={`
            hidden md:flex flex-col shrink-0 border-r border-jarvis-border
            bg-jarvis-bg/95 transition-all duration-300
            ${collapsed ? 'w-14' : 'w-52'}
          `}
        >
          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-end px-3 py-2 text-jarvis-dim hover:text-jarvis-cyan transition-colors"
          >
            <MdMenu size={18} />
          </button>

          <nav className="flex flex-col gap-1 px-2 py-2 flex-1">
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-2 py-2 rounded transition-all duration-200
                   text-jarvis-dim hover:text-jarvis-cyan hover:bg-jarvis-cyan/10
                   ${isActive ? 'nav-link-active' : ''}
                   ${highlight ? 'text-jarvis-green hover:text-jarvis-green hover:bg-jarvis-green/10' : ''}`
                }
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && (
                  <span className={`font-orbitron text-xs tracking-wider truncate ${highlight ? 'text-jarvis-green' : ''}`}>{label}</span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Sidebar footer */}
          {!collapsed && (
            <div className="px-4 py-3 border-t border-jarvis-border text-jarvis-dim text-xs font-exo">
              <div className="flex items-center gap-1 mb-1">
                <MdWifi size={12} />
                <span>Live data feeds active</span>
              </div>
              <div className="opacity-50">JARVIS v1.0</div>
            </div>
          )}
        </aside>

        {/* ── SIDEBAR (mobile overlay) ────────────────────────────────────── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 w-60 bg-jarvis-bg border-r border-jarvis-border flex flex-col pt-16"
            >
              <nav className="flex flex-col gap-1 px-2 py-2">
                {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded transition-all
                       text-jarvis-dim hover:text-jarvis-cyan hover:bg-jarvis-cyan/10
                       ${isActive ? 'nav-link-active' : ''}`
                    }
                  >
                    <Icon size={18} />
                    <span className="font-orbitron text-xs tracking-wider">{label}</span>
                  </NavLink>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-3 md:p-4">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
