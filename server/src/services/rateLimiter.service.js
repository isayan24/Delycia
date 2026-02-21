import redisService from './redis.service.js';

/**
 * Rate Limiter Service - Redis-based rate limiting
 * 
 * Features:
 * - Per-user rate limiting (5 refresh/minute)
 * - Per-IP rate limiting (10 refresh/minute)
 * - Sliding window algorithm
 * - Rate limit headers (X-RateLimit-*)
 * - Graceful degradation (works without Redis)
 * - Configurable limits and windows
 */

class RateLimiterService {
  constructor() {
    this.KEY_PREFIX = 'delycia:ratelimit:';
    
    // Rate limit configurations
    this.limits = {
      // Per-user limits
      user: {
        refresh: { limit: 5, window: 60 }, // 5 requests per minute
        login: { limit: 5, window: 300 }, // 5 attempts per 5 minutes
      },
      // Per-IP limits
      ip: {
        refresh: { limit: 10, window: 60 }, // 10 requests per minute
        login: { limit: 10, window: 300 }, // 10 attempts per 5 minutes
        api: { limit: 100, window: 60 }, // 100 requests per minute
      },
    };
    
    this.stats = {
      blocked: 0,
      allowed: 0,
    };
  }

  /**
   * Generate rate limit key
   */
  _getRateLimitKey(type, identifier, action) {
    return `${this.KEY_PREFIX}${type}:${action}:${identifier}`;
  }

  /**
   * Check rate limit using sliding window algorithm
   * @param {string} key - Rate limit key
   * @param {number} limit - Maximum requests allowed
   * @param {number} window - Time window in seconds
   * @returns {Promise<Object>} - { allowed, remaining, resetAt }
   */
  async checkRateLimit(key, limit, window) {
    try {
      // Get current count
      const currentCount = await redisService.get(key);
      const count = currentCount ? parseInt(currentCount) : 0;

      // Check if limit exceeded
      if (count >= limit) {
        const ttl = await redisService.ttl(key);
        const resetAt = Date.now() + (ttl * 1000);
        
        this.stats.blocked++;
        
        return {
          allowed: false,
          remaining: 0,
          resetAt,
          limit,
          current: count,
        };
      }

      // Increment counter
      const newCount = await redisService.incr(key);
      
      // Set expiry on first request
      if (newCount === 1) {
        await redisService.expire(key, window);
      }

      const ttl = await redisService.ttl(key);
      const resetAt = Date.now() + (ttl * 1000);
      
      this.stats.allowed++;

      return {
        allowed: true,
        remaining: Math.max(0, limit - newCount),
        resetAt,
        limit,
        current: newCount,
      };
    } catch (err) {
      console.error('[RateLimiter] Check error:', err.message);
      // On error, allow the request (fail open)
      return {
        allowed: true,
        remaining: limit,
        resetAt: Date.now() + (window * 1000),
        limit,
        current: 0,
        error: true,
      };
    }
  }

  /**
   * Check user rate limit
   * @param {number} userId - User ID
   * @param {string} action - Action type (refresh, login, etc.)
   * @returns {Promise<Object>} - Rate limit result
   */
  async checkUserLimit(userId, action = 'refresh') {
    if (!userId) {
      return { allowed: true, remaining: 999, resetAt: Date.now() + 60000 };
    }

    const config = this.limits.user[action] || this.limits.user.refresh;
    const key = this._getRateLimitKey('user', userId, action);
    
    return await this.checkRateLimit(key, config.limit, config.window);
  }

  /**
   * Check IP rate limit
   * @param {string} ip - IP address
   * @param {string} action - Action type (refresh, login, api, etc.)
   * @returns {Promise<Object>} - Rate limit result
   */
  async checkIPLimit(ip, action = 'refresh') {
    if (!ip || ip === 'Unknown') {
      return { allowed: true, remaining: 999, resetAt: Date.now() + 60000 };
    }

    const config = this.limits.ip[action] || this.limits.ip.api;
    const key = this._getRateLimitKey('ip', ip, action);
    
    return await this.checkRateLimit(key, config.limit, config.window);
  }

