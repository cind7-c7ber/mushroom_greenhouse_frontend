import { useState } from 'react'
import { useData } from '../context/DataContext'

function ImageCard({ item }) {
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const ts = item.capture_timestamp
    ? new Date(item.capture_timestamp).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
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
          <div className="h-full flex items-center justify-center px-4 text-center">
            <div>
              <p className="text-xs text-tx-muted">No preview available</p>
              {item.storage_path && (
                <p className="text-[10px] font-mono text-tx-muted mt-2 break-all">{item.storage_path}</p>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="px-3 py-3 border-t border-bg-border">
        <p className="text-[13px] font-semibold text-tx-primary truncate">{item.image_filename ?? 'Unknown file'}</p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[11px] font-medium font-mono text-tx-muted">{ts}</span>
          <span className="label-caps text-[10px] px-2 py-0.5 bg-bg-base rounded border border-bg-border">
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
      <div className="surface overflow-hidden">
        <div className="px-5 py-3.5 bg-bg-elevated border-b border-bg-border flex items-center justify-between">
          <h3 className="label-caps text-[16px] font-extrabold tracking-widest text-tx-secondary">
            Camera Stream
          </h3>
          <span className={`flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider ${streamUrl ? 'text-online' : 'text-tx-muted'}`}>
            <span className={`w-2 h-2 rounded-full ${streamUrl ? 'bg-online animate-pulse' : 'bg-bg-border'}`} />
            {streamUrl ? 'Live' : 'Offline'}
          </span>
        </div>

        <div className="p-5">
          <p className="text-xs text-tx-muted mb-4">Live MJPEG stream from the greenhouse camera</p>

          <div className="relative aspect-video bg-bg-base rounded-xl overflow-hidden border border-bg-border group">
            {streamUrl ? (
              <>
                <img
                  src={streamUrl}
                  alt="Live Camera Feed"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                {/* Overlay Controls */}
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-online animate-pulse" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">LIVE STREAM</span>
                </div>
                
                <a
                  href={streamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-4 right-4 px-4 py-2 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 text-xs font-semibold text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                >
                  Expand Stream ↗
                </a>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-bg-elevated flex items-center justify-center mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-tx-muted opacity-30">
                    <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.934a.5.5 0 0 0-.777-.416L16 11" />
                    <rect x="2" y="6" width="14" height="12" rx="3" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-tx-secondary">Camera Offline</p>
                <p className="text-xs text-tx-muted mt-1 max-w-[240px]">
                  The live feed will automatically appear once the greenhouse camera is back online.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {latest && (
        <div className="surface overflow-hidden">
          <div className="px-5 py-3.5 bg-bg-elevated border-b border-bg-border">
            <h3 className="label-caps text-[16px] font-extrabold tracking-widest text-tx-secondary">
              Latest Growth Documentation
            </h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              <div className="rounded-lg overflow-hidden bg-bg-base h-64">
                {latest.image_url ? (
                  <img
                    src={latest.image_url}
                    alt={latest.image_filename ?? 'Latest'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-tx-muted text-xs px-4 text-center">
                    {latest.storage_path ? `Stored path: ${latest.storage_path}` : 'No image available'}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {[
                  ['Filename', latest.image_filename ?? '—'],
                  ['Section', latest.section ?? '—'],
                  [
                    'Captured',
                    latest.capture_timestamp ? new Date(latest.capture_timestamp).toLocaleString('en-GB') : '—',
                  ],
                  ['Upload Status', latest.upload_status ?? '—'],
                  ['Storage Path', latest.storage_path ?? '—'],
                  ['Notes', latest.notes ?? '—'],
                ].map(([key, val]) => (
                  <div key={key} className="flex justify-between py-2.5 border-b border-bg-border last:border-0">
                    <span className="label-caps text-[11px]">{key}</span>
                    <span className="text-sm text-tx-secondary font-mono text-right max-w-[60%] truncate">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="surface overflow-hidden">
        <div className="px-5 py-3.5 bg-bg-elevated border-b border-bg-border flex items-center justify-between">
          <h3 className="label-caps text-[16px] font-extrabold tracking-widest text-tx-secondary">
            Snapshot History
          </h3>
          {!loading && <span className="text-[12px] font-bold text-tx-muted uppercase tracking-wider">{history.length} items</span>}
        </div>
        <div className="p-5">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-52 bg-bg-elevated rounded-lg animate-pulse" />
              ))}
            </div>
          ) : history.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {history.map((item, i) => (
                <ImageCard key={item.id ?? i} item={item} />
              ))}
            </div>
          ) : (
            <div className="py-10 text-center border border-dashed border-bg-border rounded-lg">
              <p className="text-sm text-tx-muted">No image history available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}