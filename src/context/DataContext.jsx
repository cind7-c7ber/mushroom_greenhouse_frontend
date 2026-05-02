import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { getLatestControlled, getLatestControl, getSensorHistory } from '../api/sensors'
import { getLatestImage, getImageHistory } from '../api/images'
import { getLatestStatus } from '../api/status'

const DataContext = createContext(null)
export const useData = () => useContext(DataContext)

const INTERVALS = {
  latest:  7_000,   // controlled + control latest readings
  history: 15_000,  // sensor history / chart data
  image:   50_000,  // latest image + image history
  status:  20_000,  // MQTT status
}

export function DataProvider({ children }) {
  const [controlled, setControlled]               = useState(null)
  const [control, setControl]                     = useState(null)
  const [historyControlled, setHistoryControlled] = useState([])
  const [historyControl, setHistoryControl]       = useState([])
  const [imageData, setImageData]                 = useState(null)
  const [imageHistory, setImageHistory]           = useState([])
  const [status, setStatus]                       = useState(null)
  const [lastUpdated, setLastUpdated]             = useState(null)
  const [loading, setLoading]                     = useState(true)
  const [error, setError]                         = useState(null)
  const [prevControlled, setPrevControlled]       = useState(null)
  const [prevControl, setPrevControl]             = useState(null)

  const prevCtrlRef  = useRef(null)
  const prevPlainRef = useRef(null)
  const loadedRef    = useRef({ latest: false, history: false, image: false, status: false })

  const markLoaded = useCallback(() => {
    const r = loadedRef.current
    if (r.latest && r.history && r.image && r.status) {
      setLoading(false)
    }
  }, [])

  // ── Latest sensor readings ─────────────────────────────────────────────────
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
        // Both rejected — surface the HTTP error
        const reason = c.reason?.response?.status ?? p.reason?.response?.status
        setError(`Backend error${reason ? ` (${reason})` : ''} — retrying…`)
      }
    } catch (e) {
      setError('Backend unreachable — retrying…')
    } finally {
      loadedRef.current.latest = true
      markLoaded()
    }
  }, [markLoaded])

  // ── History / chart data ───────────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    try {
      const [hc, hp] = await Promise.allSettled([
        getSensorHistory('controlled'),
        getSensorHistory('control'),
      ])
      if (hc.status === 'fulfilled') setHistoryControlled(hc.value)
      if (hp.status === 'fulfilled') setHistoryControl(hp.value)
    } catch { /* keep last known */ } finally {
      loadedRef.current.history = true
      markLoaded()
    }
  }, [markLoaded])

  // ── Images ─────────────────────────────────────────────────────────────────
  const fetchImages = useCallback(async () => {
    try {
      const [img, ih] = await Promise.allSettled([
        getLatestImage(),
        getImageHistory(),
      ])
      if (img.status === 'fulfilled') setImageData(img.value)
      if (ih.status === 'fulfilled')  setImageHistory(Array.isArray(ih.value) ? ih.value : [])
    } catch { /* keep last known */ } finally {
      loadedRef.current.image = true
      markLoaded()
    }
  }, [markLoaded])

  // ── MQTT status ────────────────────────────────────────────────────────────
  const fetchStatus = useCallback(async () => {
    try {
      const data = await getLatestStatus()
      setStatus(data)
    } catch { /* keep last known */ } finally {
      loadedRef.current.status = true
      markLoaded()
    }
  }, [markLoaded])

  // ── Wire up independent intervals ─────────────────────────────────────────
  useEffect(() => {
    fetchLatest()
    const id = setInterval(fetchLatest, INTERVALS.latest)
    return () => clearInterval(id)
  }, [fetchLatest])

  useEffect(() => {
    fetchHistory()
    const id = setInterval(fetchHistory, INTERVALS.history)
    return () => clearInterval(id)
  }, [fetchHistory])

  useEffect(() => {
    fetchImages()
    const id = setInterval(fetchImages, INTERVALS.image)
    return () => clearInterval(id)
  }, [fetchImages])

  useEffect(() => {
    fetchStatus()
    const id = setInterval(fetchStatus, INTERVALS.status)
    return () => clearInterval(id)
  }, [fetchStatus])

  return (
    <DataContext.Provider value={{
      controlled,
      control,
      historyControlled,
      historyControl,
      imageData,
      imageHistory,
      status,
      lastUpdated,
      loading,
      error,
      prevControlled,
      prevControl,
      intervals: INTERVALS,
    }}>
      {children}
    </DataContext.Provider>
  )
}
