import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'

function Panel({ title, subtitle, children, accent = 'default' }) {
  const accents = {
    default: {
      border: '1px solid var(--c-bg-border)',
      background: 'rgba(255,255,255,0.02)',
    },
    purple: {
      border: '1px solid rgba(165,124,201,0.26)',
      background: 'linear-gradient(180deg, rgba(165,124,201,0.09), rgba(165,124,201,0.02))',
    },
    red: {
      border: '1px solid rgba(196,100,91,0.26)',
      background: 'linear-gradient(180deg, rgba(196,100,91,0.08), rgba(196,100,91,0.02))',
    },
    green: {
      border: '1px solid rgba(79,169,154,0.26)',
      background: 'linear-gradient(180deg, rgba(79,169,154,0.08), rgba(79,169,154,0.02))',
    },
    amber: {
      border: '1px solid rgba(196,168,91,0.26)',
      background: 'linear-gradient(180deg, rgba(196,168,91,0.08), rgba(196,168,91,0.02))',
    },
  }

  return (
    <section
      className="rounded-xl p-5"
      style={accents[accent] || accents.default}
    >
      <div className="mb-4 pb-4 border-b border-bg-border">
        <h3 className="section-heading">{title}</h3>
        {subtitle && <p className="text-xs text-tx-muted mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}

function StatTile({ label, value, subtext, tone = 'default' }) {
  const tones = {
    default: {
      border: '1px solid var(--c-bg-border)',
      background: 'rgba(255,255,255,0.02)',
    },
    purple: {
      border: '1px solid rgba(165,124,201,0.28)',
      background: 'rgba(165,124,201,0.08)',
    },
    red: {
      border: '1px solid rgba(196,100,91,0.28)',
      background: 'rgba(196,100,91,0.08)',
    },
    green: {
      border: '1px solid rgba(79,169,154,0.28)',
      background: 'rgba(79,169,154,0.08)',
    },
    amber: {
      border: '1px solid rgba(196,168,91,0.28)',
      background: 'rgba(196,168,91,0.08)',
    },
  }

  return (
    <div className="rounded-lg p-4" style={tones[tone] || tones.default}>
      <p className="label-caps mb-2">{label}</p>
      <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--c-tx-primary)', lineHeight: 1.1 }}>
        {value ?? '—'}
      </p>
      {subtext && (
        <p style={{ fontSize: 11, color: 'var(--c-tx-muted)', marginTop: 8 }}>
          {subtext}
        </p>
      )}
    </div>
  )
}

function KV({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-3 border-b border-bg-border last:border-0">
      <span className="label-caps text-[10px]">{label}</span>
      <span className="text-xs text-tx-secondary font-mono text-right max-w-[68%] break-words">
        {value ?? '—'}
      </span>
    </div>
  )
}

function ToneBadge({ children, tone = 'default' }) {
  const tones = {
    default: { color: 'var(--c-tx-secondary)', border: '1px solid var(--c-bg-border)', background: 'rgba(255,255,255,0.03)' },
    purple: { color: '#A57CC9', border: '1px solid rgba(165,124,201,0.30)', background: 'rgba(165,124,201,0.10)' },
    red: { color: '#C4645B', border: '1px solid rgba(196,100,91,0.30)', background: 'rgba(196,100,91,0.10)' },
    green: { color: '#4FA99A', border: '1px solid rgba(79,169,154,0.30)', background: 'rgba(79,169,154,0.10)' },
    amber: { color: '#C4A85B', border: '1px solid rgba(196,168,91,0.30)', background: 'rgba(196,168,91,0.10)' },
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '5px 10px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        ...tones[tone],
      }}
    >
      {children}
    </span>
  )
}

function humanizeError(error) {
  if (!error) return '—'
  const err = error.toString().toLowerCase()
  
  if (err.includes('ssl verification failed') || err.includes('sslerror')) {
    return 'SSL Verification Failed (Check Certificate)'
  }
  if (err.includes('connectionpool') || err.includes('max retries exceeded') || err.includes('connection refused')) {
    return 'Source Unreachable (Connection Refused)'
  }
  if (err.includes('timeout')) {
    return 'Connection Timed Out'
  }
  if (err.includes('404')) {
    return 'Telemetry Endpoint Not Found'
  }
  if (err.includes('401') || err.includes('403')) {
    return 'Authentication Required (Check Credentials)'
  }
  if (err.includes('unexpected_eof')) {
    return 'Network Interruption (Incomplete Data)'
  }
  
  return error.length > 60 ? error.substring(0, 57) + '...' : error
}

