/**
 * In-memory token cache for SSR context.
 *
 * Problem: During SSR, multiple API calls happen in parallel. When one call
 * refreshes the token, it sets new cookies in the response. But other parallel
 * calls still read the OLD cookies from the request, causing them to fail.
 *
 * Solution: Cache the latest tokens in memory (per user) so all requests in
 * the same SSR cycle use the freshest token, even before cookies are updated.
 *
 * This cache is:
 * - Short-lived (5 minute TTL)
 * - User-specific (keyed by refresh token)
 * - Automatically cleaned up
 */

interface CachedToken {
  accessToken: string
  refreshToken: string
  timestamp: number
}

class TokenCache {
  private cache: Map<string, CachedToken> = new Map()
  private readonly TTL = 5 * 60 * 1000 // 5 minutes
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Start automatic cleanup on initialization
    this.scheduleCleanup()
  }

  /**
   * Store tokens in cache (keyed by refresh token)
   * Also stores under new refresh token if provided (for token rotation)
   */
  set(
    refreshToken: string,
    accessToken: string,
    newRefreshToken?: string,
  ): void {
    const entry = {
      accessToken,
      refreshToken: newRefreshToken || refreshToken,
      timestamp: Date.now(),
    }

    // Always cache under the current refresh token
    this.cache.set(refreshToken, entry)

    // If we have a new refresh token (from rotation), also cache under that
    if (newRefreshToken && newRefreshToken !== refreshToken) {
      this.cache.set(newRefreshToken, entry)
    }
  }

  /**
   * Get cached access token for a refresh token
   */
  get(refreshToken: string): string | null {
    const cached = this.cache.get(refreshToken)

    if (!cached) {
      return null
    }

    // Check if expired
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(refreshToken)
      return null
    }

    return cached.accessToken
  }

  /**
   * Get the number of cached tokens (for debugging/testing)
   */
  size(): number {
    return this.cache.size
  }

  /**
   * Clear all cached tokens (useful for testing)
   */
  clear(): void {
    this.cache.clear()

    // Stop cleanup interval if it exists
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }

    // Restart cleanup interval
    this.scheduleCleanup()
  }

  /**
   * Schedule automatic cleanup of expired tokens every 5 minutes
   */
  private scheduleCleanup(): void {
    // Clear existing interval if any
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }

    // Schedule cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, this.TTL)

    // Prevent the interval from keeping the process alive
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref()
    }
  }

  /**
   * Remove expired entries from cache
   */
  private cleanup(): void {
    const now = Date.now()
    let removedCount = 0

    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.TTL) {
        this.cache.delete(key)
        removedCount++
      }
    }

    if (removedCount > 0) {
      console.log(`[TokenCache] Cleaned up ${removedCount} expired token(s)`)
    }
  }
}

export const tokenCache = new TokenCache()
