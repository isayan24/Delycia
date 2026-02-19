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
 * - Cache-first: Checks token cache BEFORE attempting refresh
 * - Deduplicates concurrent refresh attempts
 * - Caches tokens under BOTH old and new refresh tokens (handles rotation)
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
   * 1. Checks token cache FIRST → returns cached token if available
   * 2. Checks if a refresh is already in progress → waits for it
   * 3. Otherwise, performs a new refresh
   *
   * @param request - The incoming Request object (for extracting cookies)
   * @returns RefreshResult with new tokens, or null if refresh failed
   */
  async refreshTokens(request: Request): Promise<RefreshResult | null> {
    const requestId = `req_${++this.requestCounter}`

    // Extract refresh token for cache lookup
    const cookieHeader = request.headers.get('cookie')
    const cookies = parseCookies(cookieHeader)
    const refreshToken = cookies['refresh_token']

    if (!refreshToken) {
      return null
    }

    // CRITICAL: Check cache FIRST before checking in-flight refresh
    // This prevents thundering herd when 100+ requests hit at once
    const cachedToken = tokenCache.get(refreshToken)
    if (cachedToken) {
      // Return cached token with empty setCookieHeaders (cookies already set)
      return {
        accessToken: cachedToken,
        refreshToken: refreshToken,
        setCookieHeaders: [],
      }
    }

    // Case 1: Refresh already in progress → wait for it
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    // Case 2: Perform new refresh
    this.refreshPromise = this.performRefresh(request, requestId, refreshToken)

    try {
      const result = await this.refreshPromise
      return result
    } finally {
      // Clear the promise so future requests can refresh again
      this.refreshPromise = null
    }
  }

  /**
   * Perform the actual refresh call to BFF
   */
  private async performRefresh(
    request: Request,
    requestId: string,
    oldRefreshToken: string,
  ): Promise<RefreshResult | null> {
    const isServer = typeof window === 'undefined'

    try {
      const cookieHeader = request.headers.get('cookie')

      // Build URL - use full URL in SSR, relative in browser
      const baseUrl = isServer
        ? process.env.VITE_APP_URL || 'http://localhost:4000'
        : ''
      const url = `${baseUrl}/api/auth/refresh`

      // Use plain axios to call BFF route (NOT axiosInstance which calls backend directly)
      const response = await axios.post(
        url,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            ...(isServer && cookieHeader ? { Cookie: cookieHeader } : {}),
          },
          withCredentials: true,
          timeout: 15000, // 15 second timeout
        },
      )

      const data = response.data

      // Validate response
      if (!data?.access_token || !data?.refresh_token) {
        console.error(`[RefreshCoordinator] Backend returned unexpected data`)
        return null
      }

      const { access_token, refresh_token } = data

      // Update last refresh time
      this.lastRefreshTime = Date.now()

      // CRITICAL: Cache under BOTH old and new refresh tokens to handle token rotation
      tokenCache.set(oldRefreshToken, access_token, refresh_token)

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        setCookieHeaders: [], // BFF handles cookies
      }
    } catch (error: any) {
      console.error(
        `[RefreshCoordinator] Refresh failed:`,
        error?.response?.data?.message || error?.message,
      )
      return null
    }
  }

  /**
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
