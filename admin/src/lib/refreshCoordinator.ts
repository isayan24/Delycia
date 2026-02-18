import axios from 'axios'
import { parseCookies } from './server-cookies'
import { tokenCache } from './tokenCache'

/**
 * Result of a successful token refresh
 */
export interface RefreshResult {
  accessToken: string
  refreshToken: string
  setCookieHeaders: string[]
}

/**
 * Centralized token refresh coordinator for server-side BFF routes.
 *
 * This singleton ensures that only ONE token refresh happens at a time,
 * even when multiple concurrent requests need a refresh.
 *
 * Key features:
 * - Deduplicates concurrent refresh attempts
 * - Enforces minimum time between refreshes (5 seconds)
 * - Provides structured logging for debugging
 * - Thread-safe Promise-based coordination
 *
 * Usage:
 * ```ts
 * import { refreshCoordinator } from './refreshCoordinator'
 *
 * const result = await refreshCoordinator.refreshTokens(request)
 * if (result) {
 *   // Use result.accessToken and result.setCookieHeaders
 * }
 * ```
 */
class RefreshCoordinator {
  private static instance: RefreshCoordinator

  // In-flight refresh promise for deduplication
  private refreshPromise: Promise<RefreshResult | null> | null = null

  // Last successful refresh timestamp
  private lastRefreshTime: number = 0

  // Minimum time between refreshes (5 seconds)
  private readonly MIN_REFRESH_INTERVAL = 5000

  // Request counter for logging
  private requestCounter = 0

  private constructor() {
    // RefreshCoordinator initialized
  }

  /**
   * Get singleton instance
   */
  static getInstance(): RefreshCoordinator {
    if (!RefreshCoordinator.instance) {
      RefreshCoordinator.instance = new RefreshCoordinator()
    }
    return RefreshCoordinator.instance
  }

  /**
   * Attempt to refresh tokens with intelligent deduplication.
   *
   * This method:
   * 1. Checks if a refresh is already in progress → waits for it
   * 2. Checks if we refreshed recently → returns cached result
   * 3. Otherwise, performs a new refresh
   *
   * @param request - The incoming Request object (for extracting cookies)
   * @returns RefreshResult with new tokens, or null if refresh failed
   */
  async refreshTokens(request: Request): Promise<RefreshResult | null> {
    const requestId = `req_${++this.requestCounter}`

    // Case 1: Refresh already in progress → wait for it
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    // Case 2: Refreshed recently → skip (prevent refresh storms)
    if (this.shouldSkipRefresh()) {
      return null
    }

    // Case 3: Perform new refresh
    this.refreshPromise = this.performRefresh(request, requestId)

    try {
      const result = await this.refreshPromise
      return result
    } finally {
      // Clear the promise so future requests can refresh again
      this.refreshPromise = null
    }
  }

  /**
   * Check if we should skip refresh based on timing
   */
  private shouldSkipRefresh(): boolean {
    if (this.lastRefreshTime === 0) return false
    const timeSinceLastRefresh = Date.now() - this.lastRefreshTime
    return timeSinceLastRefresh < this.MIN_REFRESH_INTERVAL
  }

  /**
   * Perform the actual refresh call to backend
   */
  private async performRefresh(
    request: Request,
    requestId: string,
  ): Promise<RefreshResult | null> {
    try {
      // Extract refresh token from httpOnly cookie
      const cookieHeader = request.headers.get('cookie')
      const cookies = parseCookies(cookieHeader)
      const refreshToken = cookies['admin_refresh_token']

      if (!refreshToken) {
        console.error(
          `[RefreshCoordinator:${requestId}] No refresh token - session expired`,
        )
        return null
      }

      // Detect if we're in server-side context
      const isServer = typeof window === 'undefined'
      
      // Build URL - use full URL in SSR, relative in browser
      const baseUrl = isServer 
        ? (process.env.VITE_APP_URL || 'http://localhost:4500')
        : ''
      const url = `${baseUrl}/api/auth/refresh`

      // Use plain axios to call BFF route (NOT axiosInstance which calls backend directly)
      // Flow: RefreshCoordinator → BFF /api/auth/refresh → Backend /users/auth/refresh
      const response = await axios.post(
        url,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            ...(isServer && cookieHeader ? { Cookie: cookieHeader } : {}),
          },
          withCredentials: true,
        },
      )

      const data = response.data

      // Validate response
      if (!data?.access_token || !data?.refresh_token) {
        console.error(
          `[RefreshCoordinator:${requestId}] Backend returned unexpected data:`,
          data,
        )
        return null
      }

      const { access_token, refresh_token } = data

      // Update last refresh time
      this.lastRefreshTime = Date.now()

      // Cache the new tokens for immediate use in parallel requests
      tokenCache.set(refreshToken, access_token)

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        setCookieHeaders: [], // BFF handles cookies
      }
    } catch (error: any) {
      console.error(
        `[RefreshCoordinator:${requestId}] ❌ Refresh failed:`,
        error?.response?.data || error?.message || error,
      )
      return null
    }
  }  /**
   * Reset coordinator state (useful for testing)
   */
  reset(): void {
    this.refreshPromise = null
    this.lastRefreshTime = 0
    this.requestCounter = 0
  }

  /**
   * Get current state (useful for debugging)
   */
  getState(): {
    isRefreshing: boolean
    lastRefreshTime: number
    timeSinceLastRefresh: number
  } {
    return {
      isRefreshing: this.refreshPromise !== null,
      lastRefreshTime: this.lastRefreshTime,
      timeSinceLastRefresh:
        this.lastRefreshTime > 0 ? Date.now() - this.lastRefreshTime : -1,
    }
  }
}

// Export singleton instance
export const refreshCoordinator = RefreshCoordinator.getInstance()

// Export class for testing
export { RefreshCoordinator }