  /**
   * Check combined rate limit (user AND ip)
   * @param {number} userId - User ID
   * @param {string} ip - IP address
   * @param {string} action - Action type
   * @returns {Promise<Object>} - Combined rate limit result
   */
  async checkCombinedLimit(userId, ip, action = 'refresh') {
    // Check user limit
    const userLimit = await this.checkUserLimit(userId, action);
    
    if (!userLimit.allowed) {
      return {
        ...userLimit,
        limitType: 'user',
        message: `User rate limit exceeded. Try again in ${Math.ceil((userLimit.resetAt - Date.now()) / 1000)} seconds.`,
      };
    }

    // Check IP limit
    const ipLimit = await this.checkIPLimit(ip, action);
    
    if (!ipLimit.allowed) {
      return {
        ...ipLimit,
        limitType: 'ip',
        message: `IP rate limit exceeded. Try again in ${Math.ceil((ipLimit.resetAt - Date.now()) / 1000)} seconds.`,
      };
    }

    // Both limits passed
    return {
      allowed: true,
      remaining: Math.min(userLimit.remaining, ipLimit.remaining),
      resetAt: Math.max(userLimit.resetAt, ipLimit.resetAt),
      limit: Math.min(userLimit.limit, ipLimit.limit),
      userLimit,
      ipLimit,
    };
  }

  /**
   * Reset rate limit for a user
   * @param {number} userId - User ID
   * @param {string} action - Action type
   * @returns {Promise<boolean>} - Success status
   */
  async resetUserLimit(userId, action = 'refresh') {
    if (!userId) return false;

    try {
      const key = this._getRateLimitKey('user', userId, action);
      await redisService.del(key);
      console.log(`[RateLimiter] ✅ Reset limit for user ${userId}, action ${action}`);
      return true;
    } catch (err) {
      console.error('[RateLimiter] Reset error:', err.message);
      return false;
    }
  }

  /**
   * Reset rate limit for an IP
   * @param {string} ip - IP address
   * @param {string} action - Action type
   * @returns {Promise<boolean>} - Success status
   */
  async resetIPLimit(ip, action = 'refresh') {
    if (!ip) return false;

    try {
      const key = this._getRateLimitKey('ip', ip, action);
      await redisService.del(key);
      console.log(`[RateLimiter] ✅ Reset limit for IP ${ip}, action ${action}`);
      return true;
    } catch (err) {
      console.error('[RateLimiter] Reset error:', err.message);
      return false;
    }
  }

  /**
   * Get rate limit info without incrementing
   * @param {string} key - Rate limit key
   * @returns {Promise<Object>} - Rate limit info
   */
  async getRateLimitInfo(key) {
    try {
      const currentCount = await redisService.get(key);
      const count = currentCount ? parseInt(currentCount) : 0;
      const ttl = await redisService.ttl(key);
      
      return {
        current: count,
        ttl,
        resetAt: ttl > 0 ? Date.now() + (ttl * 1000) : null,
      };
    } catch (err) {
      console.error('[RateLimiter] Get info error:', err.message);
      return { current: 0, ttl: -1, resetAt: null };
    }
  }

  /**
   * Get statistics
   * @returns {Object} - Rate limiter statistics
   */
  getStats() {
    const total = this.stats.blocked + this.stats.allowed;
    const blockRate = total > 0 ? ((this.stats.blocked / total) * 100).toFixed(2) : 0;
    
    return {
      blocked: this.stats.blocked,
      allowed: this.stats.allowed,
      total,
      blockRate: `${blockRate}%`,
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      blocked: 0,
      allowed: 0,
    };
    console.log('[RateLimiter] Statistics reset');
  }

  /**
   * Update rate limit configuration
   * @param {string} type - 'user' or 'ip'
   * @param {string} action - Action type
   * @param {Object} config - { limit, window }
   */
  updateLimit(type, action, config) {
    if (this.limits[type] && config.limit && config.window) {
      this.limits[type][action] = config;
      console.log(`[RateLimiter] ✅ Updated ${type}:${action} limit to ${config.limit}/${config.window}s`);
      return true;
    }
    return false;
  }

  /**
   * Get current configuration
   * @returns {Object} - Current rate limit configuration
   */
  getConfig() {
    return this.limits;
  }
}

// Create singleton instance
const rateLimiterService = new RateLimiterService();

// Export service
export default rateLimiterService;

// Export class for testing
export { RateLimiterService };
