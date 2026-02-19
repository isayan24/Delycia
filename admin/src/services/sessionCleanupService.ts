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
   * REMOVED: Periodic validation now handled by TanStack Query's useAdminAuthQuery
   * with proper caching (1 minute staleTime). This eliminates redundant API calls.
   */
  private startPeriodicCleanup(): void {
    // No-op: Session validation is now handled by TanStack Query
    // The useAdminAuthQuery hook manages session state with proper caching
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
