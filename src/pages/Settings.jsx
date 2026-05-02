import { useTheme }    from '../context/ThemeContext'
import { useSettings } from '../context/SettingsContext'
import { STAGES }      from '../lib/thresholds'

const POLL_OPTIONS = [
  { label: '3 seconds',  value: 3000  },
  { label: '5 seconds',  value: 5000  },
  { label: '10 seconds', value: 10000 },
  { label: '30 seconds', value: 30000 },
]

function SettingRow({ label, description, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--c-bg-border)', gap: 24 }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--c-tx-primary)' }}>{label}</p>
        {description && <p style={{ fontSize: 12, color: 'var(--c-tx-muted)', marginTop: 3 }}>{description}</p>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

function SectionBlock({ title, children }) {
  return (
    <div className="surface" style={{ padding: 20 }}>
      <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--c-bg-border)' }}>
        <h3 className="section-heading">{title}</h3>
      </div>
      <div style={{ marginTop: -4 }}>{children}</div>
    </div>
  )
}

export default function Settings() {
  const { theme, setDark, setLight } = useTheme()
  const { settings, updateSetting }  = useSettings()

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Appearance */}
      <SectionBlock title="Appearance">
        <SettingRow label="Theme" description="Switch between dark and light interface mode">
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={setDark}
              style={{
                padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                background: theme === 'dark' ? 'var(--c-accent-dim)' : 'transparent',
                border: theme === 'dark' ? '1px solid var(--c-accent-border)' : '1px solid var(--c-bg-border)',
                color: theme === 'dark' ? 'var(--c-tx-primary)' : 'var(--c-tx-muted)',
                transition: 'all 0.15s',
              }}
            >
              Dark
            </button>
            <button
              onClick={setLight}
              style={{
                padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                background: theme === 'light' ? 'var(--c-accent-dim)' : 'transparent',
                border: theme === 'light' ? '1px solid var(--c-accent-border)' : '1px solid var(--c-bg-border)',
                color: theme === 'light' ? 'var(--c-tx-primary)' : 'var(--c-tx-muted)',
                transition: 'all 0.15s',
              }}
            >
              Light
            </button>
          </div>
        </SettingRow>
      </SectionBlock>

      {/* Growth stage */}
      <SectionBlock title="Growth Stage">
        <SettingRow
          label="Default monitoring stage"
          description="Sets the threshold context used for status evaluation on the dashboard and history views"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 220 }}>
            {Object.values(STAGES).map(s => (
              <button
                key={s.key}
                onClick={() => updateSetting('growthStage', s.key)}
                style={{
                  padding: '9px 14px', borderRadius: 8, textAlign: 'left', cursor: 'pointer',
                  background: settings.growthStage === s.key ? 'var(--c-accent-dim)' : 'transparent',
                  border: settings.growthStage === s.key ? '1px solid var(--c-accent-border)' : '1px solid var(--c-bg-border)',
                  transition: 'all 0.15s',
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-tx-primary)' }}>{s.label}</p>
                <p style={{ fontSize: 11, color: 'var(--c-tx-muted)', marginTop: 2 }}>{s.description}</p>
              </button>
            ))}
          </div>
        </SettingRow>

        {/* Threshold reference table */}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--c-bg-border)' }}>
          <p className="label-caps" style={{ marginBottom: 12 }}>Threshold reference — {STAGES[settings.growthStage]?.label}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
            {[
              { key: 'temperature_c', label: 'Temperature', unit: '°C' },
              { key: 'humidity_pct',  label: 'Humidity',    unit: '%'  },
              { key: 'co2_ppm',       label: 'CO\u2082',   unit: 'ppm'},
              { key: 'light_lux',     label: 'Light',       unit: 'lux'},
            ].map(({ key, label, unit }) => {
              const bands = STAGES[settings.growthStage]?.thresholds[key]
              if (!bands) return null
              const [optMin, optMax] = bands.optimal
              return (
                <div key={key} style={{ background: 'var(--c-bg-base)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--c-bg-border)' }}>
                  <p className="label-caps" style={{ marginBottom: 8 }}>{label}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                      <span style={{ color: '#4FA99A' }}>Optimal</span>
                      <span style={{ color: 'var(--c-tx-secondary)', fontFamily: 'monospace' }}>{optMin}–{optMax} {unit}</span>
                    </div>
                    {bands.watch.map(([wMin, wMax], i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                        <span style={{ color: '#C4A85B' }}>Watch</span>
                        <span style={{ color: 'var(--c-tx-muted)', fontFamily: 'monospace' }}>
                          {isFinite(wMin) ? wMin : '<'}{isFinite(wMin) && isFinite(wMax) ? `–${wMax}` : ''} {unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          <p style={{ fontSize: 11, color: 'var(--c-tx-muted)', marginTop: 10 }}>
            Moisture sensor is locally calibrated — no universal threshold applied.
          </p>
        </div>
      </SectionBlock>

      {/* Data polling */}
      <SectionBlock title="Data Polling">
        <SettingRow label="Poll interval" description="How often the dashboard fetches new readings from the backend">
          <select
            value={settings.pollIntervalMs}
            onChange={e => updateSetting('pollIntervalMs', Number(e.target.value))}
            className="input-field"
            style={{ width: 'auto', minWidth: 140 }}
          >
            {POLL_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </SettingRow>
      </SectionBlock>
    </div>
  )
}
