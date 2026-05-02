import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminLogin() {
  const { adminLogin } = useAuth()
  const navigate = useNavigate()

  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await adminLogin(form.email.trim(), form.password)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--c-bg-base)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="label-caps mb-1" style={{ color: 'var(--c-accent)' }}>ACADEMIC CITY</p>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--c-tx-primary)' }}>
            Administrator Access
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--c-tx-muted)' }}>
            System configuration and management
          </p>
        </div>

        <div className="surface p-6">
          {/* Admin credential hint for demo */}
          <div className="mb-4 px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--c-accent-dim)', border: '1px solid var(--c-accent-border)', color: 'var(--c-tx-secondary)' }}>
            Demo — admin@greenhouse.ac / admin123
          </div>

          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-lg text-xs" style={{ background: 'rgba(196,100,91,0.1)', border: '1px solid rgba(196,100,91,0.3)', color: '#C4645B' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-caps block mb-1.5">Admin email</label>
              <input
                type="email"
                required
                autoComplete="email"
                className="input-field"
                placeholder="admin@greenhouse.ac"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="label-caps block mb-1.5">Admin password</label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Authenticating…' : 'Access System'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs" style={{ color: 'var(--c-tx-muted)' }}>
          <Link to="/login" style={{ color: 'var(--c-tx-muted)', textDecoration: 'underline' }}>
            Back to user login
          </Link>
        </p>
      </div>
    </div>
  )
}
