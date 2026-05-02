import { useState } from 'react'

function EmptyState({ message, detail }) {
  return (
    <div className="h-52 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-bg-border rounded-lg">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-tx-muted opacity-40">
        <rect x="2" y="5" width="24" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="9" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M2.5 20.5L8.5 14L12.5 18.5L17 13.5L25.5 22"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className="text-xs text-tx-muted text-center">{message}</p>
      {detail && <p className="text-[11px] text-tx-muted opacity-60 text-center">{detail}</p>}
    </div>
  )
}

function StreamPanel({ streamUrl }) {
  const [streamError, setStreamError] = useState(false)
  const [streamLoaded, setStreamLoaded] = useState(false)

  if (!streamUrl) {
    return (
      <EmptyState
        message="No stream URL configured"
        detail="The stream will appear when a live backend stream URL is available."
      />
    )
  }

  if (streamError) {
    return (
      <div className="h-52 flex flex-col items-center justify-center gap-3">
        <EmptyState message="Stream could not be loaded" detail={streamUrl} />
        <a
          href={streamUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-bg-border bg-bg-elevated text-xs font-semibold text-tx-primary hover:border-amethyst transition-colors"
        >
          Open Livestream
        </a>
      </div>
    )
  }

  return (
    <div className="relative h-52 bg-bg-elevated">
      {!streamLoaded && <div className="absolute inset-0 animate-pulse bg-bg-elevated" />}
      <img
        src={streamUrl}
        alt="Live greenhouse stream"
        className="w-full h-52 object-cover"
        onLoad={() => setStreamLoaded(true)}
        onError={() => setStreamError(true)}
      />

      <div className="absolute top-2 left-2 px-2 py-1 rounded bg-bg-base/80 border border-bg-border text-[10px] text-online backdrop-blur-sm">
        LIVE
      </div>

      <a
        href={streamUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 px-2 py-1 bg-bg-base/80 rounded text-[10px] text-tx-muted hover:text-tx-primary border border-bg-border backdrop-blur-sm"
      >
        Open full
      </a>
    </div>
  )
}

export default function ImagePanel({ imageData, loading }) {
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  if (loading) {
    return (
      <div className="surface p-5">
        <div className="h-5 w-32 bg-bg-elevated rounded animate-pulse mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64 bg-bg-elevated rounded-lg animate-pulse" />
          <div className="h-64 bg-bg-elevated rounded-lg animate-pulse" />
        </div>
      </div>
    )
  }

  const imageUrl = imageData?.image_url ?? null
  const storagePath = imageData?.storage_path ?? null
  const streamUrl = imageData?.stream_url ?? null
  const filename = imageData?.image_filename ?? null
  const uploadStatus = imageData?.upload_status ?? null

  const capturedAt = imageData?.capture_timestamp
    ? new Date(imageData.capture_timestamp).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="section-heading">Visual Monitoring</h3>
          <p className="text-xs text-tx-muted mt-0.5">
            Growth documentation and live camera feed
          </p>
        </div>
        {capturedAt && (
          <div className="text-right">
            <p className="label-caps text-[10px]">Captured</p>
            <p className="text-xs font-mono text-tx-secondary">{capturedAt}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="surface-elevated rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 border-b border-bg-border flex items-center justify-between">
            <p className="label-caps text-[10px]">Latest Image</p>
            {filename && (
              <span className="text-[10px] font-mono text-tx-muted truncate max-w-[180px]">
                {filename}
              </span>
            )}
          </div>

          {imageUrl && !imgError ? (
            <div className="relative">
              {!imgLoaded && <div className="absolute inset-0 h-52 bg-bg-elevated animate-pulse" />}
              <img
                src={imageUrl}
                alt="Latest greenhouse snapshot"
                className="w-full h-52 object-cover"
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
              />
              {imgLoaded && (
                <a
                  href={imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-2 right-2 px-2 py-1 bg-bg-base/80 rounded text-[10px] text-tx-muted hover:text-tx-primary border border-bg-border backdrop-blur-sm"
                >
                  View full
                </a>
              )}
            </div>
          ) : (
            <EmptyState
              message="No image preview available"
              detail={
                storagePath
                  ? `Stored path: ${storagePath}`
                  : uploadStatus
                  ? `Status: ${uploadStatus}`
                  : 'No image metadata available'
              }
            />
          )}

          <div className="px-4 py-3 border-t border-bg-border text-[11px] text-tx-muted space-y-1">
            <p><span className="label-caps text-[9px] mr-2">Storage</span>{storagePath || '—'}</p>
            <p><span className="label-caps text-[9px] mr-2">Status</span>{uploadStatus || '—'}</p>
          </div>
        </div>

        <div className="surface-elevated rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 border-b border-bg-border flex items-center justify-between">
            <p className="label-caps text-[10px]">Livestream</p>
            <span
              className={`flex items-center gap-1.5 text-[10px] font-medium ${
                streamUrl ? 'text-online' : 'text-tx-muted'
              }`}
            >
              <span className={`status-dot ${streamUrl ? 'bg-online' : 'bg-bg-border'}`} />
              {streamUrl ? 'Available' : 'Unavailable'}
            </span>
          </div>
          <StreamPanel streamUrl={streamUrl} />
        </div>
      </div>
    </div>
  )
}