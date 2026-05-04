import MetricCard from './MetricCard'
import { STAGES, evaluateReading, overallStatus, STATUS_META } from '../lib/thresholds'
import { useSettings } from '../context/SettingsContext'

const METRICS = ['temperature_c', 'humidity_pct', 'co2_ppm', 'light_lux', 'moisture_pct']

const SECTION_CONFIG = {
  controlled: {
    label: 'CONTROLLED SECTION',
    description: 'Regulated environment with active monitoring',
    lineColor: '#FACC15',
    tagBg: 'rgba(250,204,21,0.12)',
    tagBorder: 'rgba(250,204,21,0.3)',
    tagColor: '#FACC15',
  },
  control: {
    label: 'CONTROL SECTION',
    description: 'Ambient environment without regulation',
    lineColor: '#8B5CF6',
    tagBg: 'rgba(139,92,246,0.12)',
    tagBorder: 'rgba(139,92,246,0.3)',
    tagColor: '#8B5CF6',
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

export default function SensorPanel({ section, data, loading, prevData, title }) {
  const { settings } = useSettings()
  const config = SECTION_CONFIG[section] ?? SECTION_CONFIG.control

  const metricStatuses = data ? evaluateReading(data, settings.growthStage) : {}
  const overall = data ? overallStatus(metricStatuses) : null
  const overallMeta = overall ? STATUS_META[overall] : null

  function getSummarySentence() {
    if (!data) return { 
      text: 'Waiting for sensor data...', 
      color: 'var(--c-tx-muted)', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/>
        </svg>
      )
    }
    if (overall === 'optimal') return { 
      text: 'Everything is looking good and growing well.', 
      color: '#81C784', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#81C784" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      )
    }
    
    // Collect all active issues
    const dangerIssues = []
    const watchIssues = []
    
    for (const m of METRICS) {
      if (metricStatuses[m] === 'danger') {
        const val = data[m]
        const bands = STAGES[settings.growthStage]?.thresholds?.[m]
        const isHigh = bands && val > bands.optimal[1]
        const label = m === 'temperature_c' ? 'Temperature' : m === 'humidity_pct' ? 'Humidity' : m === 'co2_ppm' ? 'CO₂' : m === 'light_lux' ? 'Light' : 'Moisture'
        dangerIssues.push(`${label} is too ${isHigh ? 'high' : 'low'}`)
      } else if (metricStatuses[m] === 'watch') {
        const label = m === 'temperature_c' ? 'Temperature' : m === 'humidity_pct' ? 'Humidity' : m === 'co2_ppm' ? 'CO₂' : m === 'light_lux' ? 'Light' : 'Moisture'
        watchIssues.push(label)
      }
    }

    if (dangerIssues.length > 0) {
      const combinedText = dangerIssues.length === 1 
        ? `${dangerIssues[0]}.`
        : dangerIssues.length === 2
        ? `${dangerIssues[0]} and ${dangerIssues[1].toLowerCase()}.`
        : `${dangerIssues.slice(0, -1).join(', ')}, and ${dangerIssues.slice(-1)[0].toLowerCase()}.`

      return { 
        text: `${combinedText} Please check your equipment.`, 
        color: '#C4645B', 
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C4645B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        )
      }
    }

    if (watchIssues.length > 0) {
      return { 
        text: `Conditions for ${watchIssues.join(' & ')} are slightly off. Monitor closely.`, 
        color: '#38BDF8', 
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
        )
      }
    }

    return { 
      text: 'Monitor the situation closely.', 
      color: '#38BDF8', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      )
    }
  }

  const summary = getSummarySentence()

  return (
    <div
      className="surface"
      style={{
        borderRadius: 20,
        padding: '32px',
        background: 'var(--c-bg-surface)',
        border: '1px solid var(--c-bg-border)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 24
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}
      >
        {title && <h2 className="text-xl font-bold text-tx-primary mb-2">{title}</h2>}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '4px 10px',
                borderRadius: 4,
                background: config.tagBg,
                border: `1px solid ${config.tagBorder}`,
                color: config.tagColor,
              }}
            >
              {section} SECTION
            </span>
          </div>
        </div>
        <p style={{ fontSize: 14, color: 'var(--c-tx-secondary)', fontWeight: 500 }}>
          {config.description}
        </p>
      </div>

      <div style={{ borderTop: '2px solid var(--c-bg-border)', paddingTop: 28 }}>
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

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 10, 
          padding: '12px 16px', 
          background: 'rgba(255,255,255,0.03)', 
          borderRadius: 12,
          border: '1px solid var(--c-bg-border)'
        }}>
           <div style={{ fontSize: 16 }}>{summary.icon}</div>
           <p style={{ fontSize: 13, fontWeight: 600, color: summary.color }}>
             {summary.text}
           </p>
        </div>

        {data?.timestamp && (
          <div
            style={{
              padding: '8px 4px 0',
              borderTop: '1px solid var(--c-bg-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span className="label-caps" style={{ fontSize: 10 }}>
              Last reading
            </span>
            <span style={{ fontSize: 12.5, fontFamily: 'JetBrains Mono, monospace', color: 'var(--c-tx-secondary)', fontWeight: 600 }}>
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
    </div>
  )
}