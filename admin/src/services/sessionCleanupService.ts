import sessionService from './sessionService'

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
    this.setupVisibilityChangeHandler()
  }

  /**
   * Start periodic session validation via server
   */
  private startPeriodicCleanup(): void {
    // Check session validity every 5 minutes by calling server
    this.cleanupInterval = setInterval(
      async () => {
        const isValid = await sessionService.isSessionValid()
        if (!isValid) {
          console.log('Session expired, clearing...')
          sessionService.clearSession()

          // Redirect to login page if session expired
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
        }
      },
      5 * 60 * 1000,
    ) // 5 minutes
  }

  /**
   * Setup handler for browser close/refresh
   */
  private setupBeforeUnloadHandler(): void {
    if (typeof window === 'undefined') return

    this.beforeUnloadListener = () => {
      // Optional: Clear session on browser close
      // Uncomment if you want to clear session when browser closes
      // sessionService.clearSession();
    }

    window.addEventListener('beforeunload', this.beforeUnloadListener)
  }

  /**
   * Setup handler for tab visibility changes
   */
  private setupVisibilityChangeHandler(): void {
    if (typeof window === 'undefined') return

    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible') {
        // Tab became visible, check session validity via server
        const isValid = await sessionService.isSessionValid()
        if (!isValid) {
          console.log('Session expired while tab was hidden')
          sessionService.clearSession()
          window.location.href = '/login'
        }
      }
    })
  }

  /**
   * Schedule session renewal for active users
   * Note: With httpOnly cookies, renewal happens automatically on the server
   * This is now a no-op but kept for compatibility
   */
  scheduleSessionRenewal(): void {
    // Session renewal is handled automatically by server routes
    // Token refresh happens via axios interceptor on 401 responses
    // No client-side action needed
  }

  /**
   * Check if user is active (has interacted recently)
   */
  private isUserActive(): boolean {
    // Simple activity detection - can be enhanced
    const lastActivity = localStorage.getItem('lastActivity')
    if (!lastActivity) return false

    const lastActivityTime = parseInt(lastActivity)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000

    return lastActivityTime > fiveMinutesAgo
  }

  /**
   * Track user activity
   */
  trackActivity(): void {
    if (typeof window === 'undefined') return

    const updateActivity = () => {
      localStorage.setItem('lastActivity', Date.now().toString())
    }

    // Track various user interactions
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
