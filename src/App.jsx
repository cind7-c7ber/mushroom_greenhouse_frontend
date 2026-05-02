import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import { DataProvider } from './context/DataContext'
import { ToastProvider } from './context/ToastContext'
import ErrorBoundary from './components/ErrorBoundary'
import ToastContainer from './components/Toast'
import AppShell from './components/layout/AppShell'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const History = lazy(() => import('./pages/History'))
const Media = lazy(() => import('./pages/Media'))
const Admin = lazy(() => import('./pages/Admin'))
const Settings = lazy(() => import('./pages/Settings'))
const Login = lazy(() => import('./pages/Login'))
const SignUp = lazy(() => import('./pages/SignUp'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))

function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          border: '2px solid var(--c-accent)',
          borderTopColor: 'transparent',
          animation: 'spin 0.7s linear infinite',
        }}
      />
    </div>
  )
}

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  return children
}

function RequireAdmin({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/admin-login" state={{ from: location }} replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />

  return children
}

function RedirectIfAuthed({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <PageLoader />
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />

  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <RedirectIfAuthed>
            <Suspense fallback={<PageLoader />}>
              <Login />
            </Suspense>
          </RedirectIfAuthed>
        }
      />
      <Route
        path="/signup"
        element={
          <RedirectIfAuthed>
            <Suspense fallback={<PageLoader />}>
              <SignUp />
            </Suspense>
          </RedirectIfAuthed>
        }
      />
      <Route
        path="/admin-login"
        element={
          <RedirectIfAuthed>
            <Suspense fallback={<PageLoader />}>
              <AdminLogin />
            </Suspense>
          </RedirectIfAuthed>
        }
      />

      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<PageLoader />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="history"
          element={
            <Suspense fallback={<PageLoader />}>
              <History />
            </Suspense>
          }
        />
        <Route
          path="media"
          element={
            <Suspense fallback={<PageLoader />}>
              <Media />
            </Suspense>
          }
        />
        <Route
          path="settings"
          element={
            <Suspense fallback={<PageLoader />}>
              <Settings />
            </Suspense>
          }
        />
      </Route>

      <Route
        element={
          <RequireAdmin>
            <AppShell />
          </RequireAdmin>
        }
      >
        <Route
          path="admin"
          element={
            <Suspense fallback={<PageLoader />}>
              <Admin />
            </Suspense>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SettingsProvider>
            <DataProvider>
              <ToastProvider>
                <BrowserRouter>
                  <AppRoutes />
                  <ToastContainer />
                </BrowserRouter>
              </ToastProvider>
            </DataProvider>
          </SettingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}