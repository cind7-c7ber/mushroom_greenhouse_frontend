import { Link } from 'react-router-dom'

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
  adminLink = true,
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{
        backgroundImage: "url('/auth-bg2.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="w-full max-w-md">
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 40,
            padding: '40px 32px',
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow:
              '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 24px rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(28px) saturate(180%)',
            WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          }}
        >
          {/* Iridescent Overlay */}
          <div
            className="glass-iridescent"
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              mixBlendMode: 'overlay',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="mb-8">
              <p
                className="label-caps mb-2 text-xs font-bold tracking-widest"
                style={{ color: 'rgba(0,0,0,0.7)' }}
              >
                ACADEMIC CITY
              </p>
              <h1
                className="text-4xl font-bold mb-2"
                style={{ color: '#1a1a1a', letterSpacing: '-0.02em' }}
              >
                {title}
              </h1>
              <p
                className="text-sm font-semibold"
                style={{ color: 'rgba(0,0,0,0.8)' }}
              >
                {subtitle}
              </p>
            </div>

            {children}

            {footer && (
              <div
                className="text-center text-sm mt-8"
                style={{ color: 'rgba(0,0,0,0.8)' }}
              >
                {footer}
              </div>
            )}

            {adminLink && (
              <p
                className="text-center mt-6 text-sm"
                style={{ color: 'rgba(0,0,0,0.6)' }}
              >
                Administrator?{' '}
                <Link
                  to="/admin-login"
                  style={{
                    color: '#000000',
                    fontWeight: 'bold',
                    textDecoration: 'underline',
                    textUnderlineOffset: 4,
                  }}
                >
                  Admin login
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}