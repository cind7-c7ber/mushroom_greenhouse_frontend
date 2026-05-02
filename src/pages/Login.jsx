import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const redirectTo = location.state?.from?.pathname || '/'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(form.username.trim(), form.password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--c-bg-base)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="label-caps mb-1" style={{ color: 'var(--c-accent)' }}>
            ACADEMIC CITY
          </p>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--c-tx-primary)' }}>
            Greenhouse Monitoring
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--c-tx-muted)' }}>
            Sign in to your account
          </p>
        </div>

        <div className="surface p-6">
          {error && (
            <div
              className="mb-4 px-3 py-2.5 rounded-lg text-xs"
              style={{
                background: 'rgba(196,100,91,0.1)',
                border: '1px solid rgba(196,100,91,0.3)',
                color: '#C4645B',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-caps block mb-1.5">Username</label>
              <input
                type="text"
                required
                autoComplete="username"
                className="input-field"
                placeholder="Enter your username"
                value={form.username}
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
              />
            </div>

            <div>
              <label className="label-caps block mb-1.5">Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                className="input-field"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs mt-5" style={{ color: 'var(--c-tx-muted)' }}>
            No account yet?{' '}
            <Link to="/signup" className="font-medium" style={{ color: 'var(--c-accent-light)' }}>
              Create one
            </Link>
          </p>
        </div>

        <p className="text-center mt-6 text-xs" style={{ color: 'var(--c-tx-muted)' }}>
          Administrator?{' '}
          <Link
            to="/admin-login"
            className="font-medium"
            style={{ color: 'var(--c-tx-muted)', textDecoration: 'underline' }}
          >
            Admin login
          </Link>
        </p>
      </div>
    </div>
  )
}