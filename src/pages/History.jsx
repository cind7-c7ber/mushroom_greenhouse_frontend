import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ResponsiveContainer, LineChart, BarChart, AreaChart, Line, Bar, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceArea } from 'recharts'
import { useData } from '../context/DataContext'
import { useSettings } from '../context/SettingsContext'
import { getMetricStatus, getMetricNote, evaluateReading, overallStatus, STATUS_META, STAGES } from '../lib/thresholds'

const CONTROLLED_COLOR = '#FACC15'
const CONTROL_COLOR = '#8B5CF6'

const METRICS = [
  { key: 'temperature_c', label: 'Temperature', unit: '°C' },
  { key: 'humidity_pct', label: 'Humidity', unit: '%' },
  { key: 'co2_ppm', label: 'CO₂', unit: 'ppm' },
  { key: 'light_lux', label: 'Light', unit: 'lux' },
  { key: 'moisture_pct', label: 'Moisture', unit: '%' },
]

function calcStats(readings, key) {
  const vals = readings.map(r => r?.[key]).filter(v => v != null && !isNaN(v))
  if (!vals.length) return null
  return {
    avg: vals.reduce((a, b) => a + b, 0) / vals.length,
    min: Math.min(...vals),
    max: Math.max(...vals),
  }
}

function pairReadings(histCtrl, histPlain) {
  const len = Math.max(histCtrl.length, histPlain.length)
  return Array.from({ length: len }, (_, i) => ({
    controlled: histCtrl[i] ?? null,
    control: histPlain[i] ?? null,
    timestamp: histCtrl[i]?.timestamp ?? histPlain[i]?.timestamp ?? null,
  }))
}

function StatusBadge({ status, small }) {
  const m = STATUS_META[status] ?? STATUS_META.unknown
  return (
    <span
      style={{
        fontSize: small ? 9 : 10,
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        padding: small ? '2px 5px' : '3px 8px',
        borderRadius: 4,
        background: m.bg,
        border: `1px solid ${m.border}`,
        color: m.color,
        flexShrink: 0,
      }}
    >
      {m.label}
    </span>
  )
}

