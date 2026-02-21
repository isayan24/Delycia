import axios from 'axios'
import { parseCookies } from './server-cookies'
import { createCircuitBreaker, CircuitBreaker } from './circuitBreaker'

/**
 * Result of a successful token refresh
 */
export interface RefreshResult {
  accessToken: string
  refreshToken: string
  setCookieHeaders: string[]
}

/**
 * Retry configuration
 */
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
 * - Retry with exponential backoff (1s, 2s, 4s)
 * - Circuit breaker pattern (opens after 5 failures)
 * - Thread-safe Promise-based coordination
 * - Handles rate limiting (429 responses)
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
    this.circuitBreaker = createCircuitBreaker('ClientRefreshCoordinator', {
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
   * 2. Checks circuit breaker → blocks if open
   * 3. Otherwise, performs a new refresh with retry logic
   *
   * @param request - The incoming Request object (for extracting cookies)
   * @returns RefreshResult with new tokens, or null if refresh failed
   */
  async refreshTokens(request: Request): Promise<RefreshResult | null> {
    const requestId = `req_${++this.requestCounter}`

    // Extract refresh token
    const cookieHeader = request.headers.get('cookie')
    const cookies = parseCookies(cookieHeader)
    const refreshToken = cookies['refresh_token']

    if (!refreshToken) {
      return null
    }

    // Case 1: Refresh already in progress → wait for it
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    // Case 2: Check circuit breaker
    if (this.circuitBreaker.isOpen()) {
      console.warn(`[ClientRefreshCoordinator:${requestId}] Circuit breaker is OPEN - blocking refresh attempt`)
      return null
    }

    // Case 3: Perform new refresh with retry logic
    this.refreshPromise = this.performRefreshWithRetry(request, requestId, refreshToken)

    try {
      const result = await this.refreshPromise
      return result
    } finally {
      // Clear the promise so future requests can refresh again
      this.refreshPromise = null
    }
  }

  /**
   * Perform refresh with retry logic and exponential backoff
   */
  private async performRefreshWithRetry(
    request: Request,
    requestId: string,
    refreshToken: string,
  ): Promise<RefreshResult | null> {
    let lastError: any = null

    for (let attempt = 1; attempt <= this.retryConfig.maxAttempts; attempt++) {
      try {
        // Execute through circuit breaker
        const result = await this.circuitBreaker.execute(() => 
          this.performRefresh(request, requestId, refreshToken, attempt)
        )
        
        // Success!
        if (result) {
          if (attempt > 1) {
            console.log(`[ClientRefreshCoordinator:${requestId}] ✅ Succeeded on attempt ${attempt}`)
          }
          return result
        }
        
        lastError = new Error('Refresh returned null')
      } catch (error: any) {
        lastError = error
        console.warn(`[ClientRefreshCoordinator:${requestId}] Attempt ${attempt}/${this.retryConfig.maxAttempts} failed:`, error.message)
        
        // Don't retry on circuit breaker errors
        if (error.message?.includes('Circuit breaker')) {
          return null
        }
        
        // Don't retry on 401 (session expired) or 429 (rate limited)
        if (error.status === 401 || error.status === 429) {
          return null
        }
      }

      // If not last attempt, wait before retrying
      if (attempt < this.retryConfig.maxAttempts) {
        const delay = this.calculateBackoff(attempt)
        console.log(`[ClientRefreshCoordinator:${requestId}] Retrying in ${delay}ms...`)
        await this.sleep(delay)
      }
    }

    // All attempts failed
    console.error(`[ClientRefreshCoordinator:${requestId}] ❌ All ${this.retryConfig.maxAttempts} attempts failed`)
    return null
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
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Perform the actual refresh call to BFF
   */
  private async performRefresh(
    request: Request,
    requestId: string,
    refreshToken: string,
    attempt: number = 1,
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
        console.error(`[ClientRefreshCoordinator] Backend returned unexpected data`)
        return null
      }

      const { access_token, refresh_token } = data

      // Update last refresh time
      this.lastRefreshTime = Date.now()

      // Build Set-Cookie headers for the new tokens
      const isProduction = process.env.NODE_ENV === 'production'
      const secure = isProduction ? 'Secure;' : ''
      const setCookieHeaders = [
        `access_token=${access_token}; Max-Age=${7 * 24 * 60 * 60}; HttpOnly; ${secure} SameSite=strict; Path=/`,
        `refresh_token=${refresh_token}; Max-Age=${30 * 24 * 60 * 60}; HttpOnly; ${secure} SameSite=strict; Path=/`,
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
        console.warn(`[ClientRefreshCoordinator:${requestId}] ⚠️  Rate limited - retry after ${retryAfter}s`)
        const rateLimitError: any = new Error('Rate limited')
        rateLimitError.status = 429
        throw rateLimitError
      }
      
      // Check if this is a backend 401 (session truly expired)
      if (error?.response?.status === 401) {
        const authError: any = new Error('Session expired')
        authError.status = 401
        throw authError
      }
      
      // Check if this is a timeout error
      if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
        console.error(`[ClientRefreshCoordinator:${requestId}] Request timed out - backend not responding`)
        throw new Error('Network timeout')
      }
      
      // Otherwise it's a network error - throw to trigger retry
      console.error(`[ClientRefreshCoordinator:${requestId}] Network error:`, error?.message)
      throw new Error('Network error')
    }
  }

  /**
   * Reset coordinator state (useful for testing)
   */
  reset(): void {
    this.refreshPromise = null
    this.lastRefreshTime = 0
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
