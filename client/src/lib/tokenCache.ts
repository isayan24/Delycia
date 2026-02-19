/**
 * In-memory token cache for SSR token refresh coordination.
 *
 * Problem: During SSR, multiple parallel API calls read the same request cookies.
 * When one request refreshes the token, other parallel requests still have the old token.
 * Cookies only update in the HTTP response, which is too late for parallel requests.
 *
 * Solution: Cache the latest access token in memory (keyed by refresh token).
 * All parallel requests check the cache FIRST before using cookies.
 *
 * This ensures all parallel SSR requests use the SAME fresh token.
 *
 * CRITICAL: Supports token rotation by caching under BOTH old and new refresh tokens.
 */

interface CachedToken {
  accessToken: string
  timestamp: number
}

class TokenCache {
  private cache: Map<string, CachedToken> = new Map()
  private readonly TTL = 5 * 60 * 1000 // 5 minutes
  private cleanupInterval: NodeJS.Timeout | null = null

  /**
   * Store a fresh access token in the cache.
   * CRITICAL: If newRefreshToken is provided (token rotation), cache under BOTH tokens.
   *
   * @param refreshToken - The old refresh token (used as cache key)
   * @param accessToken - The fresh access token to cache
   * @param newRefreshToken - The new refresh token (if token rotation occurred)
   */
  set(
    refreshToken: string,
    accessToken: string,
    newRefreshToken?: string,
  ): void {
    const entry: CachedToken = {
      accessToken,
      timestamp: Date.now(),
    }

    // Always cache under the old refresh token
    this.cache.set(refreshToken, entry)

    // If we have a new refresh token (from rotation), also cache under that
    if (newRefreshToken && newRefreshToken !== refreshToken) {
      this.cache.set(newRefreshToken, entry)
    }

    // Schedule cleanup if not already scheduled
    this.scheduleCleanup()
  }

  /**
   * Retrieve a cached access token if it exists and hasn't expired.
   * @param refreshToken - The refresh token (cache key)
   * @returns The cached access token, or null if not found/expired
   */
  get(refreshToken: string): string | null {
    const cached = this.cache.get(refreshToken)

    if (!cached) {
      return null
    }

    // Check if expired
    const age = Date.now() - cached.timestamp
    if (age > this.TTL) {
      this.cache.delete(refreshToken)
      return null
    }

    return cached.accessToken
  }

  /**
   * Remove a specific token from the cache.
   * @param refreshToken - The refresh token (cache key)
   */
  delete(refreshToken: string): void {
    this.cache.delete(refreshToken)
  }

  /**
   * Clear all cached tokens.
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get the current cache size (for debugging).
   */
  size(): number {
    return this.cache.size
  }

  /**
   * Schedule periodic cleanup of expired tokens.
   * Runs every 5 minutes to prevent memory leaks.
   */
  private scheduleCleanup(): void {
    if (this.cleanupInterval) {
      return // Already scheduled
    }

    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      let removedCount = 0

      for (const [key, value] of this.cache.entries()) {
        if (now - value.timestamp > this.TTL) {
          this.cache.delete(key)
          removedCount++
        }
      }

      // Stop cleanup if cache is empty
      if (this.cache.size === 0 && this.cleanupInterval) {
        clearInterval(this.cleanupInterval)
        this.cleanupInterval = null
      }
    }, this.TTL) // Run every 5 minutes
  }

  /**
   * Stop the cleanup interval (useful for testing or shutdown).
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

// Export singleton instance
export const tokenCache = new TokenCache()

// Export class for testing
export { TokenCache }
