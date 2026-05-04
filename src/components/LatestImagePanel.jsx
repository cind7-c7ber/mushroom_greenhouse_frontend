import { useState } from 'react'

function EmptyState({ message, detail }) {
  return (
    <div className="h-52 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-bg-border rounded-xl">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-tx-muted opacity-40">
        <rect x="2" y="5" width="24" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="9" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2.5 20.5L8.5 14L12.5 18.5L17 13.5L25.5 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="text-xs text-tx-muted text-center">{message}</p>
      {detail && <p className="text-[11px] text-tx-muted opacity-60 text-center">{detail}</p>}
    </div>
  )
}

export default function LatestImagePanel({ imageData, loading, title, subtitle, capturedAt }) {
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  if (loading) {
    return (
      <div className="surface p-5">
        <div className="h-5 w-32 bg-bg-elevated rounded animate-pulse mb-4" />
        <div className="h-64 bg-bg-elevated rounded-lg animate-pulse" />
      </div>
    )
  }

  const imageUrl = imageData?.image_url ?? null
  const storagePath = imageData?.storage_path ?? null
  const filename = imageData?.image_filename ?? null
  const uploadStatus = imageData?.upload_status ?? null

  return (
    <div className="surface p-6 flex flex-col h-full">
      {(title || subtitle || capturedAt) && (
        <div className="flex items-center justify-between mb-6">
          <div>
            {title && <h2 className="text-xl font-bold text-tx-primary">{title}</h2>}
            {subtitle && <p className="text-sm text-tx-muted mt-1">{subtitle}</p>}
          </div>
          {capturedAt && (
            <div className="text-right">
              <p className="label-caps text-[10px] opacity-60">CAPTURED</p>
              <p className="text-xs font-bold text-tx-secondary mt-0.5">{capturedAt}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="section-heading text-[11px] opacity-80">LATEST SNAPSHOT</h3>
        </div>
        {filename && (
          <span className="text-[11px] font-mono text-tx-muted truncate max-w-[200px]">
            {filename}
          </span>
        )}
      </div>

      <div className="relative flex-1 bg-bg-base rounded-xl overflow-hidden border border-bg-border group">
        {imageUrl && !imgError ? (
          <>
            {!imgLoaded && <div className="absolute inset-0 bg-bg-elevated animate-pulse" />}
            <img
              src={imageUrl}
              alt="Latest greenhouse snapshot"
              className="w-full h-full object-cover"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
            {imgLoaded && (
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-white hover:bg-black/60 transition-colors"
              >
                View full
              </a>
            )}
          </>
        ) : (
          <EmptyState
            message="No image preview available"
            detail={storagePath ? `Path: ${storagePath}` : 'Awaiting snapshot...'}
          />
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-bg-border text-[11px] text-tx-muted space-y-2">
        <div className="flex items-center">
          <span className="label-caps text-[9px] w-20 opacity-60">STORAGE</span>
          <span className="font-mono truncate">{storagePath || '—'}</span>
        </div>
        <div className="flex items-center">
          <span className="label-caps text-[9px] w-20 opacity-60">STATUS</span>
          <span className="font-mono">{uploadStatus || '—'}</span>
        </div>
      </div>
    </div>
  )
}
