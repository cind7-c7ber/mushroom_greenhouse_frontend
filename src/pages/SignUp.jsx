import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--c-bg-base)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="label-caps mb-1" style={{ color: 'var(--c-accent)' }}>
            ACADEMIC CITY
          </p>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--c-tx-primary)' }}>
            Create your account
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--c-tx-muted)' }}>
            Access the greenhouse monitoring system
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
                className="input-field"
                placeholder="Choose a username"
                value={form.username}
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
              />
            </div>

            <div>
              <label className="label-caps block mb-1.5">Email address</label>
              <input
                type="email"
                required
                autoComplete="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              />
            </div>

            <div>
              <label className="label-caps block mb-1.5">Password</label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              />
            </div>

            <div>
              <label className="label-caps block mb-1.5">Confirm password</label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="Repeat password"
                value={form.confirm}
                onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs mt-5" style={{ color: 'var(--c-tx-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-medium" style={{ color: 'var(--c-accent-light)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}