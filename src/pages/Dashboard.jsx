import { useState, useEffect, useRef } from 'react'
import SensorPanel from '../components/SensorPanel'
import ComparisonCharts from '../components/ComparisonCharts'
import ImagePanel from '../components/ImagePanel'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import { useSettings } from '../context/SettingsContext'
import { STAGES, evaluateReading, overallStatus } from '../lib/thresholds'

function StageSwitcher({ current, onRequest }) {
  const stages = Object.values(STAGES)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span className="label-caps" style={{ marginRight: 6 }}>Stage</span>
      {stages.map((s) => (
        <button
          key={s.key}
          onClick={() => s.key !== current && onRequest(s.key)}
          style={{
            padding: '5px 14px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            border: 'none',
            background: s.key === current ? 'var(--c-accent-dim)' : 'transparent',
            outline: s.key === current ? '1px solid var(--c-accent-border)' : '1px solid var(--c-bg-border)',
            color: s.key === current ? 'var(--c-tx-primary)' : 'var(--c-tx-muted)',
            transition: 'all 0.15s',
          }}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}

function StageConfirm({ targetStage, onConfirm, onCancel }) {
  const stage = STAGES[targetStage]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.15s ease-out',
      }}
    >
      <div className="surface" style={{ maxWidth: 360, width: '90%', padding: 24, animation: 'scaleIn 0.2s ease-out' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--c-tx-primary)', marginBottom: 8 }}>
          Switch to {stage?.label} stage?
        </h3>
        <p style={{ fontSize: 13, color: 'var(--c-tx-secondary)', marginBottom: 6 }}>
          {stage?.description}
        </p>
        <p style={{ fontSize: 12, color: 'var(--c-tx-muted)', marginBottom: 20 }}>
          All threshold evaluations, status badges, and insights will update to reflect the selected stage.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} className="btn-ghost" style={{ padding: '8px 16px', fontSize: 13 }}>
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ label, value, tone = 'default' }) {
  const toneStyles = {
    default: {
      border: '1px solid var(--c-bg-border)',
      background: 'var(--c-bg-surface)',
    },
    critical: {
      border: '1px solid rgba(196,100,91,0.35)',
      background: 'rgba(196,100,91,0.08)',
    },
    watch: {
      border: '1px solid rgba(214,163,92,0.35)',
      background: 'rgba(214,163,92,0.08)',
    },
    healthy: {
      border: '1px solid rgba(93,176,117,0.35)',
      background: 'rgba(93,176,117,0.08)',
    },
  }

  return (
    <div className="surface-elevated rounded-lg p-4" style={toneStyles[tone] || toneStyles.default}>
      <p className="label-caps mb-2">{label}</p>
      <p style={{ fontSize: 22, fontWeight: 600, color: 'var(--c-tx-primary)' }}>{value}</p>
    </div>
  )
}

