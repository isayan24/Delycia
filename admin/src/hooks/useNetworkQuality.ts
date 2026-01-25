import { useState, useEffect, useCallback } from 'react'

export interface NetworkState {
  online: boolean
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g'
  rtt?: number
  downlink?: number
  saveData?: boolean
  loading: boolean
  refresh: () => Promise<void>
}

export function useNetworkQuality(): NetworkState {
  const [networkState, setNetworkState] = useState<
    Omit<NetworkState, 'refresh'>
  >({
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    effectiveType: '4g',
    rtt: 0,
    downlink: 0,
    saveData: false,
    loading: false,
  })

  const measureConnection = useCallback(async () => {
    if (!navigator.onLine) {
      setNetworkState((prev) => ({ ...prev, online: false, loading: false }))
      return
    }

    setNetworkState((prev) => ({ ...prev, loading: true }))

    try {
      // Create a minimum delay promise to ensure UI feedback is visible
      const minDelayPromise = new Promise((resolve) => setTimeout(resolve, 800))

      // 1. Measure Latency (RTT) - Fetching a tiny file (favicon)
      const rttStart = performance.now()
      await fetch('/favicon.ico', { cache: 'no-store', method: 'HEAD' })
      const rttEnd = performance.now()
      const rtt = Math.round(rttEnd - rttStart)

      // 2. Measure Throughput (Downlink) - Fetching a larger file (~80KB)
      const downloadStart = performance.now()
      const response = await fetch('/delycia-logo.jpg', { cache: 'no-store' })
      const blob = await response.blob()
      const downloadEnd = performance.now()

      const durationInSeconds = (downloadEnd - downloadStart) / 1000
      const bitsLoaded = blob.size * 8
      const bps = bitsLoaded / durationInSeconds
      const mbps = (bps / 1_000_000).toFixed(2)

      // Wait for the minimum delay to pass
      await minDelayPromise

      setNetworkState((prev) => ({
        ...prev,
        online: true,
        rtt,
        downlink: parseFloat(mbps),
        loading: false,
      }))
    } catch (error) {
      console.error('Network measurement failed', error)
      // If fetch fails, we might be offline or have partial connectivity
      setNetworkState((prev) => ({
        ...prev,
        online: navigator.onLine, // Fallback to browser status
        loading: false,
      }))
    }
  }, [])

  useEffect(() => {
    // Initial measure
    measureConnection()

    let intervalId: NodeJS.Timeout | null = null

    const startPolling = () => {
      if (intervalId) clearInterval(intervalId)
      intervalId = setInterval(() => {
        if (!document.hidden) {
          measureConnection()
        }
      }, 15000)
    }

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    }

    // Start polling immediately
    startPolling()

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling()
      } else {
        // Measure immediately when coming back, then restart polling
        measureConnection()
        startPolling()
      }
    }

    const handleOnline = () => {
      setNetworkState((prev) => ({ ...prev, online: true }))
      measureConnection()
    }

    const handleOffline = () => {
      setNetworkState((prev) => ({ ...prev, online: false }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (intervalId) clearInterval(intervalId)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [measureConnection])

  return {
    ...networkState,
    refresh: measureConnection,
  }
}
