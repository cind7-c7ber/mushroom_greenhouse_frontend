import { useData } from '../context/DataContext'

export default function LiveStreamPanel() {
  const { imageData } = useData()
  const streamUrl = imageData?.stream_url

  return (
    <div className="surface p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="section-heading">LIVESTREAM</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${streamUrl ? 'bg-[#5DB075] animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-[11px] font-bold text-tx-secondary uppercase tracking-wider">
            {streamUrl ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>

      <div className="relative flex-1 bg-bg-base rounded-xl overflow-hidden border border-bg-border group">
        {streamUrl ? (
          <img
            src={streamUrl}
            alt="Live Stream"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-tx-muted mb-3 opacity-20">
              <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.934a.5.5 0 0 0-.777-.416L16 11" />
              <rect x="2" y="6" width="14" height="12" rx="3" />
            </svg>
            <p className="text-xs text-tx-muted">Live feed disconnected</p>
          </div>
        )}

        {/* Live Badge */}
        {streamUrl && (
          <div className="absolute top-4 left-4 px-2 py-1 rounded-md bg-black/40 backdrop-blur-md border border-white/10">
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">LIVE</span>
          </div>
        )}

        {/* Open Full Button */}
        {streamUrl && (
          <a
            href={streamUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-white hover:bg-black/60 transition-colors"
          >
            Open full
          </a>
        )}
      </div>
    </div>
  )
}
