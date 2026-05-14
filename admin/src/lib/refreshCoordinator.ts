import axios from 'axios'
import { parseCookies } from './server-cookies'
import { createCircuitBreaker, CircuitBreaker } from './circuitBreaker'

 
// Result of a successful token refresh
 
export interface RefreshResult {
  accessToken: string
  refreshToken: string
  setCookieHeaders: string[]
}


// Reason why refresh failed (helps withAuth decide whether to trigger logout)

export enum RefreshFailureReason {
  NO_COOKIES = 'NO_COOKIES', // This request had no cookies (SSR race condition)
  BACKEND_ERROR = 'BACKEND_ERROR', // Backend rejected the refresh (true session expiry)
  NETWORK_ERROR = 'NETWORK_ERROR', // Network error during refresh
  RATE_LIMITED = 'RATE_LIMITED', // Rate limit exceeded (429)
  CIRCUIT_OPEN = 'CIRCUIT_OPEN', // Circuit breaker is open
}

// 
// Extended result that includes failure reason
// 
export type RefreshResultOrFailure =
  | RefreshResult
  | { failed: true; reason: RefreshFailureReason }


// Retry configuration

interface RetryConfig {
  maxAttempts: number
  baseDelay: number // Base delay in ms (will be exponentially increased)
  maxDelay: number // Maximum delay in ms
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
 * - Retry with exponential backoff (1s, 2s, 4s)
 * - Circuit breaker pattern (opens after 5 failures)
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

  // Cached last successful refresh result
  private lastRefreshResult: RefreshResult | null = null

  // Minimum time between refreshes (5 seconds)
  private readonly MIN_REFRESH_INTERVAL = 5000

  // Request counter for logging
  private requestCounter = 0

  // Circuit breaker for refresh endpoint
  private circuitBreaker: CircuitBreaker