function MiniSparkline({ readings, metricKey, color }) {
  const vals = useMemo(() => readings.map(r => r?.[metricKey]).filter(v => v != null && !isNaN(v)).slice(-20), [readings, metricKey])
  if (vals.length < 2) return null
  
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const range = max - min || 1
  const width = 80
  const height = 24
  const points = vals.map((v, i) => ({
    x: (i / (vals.length - 1)) * width,
    y: height - ((v - min) / range) * height
  }))
  const path = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`
  
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible', opacity: 0.7 }}>
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ComparisonMatrix({ histCtrl, histPlain, stage }) {
  const ctrlStats = useMemo(() => Object.fromEntries(METRICS.map(m => [m.key, calcStats(histCtrl, m.key)])), [histCtrl])
  const plainStats = useMemo(() => Object.fromEntries(METRICS.map(m => [m.key, calcStats(histPlain, m.key)])), [histPlain])

  const sessionDuration = useMemo(() => {
    if (!histCtrl.length) return null
    const start = new Date(histCtrl[0].timestamp)
    const end = new Date(histCtrl[histCtrl.length - 1].timestamp)
    const diff = Math.abs(end - start)
    const hours = Math.floor(diff / 3600000)
    const mins = Math.floor((diff % 3600000) / 60000)
    return `${hours}h ${mins}m`
  }, [histCtrl])

  return (
    <div className="surface" style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h3 className="section-heading" style={{ fontSize: 16 }}>Performance Matrix</h3>
          <p style={{ fontSize: 13, color: 'var(--c-tx-muted)', marginTop: 4 }}>
            Direct comparison between controlled and control environments
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p className="label-caps" style={{ fontSize: 9 }}>Session Duration</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-tx-primary)' }}>{sessionDuration || '—'}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.6fr 1fr', gap: 20, borderBottom: '1px solid var(--c-bg-border)', paddingBottom: 12, marginBottom: 12 }}>
        <p className="label-caps" style={{ opacity: 0.6 }}>Metric</p>
        <p className="label-caps" style={{ color: CONTROLLED_COLOR }}>Controlled Section</p>
        <p className="label-caps" style={{ textAlign: 'center', opacity: 0.6 }}>Delta</p>
        <p className="label-caps" style={{ color: CONTROL_COLOR }}>Control Section</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {METRICS.map(({ key, label, unit }) => {
          const cs = ctrlStats[key]
          const ps = plainStats[key]
          const csStatus = getMetricStatus(key, cs?.avg, stage)
          const psStatus = getMetricStatus(key, ps?.avg, stage)
          const delta = cs && ps ? cs.avg - ps.avg : null
          const deltaColor = delta > 0 ? '#5DB075' : delta < 0 ? '#DF2935' : 'var(--c-tx-muted)'

          return (
            <div key={key} style={{ 
              display: 'grid', 
              gridTemplateColumns: '1.2fr 1fr 0.6fr 1fr', 
              gap: 20, 
              alignItems: 'center',
              padding: '16px 0',
              borderBottom: '1px solid var(--c-bg-border)',
              transition: 'background 0.2s',
            }}>
              {/* Metric Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 80 }}>
                   <MiniSparkline readings={histCtrl} metricKey={key} color={CONTROLLED_COLOR} />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-tx-primary)' }}>{label}</p>
                  <p style={{ fontSize: 11, color: 'var(--c-tx-muted)' }}>{unit}</p>
                </div>
              </div>

              {/* Controlled */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20, fontWeight: 700, fontFamily: 'monospace', color: 'var(--c-tx-primary)' }}>
                  {cs ? parseFloat(cs.avg.toFixed(2)) : '—'}
                </span>
                <StatusBadge status={csStatus} small />
              </div>

              {/* Delta */}
              <div style={{ textAlign: 'center' }}>
                {delta !== null ? (
                  <span style={{ 
                    fontSize: 12, 
                    fontWeight: 800, 
                    padding: '3px 8px', 
                    borderRadius: 6, 
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--c-bg-border)',
                    color: deltaColor,
                    fontFamily: 'monospace'
                  }}>
                    {delta > 0 ? '+' : ''}{parseFloat(delta.toFixed(2))}
                  </span>
                ) : <span style={{ color: 'var(--c-tx-muted)' }}>—</span>}
              </div>

              {/* Control */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20, fontWeight: 700, fontFamily: 'monospace', color: 'var(--c-tx-primary)' }}>
                  {ps ? parseFloat(ps.avg.toFixed(2)) : '—'}
                </span>
                <StatusBadge status={psStatus} small />
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 24, padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid var(--c-bg-border)' }}>
        <p className="label-caps" style={{ fontSize: 9, marginBottom: 8, opacity: 0.6 }}>Analysis Summary</p>
        <p style={{ fontSize: 13, color: 'var(--c-tx-secondary)', lineHeight: 1.5 }}>
          The controlled section is currently showing an average deviation of 
          <span style={{ color: 'var(--c-tx-primary)', fontWeight: 600 }}> {parseFloat((METRICS.reduce((acc, m) => acc + Math.abs((ctrlStats[m.key]?.avg || 0) - (plainStats[m.key]?.avg || 0)), 0) / METRICS.length).toFixed(2))} units </span> 
          across all parameters compared to the control section.
        </p>
      </div>
    </div>
  )
}

function exportCSV(pairs) {
  const headers = [
    'Timestamp',
    'Ctrl_Temp_C', 'Ctrl_Humidity_pct', 'Ctrl_CO2_ppm', 'Ctrl_Light_lux', 'Ctrl_Moisture_pct',
    'Plain_Temp_C', 'Plain_Humidity_pct', 'Plain_CO2_ppm', 'Plain_Light_lux', 'Plain_Moisture_pct',
  ]
  const rows = pairs.map(({ controlled: c, control: p, timestamp }) => [
    timestamp ?? '',
    c?.temperature_c ?? '', c?.humidity_pct ?? '', c?.co2_ppm ?? '', c?.light_lux ?? '', c?.moisture_pct ?? '',
    p?.temperature_c ?? '', p?.humidity_pct ?? '', p?.co2_ppm ?? '', p?.light_lux ?? '', p?.moisture_pct ?? '',
  ])
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `greenhouse_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function RecordsTab({ pairs, stage }) {
  const [sectionFilter, setSectionFilter] = useState('both')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showExport, setShowExport] = useState(false)

  const filtered = useMemo(() => {
    const list = pairs.filter(({ controlled: c, control: p }) => {
      if (statusFilter === 'all') return true
      const cs = overallStatus(c ? evaluateReading(c, stage) : {})
      const ps = overallStatus(p ? evaluateReading(p, stage) : {})
      return cs === statusFilter || ps === statusFilter
    })
    // Fixed to 15 entries newest first
    return [...list].reverse().slice(0, 15)
  }, [pairs, statusFilter, stage])

  const dangerCount = pairs.filter(({ controlled: c, control: p }) => {
    const cs = c ? overallStatus(evaluateReading(c, stage)) : null
    const ps = p ? overallStatus(evaluateReading(p, stage)) : null
    return cs === 'danger' || ps === 'danger'
  }).length

  const lastTs = pairs[pairs.length - 1]?.timestamp

  function getHumanStatus(data, stage) {
    if (!data) return { label: 'No Data', color: 'var(--c-tx-muted)' }
    const statuses = evaluateReading(data, stage)
    const overall = overallStatus(statuses)
    
    if (overall === 'optimal') return { label: 'Conditions: Ideal', color: '#4FA99A' }
    
    // Pick the most critical issue to display
    const metrics = ['temperature_c', 'humidity_pct', 'co2_ppm', 'light_lux']
    for (const m of metrics) {
      if (statuses[m] === 'danger') {
        const label = METRICS.find(met => met.key === m)?.label || m
        const val = data[m]
        const bands = STAGES[stage]?.thresholds?.[m]
        const isHigh = bands && val > bands.optimal[1]
        return { label: `${label} is too ${isHigh ? 'High' : 'Low'}`, color: '#C4645B' }
      }
    }
    for (const m of metrics) {
      if (statuses[m] === 'watch') {
        const label = METRICS.find(met => met.key === m)?.label || m
        return { label: `Check ${label}`, color: '#C4A85B' }
      }
    }
    return { label: 'Monitor', color: '#C4A85B' }
  }

  function handleExport(limit) {
    const dataToExport = limit ? pairs.slice(-limit) : pairs
    exportCSV(dataToExport)
    setShowExport(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Search & Filters */}
      <div className="surface" style={{ padding: '16px 20px' }}>
        <p style={{ fontSize: 13, color: 'var(--c-tx-secondary)', marginBottom: 16, opacity: 0.8 }}>
           Showing latest <strong>{filtered.length}</strong> diary entries
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="label-caps" style={{ opacity: 0.6 }}>Filter Section</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {['both', 'controlled', 'control'].map(s => (
                  <button
                    key={s}
                    onClick={() => setSectionFilter(s)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: 'none',
                      background: sectionFilter === s ? 'var(--c-accent-dim)' : 'transparent',
                      outline: sectionFilter === s ? '1px solid var(--c-accent-border)' : '1px solid var(--c-bg-border)',
                      color: sectionFilter === s ? 'var(--c-tx-primary)' : 'var(--c-tx-muted)',
                    }}
                  >
                    {s === 'both' ? 'Both' : s === 'controlled' ? 'Controlled Section' : 'Control Section'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="label-caps" style={{ opacity: 0.6 }}>Filter Issues</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {['all', 'optimal', 'watch', 'danger'].map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: 'none',
                      background: statusFilter === s ? 'var(--c-accent-dim)' : 'transparent',
                      outline: statusFilter === s ? '1px solid var(--c-accent-border)' : '1px solid var(--c-bg-border)',
                      color: statusFilter === s ? 'var(--c-tx-primary)' : 'var(--c-tx-muted)',
                    }}
                  >
                    {s === 'all' ? 'All Logs' : s === 'optimal' ? 'Ideal Only' : s === 'watch' ? 'Warnings' : 'Alerts'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowExport(!showExport)}
              className="btn-ghost"
              style={{ 
                padding: '8px 18px', 
                fontSize: 12, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8, 
                borderRadius: 8,
                background: showExport ? 'var(--c-accent-dim)' : 'transparent',
                borderColor: showExport ? 'var(--c-accent-border)' : 'var(--c-bg-border)',
                color: showExport ? 'var(--c-tx-primary)' : 'var(--c-tx-secondary)'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download Records
            </button>

            {showExport && (
              <div className="surface" style={{ 
                position: 'absolute', 
                top: '100%', 
                right: 0, 
                marginTop: 8, 
                width: 220, 
                zIndex: 50, 
                padding: 12, 
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                animation: 'fadeIn 0.2s ease-out'
              }}>
                <p className="label-caps" style={{ marginBottom: 12, opacity: 0.6, fontSize: 10 }}>Select Export Range</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {[
                    { label: 'Last 15 Records', val: 15 },
                    { label: 'Last 50 Records', val: 50 },
                    { label: 'Last 100 Records', val: 100 },
                    { label: 'Last 250 Records', val: 250 },
                    { label: 'Full Session Log', val: null },
                  ].map(opt => (
                    <button
                      key={opt.label}
                      onClick={() => handleExport(opt.val)}
                      style={{
                        padding: '10px 12px',
                        textAlign: 'left',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--c-tx-primary)',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {opt.label}
                      <span style={{ opacity: 0.3 }}>→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>



      {/* Diary List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 ? (
          <div className="surface" style={{ padding: '60px 0', textAlign: 'center' }}>
            <p style={{ color: 'var(--c-tx-muted)', fontSize: 14 }}>No diary entries found for the selected filters.</p>
          </div>
        ) : filtered.map(({ controlled: c, control: p, timestamp }, idx) => {
          const ts = timestamp ? new Date(timestamp) : null
          const timeStr = ts ? ts.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—'
          const dateStr = ts ? ts.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''
          
          const csH = getHumanStatus(c, stage)
          const psH = getHumanStatus(p, stage)

          return (
            <div key={idx} className="surface" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: 32, alignItems: 'center' }}>
                {/* Time Column */}
                <div>
                  <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--c-tx-primary)' }}>{timeStr}</p>
                  <p style={{ fontSize: 12, color: 'var(--c-tx-muted)', fontWeight: 500, marginTop: 2 }}>{dateStr}</p>
                </div>

                {/* Controlled Section */}
                {(sectionFilter === 'both' || sectionFilter === 'controlled') && (
                  <div style={{ borderLeft: `3px solid ${CONTROLLED_COLOR}`, paddingLeft: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: CONTROLLED_COLOR, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Controlled Section</span>
                      <span style={{ fontSize: 11, color: csH.color, fontWeight: 700, marginLeft: 12 }}>• {csH.label}</span>
                    </div>
                    {c ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 20px' }}>
                        <div>
                          <p style={{ fontSize: 10, opacity: 0.5, textTransform: 'uppercase', marginBottom: 2 }}>Temperature</p>
                          <p style={{ fontSize: 14, fontWeight: 600 }}>{parseFloat(c.temperature_c.toFixed(1))}°C</p>
                        </div>
                        <div>
                          <p style={{ fontSize: 10, opacity: 0.5, textTransform: 'uppercase', marginBottom: 2 }}>Humidity</p>
                          <p style={{ fontSize: 14, fontWeight: 600 }}>{parseFloat(c.humidity_pct.toFixed(1))}%</p>
                        </div>
                        <div>
                          <p style={{ fontSize: 10, opacity: 0.5, textTransform: 'uppercase', marginBottom: 2 }}>CO₂</p>
                          <p style={{ fontSize: 14, fontWeight: 600 }}>{Math.round(c.co2_ppm)} ppm</p>
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize: 13, color: 'var(--c-tx-muted)', fontStyle: 'italic' }}>Reading missed</p>
                    )}
                  </div>
                )}

                {/* Control Section */}
                {(sectionFilter === 'both' || sectionFilter === 'control') && (
                  <div style={{ borderLeft: `3px solid ${CONTROL_COLOR}`, paddingLeft: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: CONTROL_COLOR, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Control Section</span>
                      <span style={{ fontSize: 11, color: psH.color, fontWeight: 700, marginLeft: 12 }}>• {psH.label}</span>
                    </div>
                    {p ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 20px' }}>
                        <div>
                          <p style={{ fontSize: 10, opacity: 0.5, textTransform: 'uppercase', marginBottom: 2 }}>Temperature</p>
                          <p style={{ fontSize: 14, fontWeight: 600 }}>{parseFloat(p.temperature_c.toFixed(1))}°C</p>
                        </div>
                        <div>
                          <p style={{ fontSize: 10, opacity: 0.5, textTransform: 'uppercase', marginBottom: 2 }}>Humidity</p>
                          <p style={{ fontSize: 14, fontWeight: 600 }}>{parseFloat(p.humidity_pct.toFixed(1))}%</p>
                        </div>
                        <div>
                          <p style={{ fontSize: 10, opacity: 0.5, textTransform: 'uppercase', marginBottom: 2 }}>CO₂</p>
                          <p style={{ fontSize: 14, fontWeight: 600 }}>{Math.round(p.co2_ppm)} ppm</p>
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize: 13, color: 'var(--c-tx-muted)', fontStyle: 'italic' }}>Reading missed</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getThresholdBands(metric, stage) {
  if (metric === 'moisture_pct') return []
  const stageDef = STAGES[stage]
  if (!stageDef?.thresholds?.[metric]) return []
  const bands = stageDef.thresholds[metric]
  const result = []

  if (bands.optimal) {
    result.push({ y1: bands.optimal[0], y2: bands.optimal[1], fill: 'rgba(79,169,154,0.1)', label: 'Optimal' })
  }

  if (bands.watch) {
    for (const [w1, w2] of bands.watch) {
      if (w1 !== -Infinity && w2 !== Infinity) {
        result.push({ y1: w1, y2: w2, fill: 'rgba(196,168,91,0.08)' })
      }
    }
  }

  return result
}

const CHART_TYPES = ['Line', 'Bar', 'Area']
const SECTION_VIEWS = ['Both', 'Controlled', 'Control']
const TIME_RANGES = [
  { label: 'Last 10', value: 10 },
  { label: 'Last 20', value: 20 },
  { label: 'Last 50', value: 50 },
  { label: '100+', value: 250 },
]

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--c-bg-card)', border: '1px solid var(--c-bg-border)', borderRadius: 8, padding: '10px 14px', fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
      <p style={{ color: 'var(--c-tx-muted)', marginBottom: 8, fontFamily: 'monospace' }}>{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
            <span style={{ color: 'var(--c-tx-secondary)' }}>{p.name}</span>
          </div>
          <span style={{ fontFamily: 'monospace', fontWeight: 600, color: p.color }}>{p.value != null ? parseFloat(p.value.toFixed(2)) : '—'} {unit}</span>
        </div>
      ))}
    </div>
  )
}

function StatSummary({ label, data, color, unit }) {
  if (!data) return null
  return (
    <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--c-bg-border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
        <p className="label-caps" style={{ fontSize: 10, color }}>{label}</p>
      </div>
      <div style={{ marginBottom: 12 }}>
        <p className="label-caps" style={{ fontSize: 9, opacity: 0.6, marginBottom: 2 }}>Typical Reading</p>
        <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--c-tx-primary)' }}>
          {parseFloat(data.avg.toFixed(2))} <span style={{ fontSize: 12, fontWeight: 500, opacity: 0.6 }}>{unit}</span>
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <p className="label-caps" style={{ fontSize: 8, opacity: 0.5, marginBottom: 1 }}>Lowest</p>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-tx-secondary)' }}>{parseFloat(data.min.toFixed(2))}</p>
        </div>
        <div>
          <p className="label-caps" style={{ fontSize: 8, opacity: 0.5, marginBottom: 1 }}>Highest</p>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-tx-secondary)' }}>{parseFloat(data.max.toFixed(2))}</p>
        </div>
      </div>
    </div>
  )
}

function TrendsTab({ histCtrl, histPlain, stage }) {
  const [activeMetric, setActiveMetric] = useState('temperature_c')
  const [chartType, setChartType] = useState('Line')
  const [sectionView, setSectionView] = useState('Both')
  const [timeRange, setTimeRange] = useState(20)
  const [showSettings, setShowSettings] = useState(false)

  const current = METRICS.find(m => m.key === activeMetric) ?? METRICS[0]

  const series = useMemo(() => {
    const len = Math.max(histCtrl.length, histPlain.length)
    const all = Array.from({ length: len }, (_, i) => {
      const c = histCtrl[i]
      const p = histPlain[i]
      return {
        ts: c?.timestamp ?? p?.timestamp ?? '',
        controlled: c?.[activeMetric] ?? null,
        control: p?.[activeMetric] ?? null,
      }
    })

    const sliced = all.slice(-timeRange)

    const tsLabels = sliced.map(({ ts }) =>
      ts ? new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : null
    )
    const uniqueTs = new Set(tsLabels.filter(Boolean))
    const useIndex = uniqueTs.size <= 1

    return sliced.map(({ ts, controlled, control }, i) => ({
      label: useIndex
        ? `#${i + 1}`
        : ts
        ? new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
        : `#${i + 1}`,
      controlled,
      control,
    }))
  }, [histCtrl, histPlain, activeMetric, timeRange])

  const tickInterval = Math.max(1, Math.floor(series.length / 6))
  const thresholdBands = useMemo(() => getThresholdBands(activeMetric, stage), [activeMetric, stage])

  const stats = useMemo(() => {
    const compute = (key) => {
      const vals = series.map(d => d[key]).filter(v => v != null)
      if (!vals.length) return null
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length
      const min = Math.min(...vals)
      const max = Math.max(...vals)
      const variance = vals.reduce((s, v) => s + (v - avg) ** 2, 0) / vals.length
      const stability = variance < 1 ? 'Stable' : variance < 10 ? 'Moderate' : 'Variable'
      return { avg, min, max, stability }
    }
    return {
      controlled: compute('controlled'),
      control: compute('control'),
    }
  }, [series])

  const showControlled = sectionView !== 'Control'
  const showControl = sectionView !== 'Controlled'

  const chartProps = {
    data: series,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
  }

  const xAxis = (
    <XAxis 
      dataKey="label" 
      tick={{ fill: 'var(--c-tx-muted)', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }} 
      tickLine={false} 
      axisLine={false} 
      interval={tickInterval}
      label={{ value: 'Time of Reading', position: 'insideBottom', offset: -10, fill: 'var(--c-tx-muted)', fontSize: 11, fontWeight: 500 }}
    />
  )
  const yAxis = (
    <YAxis 
      tick={{ fill: 'var(--c-tx-muted)', fontSize: 10 }} 
      tickLine={false} 
      axisLine={false} 
      width={60} 
      tickFormatter={v => `${v}`}
      domain={['auto', 'auto']}
      label={{ value: `${current.label} (${current.unit})`, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'var(--c-tx-muted)', fontSize: 11, fontWeight: 500 } }}
    />
  )
  const grid = <CartesianGrid strokeDasharray="2 6" stroke="rgba(255,255,255,0.04)" vertical={false} />
  const tooltip = <Tooltip content={<CustomTooltip unit={current.unit} />} cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }} />

  const refAreas = thresholdBands.map((b, i) => (
    <ReferenceArea key={i} y1={b.y1} y2={b.y2} fill={b.fill} stroke="none" ifOverflow="extendDomain" />
  ))

  function renderChart() {
    if (chartType === 'Bar') {
      return (
        <BarChart {...chartProps}>
          {grid}{xAxis}{yAxis}{tooltip}
          {refAreas}
          {showControlled && <Bar dataKey="controlled" name="Controlled Section" fill={CONTROLLED_COLOR} radius={[3, 3, 0, 0]} />}
          {showControl && <Bar dataKey="control" name="Control Section" fill={CONTROL_COLOR} radius={[3, 3, 0, 0]} />}
        </BarChart>
      )
    }

    if (chartType === 'Area') {
      return (
        <AreaChart {...chartProps}>
          {grid}{xAxis}{yAxis}{tooltip}
          {refAreas}
          {showControlled && <Area dataKey="controlled" name="Controlled Section" stroke={CONTROLLED_COLOR} fill={CONTROLLED_COLOR} fillOpacity={0.08} strokeWidth={2} dot={false} connectNulls />}
          {showControl && <Area dataKey="control" name="Control Section" stroke={CONTROL_COLOR} fill={CONTROL_COLOR} fillOpacity={0.08} strokeWidth={2} dot={false} connectNulls />}
        </AreaChart>
      )
    }

    return (
      <LineChart {...chartProps}>
        {grid}{xAxis}{yAxis}{tooltip}
        {refAreas}
        {showControlled && <Line dataKey="controlled" name="Controlled Section" stroke={CONTROLLED_COLOR} strokeWidth={2} dot={false} activeDot={{ r: 4 }} connectNulls />}
        {showControl && <Line dataKey="control" name="Control Section" stroke={CONTROL_COLOR} strokeWidth={2} dot={false} activeDot={{ r: 4 }} connectNulls />}
      </LineChart>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Primary Filters */}
      <div className="surface" style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
          <div>
            <p className="label-caps" style={{ marginBottom: 6 }}>Sensor Type</p>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {METRICS.map(m => (
                <button
                  key={m.key}
                  onClick={() => setActiveMetric(m.key)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 7,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    background: activeMetric === m.key ? 'var(--c-accent-dim)' : 'transparent',
                    outline: activeMetric === m.key ? '1px solid var(--c-accent-border)' : '1px solid var(--c-bg-border)',
                    color: activeMetric === m.key ? 'var(--c-tx-primary)' : 'var(--c-tx-muted)',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="label-caps" style={{ marginBottom: 6 }}>History Length</p>
            <div style={{ display: 'flex', gap: 4 }}>
              {TIME_RANGES.map(r => (
                <button
                  key={r.value}
                  onClick={() => setTimeRange(r.value)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 7,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    background: timeRange === r.value ? 'var(--c-accent-dim)' : 'transparent',
                    outline: timeRange === r.value ? '1px solid var(--c-accent-border)' : '1px solid var(--c-bg-border)',
                    color: timeRange === r.value ? 'var(--c-tx-primary)' : 'var(--c-tx-muted)',
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Unified Chart & Stats Container */}
      <div className="surface" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h3 className="section-heading" style={{ fontSize: 18 }}>{current.label} Progress</h3>
            <p style={{ fontSize: 13, color: 'var(--c-tx-muted)', marginTop: 4 }}>
               Showing trends and typical levels for the selected time period
            </p>
          </div>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            style={{ 
              background: showSettings ? 'var(--c-accent-dim)' : 'transparent',
              border: '1px solid var(--c-bg-border)',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 11,
              fontWeight: 600,
              color: showSettings ? 'var(--c-tx-primary)' : 'var(--c-tx-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            Display Options
          </button>
        </div>

        {showSettings && (
          <div style={{ 
            marginBottom: 24, 
            padding: 16, 
            background: 'rgba(255,255,255,0.02)', 
            borderRadius: 12, 
            border: '1px solid var(--c-bg-border)',
            display: 'flex',
            gap: 32,
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div>
              <p className="label-caps" style={{ marginBottom: 8, opacity: 0.6 }}>Visual Style</p>
              <div style={{ display: 'flex', gap: 4 }}>
                {CHART_TYPES.map(t => (
                  <button
                    key={t}
                    onClick={() => setChartType(t)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 7,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: 'none',
                      background: chartType === t ? 'var(--c-accent-dim)' : 'transparent',
                      outline: chartType === t ? '1px solid var(--c-accent-border)' : '1px solid var(--c-bg-border)',
                      color: chartType === t ? 'var(--c-tx-primary)' : 'var(--c-tx-muted)',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="label-caps" style={{ marginBottom: 8, opacity: 0.6 }}>View Mode</p>
              <div style={{ display: 'flex', gap: 4 }}>
                {SECTION_VIEWS.map(v => (
                  <button
                    key={v}
                    onClick={() => setSectionView(v)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 7,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: 'none',
                      background: sectionView === v ? 'var(--c-accent-dim)' : 'transparent',
                      outline: sectionView === v ? '1px solid var(--c-accent-border)' : '1px solid var(--c-bg-border)',
                      color: sectionView === v ? 'var(--c-tx-primary)' : 'var(--c-tx-muted)',
                    }}
                  >
                    {v === 'Both' ? 'Both' : v === 'Controlled' ? 'Controlled Section' : 'Control Section'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 250px) 1fr', gap: 32 }}>
          {/* Stats Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {showControlled && <StatSummary label="Controlled Section" data={stats.controlled} color={CONTROLLED_COLOR} unit={current.unit} />}
            {showControl && <StatSummary label="Control Section" data={stats.control} color={CONTROL_COLOR} unit={current.unit} />}
            
            <div style={{ marginTop: 'auto' }}>
              {/* Analysis Summary removed to reduce noise */}
            </div>
          </div>

          {/* Large Chart */}
          <div style={{ height: 350, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

function AlertsTab({ alerts, loading }) {
  const [severityFilter, setSeverityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredAlerts = useMemo(() => {
    return (alerts || []).filter((alert) => {
      const severityMatch = severityFilter === 'all' || alert.severity === severityFilter
      const statusMatch = statusFilter === 'all' || alert.status === statusFilter
      return severityMatch && statusMatch
    })
  }, [alerts, severityFilter, statusFilter])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="surface" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span className="label-caps">Severity</span>
            {['all', 'critical', 'watch'].map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: 'none',
                  background: severityFilter === s ? 'var(--c-accent-dim)' : 'transparent',
                  outline: severityFilter === s ? '1px solid var(--c-accent-border)' : '1px solid var(--c-bg-border)',
                  color: severityFilter === s ? 'var(--c-tx-primary)' : 'var(--c-tx-muted)',
                }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span className="label-caps">State</span>
            {['all', 'active', 'resolved'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: 'none',
                  background: statusFilter === s ? 'var(--c-accent-dim)' : 'transparent',
                  outline: statusFilter === s ? '1px solid var(--c-accent-border)' : '1px solid var(--c-bg-border)',
                  color: statusFilter === s ? 'var(--c-tx-primary)' : 'var(--c-tx-muted)',
                }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="surface p-5">
          <div className="h-28 bg-bg-elevated rounded-lg animate-pulse" />
        </div>
      ) : filteredAlerts.length > 0 ? (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="surface p-5"
              style={{
                borderColor: alert.severity === 'critical' ? 'rgba(196,100,91,0.28)' : 'rgba(214,163,92,0.28)',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span
                      className="label-caps text-[10px] px-2 py-1 rounded border"
                      style={{
                        borderColor: alert.severity === 'critical' ? 'rgba(196,100,91,0.4)' : 'rgba(214,163,92,0.4)',
                      }}
                    >
                      {alert.severity}
                    </span>
                    <span className="label-caps text-[10px] px-2 py-1 rounded border border-bg-border">
                      {alert.status}
                    </span>
                    <span className="label-caps text-[10px] px-2 py-1 rounded border border-bg-border">
                      {alert.section}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-tx-primary">{alert.message}</p>

                  <div className="mt-2 text-xs text-tx-secondary space-y-1">
                    <p>
                      {alert.parameter} • {alert.value} • {alert.band}
                    </p>
                    <p>{alert.timestamp ? new Date(alert.timestamp).toLocaleString('en-GB') : '—'}</p>
                  </div>

                  {alert.recommended_action && (
                    <p className="text-xs text-tx-muted mt-3">{alert.recommended_action}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="surface p-8 text-center">
          <p className="text-sm text-tx-muted">No alert records match the selected filters.</p>
        </div>
      )}
    </div>
  )
}

const TABS = [
  { key: 'readings', label: 'Sensor Readings' },
  { key: 'alerts', label: 'Alert History' },
]

export default function History() {
  const { settings } = useSettings()
  const {
    historyControlled: histCtrl,
    historyControl: histPlain,
    activeAlerts,
    alertHistory,
    loading,
    alertHistoryLoading,
  } = useData()

  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const initialTab = TABS.some(t => t.key === requestedTab) ? requestedTab : 'readings'
  const [activeTab, setActiveTab] = useState(initialTab)

  useEffect(() => {
    if (requestedTab && requestedTab !== activeTab && TABS.some(t => t.key === requestedTab)) {
      setActiveTab(requestedTab)
    }
  }, [requestedTab, activeTab])

  const pairs = useMemo(() => pairReadings(histCtrl, histPlain), [histCtrl, histPlain])
  const stage = settings.growthStage
  const allAlerts = activeAlerts?.length ? activeAlerts : alertHistory

  if (loading && activeTab === 'readings') {
    return (
      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ height: 140, background: 'var(--c-bg-elevated)', borderRadius: 16, animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
    )
  }

  function handleTabChange(tabKey) {
    setActiveTab(tabKey)
    setSearchParams({ tab: tabKey })
  }

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="surface" style={{ padding: 6, borderRadius: 14, width: 'fit-content', border: '1px solid var(--c-bg-border)', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => handleTabChange(t.key)}
              style={{
                padding: '10px 28px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: activeTab === t.key ? 'var(--c-accent-dim)' : 'transparent',
                outline: activeTab === t.key ? '1px solid var(--c-accent-border)' : 'none',
                color: activeTab === t.key ? 'var(--c-tx-primary)' : 'var(--c-tx-muted)',
                transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'readings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <ComparisonMatrix histCtrl={histCtrl} histPlain={histPlain} stage={stage} />
          <TrendsTab histCtrl={histCtrl} histPlain={histPlain} stage={stage} />
          <RecordsTab pairs={pairs} stage={stage} />
        </div>
      )}

      {activeTab === 'alerts' && (
        <AlertsTab alerts={allAlerts || []} loading={alertHistoryLoading} />
      )}
    </div>
  )
}
