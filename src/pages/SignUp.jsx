import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthShell from '../components/AuthShell'

export default function SignUp() {
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirm: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    try {
      await signup({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        role: 'user',
      })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Signup failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Create Account"
      subtitle="Create your greenhouse monitoring account to begin."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#ffffff', textDecoration: 'underline', textUnderlineOffset: 3 }}>
            Sign in
          </Link>
        </>
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
              Username
            </label>
            <input
              type="text"
              required
              className="w-full rounded-2xl px-4 py-3.5 outline-none"
              style={{
                background: 'rgba(255,255,255,0.10)',
                border: '1px solid rgba(255,255,255,0.24)',
                color: '#ffffff',
              }}
              placeholder="Choose a username"
              value={form.username}
              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
            />
          </div>

          <div>
            <label className="label-caps block mb-2" style={{ color: 'rgba(255,255,255,0.84)' }}>
              Email Address
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-2xl px-4 py-3.5 outline-none"
              style={{
                background: 'rgba(255,255,255,0.10)',
                border: '1px solid rgba(255,255,255,0.24)',
                color: '#ffffff',
              }}
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            />
          </div>

          <div>
            <label className="label-caps block mb-2" style={{ color: 'rgba(255,255,255,0.84)' }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full rounded-2xl px-4 py-3.5 pr-16 outline-none"
                style={{
                  background: 'rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.24)',
                  color: '#ffffff',
                }}
                placeholder="Create a password"
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

          <div>
            <label className="label-caps block mb-2" style={{ color: 'rgba(255,255,255,0.84)' }}>
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                className="w-full rounded-2xl px-4 py-3.5 pr-16 outline-none"
                style={{
                  background: 'rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.24)',
                  color: '#ffffff',
                }}
                placeholder="Confirm your password"
                value={form.confirm}
                onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
              />
              {form.confirm && (
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium"
                  style={{ color: 'rgba(255,255,255,0.82)' }}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
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
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
      </div>
    </AuthShell>
  )
}