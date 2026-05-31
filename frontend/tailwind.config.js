/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        jarvis: {
          bg:       '#000208',
          surface:  '#000f28',
          panel:    '#001530',
          cyan:     '#00d4ff',
          blue:     '#0066ff',
          accent:   '#ff6b35',
          green:    '#00ff88',
          yellow:   '#ffcc00',
          red:      '#ff3366',
          text:     '#e0f0ff',
          dim:      '#4a7a9b',
          border:   'rgba(0, 212, 255, 0.35)',
        },
      },
      fontFamily: {
        orbitron: ['Orbitron', 'monospace'],
        exo:      ['Exo 2', 'sans-serif'],
      },
      animation: {
        'scanline':      'scanline 5s linear infinite',
        'pulse-glow':    'pulseGlow 2s ease-in-out infinite',
        'flicker':       'flicker 0.15s linear infinite',
        'data-stream':   'dataStream 1s ease-in-out',
        'spin-slow':     'spin 8s linear infinite',
        'ping-slow':     'ping 2s cubic-bezier(0,0,0.2,1) infinite',
        'slide-in-left': 'slideInLeft 0.4s ease-out',
        'fade-in':       'fadeIn 0.5s ease-out',
        'border-glow':   'borderGlow 2s ease-in-out infinite',
      },
      keyframes: {
        scanline: {
          '0%':   { transform: 'translateY(-100vh)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0,212,255,0.3), 0 0 10px rgba(0,212,255,0.1)' },
          '50%':      { boxShadow: '0 0 20px rgba(0,212,255,0.6), 0 0 40px rgba(0,212,255,0.3)' },
        },
        borderGlow: {
          '0%, 100%': { borderColor: 'rgba(0,212,255,0.3)' },
          '50%':      { borderColor: 'rgba(0,212,255,0.8)' },
        },
        dataStream: {
          '0%':   { opacity: 0, transform: 'translateY(-8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%':   { opacity: 0, transform: 'translateX(-20px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%':   { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      backgroundImage: {
        'grid-jarvis': `
          linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'grid-jarvis': '40px 40px',
      },
      boxShadow: {
        'jarvis':    '0 0 15px rgba(0,212,255,0.15), inset 0 0 15px rgba(0,212,255,0.05)',
        'jarvis-lg': '0 0 30px rgba(0,212,255,0.25), inset 0 0 25px rgba(0,212,255,0.08)',
        'jarvis-sm': '0 0 8px rgba(0,212,255,0.2)',
        'glow-green':'0 0 15px rgba(0,255,136,0.4)',
        'glow-red':  '0 0 15px rgba(255,51,102,0.4)',
        'glow-cyan': '0 0 20px rgba(0,212,255,0.5)',
      },
    },
  },
  plugins: [],
}
