import { useToast } from '../context/ToastContext'

const TYPE_META = {
  danger:  { color: '#C4645B', bg: 'rgba(196,100,91,0.14)',  border: 'rgba(196,100,91,0.35)',  label: 'DANGER'  },
  warning: { color: '#C4A85B', bg: 'rgba(196,168,91,0.14)',  border: 'rgba(196,168,91,0.35)',  label: 'WARNING' },
  success: { color: '#4FA99A', bg: 'rgba(79,169,154,0.14)',  border: 'rgba(79,169,154,0.35)',  label: 'OK'      },
  info:    { color: '#9A75B0', bg: 'rgba(154,117,176,0.14)', border: 'rgba(154,117,176,0.35)', label: 'INFO'    },
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()
  if (!toasts.length) return null

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 200,
      display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end',
      pointerEvents: 'none',
    }}>
      {toasts.map(toast => {
        const meta = TYPE_META[toast.type] ?? TYPE_META.info
        return (
          <div
            key={toast.id}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '12px 14px',
              background: 'var(--c-bg-card)',
              border: `1px solid ${meta.border}`,
              borderLeft: `3px solid ${meta.color}`,
              borderRadius: 10, minWidth: 280, maxWidth: 380,
              boxShadow: '0 6px 24px rgba(0,0,0,0.45)',
              animation: 'toastSlideIn 0.25s ease-out',
              pointerEvents: 'all',
            }}
          >
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '2px 6px', borderRadius: 4,
              background: meta.bg, color: meta.color, flexShrink: 0, marginTop: 2,
            }}>
              {meta.label}
            </span>
            <p style={{ flex: 1, fontSize: 12, color: 'var(--c-tx-secondary)', lineHeight: 1.6 }}>
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--c-tx-muted)', padding: 0, lineHeight: 1,
                flexShrink: 0, marginTop: 2,
              }}
              aria-label="Dismiss"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )
      })}
    </div>
  )
}
