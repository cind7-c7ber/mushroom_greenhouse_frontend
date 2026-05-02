import { useState, useMemo } from 'react'
import { ResponsiveContainer, LineChart, BarChart, AreaChart, Line, Bar, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceArea } from 'recharts'
import { useData }     from '../context/DataContext'
import { useSettings } from '../context/SettingsContext'
import { getMetricStatus, getMetricNote, evaluateReading, overallStatus, STATUS_META, STAGES } from '../lib/thresholds'

const CONTROLLED_COLOR = '#DF2935'
const CONTROL_COLOR    = '#80FF72'

const METRICS = [
  { key: 'temperature_c', label: 'Temperature', unit: '°C'  },
  { key: 'humidity_pct',  label: 'Humidity',    unit: '%'   },
  { key: 'co2_ppm',       label: 'CO\u2082',    unit: 'ppm' },
  { key: 'light_lux',     label: 'Light',       unit: 'lux' },
  { key: 'moisture_pct',  label: 'Moisture',    unit: '%'   },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
    control:    histPlain[i] ?? null,
    timestamp:  histCtrl[i]?.timestamp ?? histPlain[i]?.timestamp ?? null,
  }))
}

// ─── Shared chip / badge ─────────────────────────────────────────────────────
function StatusBadge({ status, small }) {
  const m = STATUS_META[status] ?? STATUS_META.unknown
  return (
    <span style={{
      fontSize: small ? 9 : 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
      padding: small ? '2px 5px' : '3px 8px', borderRadius: 4,
      background: m.bg, border: `1px solid ${m.border}`, color: m.color, flexShrink: 0,
    }}>
      {m.label}
    </span>
  )
}

// ─── Tab 1: Summary ───────────────────────────────────────────────────────────

function SummaryTab({ histCtrl, histPlain, stage }) {
  const ctrlStats  = useMemo(() => Object.fromEntries(METRICS.map(m => [m.key, calcStats(histCtrl,  m.key)])), [histCtrl])
  const plainStats = useMemo(() => Object.fromEntries(METRICS.map(m => [m.key, calcStats(histPlain, m.key)])), [histPlain])

  // Find main issue and most stable
  const issueMetric = METRICS.find(m => {
    const cs = getMetricStatus(m.key, ctrlStats[m.key]?.avg, stage)
    const ps = getMetricStatus(m.key, plainStats[m.key]?.avg, stage)
    return cs === 'danger' || ps === 'danger'
  }) ?? METRICS.find(m => {
    const cs = getMetricStatus(m.key, ctrlStats[m.key]?.avg, stage)
    const ps = getMetricStatus(m.key, plainStats[m.key]?.avg, stage)
    return cs === 'watch' || ps === 'watch'
  })

  const stableMetric = METRICS.find(m => {
    const cs = getMetricStatus(m.key, ctrlStats[m.key]?.avg, stage)
    const ps = getMetricStatus(m.key, plainStats[m.key]?.avg, stage)
    return cs === 'optimal' && ps === 'optimal'
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Overview strip */}
      <div className="surface" style={{ padding: '14px 18px' }}>
        <p className="label-caps" style={{ marginBottom: 12 }}>Session Overview</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ background: 'var(--c-bg-base)', borderRadius: 8, padding: '12px 14px', border: '1px solid var(--c-bg-border)' }}>
            <p className="label-caps" style={{ marginBottom: 4, fontSize: 9, color: '#C4645B' }}>Main Issue</p>
            <p style={{ fontSize: 13, color: 'var(--c-tx-primary)', fontWeight: 500 }}>
              {issueMetric
                ? `${issueMetric.label} out of range in one or both sections`
                : 'No critical issues detected'}
            </p>
          </div>
          <div style={{ background: 'var(--c-bg-base)', borderRadius: 8, padding: '12px 14px', border: '1px solid var(--c-bg-border)' }}>
            <p className="label-caps" style={{ marginBottom: 4, fontSize: 9, color: '#4FA99A' }}>Most Stable</p>
            <p style={{ fontSize: 13, color: 'var(--c-tx-primary)', fontWeight: 500 }}>
              {stableMetric
                ? `${stableMetric.label} — both sections within optimal range`
                : 'No consistently optimal metric found'}
            </p>
          </div>
        </div>
      </div>

      {/* Per-metric summary */}
      {METRICS.map(({ key, label, unit }) => {
        const cs  = ctrlStats[key]
        const ps  = plainStats[key]
        const csStatus    = getMetricStatus(key, cs?.avg, stage)
        const psStatus    = getMetricStatus(key, ps?.avg, stage)
        const worstStatus = csStatus === 'danger' || psStatus === 'danger' ? 'danger'
          : csStatus === 'watch'  || psStatus === 'watch'  ? 'watch'
          : csStatus
        const note = getMetricNote(key, worstStatus, stage)

        return (
          <div key={key} className="surface" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 className="section-heading">{label} <span style={{ fontWeight: 400, color: 'var(--c-tx-muted)', fontSize: 12 }}>{unit}</span></h3>
              <div style={{ display: 'flex', gap: 6 }}>
                <StatusBadge status={csStatus} />
                <StatusBadge status={psStatus} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              {[
                { label: 'Controlled', stats: cs, color: CONTROLLED_COLOR },
                { label: 'Control',    stats: ps, color: CONTROL_COLOR    },
              ].map(({ label: secLabel, stats, color }) => (
                <div key={secLabel} style={{ background: 'var(--c-bg-base)', borderRadius: 8, padding: '10px 14px', border: '1px solid var(--c-bg-border)' }}>
                  <p className="label-caps" style={{ marginBottom: 8, color }}>{secLabel}</p>
                  {stats ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                      {[['Avg', stats.avg], ['Min', stats.min], ['Max', stats.max]].map(([lbl, val]) => (
                        <div key={lbl}>
                          <p className="label-caps" style={{ fontSize: 9, marginBottom: 3 }}>{lbl}</p>
                          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600, color: 'var(--c-tx-primary)' }}>
                            {parseFloat(val.toFixed(2))}
                          </p>
                          <p style={{ fontSize: 10, color: 'var(--c-tx-muted)' }}>{unit}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: 12, color: 'var(--c-tx-muted)' }}>No data</p>
                  )}
                </div>
              ))}
            </div>

            <p style={{ fontSize: 12, color: 'var(--c-tx-secondary)', borderTop: '1px solid var(--c-bg-border)', paddingTop: 10 }}>
              {note}
            </p>
          </div>
        )
      })}
    </div>
  )
}

