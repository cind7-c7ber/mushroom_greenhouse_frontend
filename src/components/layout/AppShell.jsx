import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'

const PAGE_META = {
  '/': {
    title: 'Dashboard',
    subtitle: 'Live greenhouse monitoring, alerts, and system health',
    refreshLabel: 'Telemetry and alerts update automatically',
  },
  '/history': {
    title: 'Sensor History',
    subtitle: 'Environmental trends and recorded greenhouse conditions',
    refreshLabel: 'Historical data refreshes automatically',
  },
  '/media': {
    title: 'Media',
    subtitle: 'Growth images, bucket-aware media records, and camera stream',
    refreshLabel: 'Media metadata refreshes automatically',
  },
  '/settings': {
    title: 'Settings',
    subtitle: 'Display preferences and growth-stage evaluation settings',
    refreshLabel: null,
  },
  '/admin': {
    title: 'Administration Console',
    subtitle: 'Protected system oversight, sync health, and backend operations review',
    refreshLabel: null,
  },
}

export default function AppShell() {
  const location = useLocation()
  const { lastUpdated, syncHealth } = useData()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const meta = PAGE_META[location.pathname] ?? PAGE_META['/']
  const isAdminPage = location.pathname.startsWith('/admin')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--c-bg-base)' }}>
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 30,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(2px)',
            display: 'none',
          }}
          className="mobile-overlay"
        />
      )}

      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        style={{ flex: 1, marginLeft: 216, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
        className="main-with-sidebar"
      >
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            background: isAdminPage
              ? 'linear-gradient(180deg, rgba(165,124,201,0.14), rgba(165,124,201,0.03))'
              : 'var(--c-bg-base)',
            borderBottom: isAdminPage
              ? '1px solid rgba(165,124,201,0.22)'
              : '1px solid var(--c-bg-border)',
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backdropFilter: 'blur(8px)',
            boxShadow: isAdminPage ? '0 6px 20px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="mobile-menu-btn"
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--c-tx-muted)',
                padding: 4,
              }}
              aria-label="Toggle sidebar"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            <div>
              {isAdminPage && (
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#A57CC9',
                    marginBottom: 4,
                  }}
                >
                  Protected administrative workspace
                </p>
              )}

              <h1
                style={{
                  fontSize: isAdminPage ? 18 : 15,
                  fontWeight: 700,
                  color: 'var(--c-tx-primary)',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.25,
                }}
              >
                {meta.title}
              </h1>

              <p style={{ fontSize: 11, color: 'var(--c-tx-muted)', marginTop: 2 }}>
                {meta.subtitle}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {syncHealth?.status && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background:
                      syncHealth.status === 'healthy'
                        ? 'var(--c-online)'
                        : syncHealth.status === 'unreachable'
                        ? '#C4645B'
                        : 'var(--c-accent)',
                    display: 'inline-block',
                  }}
                />
                <span style={{ fontSize: 11, color: 'var(--c-tx-muted)' }}>
                  Sync: {syncHealth.status}
                </span>
              </div>
            )}

            {meta.refreshLabel && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--c-accent)',
                    display: 'inline-block',
                    animation: 'pulse 2s infinite',
                  }}
                />
                <span style={{ fontSize: 11, color: 'var(--c-tx-muted)' }}>{meta.refreshLabel}</span>
              </div>
            )}

            {lastUpdated && (
              <div key={lastUpdated.getTime()} style={{ textAlign: 'right', animation: 'fadeIn 0.4s ease-out' }}>
                <p
                  style={{
                    fontSize: 10,
                    color: 'var(--c-tx-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  Updated
                </p>
                <p style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--c-tx-secondary)' }}>
                  {lastUpdated.toLocaleTimeString('en-GB')}
                </p>
              </div>
            )}

            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 11, color: 'var(--c-tx-primary)', fontWeight: 500 }}>
                    {user.username}
                  </p>
                  <p
                    style={{
                      fontSize: 10,
                      color: isAdminPage ? '#A57CC9' : 'var(--c-tx-muted)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {user.role}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="btn-ghost"
                  style={{ padding: '7px 12px', fontSize: 12 }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet context={{ lastUpdated }} />
        </main>

        <footer
          style={{
            padding: '10px 24px',
            borderTop: isAdminPage
              ? '1px solid rgba(165,124,201,0.18)'
              : '1px solid var(--c-bg-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 11, color: 'var(--c-tx-muted)' }}>
            Intelligent Oyster Mushroom Greenhouse Monitoring System
          </span>
          <span style={{ fontSize: 11, color: isAdminPage ? '#A57CC9' : 'var(--c-tx-muted)' }}>
            ACITY · Thesis Project
          </span>
        </footer>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .main-with-sidebar { margin-left: 0 !important; }
          .mobile-menu-btn   { display: flex !important; }
          .mobile-overlay    { display: block !important; }
        }
      `}</style>
    </div>
  )
}