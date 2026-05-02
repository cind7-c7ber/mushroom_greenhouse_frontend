import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { getLatestControlled, getLatestControl, getSensorHistory } from '../api/sensors'
import { getLatestImage, getImageHistory } from '../api/images'
import { getLatestStatus } from '../api/status'
import { getAlertSummary, getActiveAlerts } from '../api/alerts'
import { getSyncHealth } from '../api/sync'
import { useAuth } from './AuthContext'

const DataContext = createContext(null)
export const useData = () => useContext(DataContext)

const INTERVALS = {
  latest: 7000,
  history: 15000,
  image: 50000,
  status: 20000,
  alerts: 12000,
  syncHealth: 15000,
}

export function DataProvider({ children }) {
  const { isAuthenticated, loading: authLoading } = useAuth()

  const [controlled, setControlled] = useState(null)
  const [control, setControl] = useState(null)
  const [historyControlled, setHistoryControlled] = useState([])
  const [historyControl, setHistoryControl] = useState([])
  const [imageData, setImageData] = useState(null)
  const [imageHistory, setImageHistory] = useState([])
  const [status, setStatus] = useState(null)
  const [alertSummary, setAlertSummary] = useState(null)
  const [activeAlerts, setActiveAlerts] = useState([])
  const [syncHealth, setSyncHealth] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [prevControlled, setPrevControlled] = useState(null)
  const [prevControl, setPrevControl] = useState(null)

  const prevCtrlRef = useRef(null)
  const prevPlainRef = useRef(null)
  const loadedRef = useRef({
    latest: false,
    history: false,
    image: false,
    status: false,
    alerts: false,
    syncHealth: false,
  })

  const resetLoadedFlags = useCallback(() => {
    loadedRef.current = {
      latest: false,
      history: false,
      image: false,
      status: false,
      alerts: false,
      syncHealth: false,
    }
  }, [])

  const markLoaded = useCallback(() => {
    const r = loadedRef.current
    if (r.latest && r.history && r.image && r.status && r.alerts && r.syncHealth) {
      setLoading(false)
    }
  }, [])

  const fetchLatest = useCallback(async () => {
    try {
      const [c, p] = await Promise.allSettled([
        getLatestControlled(),
        getLatestControl(),
      ])

      const anyOk = c.status === 'fulfilled' || p.status === 'fulfilled'

      if (c.status === 'fulfilled') {
        setPrevControlled(prevCtrlRef.current)
        prevCtrlRef.current = c.value
        setControlled(c.value)
      }

      if (p.status === 'fulfilled') {
        setPrevControl(prevPlainRef.current)
        prevPlainRef.current = p.value
        setControl(p.value)
      }

      if (anyOk) {
        setLastUpdated(new Date())
        setError(null)
      } else {
        const reason = c.reason?.response?.status ?? p.reason?.response?.status
        setError(`Backend error${reason ? ` (${reason})` : ''} — retrying…`)
      }
    } catch {
      setError('Backend unreachable — retrying…')
    } finally {
      loadedRef.current.latest = true
      markLoaded()
    }
  }, [markLoaded])

  const fetchHistory = useCallback(async () => {
    try {
      const [hc, hp] = await Promise.allSettled([
        getSensorHistory('controlled'),
        getSensorHistory('control'),
      ])

      if (hc.status === 'fulfilled') setHistoryControlled(hc.value)
      if (hp.status === 'fulfilled') setHistoryControl(hp.value)
    } finally {
      loadedRef.current.history = true
      markLoaded()
    }
  }, [markLoaded])

  const fetchImages = useCallback(async () => {
    try {
      const [img, ih] = await Promise.allSettled([
        getLatestImage(),
        getImageHistory(),
      ])

      if (img.status === 'fulfilled') setImageData(img.value)
      if (ih.status === 'fulfilled') setImageHistory(Array.isArray(ih.value) ? ih.value : [])
    } finally {
      loadedRef.current.image = true
      markLoaded()
    }
  }, [markLoaded])

  const fetchStatus = useCallback(async () => {
    try {
      const data = await getLatestStatus()
      setStatus(data)
    } finally {
      loadedRef.current.status = true
      markLoaded()
    }
  }, [markLoaded])

  const fetchAlerts = useCallback(async () => {
    try {
      const [summary, active] = await Promise.allSettled([
        getAlertSummary(),
        getActiveAlerts(),
      ])

      if (summary.status === 'fulfilled') setAlertSummary(summary.value)
      if (active.status === 'fulfilled') setActiveAlerts(Array.isArray(active.value) ? active.value : [])
    } finally {
      loadedRef.current.alerts = true
      markLoaded()
    }
  }, [markLoaded])

  const fetchSyncHealth = useCallback(async () => {
    try {
      const data = await getSyncHealth()
      setSyncHealth(data)
    } finally {
      loadedRef.current.syncHealth = true
      markLoaded()
    }
  }, [markLoaded])

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      setControlled(null)
      setControl(null)
      setHistoryControlled([])
      setHistoryControl([])
      setImageData(null)
      setImageHistory([])
      setStatus(null)
      setAlertSummary(null)
      setActiveAlerts([])
      setSyncHealth(null)
      setLastUpdated(null)
      setError(null)
      setPrevControlled(null)
      setPrevControl(null)
      setLoading(false)
      resetLoadedFlags()
      return
    }

    setLoading(true)
    resetLoadedFlags()

    fetchLatest()
    fetchHistory()
    fetchImages()
    fetchStatus()
    fetchAlerts()
    fetchSyncHealth()

    const latestId = setInterval(fetchLatest, INTERVALS.latest)
    const historyId = setInterval(fetchHistory, INTERVALS.history)
    const imageId = setInterval(fetchImages, INTERVALS.image)
    const statusId = setInterval(fetchStatus, INTERVALS.status)
    const alertsId = setInterval(fetchAlerts, INTERVALS.alerts)
    const syncId = setInterval(fetchSyncHealth, INTERVALS.syncHealth)

    return () => {
      clearInterval(latestId)
      clearInterval(historyId)
      clearInterval(imageId)
      clearInterval(statusId)
      clearInterval(alertsId)
      clearInterval(syncId)
    }
  }, [
    isAuthenticated,
    authLoading,
    fetchLatest,
    fetchHistory,
    fetchImages,
    fetchStatus,
    fetchAlerts,
    fetchSyncHealth,
    resetLoadedFlags,
  ])

  return (
    <DataContext.Provider
      value={{
        controlled,
        control,
        historyControlled,
        historyControl,
        imageData,
        imageHistory,
        status,
        alertSummary,
        activeAlerts,
        syncHealth,
        lastUpdated,
        loading,
        error,
        prevControlled,
        prevControl,
        intervals: INTERVALS,
        refreshLatest: fetchLatest,
        refreshHistory: fetchHistory,
        refreshImages: fetchImages,
        refreshStatus: fetchStatus,
        refreshAlerts: fetchAlerts,
        refreshSyncHealth: fetchSyncHealth,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}