export default function Admin() {
  const { user } = useAuth()
  const { status, syncHealth, alertSummary, lastUpdated, activeAlerts } = useData()

  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL || 'Not configured'

  const syncTone =
    syncHealth?.status === 'healthy'
      ? 'green'
      : syncHealth?.status === 'unreachable'
      ? 'red'
      : 'amber'

  const greenhouseTone =
    status?.status_value === 'ONLINE'
      ? 'green'
      : status?.status_value === 'OFFLINE'
      ? 'red'
      : 'amber'

  return (
    <div className="page-content space-y-5">
      <div
        className="rounded-xl p-5"
        style={{
          border: '1px solid rgba(165,124,201,0.28)',
          background: 'linear-gradient(135deg, rgba(165,124,201,0.12), rgba(165,124,201,0.02))',
        }}
      >
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <p className="label-caps mb-2" style={{ color: '#A57CC9' }}>
              Restricted administrative workspace
            </p>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--c-tx-primary)', lineHeight: 1.15 }}>
              Operations & System Control
            </h2>
            <p style={{ fontSize: 13, color: 'var(--c-tx-secondary)', marginTop: 8, maxWidth: 760 }}>
              Monitor backend connectivity, telemetry source health, current alert pressure,
              and the latest system state from a protected administrator-only view.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <ToneBadge tone="purple">{user?.role || 'unknown role'}</ToneBadge>
            <ToneBadge tone={syncTone}>sync {syncHealth?.status || 'unknown'}</ToneBadge>
            <ToneBadge tone={greenhouseTone}>greenhouse {status?.status_value || 'unknown'}</ToneBadge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatTile
          label="Active Alerts"
          value={alertSummary?.active_total ?? 0}
          subtext="Unresolved conditions"
          tone="purple"
        />
        <StatTile
          label="Critical"
          value={alertSummary?.critical_total ?? 0}
          subtext="Immediate attention"
          tone="red"
        />
        <StatTile
          label="Watch"
          value={alertSummary?.watch_total ?? 0}
          subtext="Monitoring required"
          tone="amber"
        />
        <StatTile
          label="Frontend Sync"
          value={lastUpdated ? lastUpdated.toLocaleTimeString('en-GB') : '—'}
          subtext="Latest admin view refresh"
          tone="green"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Panel
          title="Administrator Identity"
          subtitle="Current authenticated admin session"
          accent="purple"
        >
          <KV label="Username" value={user?.username} />
          <KV label="Email" value={user?.email} />
          <KV label="Role" value={user?.role} />
        </Panel>

        <Panel
          title="Backend Runtime"
          subtitle="Current production backend connection"
          accent="purple"
        >
          <KV label="API Base URL" value={backendBaseUrl} />
          <KV label="Deployment" value="Render-hosted FastAPI" />
          <KV label="Access Model" value="JWT-secured endpoints" />
        </Panel>

        <Panel
          title="System Snapshot"
          subtitle="Latest backend-reported system state"
          accent={greenhouseTone === 'red' ? 'red' : 'default'}
        >
          <KV label="Status Type" value={status?.status_type} />
          <KV label="Status Value" value={status?.status_value} />
          <KV label="Message" value={status?.message} />
        </Panel>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Panel
          title="Telemetry Source Health"
          subtitle="Availability and recent sync activity of the ingestion source"
          accent={syncTone === 'red' ? 'red' : syncTone === 'green' ? 'green' : 'amber'}
        >
          <KV label="Status" value={syncHealth?.status} />
          <KV label="Source URL" value={syncHealth?.source_url} />
          <KV label="Last Success" value={syncHealth?.last_successful_sync} />
          <KV label="Last Failure" value={syncHealth?.last_failed_sync} />
          <KV label="Last Error" value={humanizeError(syncHealth?.last_error)} />
        </Panel>

        <Panel
          title="Alert Engine Snapshot"
          subtitle="Most recent summary generated by backend alert logic"
          accent="purple"
        >
          <KV label="Active Alerts" value={alertSummary?.active_total} />
          <KV label="Critical Alerts" value={alertSummary?.critical_total} />
          <KV label="Watch Alerts" value={alertSummary?.watch_total} />
          <KV label="Latest Alert Timestamp" value={alertSummary?.latest_timestamp} />
        </Panel>
      </div>

      <Panel
        title="Recent Unresolved Alerts"
        subtitle="Latest backend-generated conditions still marked active"
        accent="purple"
      >
        {activeAlerts?.length ? (
          <div className="space-y-3">
            {activeAlerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className="rounded-lg px-4 py-3 border"
                style={{
                  borderColor:
                    alert.severity === 'critical'
                      ? 'rgba(196,100,91,0.28)'
                      : 'rgba(196,168,91,0.28)',
                  background:
                    alert.severity === 'critical'
                      ? 'rgba(196,100,91,0.06)'
                      : 'rgba(196,168,91,0.06)',
                }}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-tx-primary">{alert.message}</p>
                    <p className="text-xs text-tx-muted mt-1">
                      {alert.section} · {alert.parameter} · {alert.value}
                    </p>
                    {alert.recommended_action && (
                      <p className="text-xs text-tx-secondary mt-2">{alert.recommended_action}</p>
                    )}
                  </div>

                  <ToneBadge tone={alert.severity === 'critical' ? 'red' : 'amber'}>
                    {alert.severity}
                  </ToneBadge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="rounded-lg border border-dashed border-bg-border text-center py-10"
            style={{ color: 'var(--c-tx-muted)' }}
          >
            No active alerts at the moment
          </div>
        )}
      </Panel>
    </div>
  )
}