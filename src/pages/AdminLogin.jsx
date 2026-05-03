import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthShell from '../components/AuthShell'

export default function AdminLogin() {
  const { adminLogin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const redirectTo = location.state?.from?.pathname || '/admin'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await adminLogin(form.username.trim(), form.password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Admin login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Admin Access"
      subtitle="Sign in to the protected administration workspace."
      adminLink={false}
      footer={
        <Link to="/login" style={{ color: '#ffffff', textDecoration: 'underline', textUnderlineOffset: 3 }}>
          Back to user login
        </Link>
      }
    >
      <div className="space-y-5">
        {error && (
          <div
            className="px-4 py-3 rounded-2xl text-sm"
            style={{
              background: 'rgba(196,100,91,0.14)',
              border: '1px solid rgba(255,255,255,0.16)',
              color: '#fff1ef',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-caps block mb-2" style={{ color: 'rgba(255,255,255,0.84)' }}>
              Admin Username
            </label>
            <input
              type="text"
              required
              autoComplete="username"
              className="w-full rounded-2xl px-4 py-3.5 outline-none"
              style={{
                background: 'rgba(255,255,255,0.10)',
                border: '1px solid rgba(255,255,255,0.24)',
                color: '#ffffff',
              }}
              placeholder="Enter admin username"
              value={form.username}
              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
            />
          </div>

          <div>
            <label className="label-caps block mb-2" style={{ color: 'rgba(255,255,255,0.84)' }}>
              Admin Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                className="w-full rounded-2xl px-4 py-3.5 pr-16 outline-none"
                style={{
                  background: 'rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.24)',
                  color: '#ffffff',
                }}
                placeholder="Enter admin password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              />
              {form.password && (
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium"
                  style={{ color: 'rgba(255,255,255,0.82)' }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl py-3.5 text-base font-semibold transition"
            style={{
              background: 'rgba(255,255,255,0.22)',
              border: '1px solid rgba(255,255,255,0.30)',
              color: '#ffffff',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
            }}
          >
            {loading ? 'Authenticating…' : 'Access System'}
          </button>
        </form>
      </div>
    </AuthShell>
  )
}