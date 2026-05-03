import MetricCard from './MetricCard'
import { evaluateReading, overallStatus, STATUS_META } from '../lib/thresholds'
import { useSettings } from '../context/SettingsContext'

const METRICS = ['temperature_c', 'humidity_pct', 'co2_ppm', 'light_lux', 'moisture_pct']

const SECTION_CONFIG = {
  controlled: {
    label: 'CONTROLLED SECTION',
    description: 'Regulated environment with active monitoring',
    lineColor: '#4FA99A',
    tagBg: 'rgba(79,169,154,0.12)',
    tagBorder: 'rgba(79,169,154,0.3)',
    tagColor: '#4FA99A',
  },
  control: {
    label: 'CONTROL SECTION',
    description: 'Ambient environment without regulation',
    lineColor: '#5B8EC4',
    tagBg: 'rgba(91,142,196,0.12)',
    tagBorder: 'rgba(91,142,196,0.3)',
    tagColor: '#5B8EC4',
  },
}

function SkeletonCard() {
  return (
    <div
      style={{
        height: 76,
        borderRadius: 10,
        background: 'var(--c-bg-elevated)',
        animation: 'pulse 1.5s infinite',
      }}
    />
  )
}

export default function SensorPanel({ section, data, loading, prevData }) {
  const { settings } = useSettings()
  const config = SECTION_CONFIG[section] ?? SECTION_CONFIG.control

  const metricStatuses = data ? evaluateReading(data, settings.growthStage) : {}
  const overall = data ? overallStatus(metricStatuses) : null
  const overallMeta = overall ? STATUS_META[overall] : null

  return (
    <div
      className="surface"
      style={{
        borderRadius: 16,
        padding: '20px',
        background: 'var(--c-bg-surface)',
        border: '1px solid var(--c-bg-border)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          paddingBottom: '20px',
          borderBottom: '1px solid var(--c-bg-border)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3
              style={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: config.lineColor,
              }}
            >
              {config.label}
            </h3>
            {overallMeta && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: overallMeta.bg,
                  border: `1px solid ${overallMeta.border}`,
                  color: overallMeta.color,
                }}
              >
                {overallMeta.label}
              </span>
            )}
            <span
              style={{
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: 4,
                background: config.tagBg,
                border: `1px solid ${config.tagBorder}`,
                color: config.tagColor,
              }}
            >
              {section}
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--c-tx-muted)' }}>{config.description}</p>
        </div>
      </div>

      <div>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {METRICS.map((m) => (
              <SkeletonCard key={m} />
            ))}
          </div>
        ) : data ? (
          <div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}
          >
            {METRICS.map((m) => (
              <MetricCard key={m} metric={m} value={data[m]} status={metricStatuses[m]} prevValue={prevData?.[m]} />
            ))}
          </div>
        ) : (
          <div style={{ padding: '24px 0', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--c-tx-muted)' }}>No data received</p>
          </div>
        )}
      </div>

      {data?.timestamp && (
        <div
          style={{
            padding: '8px 18px 12px',
            borderTop: '1px solid var(--c-bg-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span className="label-caps" style={{ fontSize: 9 }}>
            Last reading
          </span>
          <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--c-tx-muted)' }}>
            {new Date(data.timestamp).toLocaleString('en-GB', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </span>
        </div>
      )}
    </div>
  )
}