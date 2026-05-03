import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import SensorPanel from '../components/SensorPanel'
import ComparisonCharts from '../components/ComparisonCharts'
import LatestImagePanel from '../components/LatestImagePanel'
import LiveStreamPanel from '../components/LiveStreamPanel'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import { useSettings } from '../context/SettingsContext'
import { STAGES, evaluateReading, overallStatus } from '../lib/thresholds'

function StageSwitcher({ current, onRequest }) {
  const stages = Object.values(STAGES)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
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
    activeAlerts,
    status,
    lastUpdated,
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

  const capturedAt = imageData?.capture_timestamp
    ? new Date(imageData.capture_timestamp).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

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

      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <StageSwitcher current={settings.growthStage} onRequest={setPendingStage} />
          <p style={{ fontSize: 12, color: 'var(--c-tx-muted)' }}>
            {STAGES[settings.growthStage]?.description}
          </p>
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
          <p className="label-caps mb-4 text-[11px] opacity-80">CURRENT READINGS</p>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <SensorPanel section="controlled" data={controlled} loading={loading} prevData={prevControlled} />
            <SensorPanel section="control" data={control} loading={loading} prevData={prevControl} />
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-tx-primary">Visual Monitoring</h2>
              <p className="text-sm text-tx-muted mt-1">Growth documentation and live camera feed</p>
            </div>
            {capturedAt && (
              <div className="text-right">
                <p className="label-caps text-[10px] opacity-60">CAPTURED</p>
                <p className="text-xs font-bold text-tx-secondary mt-0.5">{capturedAt}</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 min-h-[400px]">
            <LatestImagePanel imageData={imageData} loading={loading} />
            <LiveStreamPanel />
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <p className="label-caps text-[11px] opacity-80">TREND PREVIEW</p>
            <Link
              to="/history?tab=trends"
              className="text-xs font-bold"
              style={{ color: 'var(--c-accent-light)', textDecoration: 'underline', textUnderlineOffset: 4 }}
            >
              Open full history
            </Link>
          </div>

          <ComparisonCharts
            historyControlled={historyControlled}
            historyControl={historyControl}
            loading={loading}
            compact
          />
        </section>
      </div>
    </>
  )
}
