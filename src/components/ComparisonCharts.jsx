import { useState } from 'react'
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { useSettings } from '../context/SettingsContext'
import { STAGES } from '../lib/thresholds'

const METRICS = [
  { key: 'temperature_c', label: 'Temperature', unit: '°C',  yDomain: [10, 40]    },
  { key: 'humidity_pct',  label: 'Humidity',    unit: '%',   yDomain: [40, 100]   },
  { key: 'co2_ppm',       label: 'CO\u2082',    unit: 'ppm', yDomain: [0, 25000]  },
  { key: 'light_lux',     label: 'Light',       unit: 'lux', yDomain: [0, 500]    },
  { key: 'moisture_pct',  label: 'Moisture',    unit: '%',   yDomain: [0, 100]    },
]

// Per user specification
const CONTROLLED_COLOR = '#DF2935'
const CONTROL_COLOR    = '#80FF72'

function buildSeries(histCtrl = [], histPlain = []) {
  const len = Math.max(histCtrl.length, histPlain.length)
  const all = Array.from({ length: len }, (_, i) => {
    const c = histCtrl[i]
    const p = histPlain[i]
    return { ts: c?.timestamp ?? p?.timestamp ?? '', controlled: c, control: p }
  })
  const sliced = all.slice(-20)

  // Detect repeated timestamps — fall back to index labels when non-unique
  const tsLabels = sliced.map(({ ts }) =>
    ts ? new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : null
  )
  const uniqueTs = new Set(tsLabels.filter(Boolean))
  const useIndex = uniqueTs.size <= 1

  return sliced.map(({ ts, controlled, control }, i) => ({
    label: useIndex
      ? `#${i + 1}`
      : (ts ? new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : `#${i + 1}`),
    controlled,
    control,
  }))
}

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--c-bg-card)', border: '1px solid var(--c-bg-border)', borderRadius: 8, padding: '10px 14px', fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
      <p style={{ color: 'var(--c-tx-muted)', marginBottom: 8, fontFamily: 'monospace' }}>{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
            <span style={{ color: 'var(--c-tx-secondary)' }}>{p.name}</span>
          </div>
          <span style={{ fontFamily: 'monospace', fontWeight: 600, color: p.color }}>
            {p.value?.toFixed(1)} {unit}
          </span>
        </div>
      ))}
    </div>
  )
}

function StatCard({ label, value, unit, color }) {
  return (
    <div style={{ background: 'var(--c-bg-base)', borderRadius: 8, padding: '10px 14px', border: '1px solid var(--c-bg-border)' }}>
      <p className="label-caps" style={{ marginBottom: 6, color }}>{label}</p>
      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600, color: 'var(--c-tx-primary)' }}>
        {value != null ? `${Number(value).toFixed(1)} ${unit}` : '—'}
      </p>
    </div>
  )
}

export default function ComparisonCharts({ historyControlled, historyControl, loading }) {
  const [activeMetric, setActiveMetric] = useState('temperature_c')
  const { settings } = useSettings()
  const current = METRICS.find(m => m.key === activeMetric) ?? METRICS[0]

  if (loading) {
    return (
      <div className="surface" style={{ padding: 20 }}>
        <div style={{ height: 16, width: 180, background: 'var(--c-bg-elevated)', borderRadius: 6, marginBottom: 16, animation: 'pulse 1.5s infinite' }} />
        <div style={{ height: 240, background: 'var(--c-bg-elevated)', borderRadius: 10, animation: 'pulse 1.5s infinite' }} />
      </div>
    )
  }

  const series = buildSeries(historyControlled, historyControl)
  const tickInterval = Math.max(1, Math.floor(series.length / 6))

  // Stats for each section
  function calcStats(section) {
    const vals = series.map(d => d[section]?.[current.key]).filter(v => v != null && !isNaN(v))
    if (!vals.length) return null
    return {
      avg: vals.reduce((a, b) => a + b, 0) / vals.length,
      min: Math.min(...vals),
      max: Math.max(...vals),
    }
  }
  const ctrlStats  = calcStats('controlled')
  const plainStats = calcStats('control')

  return (
    <div className="surface" style={{ padding: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <h3 className="section-heading">Environmental Comparison</h3>
          <p style={{ fontSize: 12, color: 'var(--c-tx-muted)', marginTop: 3 }}>
            Controlled vs Control · {STAGES[settings.growthStage]?.label} thresholds · last 20 readings
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 20, borderTop: '2px solid', borderColor: CONTROLLED_COLOR, display: 'inline-block' }} />
            <span style={{ color: 'var(--c-tx-secondary)' }}>Controlled</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 20, borderTop: '2px solid', borderColor: CONTROL_COLOR, display: 'inline-block' }} />
            <span style={{ color: 'var(--c-tx-secondary)' }}>Control</span>
          </span>
        </div>
      </div>

      {/* Metric selector */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 18, background: 'var(--c-bg-base)', padding: 4, borderRadius: 10, width: 'fit-content' }}>
        {METRICS.map(m => (
          <button
            key={m.key}
            onClick={() => setActiveMetric(m.key)}
            style={{
              padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: 'none',
              background: activeMetric === m.key ? 'var(--c-accent-dim)' : 'transparent',
              outline: activeMetric === m.key ? '1px solid var(--c-accent-border)' : 'none',
              color: activeMetric === m.key ? 'var(--c-tx-primary)' : 'var(--c-tx-muted)',
              transition: 'all 0.15s',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="2 6" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--c-tx-muted)', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
              tickLine={false} axisLine={false}
              interval={tickInterval}
            />
            <YAxis
              domain={current.yDomain}
              tick={{ fill: 'var(--c-tx-muted)', fontSize: 10 }}
              tickLine={false} axisLine={false} width={44}
              tickFormatter={v => `${v}`}
            />
            <Tooltip content={<CustomTooltip unit={current.unit} />} cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }} />
            <Line dataKey={d => d.controlled?.[current.key]} name="Controlled" stroke={CONTROLLED_COLOR} strokeWidth={1.8} dot={false} activeDot={{ r: 4, fill: CONTROLLED_COLOR }} connectNulls />
            <Line dataKey={d => d.control?.[current.key]}    name="Control"    stroke={CONTROL_COLOR}    strokeWidth={1.8} dot={false} activeDot={{ r: 4, fill: CONTROL_COLOR    }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats summary — min and max shown separately */}
      {(ctrlStats || plainStats) && (
        <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--c-bg-border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'Controlled', stats: ctrlStats,  color: CONTROLLED_COLOR },
            { label: 'Control',    stats: plainStats,  color: CONTROL_COLOR    },
          ].map(({ label, stats, color }) => stats && (
            <div key={label} style={{ background: 'var(--c-bg-base)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--c-bg-border)' }}>
              <p className="label-caps" style={{ marginBottom: 10, color }}>{label}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <StatCard label="Avg"    value={stats.avg} unit={current.unit} color={color} />
                <StatCard label="Min"    value={stats.min} unit={current.unit} color="#8AADAF" />
                <StatCard label="Max"    value={stats.max} unit={current.unit} color="#8AADAF" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
