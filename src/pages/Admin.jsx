import { useState } from 'react'
import { useSettings } from '../context/SettingsContext'

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-start justify-between py-4 border-b border-bg-border last:border-0 gap-6">
      <div className="min-w-0">
        <p className="text-sm font-medium text-tx-primary">{label}</p>
        {description && <p className="text-xs text-tx-muted mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

function SectionBlock({ title, description, children }) {
  return (
    <div className="surface p-5">
      <div className="mb-4 pb-4 border-b border-bg-border">
        <h3 className="section-heading">{title}</h3>
        {description && <p className="text-xs text-tx-muted mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )
}

const POLL_OPTIONS = [
  { label: '3 seconds',  value: 3000  },
  { label: '5 seconds',  value: 5000  },
  { label: '10 seconds', value: 10000 },
  { label: '30 seconds', value: 30000 },
  { label: '60 seconds', value: 60000 },
]

const HISTORY_OPTIONS = [
  { label: '10 readings', value: 10 },
  { label: '20 readings', value: 20 },
  { label: '50 readings', value: 50 },
]

export default function Admin() {
  const { settings, updateSetting, resetSettings, DEFAULTS } = useSettings()
  const [backendInput, setBackendInput] = useState(settings.backendUrl)
  const [saved, setSaved] = useState(false)

  function handleSaveBackend() {
    updateSetting('backendUrl', backendInput.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleReset() {
    resetSettings()
    setBackendInput(DEFAULTS.backendUrl)
  }

  return (
    <div className="page-content space-y-5">
      {/* Polling & Refresh */}
      <SectionBlock
        title="Data Polling"
        description="Controls how frequently the frontend requests data from the backend"
      >
        <SettingRow
          label="Poll Interval"
          description="How often the dashboard fetches new sensor readings"
        >
          <select
            value={settings.pollIntervalMs}
            onChange={e => updateSetting('pollIntervalMs', Number(e.target.value))}
            className="bg-bg-base border border-bg-border text-tx-primary text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amethyst"
          >
            {POLL_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </SettingRow>

        <SettingRow
          label="History Display Limit"
          description="Number of historical readings shown in charts"
        >
          <select
            value={settings.historyLimit}
            onChange={e => updateSetting('historyLimit', Number(e.target.value))}
            className="bg-bg-base border border-bg-border text-tx-primary text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amethyst"
          >
            {HISTORY_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </SettingRow>
      </SectionBlock>

      {/* Backend connection */}
      <SectionBlock
        title="Backend Connection"
        description="FastAPI backend address. Vite proxies /api/* in development — this setting applies to production builds."
      >
        <SettingRow
          label="Backend Base URL"
          description="Used for direct API access outside of dev proxy"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={backendInput}
              onChange={e => setBackendInput(e.target.value)}
              placeholder="http://localhost:8000"
              className="bg-bg-base border border-bg-border text-tx-primary text-xs rounded-lg px-3 py-2 w-64 font-mono focus:outline-none focus:border-amethyst placeholder-tx-muted"
            />
            <button
              onClick={handleSaveBackend}
              className="px-3 py-2 rounded-lg bg-accent-dim border border-accent-border text-xs font-semibold text-tx-primary hover:bg-amethyst/20 transition-colors"
            >
              {saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </SettingRow>
      </SectionBlock>

      {/* API reference */}
      <SectionBlock
        title="API Reference"
        description="Backend endpoints consumed by this frontend"
      >
        <div className="space-y-0">
          {[
            ['GET', '/api/sensors/latest/controlled', 'Latest controlled section reading'],
            ['GET', '/api/sensors/latest/control',    'Latest control section reading'    ],
            ['GET', '/api/sensors/history/{section}', 'Historical readings for a section' ],
            ['GET', '/api/status/latest',             'Latest system status'              ],
            ['GET', '/api/status/history',            'System status history'             ],
            ['GET', '/api/images/latest',             'Latest growth image metadata'      ],
            ['GET', '/api/images/history',            'Image history records'             ],
          ].map(([method, path, desc]) => (
            <div key={path} className="flex items-start gap-4 py-3 border-b border-bg-border last:border-0">
              <span className="label-caps text-[9px] px-1.5 py-0.5 bg-accent-dim border border-accent-border rounded text-amethyst flex-shrink-0">
                {method}
              </span>
              <code className="text-xs font-mono text-tx-secondary flex-shrink-0 w-72">{path}</code>
              <span className="text-xs text-tx-muted">{desc}</span>
            </div>
          ))}
        </div>
      </SectionBlock>

      {/* System info */}
      <SectionBlock title="System Information" description="Frontend build metadata">
        <div className="space-y-0">
          {[
            ['Frontend stack',    'React 18 · Vite · Tailwind CSS · Recharts'],
            ['Data transport',    'HTTP polling via Axios (no WebSocket)'],
            ['Data source',       'MQTT → FastAPI → Supabase'],
            ['Current interval',  `${settings.pollIntervalMs / 1000}s`],
            ['History limit',     `${settings.historyLimit} readings`],
          ].map(([key, val]) => (
            <div key={key} className="flex justify-between py-3 border-b border-bg-border last:border-0">
              <span className="label-caps text-[10px]">{key}</span>
              <span className="text-xs text-tx-secondary font-mono">{val}</span>
            </div>
          ))}
        </div>
      </SectionBlock>

      {/* Reset */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleReset}
          className="px-4 py-2 text-xs font-medium text-tx-muted border border-bg-border rounded-lg hover:border-offline/50 hover:text-offline transition-colors"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  )
}
