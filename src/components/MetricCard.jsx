import { STATUS_META } from '../lib/thresholds'

const METRIC_META = {
  temperature_c: { 
    label: 'Temperature',      
    unit: '°C',  
    icon: (color) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>
      </svg>
    )
  },
  humidity_pct:  { 
    label: 'Humidity',          
    unit: '%',   
    icon: (color) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
      </svg>
    )
  },
  co2_ppm:       { 
    label: 'CO₂',          
    unit: 'ppm', 
    icon: (color) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.5 19a3.5 3.5 0 1 1-5.83-2.61a5 5 0 0 1-1.67-4.39a3.5 3.5 0 1 1 5-4.4a5 5 0 0 1 2.5 4.4a3.5 3.5 0 1 1 0 7Z"/>
      </svg>
    )
  },
  light_lux:     { 
    label: 'Light',             
    unit: 'lux', 
    icon: (color) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
      </svg>
    )
  },
  moisture_pct:  { 
    label: 'Moisture',
    unit: '%',   
    icon: (color) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 20l3-8 2 5h10"/><path d="M10 20c-2-5-2-7-2-10a8 8 0 0 1 16 0c0 3 0 5-2 10z"/>
      </svg>
    )
  },
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
  else                 { return null } // Don't show anything for neutral trends to keep it clean

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 2, 
      fontSize: 11, 
      fontWeight: 800, 
      color,
      background: 'rgba(255,255,255,0.05)',
      padding: '2px 6px',
      borderRadius: 4,
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      {symbol} {Math.abs(diff).toFixed(1)}
    </div>
  )
}

export default function MetricCard({ metric, value, status = 'unknown', prevValue }) {
  const meta       = METRIC_META[metric] ?? { label: metric, unit: '', icon: () => null }
  const statusMeta = STATUS_META[status]  ?? STATUS_META.unknown
  
  const display    = value !== null && value !== undefined
    ? String(parseFloat(Number(value).toFixed(1)))
    : '—'

  return (
    <div style={{
      position: 'relative', 
      borderRadius: 16, 
      overflow: 'hidden',
      background: status === 'optimal' ? 'rgba(79,169,154,0.05)' : statusMeta.bg,
      border: `1px solid ${status === 'optimal' ? 'rgba(79,169,154,0.15)' : statusMeta.border}`,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      transition: 'all 0.2s ease',
    }}>
      <div style={{ padding: '18px 20px' }}>
        {/* Row 1: Status Badge at the top */}
        <div style={{ display: 'flex', marginBottom: 14 }}>
          <span style={{
            fontSize: 9, 
            fontWeight: 900, 
            letterSpacing: '0.1em', 
            textTransform: 'uppercase',
            padding: '4px 10px', 
            borderRadius: 6,
            background: statusMeta.bg,
            border: `1px solid ${statusMeta.border}`,
            color: statusMeta.color,
          }}>
            {statusMeta.label}
          </span>
        </div>

        {/* Row 2: Icon + [Label + Value] + Trend */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
             <div style={{ 
               padding: 6, 
               borderRadius: 8, 
               background: 'rgba(255,255,255,0.04)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center'
             }}>
               {meta.icon(statusMeta.color)}
             </div>
             
             <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 0 }}>
               <p className="label-caps" style={{ 
                 fontSize: 14, 
                 fontVariant: 'small-caps', 
                 fontWeight: 800, 
                 color: 'var(--c-tx-secondary)',
                 whiteSpace: 'nowrap'
               }}>
                 {meta.label}
               </p>
               <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, flexShrink: 0 }}>
                 <span style={{ 
                   fontSize: 22, 
                   fontFamily: 'var(--font-display)',
                   fontWeight: 800, 
                   fontVariantNumeric: 'tabular-nums', 
                   letterSpacing: '-0.02em', 
                   lineHeight: 1, 
                   color: statusMeta.color 
                 }}>
                   {display}
                 </span>
                 <span style={{ fontSize: 12, color: statusMeta.color, fontWeight: 700, opacity: 0.8, whiteSpace: 'nowrap' }}>{meta.unit}</span>
               </div>
             </div>
          </div>
          <TrendArrow metric={metric} value={value} prevValue={prevValue} />
        </div>
      </div>
    </div>
  )
}
