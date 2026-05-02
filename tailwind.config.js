/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Theme-aware surfaces (via CSS vars — auto-switch dark/light)
        bg: {
          base:     'var(--c-bg-base)',
          surface:  'var(--c-bg-surface)',
          elevated: 'var(--c-bg-elevated)',
          card:     'var(--c-bg-card)',
          border:   'var(--c-bg-border)',
          hover:    'var(--c-bg-hover)',
        },
        tx: {
          primary:   'var(--c-tx-primary)',
          secondary: 'var(--c-tx-secondary)',
          muted:     'var(--c-tx-muted)',
          accent:    'var(--c-tx-accent)',
        },
        amethyst: 'var(--c-accent)',
        accent: {
          DEFAULT: 'var(--c-accent)',
          light:   'var(--c-accent-light)',
          dim:     'var(--c-accent-dim)',
          border:  'var(--c-accent-border)',
        },

        // Section identity — fixed (no theme switch)
        controlled: {
          DEFAULT: '#4FA99A',
          dim:     'rgba(79,169,154,0.12)',
          border:  'rgba(79,169,154,0.35)',
        },
        ctrl: {
          DEFAULT: '#5B8EC4',
          dim:     'rgba(91,142,196,0.12)',
          border:  'rgba(91,142,196,0.35)',
        },

        // Chart colors (per user spec)
        chart: {
          controlled: '#DF2935',
          control:    '#80FF72',
        },

        // Status
        online:  '#4FA99A',
        offline: '#C4645B',
        warning: '#C4A85B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card:   '0 1px 3px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)',
        panel:  '0 4px 16px rgba(0,0,0,0.4)',
        accent: '0 0 0 1px rgba(154,117,176,0.5)',
      },
    },
  },
  plugins: [],
}
