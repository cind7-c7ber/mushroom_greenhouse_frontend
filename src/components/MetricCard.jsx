import { STATUS_META } from '../lib/thresholds'

const METRIC_META = {
  temperature_c: { label: 'Temperature',      unit: '°C',  accentColor: '#C4A85B' },
  humidity_pct:  { label: 'Humidity',          unit: '%',   accentColor: '#5B8EC4' },
  co2_ppm:       { label: 'CO\u2082',          unit: 'ppm', accentColor: '#9A75B0' },
  light_lux:     { label: 'Light',             unit: 'lux', accentColor: '#C4A85B' },
  moisture_pct:  { label: 'Substrate Moisture',unit: '%',   accentColor: '#4FA99A' },
}

// Minimum absolute change to register a trend direction
const TREND_EPSILON = {
  temperature_c: 0.3,
  humidity_pct:  0.5,
  co2_ppm:       25,
  light_lux:     3,
  moisture_pct:  0.5,
}

function TrendArrow({ metric, value, prevValue }) {
  if (value == null || prevValue == null || isNaN(value) || isNaN(prevValue)) return null
  const diff    = value - prevValue
  const epsilon = TREND_EPSILON[metric] ?? 0.5

  let symbol, color
  if (diff >  epsilon) { symbol = '↑'; color = '#4FA99A' }
  else if (diff < -epsilon) { symbol = '↓'; color = '#C4645B' }
  else                 { symbol = '→'; color = 'var(--c-tx-muted)' }

  return (
    <span style={{ fontSize: 13, fontWeight: 600, color, lineHeight: 1, userSelect: 'none' }}
          title={`${diff > 0 ? '+' : ''}${diff.toFixed(1)} from previous`}>
      {symbol}
    </span>
  )
}

export default function MetricCard({ metric, value, status = 'unknown', prevValue }) {
  const meta       = METRIC_META[metric] ?? { label: metric, unit: '', accentColor: '#9A75B0' }
  const statusMeta = STATUS_META[status]  ?? STATUS_META.unknown
  // Show raw value as-is — no rounding, strip unnecessary trailing zeros
  const display    = value !== null && value !== undefined
    ? String(parseFloat(Number(value).toFixed(2)))
    : '—'

  return (
    <div style={{
      position: 'relative', borderRadius: 10, overflow: 'hidden',
      background: 'var(--c-bg-card)',
      border: '1px solid var(--c-bg-border)',
      transition: 'border-color 0.15s',
    }}>
      {/* Left accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: meta.accentColor }} />

      <div style={{ padding: '12px 14px 12px 18px' }}>
        {/* Label + status row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <p className="label-caps">{meta.label}</p>
          {status !== 'unknown' && (
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '2px 6px', borderRadius: 4,
              background: statusMeta.bg, border: `1px solid ${statusMeta.border}`,
              color: statusMeta.color, flexShrink: 0,
            }}>
              {statusMeta.label}
            </span>
          )}
        </div>

        {/* Value + trend arrow */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
          <span style={{ fontSize: 26, fontWeight: 600, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', lineHeight: 1, color: meta.accentColor }}>
            {display}
          </span>
          <span style={{ fontSize: 11, color: 'var(--c-tx-muted)', fontWeight: 400 }}>{meta.unit}</span>
          <TrendArrow metric={metric} value={value} prevValue={prevValue} />
        </div>
      </div>
    </div>
  )
}
