import { useEffect, useState, useCallback, useRef } from 'react'
import axios from 'axios'

/**
 * Session status data from backend
 */
export interface SessionStatus {
  sessionId: string
  expiresAt: string
  timeUntilExpiry: number // seconds
  lastActivity: string
  lastRefresh: string
}

/**
 * Hook configuration
 */
interface UseSessionStatusConfig {
  checkInterval?: number // How often to check (ms), default 60000 (1 minute)
  warningThreshold?: number // Show warning when this many seconds remain, default 300 (5 minutes)
  onWarning?: () => void // Callback when warning threshold is reached
  onExpired?: () => void // Callback when session expires
  enabled?: boolean // Enable/disable the hook, default true
}

/**
 * Hook return value
 */
interface UseSessionStatusReturn {
  status: SessionStatus | null
  loading: boolean
  error: string | null
  timeUntilExpiry: number | null // seconds
  shouldShowWarning: boolean
  isExpired: boolean
  extendSession: () => Promise<boolean>
  extending: boolean
  refresh: () => Promise<void>
}

/**
 * Hook to monitor session status and show expiry warnings
 * 
 * Features:
 * - Checks session status every minute
 * - Shows warning 5 minutes before expiry
 * - Allows extending session
 * - Handles session expiry
 * - Automatic cleanup on unmount
 * 
 * Usage:
 * ```tsx
 * const { shouldShowWarning, timeUntilExpiry, extendSession } = useSessionStatus({
 *   onWarning: () => console.log('Session expiring soon!'),
 *   onExpired: () => router.navigate('/login'),
 * })
 * ```
 */
export function useSessionStatus(config: UseSessionStatusConfig = {}): UseSessionStatusReturn {
  const {
    checkInterval = 60000, // 1 minute
    warningThreshold = 300, // 5 minutes
    onWarning,
    onExpired,
    enabled = true,
  } = config

  const [status, setStatus] = useState<SessionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [extending, setExtending] = useState(false)
  const [hasShownWarning, setHasShownWarning] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const onWarningRef = useRef(onWarning)
  const onExpiredRef = useRef(onExpired)

  // Update refs when callbacks change
  useEffect(() => {
    onWarningRef.current = onWarning
    onExpiredRef.current = onExpired
  }, [onWarning, onExpired])

  /**
   * Fetch session status from backend
   */
  const fetchStatus = useCallback(async () => {
    if (!enabled) return

    try {
      const baseUrl = typeof window === 'undefined' 
        ? (process.env.VITE_APP_URL || 'http://localhost:4500')
        : ''
      
      const response = await axios.get(`${baseUrl}/api/sessions/status`, {
        withCredentials: true,
        timeout: 10000,
      })

      if (response.data?.status && response.data?.data) {
        const sessionData = response.data.data
        setStatus(sessionData)
        setError(null)

        // Check if we should show warning
        if (sessionData.timeUntilExpiry <= warningThreshold && !hasShownWarning) {
          setHasShownWarning(true)
          onWarningRef.current?.()
        }

        // Check if session expired
        if (sessionData.timeUntilExpiry <= 0) {
          onExpiredRef.current?.()
        }
      }
    } catch (err: any) {
      // Don't set error for 401/404 (session not found is expected on logout)
      if (err?.response?.status !== 401 && err?.response?.status !== 404) {
        console.error('[useSessionStatus] Failed to fetch status:', err.message)
        setError(err.message || 'Failed to fetch session status')
      }
    } finally {
      setLoading(false)
    }
  }, [enabled, warningThreshold, hasShownWarning])

  /**
   * Extend session (refresh TTL)
   */
  const extendSession = useCallback(async (): Promise<boolean> => {
    setExtending(true)

    try {
      const baseUrl = typeof window === 'undefined' 
        ? (process.env.VITE_APP_URL || 'http://localhost:4500')
        : ''
      
      const response = await axios.post(
        `${baseUrl}/api/sessions/extend`,
        {},
        {
          withCredentials: true,
          timeout: 10000,
        }
      )

      if (response.data?.status) {
        // Reset warning flag
        setHasShownWarning(false)
        
        // Refresh status immediately
        await fetchStatus()
        
        console.log('[useSessionStatus] ✅ Session extended successfully')
        return true
      }

      return false
    } catch (err: any) {
      console.error('[useSessionStatus] Failed to extend session:', err.message)
      setError(err.message || 'Failed to extend session')
      return false
    } finally {
      setExtending(false)
    }
  }, [fetchStatus])

  /**
   * Manual refresh
   */
  const refresh = useCallback(async () => {
    setLoading(true)
    await fetchStatus()
  }, [fetchStatus])

  // Start polling on mount
  useEffect(() => {
    if (!enabled) return

    // Initial fetch
    fetchStatus()

    // Set up interval
    intervalRef.current = setInterval(fetchStatus, checkInterval)

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [enabled, checkInterval, fetchStatus])

  // Computed values
  const timeUntilExpiry = status?.timeUntilExpiry ?? null
  const shouldShowWarning = timeUntilExpiry !== null && timeUntilExpiry <= warningThreshold && timeUntilExpiry > 0
  const isExpired = timeUntilExpiry !== null && timeUntilExpiry <= 0

  return {
    status,
    loading,
    error,
    timeUntilExpiry,
    shouldShowWarning,
    isExpired,
    extendSession,
    extending,
    refresh,
  }
}
