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

  /**
   * Store tokens in cache (keyed by refresh token)
   */
  set(refreshToken: string, accessToken: string): void {
    this.cache.set(refreshToken, {
      accessToken,
      refreshToken,
      timestamp: Date.now(),
    })
    
    // Clean up old entries
    this.cleanup()
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
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.TTL) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Clear all cached tokens (useful for testing)
   */
  clear(): void {
    this.cache.clear()
  }
}

export const tokenCache = new TokenCache()
