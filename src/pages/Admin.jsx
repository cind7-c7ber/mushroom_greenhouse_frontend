import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'

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

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-3 border-b border-bg-border last:border-0 gap-4">
      <span className="label-caps text-[10px]">{label}</span>
      <span className="text-xs text-tx-secondary font-mono text-right max-w-[65%] break-words">{value ?? '—'}</span>
    </div>
  )
}

export default function Admin() {
  const { user } = useAuth()
  const { status, syncHealth, alertSummary, lastUpdated } = useData()

  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL || 'Not configured'

  return (
    <div className="page-content space-y-5">
      <SectionBlock
        title="Administrator Session"
        description="Authenticated administrator identity and access state"
      >
        <InfoRow label="Username" value={user?.username} />
        <InfoRow label="Email" value={user?.email} />
        <InfoRow label="Role" value={user?.role} />
      </SectionBlock>

      <SectionBlock
        title="Backend Connection"
        description="Cloud-hosted backend service currently used by the frontend"
      >
        <InfoRow label="Backend Base URL" value={backendBaseUrl} />
        <InfoRow label="Deployment Mode" value="Render-hosted FastAPI backend" />
        <InfoRow label="Authentication" value="JWT-protected API access" />
      </SectionBlock>

      <SectionBlock
        title="Telemetry Sync Health"
        description="Status of telemetry ingestion source availability"
      >
        <InfoRow label="Status" value={syncHealth?.status} />
        <InfoRow label="Source URL" value={syncHealth?.source_url} />
        <InfoRow label="Last Successful Sync" value={syncHealth?.last_successful_sync} />
        <InfoRow label="Last Failed Sync" value={syncHealth?.last_failed_sync} />
        <InfoRow label="Last Error" value={syncHealth?.last_error} />
      </SectionBlock>

      <SectionBlock
        title="Alert Overview"
        description="Current alert counts from the backend alert engine"
      >
        <InfoRow label="Active Alerts" value={alertSummary?.active_total} />
        <InfoRow label="Critical Alerts" value={alertSummary?.critical_total} />
        <InfoRow label="Watch Alerts" value={alertSummary?.watch_total} />
        <InfoRow label="Latest Alert Timestamp" value={alertSummary?.latest_timestamp} />
      </SectionBlock>

      <SectionBlock
        title="System Status"
        description="Latest backend-reported greenhouse status record"
      >
        <InfoRow label="Status Type" value={status?.status_type} />
        <InfoRow label="Status Value" value={status?.status_value} />
        <InfoRow label="Message" value={status?.message} />
        <InfoRow label="Source" value={status?.source} />
        <InfoRow label="Timestamp" value={status?.timestamp} />
        <InfoRow label="Last Frontend Refresh" value={lastUpdated ? lastUpdated.toLocaleString('en-GB') : '—'} />
      </SectionBlock>
    </div>
  )
}