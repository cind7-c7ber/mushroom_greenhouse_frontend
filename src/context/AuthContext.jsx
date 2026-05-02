import { createContext, useContext, useState, useCallback } from 'react'

// ─── Mock auth — wire these functions to your FastAPI auth endpoints later ───
// Admin credentials (demo only):  admin@greenhouse.ac / admin123
const ADMIN_EMAIL    = 'admin@greenhouse.ac'
const ADMIN_PASSWORD = 'admin123'
const USERS_KEY      = 'gh_users'
const SESSION_KEY    = 'gh_session'

function loadUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || [] } catch { return [] }
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}
function loadSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)) || null } catch { return null }
}

// ─────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadSession())

  const login = useCallback(async (email, password) => {
    const users = loadUsers()
    const found = users.find(u => u.email === email && u.password === password)
    if (!found) throw new Error('Invalid email or password.')
    const session = { id: found.id, name: found.name, email: found.email, role: found.role }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    setUser(session)
    return session
  }, [])

  const signup = useCallback(async (name, email, password) => {
    const users = loadUsers()
    if (users.find(u => u.email === email)) throw new Error('An account with this email already exists.')
    const newUser = { id: Date.now().toString(), name, email, password, role: 'user' }
    saveUsers([...users, newUser])
    const session = { id: newUser.id, name, email, role: 'user' }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    setUser(session)
    return session
  }, [])

  const adminLogin = useCallback(async (email, password) => {
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      throw new Error('Invalid admin credentials.')
    }
    const session = { id: 'admin-0', name: 'Administrator', email, role: 'admin' }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    setUser(session)
    return session
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, signup, adminLogin, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
