import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { getCurrentUser, loginUser, registerUser } from '../api/auth'

const AuthContext = createContext(null)

const TOKEN_KEY = 'gh_token'
const USER_KEY = 'gh_user'

function loadStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null
  } catch {
    return null
  }
}

function loadStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadStoredUser())
  const [token, setToken] = useState(() => loadStoredToken())
  const [loading, setLoading] = useState(true)

  const persistSession = useCallback((nextToken, nextUser) => {
    localStorage.setItem(TOKEN_KEY, nextToken)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    setToken(nextToken)
    setUser(nextUser)
  }, [])

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    async function restoreSession() {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const currentUser = await getCurrentUser()
        localStorage.setItem(USER_KEY, JSON.stringify(currentUser))
        setUser(currentUser)
      } catch (error) {
        clearSession()
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [token, clearSession])

  const login = useCallback(async (username, password) => {
    const authResult = await loginUser({ username, password })
    const nextToken = authResult.access_token

    localStorage.setItem(TOKEN_KEY, nextToken)
    setToken(nextToken)

    const currentUser = await getCurrentUser()
    persistSession(nextToken, currentUser)

    return currentUser
  }, [persistSession])

  const signup = useCallback(async ({ username, email, password, role = 'user' }) => {
    await registerUser({ username, email, password, role })
    return login(username, password)
  }, [login])

  const adminLogin = useCallback(async (username, password) => {
    const currentUser = await login(username, password)

    if (currentUser.role !== 'admin') {
      clearSession()
      throw new Error('Admin access required.')
    }

    return currentUser
  }, [login, clearSession])

  const logout = useCallback(() => {
    clearSession()
  }, [clearSession])

  const value = useMemo(() => ({
    user,
    token,
    loading,
    login,
    signup,
    adminLogin,
    logout,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
  }), [user, token, loading, login, signup, adminLogin, logout])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
