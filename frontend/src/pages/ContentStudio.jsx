/**
 * ContentStudio.jsx — Automated Content Creation & Affiliate Marketing Hub
 *
 * Tabs:
 *  1. NicheRadar    — Live trending niches with affiliate potential scores
 *  2. ContentFactory — 5-agent pipeline → complete posts for all platforms
 *  3. Workflow       — 30-min daily workflow guide + posting calendar
 */

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import {
  MdAutoAwesome, MdTrendingUp, MdContentCopy, MdCheck,
  MdRefresh, MdPlayArrow, MdCheckCircle, MdRadioButtonUnchecked,
  MdOpenInNew, MdLightbulb, MdSchedule,
  MdAttachMoney, MdPeople, MdBarChart, MdStar,
  MdExpandMore, MdExpandLess, MdRocketLaunch, MdTimer,
} from 'react-icons/md'

const api = axios.create({ baseURL: '' })

// ── Helpers ───────────────────────────────────────────────────────────────────

function useCopy(text) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return [copied, copy]
}

function CopyBtn({ text, small }) {
  const [copied, copy] = useCopy(text)
  return (
    <button
      onClick={copy}
      className={`flex items-center gap-1 px-2 py-1 bg-jarvis-cyan/10 border border-jarvis-cyan/30 rounded text-jarvis-cyan font-exo hover:bg-jarvis-cyan/20 transition-colors ${small ? 'text-xs' : 'text-xs'}`}
    >
      {copied ? <MdCheck size={12} /> : <MdContentCopy size={12} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function ScoreBar({ score, color = 'bg-jarvis-cyan' }) {
  return (
    <div className="w-full bg-jarvis-border/30 rounded-full h-1.5 overflow-hidden">
      <motion.div
        className={`h-1.5 rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  )
}

// ── Agent Status Panel ────────────────────────────────────────────────────────

const AGENTS = [
  { id: 'NicheScout',      icon: '🔭', desc: 'Scanning trending topics' },
  { id: 'AudienceAnalyst', icon: '👥', desc: 'Defining target audience' },
  { id: 'ContentArchitect',icon: '🏗️', desc: 'Planning content structure' },
  { id: 'CopyWriter',      icon: '✍️', desc: 'Writing all platform posts' },
  { id: 'AffiliateWeaver', icon: '🔗', desc: 'Embedding affiliate links' },
]

function AgentPanel({ agents, running }) {
  return (
    <div className="space-y-2">
      {AGENTS.map((agent, idx) => {
        const status = agents[agent.id] || 'pending'
        return (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              status === 'completed' ? 'border-jarvis-green/40 bg-jarvis-green/5' :
              status === 'running'   ? 'border-jarvis-cyan/50 bg-jarvis-cyan/5' :
              'border-jarvis-border/30 bg-transparent'
            }`}
          >
            <span className="text-lg">{agent.icon}</span>
            <div className="flex-1">
              <div className={`font-orbitron text-xs font-bold ${
                status === 'completed' ? 'text-jarvis-green' :
                status === 'running'   ? 'text-jarvis-cyan' :
                'text-jarvis-dim'
              }`}>{agent.id}</div>
              <div className="text-jarvis-dim text-xs font-exo">{agent.desc}</div>
            </div>
            <div className="flex-shrink-0">
              {status === 'completed' && <MdCheckCircle className="text-jarvis-green" size={18} />}
              {status === 'running' && (
                <div className="w-4 h-4 border-2 border-jarvis-cyan/30 border-t-jarvis-cyan rounded-full animate-spin" />
              )}
              {status === 'pending' && <MdRadioButtonUnchecked className="text-jarvis-dim/40" size={18} />}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ── Niche Card ────────────────────────────────────────────────────────────────

function NicheCard({ niche, onSelect, rank }) {
  const [expanded, setExpanded] = useState(false)
  const scoreColor = niche.score >= 80 ? 'bg-jarvis-green' : niche.score >= 60 ? 'bg-jarvis-cyan' : 'bg-yellow-400'
  const diffColor = niche.difficulty === 'Easy' ? 'text-jarvis-green' : niche.difficulty === 'Medium' ? 'text-yellow-400' : 'text-jarvis-red'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.05 }}
      className="jarvis-panel border border-jarvis-border rounded-lg overflow-hidden hover:border-jarvis-cyan/30 transition-colors"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-jarvis-cyan/20 text-jarvis-cyan text-xs font-orbitron flex items-center justify-center flex-shrink-0 mt-0.5">
              {rank + 1}
            </span>
            <div>
              <div className="font-orbitron text-jarvis-text text-xs font-bold leading-tight">{niche.topic}</div>
              <div className="text-jarvis-dim text-xs font-exo mt-0.5">{niche.source}</div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <div className={`font-orbitron text-sm font-bold ${niche.score >= 80 ? 'text-jarvis-green' : 'text-jarvis-cyan'}`}>
              {niche.score}
            </div>
            <span className={`text-xs font-exo ${diffColor}`}>{niche.difficulty}</span>
          </div>
        </div>

        <ScoreBar score={niche.score} color={scoreColor} />

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-exo">
          <div className="flex items-center gap-1 text-jarvis-green">
            <MdAttachMoney size={12} />
            <span>{niche.commission}</span>
          </div>
          <div className="flex items-center gap-1 text-jarvis-cyan">
            <MdBarChart size={12} />
            <span>{niche.monthly_potential}/mo</span>
          </div>
        </div>

        <p className="mt-2 text-jarvis-dim text-xs font-exo leading-relaxed italic">
          "{niche.content_angle}"
        </p>

        <div className="mt-2 flex flex-wrap gap-1">
          {(niche.best_platforms || []).map(p => (
            <span key={p} className="px-2 py-0.5 bg-jarvis-blue/20 border border-jarvis-blue/30 rounded text-jarvis-cyan text-xs font-exo capitalize">{p}</span>
          ))}
          {(niche.affiliate_programs || []).slice(0, 2).map(p => (
            <span key={p} className="px-2 py-0.5 bg-jarvis-green/10 border border-jarvis-green/30 rounded text-jarvis-green text-xs font-exo">{p}</span>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onSelect(niche)}
            className="flex-1 jarvis-btn text-xs flex items-center justify-center gap-1"
          >
            <MdPlayArrow size={14} />
            Generate Content
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-2 py-1 border border-jarvis-border rounded text-jarvis-dim hover:text-jarvis-cyan transition-colors"
          >
            {expanded ? <MdExpandLess size={14} /> : <MdExpandMore size={14} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-jarvis-border overflow-hidden"
          >
            <div className="p-3 space-y-2 text-xs font-exo">
              <div><span className="text-jarvis-cyan font-orbitron">PROGRAMS:</span> {(niche.affiliate_programs || []).join(', ')}</div>
              <div><span className="text-jarvis-cyan font-orbitron">CATEGORY:</span> <span className="text-jarvis-text capitalize">{niche.category}</span></div>
              <div><span className="text-jarvis-cyan font-orbitron">ANGLE:</span> <span className="text-jarvis-dim">{niche.content_angle}</span></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Platform Content Viewer ───────────────────────────────────────────────────

function TwitterView({ data }) {
  const thread = data?.affiliate_weaver?.twitter_thread || data?.copy_writer?.twitter_thread || []
  const fullText = thread.join('\n\n---\n\n')
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[#1DA1F2] text-lg">🐦</span>
          <span className="font-orbitron text-jarvis-cyan text-xs">TWITTER THREAD</span>
          <span className="text-jarvis-dim text-xs font-exo">({thread.length} tweets)</span>
        </div>
        <CopyBtn text={fullText} />
      </div>
      {thread.map((tweet, i) => (
        <div key={i} className="relative p-3 bg-jarvis-surface/20 border border-jarvis-border rounded-lg">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-jarvis-cyan/20 text-jarvis-cyan text-xs font-orbitron flex items-center justify-center flex-shrink-0">{i+1}</div>
            <div className="flex-1">
              <p className="text-jarvis-text text-xs font-exo leading-relaxed whitespace-pre-wrap">{tweet}</p>
              <div className="mt-1 text-jarvis-dim/50 text-xs font-exo">{tweet.length}/280 chars</div>
            </div>
            <CopyBtn text={tweet} small />
          </div>
        </div>
      ))}
      <div className="p-3 bg-jarvis-cyan/5 border border-jarvis-cyan/20 rounded text-xs font-exo text-jarvis-dim">
        💡 <strong className="text-jarvis-cyan">Best time:</strong> {data?.audience_analyst?.platforms?.twitter?.best_time || '8-10 AM EST weekdays'}
      </div>
    </div>
  )
}

function InstagramView({ data }) {
  const caption = data?.affiliate_weaver?.instagram_caption || data?.copy_writer?.instagram_caption || ''
  const slides = data?.affiliate_weaver?.instagram_slides || data?.copy_writer?.instagram_slides || []
  const hashtags = (data?.affiliate_weaver?.instagram_hashtags || data?.copy_writer?.instagram_hashtags || []).join(' ')
  const fullPost = `${caption}\n\n.\n.\n.\n${hashtags}`

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-pink-400 text-lg">📸</span>
          <span className="font-orbitron text-jarvis-cyan text-xs">INSTAGRAM CAROUSEL</span>
        </div>
        <CopyBtn text={fullPost} />
      </div>

      <div>
        <div className="text-jarvis-dim text-xs font-orbitron mb-2">CAROUSEL SLIDES</div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {slides.map((slide, i) => (
            <div key={i} className="flex-shrink-0 w-40 h-40 bg-gradient-to-br from-jarvis-blue/30 to-jarvis-cyan/10 border border-jarvis-cyan/20 rounded-lg p-3 flex flex-col items-center justify-center text-center">
              <div className="text-jarvis-cyan font-orbitron text-xs mb-1">{i+1}/{slides.length}</div>
              <p className="text-jarvis-text text-xs font-exo leading-tight">{slide}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-jarvis-dim text-xs font-orbitron mb-1">CAPTION</div>
        <div className="p-3 bg-jarvis-surface/20 border border-jarvis-border rounded text-jarvis-text text-xs font-exo leading-relaxed whitespace-pre-wrap">
          {caption}
        </div>
      </div>

      <div>
        <div className="text-jarvis-dim text-xs font-orbitron mb-1">HASHTAGS (copy & paste)</div>
        <div className="p-3 bg-jarvis-surface/20 border border-jarvis-border rounded text-jarvis-dim text-xs font-exo flex flex-wrap gap-1">
          {(data?.affiliate_weaver?.instagram_hashtags || data?.copy_writer?.instagram_hashtags || []).map((h, i) => (
            <span key={i} className="text-jarvis-blue">{h}</span>
          ))}
        </div>
      </div>

      <div className="p-3 bg-pink-900/10 border border-pink-500/20 rounded text-xs font-exo text-jarvis-dim">
        💡 <strong className="text-pink-400">Best time:</strong> {data?.audience_analyst?.platforms?.instagram?.best_time || '12 PM and 7 PM EST'}
        <br />
        🎥 <strong className="text-pink-400">Pro tip:</strong> Record a 15-30s Reel explaining slide 1 → 3x more reach than static carousel
      </div>
    </div>
  )
}

function LinkedInView({ data }) {
  const post = data?.affiliate_weaver?.linkedin_post || data?.copy_writer?.linkedin_post || ''
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-blue-500 text-lg">💼</span>
          <span className="font-orbitron text-jarvis-cyan text-xs">LINKEDIN POST</span>
          <span className="text-jarvis-dim text-xs font-exo">({post.length} chars)</span>
        </div>
        <CopyBtn text={post} />
      </div>
      <div className="p-4 bg-jarvis-surface/20 border border-jarvis-border rounded text-jarvis-text text-xs font-exo leading-relaxed whitespace-pre-wrap">
        {post}
      </div>
      <div className="p-3 bg-blue-900/10 border border-blue-500/20 rounded text-xs font-exo text-jarvis-dim">
        💡 <strong className="text-blue-400">Best time:</strong> {data?.audience_analyst?.platforms?.linkedin?.best_time || 'Tuesday-Thursday 9 AM EST'}
        <br />
        📊 <strong className="text-blue-400">Pro tip:</strong> End with a question — LinkedIn algorithm boosts posts with comments in first hour
      </div>
    </div>
  )
}

function RedditView({ data }) {
  const reddit = data?.affiliate_weaver?.reddit_post || data?.copy_writer?.reddit_post || {}
  const fullText = `${reddit.title}\n\n${reddit.body}`
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-orange-400 text-lg">🤖</span>
          <span className="font-orbitron text-jarvis-cyan text-xs">REDDIT POST</span>
          {reddit.subreddit && <span className="text-orange-400 text-xs font-exo">{reddit.subreddit}</span>}
        </div>
        <CopyBtn text={fullText} />
      </div>
      <div className="p-3 bg-orange-900/10 border border-orange-500/30 rounded">
        <div className="text-jarvis-text font-orbitron text-xs mb-2">{reddit.title}</div>
        <div className="text-jarvis-dim text-xs font-exo leading-relaxed whitespace-pre-wrap">{reddit.body}</div>
      </div>
      <div className="p-3 bg-orange-900/10 border border-orange-500/20 rounded text-xs font-exo text-jarvis-dim">
        ⚠️ <strong className="text-orange-400">Reddit rule:</strong> Provide genuine value first. Never link your affiliate product directly — mention it as a reference if asked.
        <br />
        💡 <strong className="text-orange-400">Best time:</strong> 2 PM EST weekdays — peak Reddit activity
      </div>
    </div>
  )
}

function AffiliateView({ data }) {
  const placements = data?.affiliate_weaver?.affiliate_placements || []
  const strategy = data?.affiliate_weaver?.posting_strategy || {}

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-jarvis-green text-lg">🔗</span>
        <span className="font-orbitron text-jarvis-cyan text-xs">AFFILIATE STRATEGY</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-jarvis-green/10 border border-jarvis-green/30 rounded text-center">
          <div className="font-orbitron text-jarvis-green text-sm">{data?.affiliate_weaver?.estimated_clicks || '200-600'}</div>
          <div className="text-jarvis-dim text-xs font-exo">Est. clicks/week</div>
        </div>
        <div className="p-3 bg-jarvis-cyan/10 border border-jarvis-cyan/30 rounded text-center">
          <div className="font-orbitron text-jarvis-cyan text-sm">{data?.affiliate_weaver?.estimated_commission || '$30-$150'}</div>
          <div className="text-jarvis-dim text-xs font-exo">Est. commission/campaign</div>
        </div>
      </div>

      {placements.length > 0 && (
        <div>
          <div className="text-jarvis-dim text-xs font-orbitron mb-2">PLACEMENTS</div>
          {placements.map((p, i) => (
            <div key={i} className="p-3 bg-jarvis-surface/20 border border-jarvis-border rounded mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="font-orbitron text-jarvis-green text-xs">{p.program}</span>
                <span className="text-jarvis-dim text-xs font-exo capitalize">{p.platform}</span>
              </div>
              <p className="text-jarvis-text text-xs font-exo italic">"{p.natural_text}"</p>
              <p className="text-jarvis-dim text-xs font-exo mt-1">⚠️ {p.disclosure}</p>
            </div>
          ))}
        </div>
      )}

      {Object.keys(strategy).length > 0 && (
        <div>
          <div className="text-jarvis-dim text-xs font-orbitron mb-2">POSTING TIMELINE</div>
          <div className="space-y-1">
            {Object.entries(strategy).map(([key, val]) => (
              <div key={key} className="flex gap-2 text-xs font-exo">
                <span className="text-jarvis-cyan font-orbitron capitalize w-16 flex-shrink-0">{key.replace(/_/g, ' ')}:</span>
                <span className="text-jarvis-dim">{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data?.affiliate_weaver?.pro_tip && (
        <div className="p-3 bg-jarvis-green/10 border border-jarvis-green/30 rounded text-xs font-exo text-jarvis-green">
          💡 <strong>Pro Tip:</strong> {data.affiliate_weaver.pro_tip}
        </div>
      )}
    </div>
  )
}

// ── Workflow Guide Tab ────────────────────────────────────────────────────────

function WorkflowGuide() {
  const steps = [
    { time: '5 min', icon: '☀️', title: 'Morning Check',        desc: 'Open JARVIS NicheRadar tab. Scan top 3 niches. Pick the one with highest score that you can write about today.' },
    { time: '2 min', icon: '🎯', title: 'Select Niche',         desc: 'Click "Generate Content" on your chosen niche. Wait ~30 seconds for the 5-agent pipeline to complete.' },
    { time: '5 min', icon: '📝', title: 'Review Twitter Thread', desc: 'Read the 8 tweets. Make 1-2 personal tweaks to add your voice. Replace [PROGRAM_LINK] with your actual affiliate link.' },
    { time: '5 min', icon: '📸', title: 'Prep Instagram',       desc: 'Copy the caption + hashtags. Create carousel slides in Canva (free) using the slide texts. Takes 5 min with a template.' },
    { time: '3 min', icon: '💼', title: 'Post LinkedIn',        desc: 'Copy the LinkedIn post. Add your photo if relevant. Post between 9-11 AM on Tuesday/Wednesday/Thursday for best reach.' },
    { time: '5 min', icon: '📊', title: 'Check Yesterday',      desc: 'Quick look at yesterday\'s posts. Note which got most engagement. The JARVIS IncomeTracker logs your commissions.' },
    { time: '5 min', icon: '💬', title: 'Engage',               desc: 'Reply to any comments from yesterday. Comment on 3-5 posts from bigger accounts in your niche. Builds your visibility.' },
  ]

  const [done, setDone] = useState({})
  const toggle = (i) => setDone(p => ({ ...p, [i]: !p[i] }))
  const totalDone = Object.values(done).filter(Boolean).length
  const totalTime = steps.reduce((a, s) => a + parseInt(s.time), 0)

  return (
    <div className="space-y-4">
      <div className="jarvis-panel border border-jarvis-cyan/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-orbitron text-jarvis-cyan text-sm font-bold">⚡ 30-MINUTE DAILY WORKFLOW</h2>
            <p className="text-jarvis-dim text-xs font-exo mt-0.5">Your complete daily routine for consistent affiliate income</p>
          </div>
          <div className="text-right">
            <div className="font-orbitron text-jarvis-green text-sm">{totalDone}/{steps.length}</div>
            <div className="text-jarvis-dim text-xs font-exo">done today</div>
          </div>
        </div>
        <div className="w-full bg-jarvis-border/30 rounded-full h-2">
          <motion.div
            className="bg-jarvis-green h-2 rounded-full transition-all"
            animate={{ width: `${(totalDone / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
              done[i] ? 'border-jarvis-green/30 bg-jarvis-green/5' : 'border-jarvis-border hover:border-jarvis-cyan/30'
            }`}
            onClick={() => toggle(i)}
          >
            {done[i]
              ? <MdCheckCircle className="text-jarvis-green flex-shrink-0 mt-0.5" size={20} />
              : <MdRadioButtonUnchecked className="text-jarvis-dim/40 flex-shrink-0 mt-0.5" size={20} />
            }
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm">{step.icon}</span>
                <span className={`font-orbitron text-xs font-bold ${done[i] ? 'text-jarvis-green' : 'text-jarvis-text'}`}>{step.title}</span>
                <span className="flex items-center gap-0.5 text-jarvis-dim text-xs font-exo">
                  <MdTimer size={11} />{step.time}
                </span>
              </div>
              <p className={`text-xs font-exo mt-1 leading-relaxed ${done[i] ? 'text-jarvis-dim line-through' : 'text-jarvis-dim'}`}>
                {step.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        {[
          { label: 'Total Daily Time', value: `~${totalTime} min`, icon: '⏱️', color: 'text-jarvis-cyan' },
          { label: 'Posts Per Day', value: '4 platforms', icon: '📱', color: 'text-jarvis-green' },
          { label: 'Expected Income', value: '$30–$150/day', icon: '💰', color: 'text-yellow-400' },
        ].map(stat => (
          <div key={stat.label} className="jarvis-panel border border-jarvis-border rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className={`font-orbitron text-sm font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-jarvis-dim text-xs font-exo">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="jarvis-panel border border-yellow-500/30 rounded-lg p-4">
        <div className="font-orbitron text-yellow-400 text-xs mb-3">📅 WEEKLY POSTING SCHEDULE</div>
        <div className="space-y-2">
          {[
            { day: 'Monday',    platform: 'LinkedIn',  time: '9 AM',  type: 'Professional insight / career tips' },
            { day: 'Tuesday',   platform: 'Twitter',   time: '8 AM',  type: 'Thread (your top-scoring niche)' },
            { day: 'Wednesday', platform: 'Instagram', time: '12 PM', type: '6-slide carousel' },
            { day: 'Thursday',  platform: 'LinkedIn',  time: '9 AM',  type: 'Story / personal case study' },
            { day: 'Friday',    platform: 'Twitter',   time: '9 AM',  type: 'Week roundup / tools I used' },
            { day: 'Saturday',  platform: 'Instagram', time: '11 AM', type: 'Behind the scenes / lifestyle' },
            { day: 'Sunday',    platform: 'Reddit',    time: '2 PM',  type: 'Helpful discussion post' },
          ].map(item => (
            <div key={item.day} className="flex items-center gap-3 text-xs font-exo">
              <span className="w-20 font-orbitron text-jarvis-cyan text-xs">{item.day}</span>
              <span className="w-20 text-jarvis-text">{item.platform}</span>
              <span className="w-12 text-jarvis-dim">{item.time}</span>
              <span className="text-jarvis-dim/70">{item.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ContentStudio() {
  const [tab, setTab] = useState('niches')
  const [niches, setNiches] = useState([])
  const [nichesLoading, setNichesLoading] = useState(false)
  const [nichesUpdated, setNichesUpdated] = useState(null)

  const [pipelineRunning, setPipelineRunning] = useState(false)
  const [agentStatuses, setAgentStatuses] = useState({})
  const [contentResult, setContentResult] = useState(null)
  const [contentTab, setContentTab] = useState('twitter')
  const [selectedNiche, setSelectedNiche] = useState(null)

  const pollRef = useRef(null)

  // Load niches on mount
  useEffect(() => {
    loadNiches()
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  const loadNiches = async () => {
    setNichesLoading(true)
    try {
      const { data } = await api.get('/api/content/niches')
      setNiches(data.niches || [])
      setNichesUpdated(data.updated_at)
    } catch (e) {
      console.error('Niches fetch error', e)
    }
    setNichesLoading(false)
  }

  const startPipeline = async (niche) => {
    if (pipelineRunning) return
    setSelectedNiche(niche)
    setTab('generate')
    setContentResult(null)
    setAgentStatuses({
      NicheScout: 'pending', AudienceAnalyst: 'pending',
      ContentArchitect: 'pending', CopyWriter: 'pending', AffiliateWeaver: 'pending',
    })

    try {
      await api.post('/api/content/generate')
      setPipelineRunning(true)

      // Poll for status
      pollRef.current = setInterval(async () => {
        try {
          const { data: status } = await api.get('/api/content/status')
          setAgentStatuses(status.agents || {})

          if (!status.running && status.has_results) {
            clearInterval(pollRef.current)
            setPipelineRunning(false)
            const { data: results } = await api.get('/api/content/results')
            setContentResult(results)
          } else if (!status.running) {
            clearInterval(pollRef.current)
            setPipelineRunning(false)
          }
        } catch (e) {
          clearInterval(pollRef.current)
          setPipelineRunning(false)
        }
      }, 2000)
    } catch (e) {
      console.error('Pipeline start error', e)
      setPipelineRunning(false)
    }
  }

  const platformTabs = [
    { id: 'twitter',   label: '🐦 Twitter',   color: 'text-[#1DA1F2]' },
    { id: 'instagram', label: '📸 Instagram', color: 'text-pink-400'  },
    { id: 'linkedin',  label: '💼 LinkedIn',  color: 'text-blue-400'  },
    { id: 'reddit',    label: '🤖 Reddit',    color: 'text-orange-400' },
    { id: 'affiliate', label: '🔗 Affiliate', color: 'text-jarvis-green' },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="jarvis-panel border border-jarvis-cyan/30 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <MdAutoAwesome className="text-jarvis-green" size={22} />
          <div>
            <h1 className="font-orbitron text-jarvis-cyan text-lg font-bold tracking-wider">CONTENT STUDIO</h1>
            <p className="text-jarvis-dim text-xs font-exo">5-Agent AI → Full content for Twitter, Instagram, LinkedIn, Reddit — in 30 seconds</p>
          </div>
          <span className="ml-auto badge badge-high text-xs">AUTO</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
          {[
            { v: '5 AI Agents',    c: 'text-jarvis-cyan'  },
            { v: '4 Platforms',    c: 'text-jarvis-green' },
            { v: '30 sec/batch',   c: 'text-yellow-400'   },
            { v: '$30-$150/day',   c: 'text-jarvis-green' },
          ].map(s => (
            <div key={s.v} className={`text-center p-2 bg-jarvis-surface/20 rounded border border-jarvis-border font-orbitron text-xs ${s.c}`}>{s.v}</div>
          ))}
        </div>
      </div>

      {/* Main tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {[
          { id: 'niches',   label: '🎯 Niche Radar' },
          { id: 'generate', label: '🤖 Content Factory' },
          { id: 'workflow', label: '⚡ Daily Workflow' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-shrink-0 px-4 py-2 rounded font-orbitron text-xs transition-all ${
              tab === t.id
                ? 'bg-jarvis-cyan/20 border border-jarvis-cyan text-jarvis-cyan'
                : 'bg-jarvis-surface/30 border border-jarvis-border text-jarvis-dim hover:text-jarvis-text'
            }`}
          >
            {t.label}
            {t.id === 'generate' && pipelineRunning && (
              <span className="ml-2 inline-block w-2 h-2 bg-jarvis-cyan rounded-full animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* ── Niche Radar Tab ──────────────────────────────────────────────── */}
      {tab === 'niches' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-jarvis-dim text-xs font-exo">
              {niches.length} niches · {nichesUpdated ? `Updated ${new Date(nichesUpdated).toLocaleTimeString()}` : ''}
            </div>
            <button onClick={loadNiches} disabled={nichesLoading}
              className="flex items-center gap-1 px-3 py-1.5 border border-jarvis-border rounded text-jarvis-dim hover:text-jarvis-cyan text-xs font-exo transition-colors">
              <MdRefresh size={14} className={nichesLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {nichesLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-jarvis-cyan/30 border-t-jarvis-cyan rounded-full animate-spin mx-auto mb-3" />
              <div className="text-jarvis-dim text-xs font-exo">Scanning Google Trends, Reddit, Hacker News…</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {niches.map((niche, i) => (
                <NicheCard key={i} niche={niche} rank={i} onSelect={startPipeline} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Content Factory Tab ──────────────────────────────────────────── */}
      {tab === 'generate' && (
        <div className="space-y-4">
          {!contentResult && !pipelineRunning && (
            <div className="text-center py-12">
              <MdRocketLaunch className="text-jarvis-cyan mx-auto mb-3" size={36} />
              <p className="font-orbitron text-jarvis-cyan text-sm mb-2">Ready to Generate</p>
              <p className="text-jarvis-dim text-xs font-exo mb-4">
                Go to Niche Radar and click "Generate Content" on any niche,<br />or click below to use today's top niche.
              </p>
              <button
                onClick={() => niches.length > 0 && startPipeline(niches[0])}
                className="jarvis-btn flex items-center gap-2 mx-auto text-sm"
              >
                <MdPlayArrow size={16} />
                Auto-Generate with Top Niche
              </button>
            </div>
          )}

          {(pipelineRunning || (contentResult && Object.keys(agentStatuses).length > 0)) && (
            <div className="jarvis-panel border border-jarvis-cyan/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-orbitron text-jarvis-cyan text-xs">
                  {pipelineRunning ? '⚙️ AGENTS RUNNING…' : '✅ PIPELINE COMPLETE'}
                </span>
                {selectedNiche && (
                  <span className="text-jarvis-dim text-xs font-exo truncate max-w-48">
                    Niche: {selectedNiche.topic}
                  </span>
                )}
              </div>
              <AgentPanel agents={agentStatuses} running={pipelineRunning} />
              {pipelineRunning && (
                <p className="text-jarvis-dim text-xs font-exo mt-3 text-center">
                  Generating content for Twitter, Instagram, LinkedIn, Reddit…
                </p>
              )}
            </div>
          )}

          {contentResult && !pipelineRunning && (
            <div className="space-y-3">
              {/* Niche summary */}
              {contentResult.niche_scout && (
                <div className="jarvis-panel border border-jarvis-green/30 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-exo">
                    <div>
                      <div className="text-jarvis-dim font-orbitron mb-1">NICHE</div>
                      <div className="text-jarvis-text">{contentResult.niche_scout.selected_niche}</div>
                    </div>
                    <div>
                      <div className="text-jarvis-dim font-orbitron mb-1">AFFILIATE</div>
                      <div className="text-jarvis-green">{contentResult.niche_scout.affiliate_match}</div>
                    </div>
                    <div>
                      <div className="text-jarvis-dim font-orbitron mb-1">POTENTIAL</div>
                      <div className="text-jarvis-green">{contentResult.niche_scout.estimated_monthly_income}</div>
                    </div>
                    <div>
                      <div className="text-jarvis-dim font-orbitron mb-1">COMPETITION</div>
                      <div className="text-jarvis-cyan capitalize">{contentResult.niche_scout.competition_level}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Platform tabs */}
              <div className="flex gap-2 overflow-x-auto">
                {platformTabs.map(pt => (
                  <button key={pt.id} onClick={() => setContentTab(pt.id)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded font-exo text-xs transition-all ${
                      contentTab === pt.id
                        ? `bg-jarvis-cyan/20 border border-jarvis-cyan ${pt.color}`
                        : 'bg-jarvis-surface/20 border border-jarvis-border text-jarvis-dim'
                    }`}
                  >
                    {pt.label}
                  </button>
                ))}
              </div>

              <div className="jarvis-panel border border-jarvis-border rounded-lg p-4">
                {contentTab === 'twitter'   && <TwitterView data={contentResult} />}
                {contentTab === 'instagram' && <InstagramView data={contentResult} />}
                {contentTab === 'linkedin'  && <LinkedInView data={contentResult} />}
                {contentTab === 'reddit'    && <RedditView data={contentResult} />}
                {contentTab === 'affiliate' && <AffiliateView data={contentResult} />}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => niches.length > 0 && startPipeline(niches[0])}
                  className="jarvis-btn flex items-center gap-2 text-xs"
                >
                  <MdRefresh size={14} />
                  Generate New Content
                </button>
                {contentResult?.affiliate_weaver?.pro_tip && (
                  <div className="flex-1 p-3 bg-jarvis-green/10 border border-jarvis-green/30 rounded text-jarvis-green text-xs font-exo">
                    💡 {contentResult.affiliate_weaver.pro_tip}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Workflow Tab ─────────────────────────────────────────────────── */}
      {tab === 'workflow' && <WorkflowGuide />}
    </div>
  )
}