// ─── CSV Export ──────────────────────────────────────────────────────────────

function exportCSV(pairs) {
  const headers = [
    'Timestamp',
    'Ctrl_Temp_C','Ctrl_Humidity_pct','Ctrl_CO2_ppm','Ctrl_Light_lux','Ctrl_Moisture_pct',
    'Plain_Temp_C','Plain_Humidity_pct','Plain_CO2_ppm','Plain_Light_lux','Plain_Moisture_pct',
  ]
  const rows = pairs.map(({ controlled: c, control: p, timestamp }) => [
    timestamp ?? '',
    c?.temperature_c ?? '', c?.humidity_pct ?? '', c?.co2_ppm ?? '', c?.light_lux ?? '', c?.moisture_pct ?? '',
    p?.temperature_c ?? '', p?.humidity_pct ?? '', p?.co2_ppm ?? '', p?.light_lux ?? '', p?.moisture_pct ?? '',
  ])
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `greenhouse_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Tab 2: Records ───────────────────────────────────────────────────────────

function RecordsTab({ pairs, stage }) {
  const [sectionFilter, setSectionFilter]   = useState('both')
  const [statusFilter, setStatusFilter]     = useState('all')
  const [expanded, setExpanded]             = useState(null)

  const filtered = useMemo(() => {
    return pairs.filter(({ controlled: c, control: p }) => {
      if (statusFilter === 'all') return true
      const cs = overallStatus(c ? evaluateReading(c, stage) : {})
      const ps = overallStatus(p ? evaluateReading(p, stage) : {})
      return cs === statusFilter || ps === statusFilter
    })
  }, [pairs, statusFilter, stage])

  const dangerCount = pairs.filter(({ controlled: c, control: p }) => {
    const cs = c ? overallStatus(evaluateReading(c, stage)) : null
    const ps = p ? overallStatus(evaluateReading(p, stage)) : null
    return cs === 'danger' || ps === 'danger'
  }).length

  const lastTs = pairs[pairs.length - 1]?.timestamp

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Controls */}
      <div className="surface" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span className="label-caps">Section</span>
              {['both', 'controlled', 'control'].map(s => (
                <button key={s} onClick={() => setSectionFilter(s)} style={{
                  padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: 'pointer', border: 'none',
                  background: sectionFilter === s ? 'var(--c-accent-dim)' : 'transparent',
                  outline: sectionFilter === s ? '1px solid var(--c-accent-border)' : '1px solid var(--c-bg-border)',
                  color: sectionFilter === s ? 'var(--c-tx-primary)' : 'var(--c-tx-muted)',
                }}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span className="label-caps">Status</span>
              {['all', 'optimal', 'watch', 'danger'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} style={{
                  padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: 'pointer', border: 'none',
                  background: statusFilter === s ? 'var(--c-accent-dim)' : 'transparent',
                  outline: statusFilter === s ? '1px solid var(--c-accent-border)' : '1px solid var(--c-bg-border)',
                  color: statusFilter === s ? 'var(--c-tx-primary)' : 'var(--c-tx-muted)',
                }}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {/* CSV Export */}
          <button
            onClick={() => exportCSV(pairs)}
            className="btn-ghost"
            style={{ padding: '5px 14px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1v7M3.5 5.5l3 3 3-3M1.5 9.5v2h10v-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary strip */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          [`${pairs.length} readings`, 'var(--c-tx-secondary)'],
          [`Stage: ${STAGES[stage]?.label}`, 'var(--c-tx-secondary)'],
          [`${dangerCount} danger event${dangerCount !== 1 ? 's' : ''}`, dangerCount > 0 ? '#C4645B' : 'var(--c-tx-muted)'],
          [lastTs ? `Last: ${new Date(lastTs).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` : '', 'var(--c-tx-muted)'],
        ].filter(([t]) => t).map(([text, color], i) => (
          <span key={i} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'var(--c-bg-elevated)', border: '1px solid var(--c-bg-border)', color }}>
            {text}
          </span>
        ))}
      </div>

      {/* Activity log */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <p style={{ color: 'var(--c-tx-muted)', fontSize: 13 }}>No records match the selected filters.</p>
          </div>
        ) : filtered.map(({ controlled: c, control: p, timestamp }, idx) => {
          const ts       = timestamp ? new Date(timestamp) : null
          const timeStr  = ts ? ts.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—'
          const dateStr  = ts ? ts.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''
          const csStatus = c ? overallStatus(evaluateReading(c, stage)) : 'unknown'
          const psStatus = p ? overallStatus(evaluateReading(p, stage)) : 'unknown'
          const isOpen   = expanded === idx

          return (
            <div key={idx} className="surface" style={{ overflow: 'hidden' }}>
              {/* Collapsed row */}
              <button
                onClick={() => setExpanded(isOpen ? null : idx)}
                style={{ width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <div style={{ minWidth: 52 }}>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600, color: 'var(--c-tx-primary)' }}>{timeStr}</p>
                  <p style={{ fontSize: 10, color: 'var(--c-tx-muted)' }}>{dateStr}</p>
                </div>

                <div style={{ flex: 1, minWidth: 0, fontSize: 12, color: 'var(--c-tx-secondary)' }}>
                  {(sectionFilter === 'both' || sectionFilter === 'controlled') && c && (
                    <p style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <span style={{ color: CONTROLLED_COLOR, fontWeight: 600 }}>Controlled: </span>
                      {c.temperature_c != null ? parseFloat(c.temperature_c.toFixed(2)) : '—'}°C · {c.humidity_pct != null ? parseFloat(c.humidity_pct.toFixed(2)) : '—'}% RH · {c.co2_ppm} ppm
                    </p>
                  )}
                  {(sectionFilter === 'both' || sectionFilter === 'control') && p && (
                    <p style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>
                      <span style={{ color: CONTROL_COLOR, fontWeight: 600 }}>Control: </span>
                      {p.temperature_c != null ? parseFloat(p.temperature_c.toFixed(2)) : '—'}°C · {p.humidity_pct != null ? parseFloat(p.humidity_pct.toFixed(2)) : '—'}% RH · {p.co2_ppm} ppm
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                  <StatusBadge status={csStatus} small />
                  <StatusBadge status={psStatus} small />
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: 'var(--c-tx-muted)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <path d="M2 4.5L6 8L10 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div style={{ borderTop: '1px solid var(--c-bg-border)', padding: '14px 16px', background: 'var(--c-bg-base)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {[
                      { label: 'Controlled', data: c, color: CONTROLLED_COLOR },
                      { label: 'Control',    data: p, color: CONTROL_COLOR    },
                    ].map(({ label: secLabel, data, color }) => data && (
                      <div key={secLabel}>
                        <p className="label-caps" style={{ marginBottom: 8, color }}>{secLabel}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {METRICS.map(({ key, label: mLabel, unit }) => {
                            const st = getMetricStatus(key, data[key], stage)
                            return (
                              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 12, color: 'var(--c-tx-muted)' }}>{mLabel}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--c-tx-primary)', fontWeight: 600 }}>
                                    {data[key] != null ? `${parseFloat(Number(data[key]).toFixed(2))} ${unit}` : '—'}
                                  </span>
                                  <StatusBadge status={st} small />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Threshold reference bands for Trends chart ──────────────────────────────

function getThresholdBands(metric, stage) {
  if (metric === 'moisture_pct') return []
  const stageDef = STAGES[stage]
  if (!stageDef?.thresholds?.[metric]) return []
  const bands = stageDef.thresholds[metric]
  const result = []
  // Optimal — green tint
  if (bands.optimal) {
    result.push({ y1: bands.optimal[0], y2: bands.optimal[1], fill: 'rgba(79,169,154,0.1)', label: 'Optimal' })
  }
  // Watch — amber tint (finite ranges only)
  if (bands.watch) {
    for (const [w1, w2] of bands.watch) {
      if (w1 !== -Infinity && w2 !== Infinity) {
        result.push({ y1: w1, y2: w2, fill: 'rgba(196,168,91,0.08)' })
      }
    }
  }
  return result
}

// ─── Tab 3: Trends ────────────────────────────────────────────────────────────

const CHART_TYPES   = ['Line', 'Bar', 'Area']
const SECTION_VIEWS = ['Both', 'Controlled', 'Control']
const TIME_RANGES   = [
  { label: 'Last 10', value: 10 },
  { label: 'Last 20', value: 20 },
  { label: 'Last 50', value: 50 },
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

function TrendsTab({ histCtrl, histPlain, stage }) {
  const [activeMetric, setActiveMetric] = useState('temperature_c')
  const [chartType, setChartType]       = useState('Line')
  const [sectionView, setSectionView]   = useState('Both')
  const [timeRange, setTimeRange]       = useState(20)

  const current = METRICS.find(m => m.key === activeMetric) ?? METRICS[0]

  const series = useMemo(() => {
    const len = Math.max(histCtrl.length, histPlain.length)
    const all = Array.from({ length: len }, (_, i) => {
      const c = histCtrl[i]
      const p = histPlain[i]
      return {
        ts:         c?.timestamp ?? p?.timestamp ?? '',
        controlled: c?.[activeMetric] ?? null,
        control:    p?.[activeMetric] ?? null,
      }
    })
    const sliced = all.slice(-timeRange)

    // Detect repeated timestamps — fall back to index labels
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
  }, [histCtrl, histPlain, activeMetric, timeRange])

  const tickInterval = Math.max(1, Math.floor(series.length / 6))
  const thresholdBands = useMemo(() => getThresholdBands(activeMetric, stage), [activeMetric, stage])

  // Insight stats
  const stats = useMemo(() => {
    const compute = (key) => {
      const vals = series.map(d => d[key]).filter(v => v != null)
      if (!vals.length) return null
      const avg  = vals.reduce((a, b) => a + b, 0) / vals.length
      const min  = Math.min(...vals)
      const max  = Math.max(...vals)
      const variance = vals.reduce((s, v) => s + (v - avg) ** 2, 0) / vals.length
      const stability = variance < 1 ? 'Stable' : variance < 10 ? 'Moderate' : 'Variable'
      return { avg, min, max, stability }
    }
    return { controlled: compute('controlled'), control: compute('control') }
  }, [series])

  const showControlled = sectionView !== 'Control'
  const showControl    = sectionView !== 'Controlled'

  const chartProps = {
    data:   series,
    margin: { top: 4, right: 8, bottom: 0, left: 0 },
  }
  const xAxis = (
    <XAxis dataKey="label" tick={{ fill: 'var(--c-tx-muted)', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }} tickLine={false} axisLine={false} interval={tickInterval} />
  )
  const yAxis = (
    <YAxis tick={{ fill: 'var(--c-tx-muted)', fontSize: 10 }} tickLine={false} axisLine={false} width={44} tickFormatter={v => `${v}`} />
  )
  const grid = <CartesianGrid strokeDasharray="2 6" stroke="rgba(255,255,255,0.04)" vertical={false} />
  const tooltip = <Tooltip content={<CustomTooltip unit={current.unit} />} cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }} />

  const refAreas = thresholdBands.map((b, i) => (
    <ReferenceArea key={i} y1={b.y1} y2={b.y2} fill={b.fill} stroke="none" ifOverflow="extendDomain" />
  ))

  function renderChart() {
    if (chartType === 'Bar') return (
      <BarChart {...chartProps}>
        {grid}{xAxis}{yAxis}{tooltip}
        {refAreas}
        {showControlled && <Bar dataKey="controlled" name="Controlled" fill={CONTROLLED_COLOR} radius={[3,3,0,0]} />}
        {showControl    && <Bar dataKey="control"    name="Control"    fill={CONTROL_COLOR}    radius={[3,3,0,0]} />}
      </BarChart>
    )
    if (chartType === 'Area') return (
      <AreaChart {...chartProps}>
        {grid}{xAxis}{yAxis}{tooltip}
        {refAreas}
        {showControlled && <Area dataKey="controlled" name="Controlled" stroke={CONTROLLED_COLOR} fill={CONTROLLED_COLOR} fillOpacity={0.08} strokeWidth={1.8} dot={false} connectNulls />}
        {showControl    && <Area dataKey="control"    name="Control"    stroke={CONTROL_COLOR}    fill={CONTROL_COLOR}    fillOpacity={0.08} strokeWidth={1.8} dot={false} connectNulls />}
      </AreaChart>
    )
    return (
      <LineChart {...chartProps}>
        {grid}{xAxis}{yAxis}{tooltip}
        {refAreas}
        {showControlled && <Line dataKey="controlled" name="Controlled" stroke={CONTROLLED_COLOR} strokeWidth={1.8} dot={false} activeDot={{ r: 4 }} connectNulls />}
        {showControl    && <Line dataKey="control"    name="Control"    stroke={CONTROL_COLOR}    strokeWidth={1.8} dot={false} activeDot={{ r: 4 }} connectNulls />}
      </LineChart>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Controls */}
      <div className="surface" style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
          {/* Metric */}
          <div>
            <p className="label-caps" style={{ marginBottom: 6 }}>Metric</p>
            <div style={{ display: 'flex', gap: 4 }}>
              {METRICS.map(m => (
                <button key={m.key} onClick={() => setActiveMetric(m.key)} style={{
                  padding: '5px 12px', borderRadius: 7, fontSize: 11, fontWeight: 500, cursor: 'pointer', border: 'none',
                  background: activeMetric === m.key ? 'var(--c-accent-dim)' : 'transparent',
                  outline: activeMetric === m.key ? '1px solid var(--c-accent-border)' : '1px solid var(--c-bg-border)',
                  color: activeMetric === m.key ? 'var(--c-tx-primary)' : 'var(--c-tx-muted)',
                }}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          {/* Time range */}
          <div>
            <p className="label-caps" style={{ marginBottom: 6 }}>Time range</p>
            <div style={{ display: 'flex', gap: 4 }}>
              {TIME_RANGES.map(r => (
                <button key={r.value} onClick={() => setTimeRange(r.value)} style={{
                  padding: '5px 12px', borderRadius: 7, fontSize: 11, fontWeight: 500, cursor: 'pointer', border: 'none',
                  background: timeRange === r.value ? 'var(--c-accent-dim)' : 'transparent',
                  outline: timeRange === r.value ? '1px solid var(--c-accent-border)' : '1px solid var(--c-bg-border)',
                  color: timeRange === r.value ? 'var(--c-tx-primary)' : 'var(--c-tx-muted)',
                }}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          {/* Chart type */}
          <div>
            <p className="label-caps" style={{ marginBottom: 6 }}>Chart type</p>
            <div style={{ display: 'flex', gap: 4 }}>
              {CHART_TYPES.map(t => (
                <button key={t} onClick={() => setChartType(t)} style={{
                  padding: '5px 12px', borderRadius: 7, fontSize: 11, fontWeight: 500, cursor: 'pointer', border: 'none',
                  background: chartType === t ? 'var(--c-accent-dim)' : 'transparent',
                  outline: chartType === t ? '1px solid var(--c-accent-border)' : '1px solid var(--c-bg-border)',
                  color: chartType === t ? 'var(--c-tx-primary)' : 'var(--c-tx-muted)',
                }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          {/* Section */}
          <div>
            <p className="label-caps" style={{ marginBottom: 6 }}>View</p>
            <div style={{ display: 'flex', gap: 4 }}>
              {SECTION_VIEWS.map(v => (
                <button key={v} onClick={() => setSectionView(v)} style={{
                  padding: '5px 12px', borderRadius: 7, fontSize: 11, fontWeight: 500, cursor: 'pointer', border: 'none',
                  background: sectionView === v ? 'var(--c-accent-dim)' : 'transparent',
                  outline: sectionView === v ? '1px solid var(--c-accent-border)' : '1px solid var(--c-bg-border)',
                  color: sectionView === v ? 'var(--c-tx-primary)' : 'var(--c-tx-muted)',
                }}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main chart */}
      <div className="surface" style={{ padding: 20 }}>
        <div style={{ marginBottom: 16 }}>
          <h3 className="section-heading">{current.label} Trend</h3>
          <p style={{ fontSize: 12, color: 'var(--c-tx-muted)', marginTop: 3 }}>
            {sectionView === 'Both' ? 'Controlled vs Control' : sectionView} · {current.unit}
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 14, fontSize: 12 }}>
          {showControlled && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 20, borderTop: '2px solid', borderColor: CONTROLLED_COLOR, display: 'inline-block' }} />
              <span style={{ color: 'var(--c-tx-secondary)' }}>Controlled</span>
            </span>
          )}
          {showControl && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 20, borderTop: '2px solid', borderColor: CONTROL_COLOR, display: 'inline-block' }} />
              <span style={{ color: 'var(--c-tx-secondary)' }}>Control</span>
            </span>
          )}
        </div>

        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insight cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          { label: 'Controlled', data: stats.controlled, color: CONTROLLED_COLOR, show: showControlled },
          { label: 'Control',    data: stats.control,    color: CONTROL_COLOR,    show: showControl    },
        ].filter(s => s.show && s.data).map(({ label: secLabel, data, color }) => (
          <div key={secLabel} style={{ background: 'var(--c-bg-elevated)', border: '1px solid var(--c-bg-border)', borderRadius: 10, padding: '14px 16px' }}>
            <p className="label-caps" style={{ marginBottom: 12, color }}>{secLabel}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {[
                ['Average',   `${parseFloat(data.avg.toFixed(2))} ${current.unit}`],
                ['Min',       `${parseFloat(data.min.toFixed(2))} ${current.unit}`],
                ['Max',       `${parseFloat(data.max.toFixed(2))} ${current.unit}`],
                ['Stability', data.stability],
              ].map(([lbl, val]) => (
                <div key={lbl}>
                  <p className="label-caps" style={{ fontSize: 9, marginBottom: 4 }}>{lbl}</p>
                  <p style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'var(--c-tx-primary)' }}>{val}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main History Page ────────────────────────────────────────────────────────

const TABS = [
  { key: 'summary', label: 'Summary' },
  { key: 'records', label: 'Records' },
  { key: 'trends',  label: 'Trends'  },
]

export default function History() {
  const { settings } = useSettings()
  const { historyControlled: histCtrl, historyControl: histPlain, loading } = useData()
  const [activeTab, setActiveTab] = useState('summary')

  const pairs = useMemo(() => pairReadings(histCtrl, histPlain), [histCtrl, histPlain])
  const stage = settings.growthStage

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ height: 120, background: 'var(--c-bg-elevated)', borderRadius: 12, animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
    )
  }

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--c-bg-elevated)', padding: 4, borderRadius: 10, width: 'fit-content', border: '1px solid var(--c-bg-border)' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: '8px 22px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none',
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

      {/* Tab content */}
      {activeTab === 'summary' && <SummaryTab histCtrl={histCtrl} histPlain={histPlain} stage={stage} />}
      {activeTab === 'records' && <RecordsTab pairs={pairs} stage={stage} />}
      {activeTab === 'trends'  && <TrendsTab  histCtrl={histCtrl} histPlain={histPlain} stage={stage} />}
    </div>
  )
}
