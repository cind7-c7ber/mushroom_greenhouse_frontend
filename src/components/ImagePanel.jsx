import { useState } from 'react'

function EmptyState({ message, detail }) {
  return (
    <div className="h-52 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-bg-border rounded-lg">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-tx-muted opacity-40">
        <rect x="2" y="5" width="24" height="18" rx="3" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="9" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2.5 20.5L8.5 14L12.5 18.5L17 13.5L25.5 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <p className="text-xs text-tx-muted text-center">{message}</p>
      {detail && <p className="text-[11px] text-tx-muted opacity-60 text-center">{detail}</p>}
    </div>
  )
}

function StreamPanel({ streamUrl }) {
  return (
    <div className="h-52 flex flex-col items-center justify-center gap-3">
      {streamUrl ? (
        <>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-online animate-pulse" />
            <span className="text-xs font-medium text-tx-primary">Stream available</span>
          </div>
          <a
            href={streamUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-bg-border bg-bg-elevated text-xs font-semibold text-tx-primary hover:border-amethyst transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <polygon points="3,2 10,6 3,10" fill="currentColor"/>
            </svg>
            Open Livestream
          </a>
          <p className="text-[10px] font-mono text-tx-muted break-all max-w-xs text-center px-4">
            {streamUrl}
          </p>
        </>
      ) : (
        <EmptyState
          message="No stream URL configured"
          detail="Stream will appear when an active URL is received via MQTT"
        />
      )}
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

  const imageUrl  = imageData?.image_url  ?? null
  const streamUrl = imageData?.stream_url ?? null
  const filename  = imageData?.image_filename ?? null

  const capturedAt = imageData?.capture_timestamp
    ? new Date(imageData.capture_timestamp).toLocaleString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : null

  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="section-heading">Visual Monitoring</h3>
          <p className="text-xs text-tx-muted mt-0.5">Growth documentation and live camera feed</p>
        </div>
        {capturedAt && (
          <div className="text-right">
            <p className="label-caps text-[10px]">Captured</p>
            <p className="text-xs font-mono text-tx-secondary">{capturedAt}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Latest snapshot */}
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
              {!imgLoaded && (
                <div className="absolute inset-0 h-52 bg-bg-elevated animate-pulse" />
              )}
              <img
                src={imageUrl}
                alt="Latest greenhouse snapshot"
                className="w-full h-52 object-cover"
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
                style={{ display: imgLoaded ? 'block' : 'block' }}
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
          ) : imgError ? (
            <EmptyState
              message="Image could not be loaded"
              detail={imageUrl ? `Source: ${imageUrl.slice(0, 60)}…` : undefined}
            />
          ) : (
            <EmptyState
              message="No image available"
              detail="Images are received via MQTT payload"
            />
          )}
        </div>

        {/* Livestream */}
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
