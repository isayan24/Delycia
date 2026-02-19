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
 * Reason why refresh failed (helps withAuth decide whether to trigger logout)
 */
export enum RefreshFailureReason {
  NO_COOKIES = 'NO_COOKIES', // This request had no cookies (SSR race condition)
  BACKEND_ERROR = 'BACKEND_ERROR', // Backend rejected the refresh (true session expiry)
  NETWORK_ERROR = 'NETWORK_ERROR', // Network error during refresh
}

/**
 * Extended result that includes failure reason
 */
export type RefreshResultOrFailure = RefreshResult | { failed: true; reason: RefreshFailureReason }

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
  private refreshPromise: Promise<RefreshResultOrFailure | null> | null = null

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
   * 2. Checks cache FIRST (before checking timing) → returns cached token
   * 3. Checks if we refreshed recently → returns cached result (if available)
   * 4. Otherwise, performs a new refresh
   *
   * @param request - The incoming Request object (for extracting cookies)
   * @returns RefreshResult with new tokens, or failure object with reason
   */
  async refreshTokens(request: Request): Promise<RefreshResultOrFailure | null> {
    const requestId = `req_${++this.requestCounter}`

    // Extract refresh token early for cache lookup
    const cookieHeader = request.headers.get('cookie')
    const cookies = parseCookies(cookieHeader)
    const refreshToken = cookies['admin_refresh_token']

    // CRITICAL: Check cache FIRST before any other logic
    // This prevents 100+ cache misses when parallel requests arrive
    if (refreshToken) {
      const cachedAccessToken = tokenCache.get(refreshToken)
      if (cachedAccessToken) {
        console.log(`[RefreshCoordinator:${requestId}] ✅ Using cached token (no refresh needed)`)
        return {
          accessToken: cachedAccessToken,
          refreshToken: refreshToken,
          setCookieHeaders: [],
        }
      }
    }

    // Case 1: Refresh already in progress → wait for it
    if (this.refreshPromise) {
      console.log(`[RefreshCoordinator:${requestId}] Waiting for in-flight refresh...`)
      return this.refreshPromise
    }

    // Case 2: Refreshed recently → try to use cached token (already checked above)
    if (this.shouldSkipRefresh()) {
      console.log(`[RefreshCoordinator:${requestId}] Skipping refresh (too soon), but cache was empty`)
      // Cache was already checked above and was empty, so we need to refresh
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
   * Perform the actual refresh call to BFF
   */
  private async performRefresh(
    request: Request,
    requestId: string,
  ): Promise<RefreshResultOrFailure | null> {
    const isServer = typeof window === 'undefined'
    
    try {
      // Extract refresh token from httpOnly cookie
      const cookieHeader = request.headers.get('cookie')
      const cookies = parseCookies(cookieHeader)
      const refreshToken = cookies['admin_refresh_token']

      if (!refreshToken) {
        if (isServer) {
          // SSR context - this is expected for initial renders without cookies
          return { failed: true, reason: RefreshFailureReason.NO_COOKIES }
        } else {
          // Client context - user needs to login
          console.error(`[RefreshCoordinator] No refresh token in browser - user needs to login`)
          return { failed: true, reason: RefreshFailureReason.BACKEND_ERROR }
        }
      }

      // Build URL - use full URL in SSR, relative in browser
      const baseUrl = isServer 
        ? (process.env.VITE_APP_URL || 'http://localhost:4500')
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
          timeout: 15000, // 15 second timeout for refresh requests
        },
      )

      const data = response.data

      // Validate response
      if (!data?.access_token || !data?.refresh_token) {
        console.error(`[RefreshCoordinator] Backend returned unexpected data`)
        return { failed: true, reason: RefreshFailureReason.BACKEND_ERROR }
      }

      const { access_token, refresh_token } = data

      // Update last refresh time
      this.lastRefreshTime = Date.now()

      // Cache the new tokens for immediate use in parallel requests
      // CRITICAL: Cache under BOTH old and new refresh tokens to handle token rotation
      tokenCache.set(refreshToken, access_token, refresh_token)

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
      
      // Check if this is a timeout error
      if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
        console.error(`[RefreshCoordinator:${requestId}] Request timed out - backend not responding`)
        return { failed: true, reason: RefreshFailureReason.NETWORK_ERROR }
      }
      
      // Check if this is a backend 401 (session truly expired)
      if (error?.response?.status === 401) {
        return { failed: true, reason: RefreshFailureReason.BACKEND_ERROR }
      }
      
      // Otherwise it's a network error
      return { failed: true, reason: RefreshFailureReason.NETWORK_ERROR }
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
