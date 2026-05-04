import { useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Label,
  ReferenceArea,
} from 'recharts'
import { useSettings } from '../context/SettingsContext'
import { STAGES } from '../lib/thresholds'

const METRICS = [
  { key: 'temperature_c', label: 'Temperature', unit: '°C' },
  { key: 'humidity_pct', label: 'Humidity', unit: '%' },
  { key: 'co2_ppm', label: 'CO₂', unit: 'ppm' },
  { key: 'light_lux', label: 'Light', unit: 'lux' },
  { key: 'moisture_pct', label: 'Moisture', unit: '%' },
]

// Use the standard app colors for consistency
const CONTROLLED_COLOR = '#FACC15' // Yellow for Controlled
const CONTROL_COLOR = '#8B5CF6'    // Purple for Control

function buildSeries(histCtrl = [], histPlain = [], limit = 60) {
  const len = Math.max(histCtrl.length, histPlain.length)
  const all = Array.from({ length: len }, (_, i) => {
    const c = histCtrl[i]
    const p = histPlain[i]
    return { ts: c?.timestamp ?? p?.timestamp ?? '', controlled: c, control: p }
  })

  // Sort and take only the most recent points to keep the chart "full" and relevant
  const sorted = [...all].sort((a, b) => new Date(a.ts) - new Date(b.ts))
  const sliced = sorted.slice(-limit)

  return sliced.map(({ ts, controlled, control }) => ({
    time: ts ? new Date(ts).getTime() : 0,
    label: ts ? new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '',
    controlledValue: controlled?.[METRICS.find(m => controlled[m.key] !== undefined)?.key] ?? null, // Fallback logic
    // We'll calculate the specific values inside the component mapping to be more robust
    rawControlled: controlled,
    rawControl: control
  }))
}

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null
  
  const displayTime = typeof label === 'number' 
    ? new Date(label).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) 
    : label

  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: '12px 16px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
      }}
    >
      <p style={{ color: '#94A3B8', fontSize: 11, marginBottom: 8, fontWeight: 700, letterSpacing: '0.05em' }}>
        {displayTime}
      </p>
      {payload.map((p) => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.color }} />
            <span style={{ color: '#F8FAFC', fontSize: 13, fontWeight: 500 }}>{p.name}</span>
          </div>
          <span style={{ color: p.color, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 13 }}>
            {p.value?.toFixed(1)}{unit}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function ComparisonCharts({ historyControlled, historyControl, loading, compact = false, title, headerAction }) {
  const [activeMetric, setActiveMetric] = useState('temperature_c')
  const { settings } = useSettings()
  const metric = METRICS.find((m) => m.key === activeMetric) ?? METRICS[0]

  if (loading) return <div className="surface" style={{ height: 300, animation: 'pulse 1.5s infinite' }} />

  // Process data for the active metric
  const series = buildSeries(historyControlled, historyControl, 50).map(d => ({
    ...d,
    controlled: d.rawControlled?.[metric.key],
    control: d.rawControl?.[metric.key]
  }))

  const bands = STAGES[settings.growthStage]?.thresholds?.[metric.key]
  const optimalBand = bands?.optimal

  return (
    <div className="surface" style={{ padding: '28px', position: 'relative', overflow: 'hidden' }}>
      {/* Background Glow */}
      <div style={{ 
        position: 'absolute', top: -50, right: -50, width: 200, height: 200, 
        background: `${CONTROLLED_COLOR}10`, filter: 'blur(80px)', pointerEvents: 'none' 
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--c-tx-primary)', marginBottom: 4 }}>
            {title || 'Environmental Trends'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--c-tx-muted)', fontWeight: 500 }}>
              {metric.label} Comparison ({metric.unit})
            </span>
            <div style={{ width: 1, height: 12, background: 'var(--c-bg-border)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: CONTROLLED_COLOR, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              • Controlled
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: CONTROL_COLOR, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              • Control
            </span>
          </div>
        </div>
        {headerAction}
      </div>

      {/* Metric Selector Tabs */}
      <div style={{ 
        display: 'flex', gap: 8, marginBottom: 30, background: 'rgba(255,255,255,0.03)', 
        padding: 6, borderRadius: 14, width: 'fit-content' 
      }}>
        {METRICS.map(m => (
          <button
            key={m.key}
            onClick={() => setActiveMetric(m.key)}
            style={{
              padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none',
              background: activeMetric === m.key ? 'var(--c-bg-surface)' : 'transparent',
              color: activeMetric === m.key ? 'var(--c-tx-primary)' : 'var(--c-tx-muted)',
              boxShadow: activeMetric === m.key ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div style={{ height: 240, width: '100%', marginLeft: -20 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.03)" vertical={false} />
            
            <XAxis 
              dataKey="time" 
              type="number"
              domain={['auto', 'auto']}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
              tick={false}
              tickLine={false}
            />
            
            <YAxis 
              domain={metric.key === 'temperature_c' ? [31, 33.5] : ['auto', 'auto']}
              ticks={metric.key === 'temperature_c' ? [31, 31.5, 32, 32.5, 33, 33.5] : undefined}
              orientation="left"
              axisLine={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
              tickLine={false}
              tick={{ fill: 'var(--c-tx-muted)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              width={50}
            >
              <Label
                value={`${metric.label} (${metric.unit})`}
                angle={-90}
                position="insideLeft"
                offset={10}
                style={{ textAnchor: 'middle', fill: 'var(--c-tx-muted)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}
              />
            </YAxis>

            <Tooltip content={<CustomTooltip unit={metric.unit} />} />

            {/* The "Safe Zone" Background */}
            {optimalBand && (
              <ReferenceArea 
                y1={optimalBand[0]} 
                y2={optimalBand[1]} 
                fill="rgba(129, 199, 132, 0.05)" 
                stroke="rgba(129, 199, 132, 0.15)"
                strokeDasharray="3 3"
              />
            )}

            <Line
              type="monotone"
              dataKey="controlled"
              name="Controlled"
              stroke={CONTROLLED_COLOR}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={1000}
              connectNulls
            />
            
            <Line
              type="monotone"
              dataKey="control"
              name="Control"
              stroke={CONTROL_COLOR}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={1000}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Legend / Labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px', marginTop: 10 }}>
         <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--c-tx-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
           ← Oldest
         </span>
         <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--c-tx-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
           Most Recent →
         </span>
      </div>
    </div>
  )
}