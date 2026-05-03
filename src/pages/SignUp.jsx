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
      if (err.code === 'ECONNABORTED') {
        setError('The server is waking up. Please wait a moment and try again.')
      } else {
        setError(err?.response?.data?.detail || err.message || 'Signup failed.')
      }
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
          <Link to="/login" className="font-bold hover:underline" style={{ color: '#000000' }}>
            Sign in
          </Link>
        </>
      }
    >
      <div className="space-y-6">
        {error && (
          <div
            className="px-4 py-3 rounded-2xl text-sm font-semibold"
            style={{
              background: 'rgba(255, 50, 50, 0.15)',
              border: '1px solid rgba(0,0,0,0.1)',
              color: '#d00000',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-bold ml-1" style={{ color: '#000000' }}>
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                required
                className="w-full rounded-2xl px-5 py-4 outline-none transition-all focus:ring-2 focus:ring-black/10"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(0, 0, 0, 0.15)',
                  color: '#000000',
                }}
                placeholder="Choose a username"
                value={form.username}
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold ml-1" style={{ color: '#000000' }}>
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-2xl px-5 py-4 outline-none transition-all focus:ring-2 focus:ring-black/10"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(0, 0, 0, 0.15)',
                  color: '#000000',
                }}
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold ml-1" style={{ color: '#000000' }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full rounded-2xl px-5 py-4 pr-14 outline-none transition-all focus:ring-2 focus:ring-black/10"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(0, 0, 0, 0.15)',
                  color: '#000000',
                }}
                placeholder="Create a password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-5 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold ml-1" style={{ color: '#000000' }}>
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                className="w-full rounded-2xl px-5 py-4 pr-14 outline-none transition-all focus:ring-2 focus:ring-black/10"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(0, 0, 0, 0.15)',
                  color: '#000000',
                }}
                placeholder="Confirm your password"
                value={form.confirm}
                onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((s) => !s)}
                className="absolute right-5 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
              >
                {showConfirmPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl py-4 text-lg font-bold transition-all transform active:scale-[0.98] mt-4"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#1a1a1a',
              boxShadow: '0 10px 25px -5px rgba(255, 255, 255, 0.2)',
            }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </AuthShell>
  )
}