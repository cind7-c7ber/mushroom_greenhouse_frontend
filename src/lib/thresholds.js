// Growth-stage-aware threshold logic for oyster mushroom monitoring
// Each metric has optimal, watch, and danger bands per stage.
// Moisture is excluded — treat as locally calibrated only.

export const STAGES = {
  incubation: {
    key:         'incubation',
    label:       'Incubation',
    description: 'Spawn run — mycelium colonisation phase',
    thresholds: {
      temperature_c: {
        optimal: [22, 26],
        watch:   [[20, 21.9], [26.1, 28]],
        danger:  [[-Infinity, 19.9], [28.1, Infinity]],
      },
      humidity_pct: {
        optimal: [80, 90],
        watch:   [[75, 79.9], [90.1, 95]],
        danger:  [[-Infinity, 74.9], [95.1, Infinity]],
      },
      co2_ppm: {
        optimal: [5000, 20000],
        watch:   [[2000, 4999], [20001, 25000]],
        danger:  [[-Infinity, 1999], [25001, Infinity]],
      },
      light_lux: {
        optimal: [0, 20],
        watch:   [[21, 100]],
        danger:  [[100.1, Infinity]],
      },
    },
  },

  fruiting: {
    key:         'fruiting',
    label:       'Fruiting',
    description: 'Cropping / pinning stage',
    thresholds: {
      temperature_c: {
        optimal: [18, 24],
        watch:   [[15, 17.9], [24.1, 26]],
        danger:  [[-Infinity, 14.9], [26.1, Infinity]],
      },
      humidity_pct: {
        optimal: [85, 95],
        watch:   [[80, 84.9], [95.1, 97]],
        danger:  [[-Infinity, 79.9], [97.1, Infinity]],
      },
      co2_ppm: {
        optimal: [0, 700],
        watch:   [[700, 1000]],
        danger:  [[1000.1, Infinity]],
      },
      light_lux: {
        optimal: [100, 200],
        watch:   [[50, 99], [201, 300]],
        danger:  [[-Infinity, 49.9], [300.1, Infinity]],
      },
    },
  },
}

/**
 * Returns 'optimal' | 'watch' | 'danger' | 'uncalibrated' | 'unknown'
 */
export function getMetricStatus(metric, value, stage) {
  if (metric === 'moisture_pct') return 'uncalibrated'
  if (value === null || value === undefined || isNaN(value)) return 'unknown'

  const stageDef = STAGES[stage]
  if (!stageDef) return 'unknown'

  const bands = stageDef.thresholds[metric]
  if (!bands) return 'unknown'

  const [optMin, optMax] = bands.optimal
  if (value >= optMin && value <= optMax) return 'optimal'

  for (const [wMin, wMax] of bands.watch) {
    if (value >= wMin && value <= wMax) return 'watch'
  }

  return 'danger'
}

export const STATUS_META = {
  optimal:       { label: 'Optimal',      color: '#81C784', bg: 'rgba(129,199,132,0.12)', border: 'rgba(129,199,132,0.3)' },
  watch:         { label: 'Monitor',      color: '#38BDF8', bg: 'rgba(56,189,248,0.12)',  border: 'rgba(56,189,248,0.3)'  },
  danger:        { label: 'Needs Action', color: '#F87171', bg: 'rgba(248,113,113,0.12)',  border: 'rgba(248,113,113,0.3)'  },
  uncalibrated:  { label: 'Calibrating', color: '#81C784', bg: 'rgba(129,199,132,0.12)',  border: 'rgba(129,199,132,0.3)' },
  unknown:       { label: '—',            color: '#64748B', bg: 'transparent',             border: 'transparent'           },
}

/**
 * Generate a short readable note for a metric + status + stage combo
 */
export function getMetricNote(metric, status, stage) {
  const NOTES = {
    temperature_c: {
      optimal: 'Temperature is within the ideal range for this stage.',
      watch:   'Temperature is slightly outside the optimal range. Monitor closely.',
      danger:  'Temperature is outside safe limits. Immediate attention required.',
    },
    humidity_pct: {
      optimal: 'Humidity is well maintained for this stage.',
      watch:   'Humidity is drifting from the ideal range.',
      danger:  'Humidity is critically out of range.',
    },
    co2_ppm: {
      optimal: 'CO\u2082 levels are appropriate for this stage.',
      watch:   'CO\u2082 is approaching an unfavourable level.',
      danger:  'CO\u2082 is at a critical level — check ventilation.',
    },
    light_lux: {
      optimal: 'Light exposure is suitable for this stage.',
      watch:   'Light levels are outside the preferred band.',
      danger:  'Light exposure is critically outside the safe range.',
    },
    moisture_pct: {
      optimal: 'Substrate moisture within expected range.',
      watch:   'Substrate moisture may need adjustment.',
      danger:  'Substrate moisture at critical level.',
    },
  }

  if (status === 'uncalibrated') return 'Moisture sensor is locally calibrated — thresholds not applied.'
  if (status === 'unknown') return 'Insufficient data to evaluate.'
  return NOTES[metric]?.[status] ?? ''
}

/**
 * Evaluate a full sensor reading object and return per-metric statuses
 */
export function evaluateReading(data, stage) {
  const metrics = ['temperature_c', 'humidity_pct', 'co2_ppm', 'light_lux', 'moisture_pct']
  const result = {}
  for (const m of metrics) {
    result[m] = getMetricStatus(m, data?.[m], stage)
  }
  return result
}

/**
 * Derive overall section status from individual metric statuses
 */
export function overallStatus(metricStatuses) {
  const vals = Object.values(metricStatuses)
  if (vals.includes('danger'))  return 'danger'
  if (vals.includes('watch'))   return 'watch'
  if (vals.every(v => v === 'optimal' || v === 'uncalibrated')) return 'optimal'
  return 'watch'
}
