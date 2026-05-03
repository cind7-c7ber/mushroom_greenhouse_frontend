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
        backgroundImage:
          "linear-gradient(rgba(16,18,34,0.30), rgba(16,18,34,0.38)), url('/auth-bg.webp')",
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
            borderRadius: 30,
            padding: 28,
            background: 'rgba(255,255,255,0.14)',
            border: '1px solid rgba(255,255,255,0.28)',
            boxShadow:
              '0 20px 60px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.25)',
            backdropFilter: 'blur(22px) saturate(160%)',
            WebkitBackdropFilter: 'blur(22px) saturate(160%)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.04) 42%, rgba(255,255,255,0.10) 100%)',
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: -80,
              right: -40,
              width: 180,
              height: 180,
              borderRadius: '50%',
              background: 'rgba(188, 214, 255, 0.20)',
              filter: 'blur(24px)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'absolute',
              bottom: -70,
              left: -30,
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: 'rgba(218, 177, 255, 0.18)',
              filter: 'blur(24px)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="text-center mb-8">
              <p
                className="label-caps mb-2"
                style={{ color: 'rgba(245,240,255,0.88)', letterSpacing: '0.18em' }}
              >
                ACADEMIC CITY
              </p>
              <h1
                className="text-3xl font-semibold"
                style={{ color: '#ffffff', letterSpacing: '-0.03em' }}
              >
                {title}
              </h1>
              <p
                className="text-sm mt-2"
                style={{ color: 'rgba(255,255,255,0.78)' }}
              >
                {subtitle}
              </p>
            </div>

            {children}

            {footer && (
              <div
                className="text-center text-sm mt-6"
                style={{ color: 'rgba(255,255,255,0.78)' }}
              >
                {footer}
              </div>
            )}

            {adminLink && (
              <p
                className="text-center mt-6 text-sm"
                style={{ color: 'rgba(255,255,255,0.74)' }}
              >
                Administrator?{' '}
                <Link
                  to="/admin-login"
                  style={{
                    color: '#ffffff',
                    textDecoration: 'underline',
                    textUnderlineOffset: 3,
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