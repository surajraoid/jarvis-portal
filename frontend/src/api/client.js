/**
 * api/client.js — Centralised Axios API client for JARVIS Portal.
 *
 * All API calls go through this module so base URL and error handling
 * are configured in one place.
 */

import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Response interceptor: normalise errors ──────────────────────────────────
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err?.response?.data?.detail || err.message || 'Network error'
    console.error('[JARVIS API]', msg)
    return Promise.reject(new Error(msg))
  },
)

// ── Endpoints ───────────────────────────────────────────────────────────────

export const fetchSummary    = ()         => api.get('/api/summary')
export const fetchMarket     = ()         => api.get('/api/market')
export const fetchChart      = (symbol)   => api.get(`/api/market/chart/${symbol}`)
export const fetchCrypto     = ()         => api.get('/api/crypto')
export const fetchNews       = (cat='all')=> api.get(`/api/news?category=${cat}`)
export const fetchInsights   = ()         => api.get('/api/insights')
export const fetchHealth     = ()         => api.get('/api/health')

// ── WebSocket factory ───────────────────────────────────────────────────────
const WS_URL = BASE_URL.replace(/^http/, 'ws')

export function createMarketSocket(onMessage, onError) {
  const ws = new WebSocket(`${WS_URL}/ws/live`)
  ws.onmessage = (e) => {
    try { onMessage(JSON.parse(e.data)) } catch {}
  }
  ws.onerror   = (e) => { if (onError) onError(e) }
  ws.onclose   = () => {}
  return ws
}

export default api
