import { useState } from 'react'
import { useData } from '../context/DataContext'

function ImageCard({ item }) {
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const ts = item.capture_timestamp
    ? new Date(item.capture_timestamp).toLocaleString('en-GB', {
        day: 'numeric', month: 'short',
        hour: '2-digit', minute: '2-digit',
      })
    : '—'

  return (
    <div className="surface-elevated rounded-lg overflow-hidden">
      <div className="relative bg-bg-base h-44">
        {item.image_url && !error ? (
          <>
            {!loaded && <div className="absolute inset-0 bg-bg-elevated animate-pulse" />}
            <img
              src={item.image_url}
              alt={item.image_filename ?? 'Growth image'}
              className="w-full h-full object-cover"
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
            />
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-tx-muted opacity-30">
              <rect x="3" y="6" width="26" height="20" rx="3" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="11" cy="13" r="3" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M3.5 26L10 18.5L15 23L21 17L28.5 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>
      <div className="px-3 py-2.5 border-t border-bg-border">
        <p className="text-xs text-tx-primary truncate">{item.image_filename ?? 'Unknown file'}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] font-mono text-tx-muted">{ts}</span>
          <span className="label-caps text-[9px] px-1.5 py-0.5 bg-bg-base rounded border border-bg-border">
            {item.section ?? '—'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function Media() {
  const { imageData: latest, imageHistory: history, loading } = useData()

  const streamUrl = latest?.stream_url ?? null

  return (
    <div className="page-content space-y-6">
      {/* Stream status */}
      <div className="surface p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="section-heading">Camera Stream</h3>
            <p className="text-xs text-tx-muted mt-0.5">Live camera feed via MQTT-reported URL</p>
          </div>
          <span className={`flex items-center gap-2 text-xs font-medium ${streamUrl ? 'text-online' : 'text-tx-muted'}`}>
            <span className={`status-dot ${streamUrl ? 'bg-online animate-pulse' : 'bg-bg-border'}`} />
            {streamUrl ? 'Stream online' : 'No stream'}
          </span>
        </div>

        {streamUrl ? (
          <div className="flex items-center gap-4 p-4 rounded-lg bg-bg-base border border-bg-border">
            <div className="flex-1 min-w-0">
              <p className="label-caps mb-1">Stream URL</p>
              <p className="text-xs font-mono text-tx-secondary break-all">{streamUrl}</p>
            </div>
            <a
              href={streamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 px-4 py-2 rounded-lg border border-amethyst/50 bg-accent-dim text-xs font-semibold text-tx-primary hover:bg-amethyst/20 transition-colors"
            >
              Open Stream
            </a>
          </div>
        ) : (
          <div className="py-6 text-center border border-dashed border-bg-border rounded-lg">
            <p className="text-sm text-tx-muted">No stream URL received yet</p>
            <p className="text-xs text-tx-muted mt-1 opacity-60">
              The stream URL is delivered via MQTT payload from the Raspberry Pi camera
            </p>
          </div>
        )}
      </div>

      {/* Latest image */}
      {latest && (
        <div>
          <p className="label-caps mb-3">Latest Image</p>
          <div className="surface p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              <div className="rounded-lg overflow-hidden bg-bg-base h-64">
                {latest.image_url ? (
                  <img
                    src={latest.image_url}
                    alt={latest.image_filename ?? 'Latest'}
                    className="w-full h-full object-cover"
                    onError={e => { e.currentTarget.style.display = 'none' }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-tx-muted text-xs">
                    No image available
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {[
                  ['Filename',  latest.image_filename ?? '—'],
                  ['Section',   latest.section ?? '—'],
                  ['Captured',  latest.capture_timestamp
                    ? new Date(latest.capture_timestamp).toLocaleString('en-GB')
                    : '—'],
                  ['Status',    latest.upload_status ?? '—'],
                  ['Notes',     latest.notes ?? '—'],
                ].map(([key, val]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-bg-border last:border-0">
                    <span className="label-caps text-[10px]">{key}</span>
                    <span className="text-xs text-tx-secondary font-mono text-right max-w-[60%] truncate">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image history */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="label-caps">Image History</p>
          {!loading && <span className="text-xs text-tx-muted">{history.length} records</span>}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-52 bg-bg-elevated rounded-lg animate-pulse" />
            ))}
          </div>
        ) : history.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {history.map((item, i) => <ImageCard key={item.id ?? i} item={item} />)}
          </div>
        ) : (
          <div className="py-10 text-center border border-dashed border-bg-border rounded-lg">
            <p className="text-sm text-tx-muted">No image history available</p>
          </div>
        )}
      </div>
    </div>
  )
}
