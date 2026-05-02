import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth }  from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useSettings } from '../../context/SettingsContext'
import { useData }   from '../../context/DataContext'
import { STAGES } from '../../lib/thresholds'


const USER_NAV = [
  {
    path: '/', exact: true,
    label: 'Dashboard', description: 'Live readings',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="1" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><rect x="8.5" y="1" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><rect x="1" y="8.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/></svg>,
  },
  {
    path: '/history', exact: false,
    label: 'History', description: 'Sensor trends',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M7.5 4V8L10 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
  {
    path: '/media', exact: false,
    label: 'Media', description: 'Images & stream',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="3" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="5" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.1"/><path d="M1.5 11.5L5 8L8 10.5L10 8.5L13.5 12" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  {
    path: '/settings', exact: false,
    label: 'Settings', description: 'Preferences',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 9.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="currentColor" strokeWidth="1.3"/><path d="M7.5 1.5v1M7.5 12.5v1M1.5 7.5h1M12.5 7.5h1M3.4 3.4l.7.7M10.9 10.9l.7.7M3.4 11.6l.7-.7M10.9 4.1l.7-.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
]

const ADMIN_ONLY_NAV = [
  {
    path: '/admin', exact: false,
    label: 'System', description: 'Configuration',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="3" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5 7.5h5M7.5 5v5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
]

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, width: '100%',
        padding: '8px 12px', borderRadius: 8, border: 'none',
        background: 'transparent', cursor: 'pointer',
        color: 'var(--c-tx-muted)', fontSize: 13, fontWeight: 500,
        transition: 'color 0.15s',
      }}
    >
      {isDark ? (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <circle cx="7.5" cy="7.5" r="3" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M3.2 3.2l1 1M10.8 10.8l1 1M3.2 11.8l1-1M10.8 4.2l1-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path d="M7 1.5A6 6 0 1 0 13.5 8 4.5 4.5 0 0 1 7 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
        </svg>
      )}
      <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
    </button>
  )
}

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout, isAdmin } = useAuth()
  const { settings } = useSettings()
  const { status } = useData()
  const location = useLocation()
  const navigate = useNavigate()
  const isOnline = status?.status_value === 'ONLINE'
  const stage    = STAGES[settings.growthStage]

  const navItems = isAdmin ? [...USER_NAV, ...ADMIN_ONLY_NAV] : USER_NAV

  function isActive(path, exact) {
    return exact ? location.pathname === path : location.pathname.startsWith(path)
  }

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, height: '100vh', width: 216,
      display: 'flex', flexDirection: 'column',
      background: 'var(--c-bg-surface)',
      borderRight: '1px solid var(--c-bg-border)',
      zIndex: 40,
      transform: mobileOpen ? 'translateX(0)' : undefined,
      transition: 'transform 0.25s ease',
    }}
    className={`sidebar-root ${mobileOpen ? 'sidebar-mobile-open' : ''}`}
    >
      {/* Identity */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--c-bg-border)' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--c-accent)', marginBottom: 2 }}>
          ACADEMIC CITY
        </p>
        <p style={{ fontSize: 12, color: 'var(--c-tx-primary)', fontWeight: 600, lineHeight: 1.3 }}>
          Greenhouse Monitor
        </p>
        <p style={{ fontSize: 11, color: 'var(--c-tx-muted)', marginTop: 2 }}>
          Oyster Mushroom System
        </p>
      </div>

      {/* Growth stage indicator */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--c-bg-border)' }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--c-tx-muted)', marginBottom: 6 }}>
          Active Stage
        </p>
        <NavLink to="/settings" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
            borderRadius: 8, background: 'var(--c-accent-dim)',
            border: '1px solid var(--c-accent-border)', cursor: 'pointer',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--c-accent)', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-tx-primary)', lineHeight: 1.2 }}>{stage?.label ?? '—'}</p>
              <p style={{ fontSize: 10, color: 'var(--c-tx-muted)', lineHeight: 1.2 }}>Change in Settings</p>
            </div>
          </div>
        </NavLink>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
        <p className="label-caps" style={{ padding: '0 8px', marginBottom: 8 }}>Navigation</p>
        {navItems.map(({ path, exact, label, icon, description }) => {
          const active = isActive(path, exact)
          return (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={`nav-item ${active ? 'nav-item-active' : ''}`}
              style={{ marginBottom: 2, textDecoration: 'none' }}
            >
              <span style={{ color: active ? 'var(--c-accent)' : 'var(--c-tx-muted)', flexShrink: 0 }}>{icon}</span>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 13, lineHeight: 1.3, color: 'var(--c-tx-primary)' }}>{label}</p>
                <p style={{ fontSize: 11, color: 'var(--c-tx-muted)', lineHeight: 1.2 }}>{description}</p>
              </div>
            </NavLink>
          )
        })}
      </nav>

      {/* Theme toggle + Status + User */}
      <div style={{ borderTop: '1px solid var(--c-bg-border)', padding: '8px 12px' }}>
        <ThemeToggle />
      </div>

      <div style={{ borderTop: '1px solid var(--c-bg-border)', padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span className="status-dot" style={{ background: isOnline ? '#4FA99A' : '#C4645B', animation: isOnline ? 'pulse 2s infinite' : 'none' }} />
            <span style={{ fontSize: 12, color: 'var(--c-tx-secondary)' }}>
              {!status ? 'Connecting' : isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          <span className="label-caps" style={{ fontSize: 9 }}>MQTT</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 12, color: 'var(--c-tx-primary)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </p>
            <p style={{ fontSize: 10, color: 'var(--c-tx-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{user?.role}</p>
          </div>
          <button
            onClick={() => { logout(); navigate('/login') }}
            title="Sign out"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-tx-muted)', padding: 4, borderRadius: 6, flexShrink: 0 }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9.5 4.5L12.5 7.5L9.5 10.5M12.5 7.5H5M5 2.5H2.5A1 1 0 0 0 1.5 3.5v7a1 1 0 0 0 1 1H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .sidebar-root {
            transform: translateX(-100%);
          }
          .sidebar-root.sidebar-mobile-open {
            transform: translateX(0) !important;
            box-shadow: 4px 0 24px rgba(0,0,0,0.5);
          }
        }
      `}</style>
    </aside>
  )
}