  // Retry configuration
  private retryConfig: RetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 8000, // 8 seconds max
  }

  private constructor() {
    // Initialize circuit breaker
    this.circuitBreaker = createCircuitBreaker('RefreshCoordinator', {
      failureThreshold: 5, // Open after 5 consecutive failures
      successThreshold: 2, // Close after 2 consecutive successes
      timeout: 30000, // Try again after 30 seconds
    })
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
  async refreshTokens(
    request: Request,
  ): Promise<RefreshResultOrFailure | null> {
    const requestId = `req_${++this.requestCounter}`

    // 1: Refresh already in progress → wait for it
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    // 2: Refreshed recently → return cached result
    if (this.shouldSkipRefresh() && this.lastRefreshResult) {
      return this.lastRefreshResult
    }

    // 3: Check circuit breaker
    if (this.circuitBreaker.isOpen()) {
      console.warn(
        `[RefreshCoordinator:${requestId}] Circuit breaker is OPEN - blocking refresh attempt`,
      )
      return { failed: true, reason: RefreshFailureReason.CIRCUIT_OPEN }
    }

    // 4: Perform new refresh with retry logic
    this.refreshPromise = this.performRefreshWithRetry(request, requestId)

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
   * Perform refresh with retry logic and exponential backoff
   */
  private async performRefreshWithRetry(
    request: Request,
    requestId: string,
  ): Promise<RefreshResultOrFailure | null> {
    let lastError: any = null

    for (let attempt = 1; attempt <= this.retryConfig.maxAttempts; attempt++) {
      try {
        // Execute through circuit breaker
        const result = await this.circuitBreaker.execute(() =>
          this.performRefresh(request, requestId, attempt),
        )

        // Success!
        if (result && 'accessToken' in result) {
          if (attempt > 1) {
            console.log(
              `[RefreshCoordinator:${requestId}] ✅ Succeeded on attempt ${attempt}`,
            )
          }
          // Cache the successful result for concurrent callers
          this.lastRefreshResult = result as RefreshResult
          return result
        }

        // Failed with specific reason (don't retry)
        if (result && 'failed' in result) {
          // Don't retry on these errors
          if (
            result.reason === RefreshFailureReason.NO_COOKIES ||
            result.reason === RefreshFailureReason.BACKEND_ERROR ||
            result.reason === RefreshFailureReason.RATE_LIMITED
          ) {
            return result
          }
          lastError = result
        }
      } catch (error: any) {
        lastError = error
        console.warn(
          `[RefreshCoordinator:${requestId}] Attempt ${attempt}/${this.retryConfig.maxAttempts} failed:`,
          error.message,
        )

        // Don't retry on non-network errors
        if (error.message?.includes('Circuit breaker')) {
          return { failed: true, reason: RefreshFailureReason.CIRCUIT_OPEN }
        }
      }

      // If not last attempt, wait before retrying
      if (attempt < this.retryConfig.maxAttempts) {
        const delay = this.calculateBackoff(attempt)
        console.log(
          `[RefreshCoordinator:${requestId}] Retrying in ${delay}ms...`,
        )
        await this.sleep(delay)
      }
    }

    // All attempts failed
    console.error(
      `[RefreshCoordinator:${requestId}] ❌ All ${this.retryConfig.maxAttempts} attempts failed`,
    )
    return { failed: true, reason: RefreshFailureReason.NETWORK_ERROR }
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoff(attempt: number): number {
    const delay = this.retryConfig.baseDelay * Math.pow(2, attempt - 1)
    return Math.min(delay, this.retryConfig.maxDelay)
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Perform the actual refresh call to BFF
   */
  private async performRefresh(
    request: Request,
    requestId: string,
    attempt: number = 1,
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
          console.error(
            `[RefreshCoordinator] No refresh token in browser - user needs to login`,
          )
          return { failed: true, reason: RefreshFailureReason.BACKEND_ERROR }
        }
      }

      // Build URL - use full URL in SSR, relative in browser
      const baseUrl = isServer
        ? process.env.VITE_APP_URL || 'http://localhost:4500'
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

      // Build Set-Cookie headers for the new tokens
      const isProduction = process.env.NODE_ENV === 'production'
      const secure = isProduction ? 'Secure;' : ''
      const setCookieHeaders = [
        `admin_access_token=${access_token}; Max-Age=${7 * 24 * 60 * 60}; HttpOnly; ${secure} SameSite=strict; Path=/`,
        `admin_refresh_token=${refresh_token}; Max-Age=${30 * 24 * 60 * 60}; HttpOnly; ${secure} SameSite=strict; Path=/`,
      ]

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        setCookieHeaders,
      }
    } catch (error: any) {
      // Check if this is a rate limit error (429)
      if (error?.response?.status === 429) {
        const retryAfter = error?.response?.headers?.['retry-after'] || 60
        console.warn(
          `[RefreshCoordinator:${requestId}] ⚠️  Rate limited - retry after ${retryAfter}s`,
        )
        return { failed: true, reason: RefreshFailureReason.RATE_LIMITED }
      }

      // Check if this is a timeout error
      if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
        console.error(
          `[RefreshCoordinator:${requestId}] Request timed out - backend not responding`,
        )
        throw new Error('Network timeout')
      }

      // Check if this is a backend 401 (session truly expired)
      if (error?.response?.status === 401) {
        return { failed: true, reason: RefreshFailureReason.BACKEND_ERROR }
      }

      // Otherwise it's a network error - throw to trigger retry
      console.error(
        `[RefreshCoordinator:${requestId}] Network error:`,
        error?.message,
      )
      throw new Error('Network error')
    }
  }

  /**
   * Reset coordinator state (useful for testing)
   */
  reset(): void {
    this.refreshPromise = null
    this.lastRefreshTime = 0
    this.lastRefreshResult = null
    this.requestCounter = 0
    this.circuitBreaker.reset()
  }

  /**
   * Get current state (useful for debugging)
   */
  getState(): {
    isRefreshing: boolean
    lastRefreshTime: number
    timeSinceLastRefresh: number
    circuitBreaker: any
  } {
    return {
      isRefreshing: this.refreshPromise !== null,
      lastRefreshTime: this.lastRefreshTime,
      timeSinceLastRefresh:
        this.lastRefreshTime > 0 ? Date.now() - this.lastRefreshTime : -1,
      circuitBreaker: this.circuitBreaker.getStats(),
    }
  }
}

// Export singleton instance
export const refreshCoordinator = RefreshCoordinator.getInstance()

// Export class for testing
export { RefreshCoordinator }