function ActiveAlertsPanel({ alerts }) {
  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="section-heading">Active Alerts</h3>
          <p className="text-xs text-tx-muted mt-0.5">Watch and critical conditions requiring attention</p>
        </div>
        <span className="text-xs text-tx-muted">{alerts.length} active</span>
      </div>

      {alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.slice(0, 6).map((alert) => (
            <div
              key={alert.id}
              className="rounded-lg px-4 py-3 border"
              style={{
                borderColor: alert.severity === 'critical' ? 'rgba(196,100,91,0.35)' : 'rgba(214,163,92,0.35)',
                background: alert.severity === 'critical' ? 'rgba(196,100,91,0.08)' : 'rgba(214,163,92,0.08)',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-tx-primary">{alert.message}</p>
                  <p className="text-xs text-tx-secondary mt-1">
                    {alert.section} • {alert.parameter} • {alert.value}
                  </p>
                  {alert.recommended_action && (
                    <p className="text-xs text-tx-muted mt-2">{alert.recommended_action}</p>
                  )}
                </div>

                <span
                  className="label-caps text-[10px] px-2 py-1 rounded border"
                  style={{
                    borderColor: alert.severity === 'critical' ? 'rgba(196,100,91,0.4)' : 'rgba(214,163,92,0.4)',
                  }}
                >
                  {alert.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center border border-dashed border-bg-border rounded-lg">
          <p className="text-sm text-tx-muted">No active alerts</p>
        </div>
      )}
    </div>
  )
}

function SyncHealthPanel({ syncHealth }) {
  const status = syncHealth?.status ?? 'unknown'

  const statusTone =
    status === 'healthy'
      ? 'healthy'
      : status === 'unreachable'
      ? 'critical'
      : 'default'

  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="section-heading">Sync Health</h3>
          <p className="text-xs text-tx-muted mt-0.5">Telemetry ingestion source health</p>
        </div>
        <span className={`label-caps px-2 py-1 rounded border ${statusTone === 'critical' ? '' : ''}`}>
          {status}
        </span>
      </div>

      <div className="space-y-3 text-xs">
        <div className="flex justify-between gap-4 border-b border-bg-border pb-2">
          <span className="label-caps text-[10px]">Source URL</span>
          <span className="text-tx-secondary font-mono text-right max-w-[70%] break-all">
            {syncHealth?.source_url ?? '—'}
          </span>
        </div>
        <div className="flex justify-between gap-4 border-b border-bg-border pb-2">
          <span className="label-caps text-[10px]">Last Success</span>
          <span className="text-tx-secondary font-mono text-right">
            {syncHealth?.last_successful_sync ?? '—'}
          </span>
        </div>
        <div className="flex justify-between gap-4 border-b border-bg-border pb-2">
          <span className="label-caps text-[10px]">Last Failure</span>
          <span className="text-tx-secondary font-mono text-right">
            {syncHealth?.last_failed_sync ?? '—'}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="label-caps text-[10px]">Last Error</span>
          <span className="text-tx-secondary text-right max-w-[70%] break-words">
            {syncHealth?.last_error ?? '—'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { settings, updateSetting } = useSettings()
  const { addToast } = useToast()
  const {
    controlled,
    control,
    historyControlled,
    historyControl,
    imageData,
    loading,
    error,
    prevControlled,
    prevControl,
    alertSummary,
    activeAlerts,
    syncHealth,
  } = useData()

  const [pendingStage, setPendingStage] = useState(null)
  const prevOverallRef = useRef(null)

  useEffect(() => {
    if (!controlled && !control) return

    const ctrlStatuses = controlled ? evaluateReading(controlled, settings.growthStage) : {}
    const plainStatuses = control ? evaluateReading(control, settings.growthStage) : {}
    const ctrlOverall = overallStatus(ctrlStatuses)
    const plainOverall = overallStatus(plainStatuses)

    const isDanger = ctrlOverall === 'danger' || plainOverall === 'danger'
    const wasDanger = prevOverallRef.current === 'danger'

    if (isDanger && !wasDanger) {
      const affected = [
        ctrlOverall === 'danger' ? 'Controlled' : null,
        plainOverall === 'danger' ? 'Control' : null,
      ]
        .filter(Boolean)
        .join(' and ')

      addToast({
        message: `${affected} section readings have entered DANGER range. Immediate attention required.`,
        type: 'danger',
        duration: 9000,
      })
    }

    prevOverallRef.current = isDanger
      ? 'danger'
      : ctrlOverall === 'watch' || plainOverall === 'watch'
      ? 'watch'
      : 'optimal'
  }, [controlled, control, settings.growthStage, addToast])

  return (
    <>
      {pendingStage && (
        <StageConfirm
          targetStage={pendingStage}
          onConfirm={() => {
            updateSetting('growthStage', pendingStage)
            setPendingStage(null)
          }}
          onCancel={() => setPendingStage(null)}
        />
      )}

      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <StageSwitcher current={settings.growthStage} onRequest={setPendingStage} />
          <p style={{ fontSize: 12, color: 'var(--c-tx-muted)' }}>{STAGES[settings.growthStage]?.description}</p>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              borderRadius: 10,
              background: 'rgba(196,100,91,0.08)',
              border: '1px solid rgba(196,100,91,0.25)',
              fontSize: 13,
              color: 'var(--c-tx-secondary)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: '#C4645B', flexShrink: 0 }}>
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4" />
              <path d="M7 4v3.5M7 10h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            {error}
          </div>
        )}

        <section>
          <p className="label-caps" style={{ marginBottom: 12 }}>System Alerts Overview</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <SummaryCard label="Active Alerts" value={alertSummary?.active_total ?? 0} />
            <SummaryCard label="Critical Alerts" value={alertSummary?.critical_total ?? 0} tone="critical" />
            <SummaryCard label="Watch Alerts" value={alertSummary?.watch_total ?? 0} tone="watch" />
            <SummaryCard
              label="Sync Status"
              value={syncHealth?.status ?? 'unknown'}
              tone={syncHealth?.status === 'healthy' ? 'healthy' : syncHealth?.status === 'unreachable' ? 'critical' : 'default'}
            />
          </div>
        </section>

        <section>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <ActiveAlertsPanel alerts={activeAlerts || []} />
            <SyncHealthPanel syncHealth={syncHealth} />
          </div>
        </section>

        <section>
          <p className="label-caps" style={{ marginBottom: 12 }}>Live Sensor Readings</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }} className="grid-cols-1 xl:grid-cols-2">
            <SensorPanel section="controlled" data={controlled} loading={loading} prevData={prevControlled} />
            <SensorPanel section="control" data={control} loading={loading} prevData={prevControl} />
          </div>
        </section>


        <section>
          <p className="label-caps" style={{ marginBottom: 12 }}>Environmental Comparison</p>
          <ComparisonCharts
            historyControlled={historyControlled}
            historyControl={historyControl}
            loading={loading}
          />
        </section>


        <section>
          <p className="label-caps" style={{ marginBottom: 12 }}>Visual Monitoring</p>
          <ImagePanel imageData={imageData} loading={loading} />
        </section>
      </div>
    </>
  )
}
