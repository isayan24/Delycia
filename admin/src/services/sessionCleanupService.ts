import sessionService from './sessionService'
import axios from 'axios'

class SessionCleanupService {
  private static instance: SessionCleanupService
  private cleanupInterval: NodeJS.Timeout | null = null
  private beforeUnloadListener: (() => void) | null = null

  private constructor() {}

  static getInstance(): SessionCleanupService {
    if (!SessionCleanupService.instance) {
      SessionCleanupService.instance = new SessionCleanupService()
    }
    return SessionCleanupService.instance
  }

  /**
   * Initialize session cleanup mechanisms
   */
  initialize(): void {
    this.startPeriodicCleanup()
    this.setupBeforeUnloadHandler()
  }

  /**
   * Start periodic session validation via server.
   * If the session is invalid, attempt a token refresh before logging out.
   */
  private startPeriodicCleanup(): void {
    // Check session validity every 5 minutes
    this.cleanupInterval = setInterval(
      async () => {
        const isValid = await sessionService.isSessionValid()
        if (!isValid) {
          console.log(
            '[SessionCleanup] Session check failed, attempting refresh...',
          )

          // Don't immediately clear session — try refreshing first
          // The /api/auth/session endpoint now handles auto-refresh,
          // but if that failed too, try an explicit refresh
          try {
            const refreshResponse = await axios.post(
              '/api/auth/refresh',
              {},
              { withCredentials: true },
            )

            if (
              refreshResponse.status === 200 &&
              refreshResponse.data?.statusCode === 200
            ) {
              console.log(
                '[SessionCleanup] Token refreshed successfully, re-validating...',
              )
              // Re-validate session with new token
              const recheck = await sessionService.isSessionValid()
              if (recheck) {
                console.log('[SessionCleanup] Session recovered after refresh')
                return // Session is good now, don't clear anything
              }
            }
          } catch (refreshError) {
            console.error(
              '[SessionCleanup] Refresh attempt failed:',
              refreshError,
            )
          }

          // Refresh failed — session is truly expired
          console.log(
            '[SessionCleanup] Session expired and refresh failed, clearing...',
          )
          sessionService.clearSession()

          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
        }
      },
      5 * 60 * 1000, // 5 minutes
    )
  }

  /**
   * Setup handler for browser close/refresh
   */
  private setupBeforeUnloadHandler(): void {
    if (typeof window === 'undefined') return

    this.beforeUnloadListener = () => {
      // No-op: don't clear session on browser close
    }

    window.addEventListener('beforeunload', this.beforeUnloadListener)
  }

  /**
   * Schedule session renewal for active users.
   * Token refresh is handled automatically by the server routes
   * and axios interceptor on 401 responses.
   */
  scheduleSessionRenewal(): void {
    // No-op — handled by session endpoint auto-refresh and tokenService interceptor
  }

  /**
   * Track user activity
   */
  trackActivity(): void {
    if (typeof window === 'undefined') return

    const updateActivity = () => {
      localStorage.setItem('lastActivity', Date.now().toString())
    }

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ]

    events.forEach((event) => {
      document.addEventListener(event, updateActivity, { passive: true })
    })

    // Initial activity timestamp
    updateActivity()
  }

  /**
   * Cleanup all listeners and intervals
   */
  cleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }

    if (this.beforeUnloadListener && typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.beforeUnloadListener)
      this.beforeUnloadListener = null
    }
  }

  /**
   * Force session expiration (for testing or manual logout)
   */
  expireSession(): void {
    sessionService.clearSession()
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }
}

export default SessionCleanupService.getInstance()
