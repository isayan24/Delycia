import rateLimiterService from '../services/rateLimiter.service.js';
import jwt from 'jsonwebtoken';

/**
 * Rate Limiter Middleware
 * 
 * Applies rate limiting to routes based on user ID and IP address
 */

/**
 * Extract user ID from token
 */
const extractUserId = (req) => {
  try {
    // Try access token first
    let token = req.headers?.authorization?.split(" ")[1] || req.cookies?.access_token;
    
    if (token) {
      const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
      return decoded.id;
    }

    // Try refresh token
    token = req.cookies?.refresh_token || req.headers?.['x-refresh-token'];
    
    if (token) {
      const decoded = jwt.verify(token, process.env.REFRESH_SECRET);
      return decoded.id;
    }

    return null;
  } catch (err) {
    return null;
  }
};

/**
 * Extract IP address from request
 */
const extractIP = (req) => {
  return req.ip || 
         req.headers['x-forwarded-for']?.split(',')[0] || 
         req.connection?.remoteAddress || 
         'Unknown';
};

/**
 * Create rate limiter middleware
 * @param {string} action - Action type (refresh, login, api, etc.)
 * @returns {Function} - Express middleware
 */
export const createRateLimiter = (action = 'api') => {
  return async (req, res, next) => {
    try {
      const userId = extractUserId(req);
      const ip = extractIP(req);

      // Check rate limit
      const result = await rateLimiterService.checkCombinedLimit(userId, ip, action);

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', result.limit || 100);
      res.setHeader('X-RateLimit-Remaining', result.remaining || 0);
      res.setHeader('X-RateLimit-Reset', result.resetAt || Date.now() + 60000);

      if (!result.allowed) {
        const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
        res.setHeader('Retry-After', retryAfter);

        console.warn(`[RateLimiter] ⚠️  Blocked ${result.limitType} - User: ${userId}, IP: ${ip}, Action: ${action}`);

        return res.status(429).json({
          status: false,
          error: 'Too many requests',
          message: result.message || 'Rate limit exceeded. Please try again later.',
          retryAfter,
          limit: result.limit,
          resetAt: result.resetAt,
        });
      }

      // Log if close to limit (80% threshold)
      if (result.remaining < result.limit * 0.2) {
        console.warn(`[RateLimiter] ⚠️  Near limit - User: ${userId}, IP: ${ip}, Remaining: ${result.remaining}/${result.limit}`);
      }

      next();
    } catch (err) {
      console.error('[RateLimiter] Middleware error:', err.message);
      // On error, allow the request (fail open)
      next();
    }
  };
};

/**
 * Rate limiter for token refresh endpoint
 */
export const refreshRateLimiter = createRateLimiter('refresh');

/**
 * Rate limiter for login endpoint
 */
export const loginRateLimiter = createRateLimiter('login');

/**
 * Rate limiter for general API endpoints
 */
export const apiRateLimiter = createRateLimiter('api');

/**
 * Custom rate limiter with specific limits
 * @param {Object} options - { userLimit, userWindow, ipLimit, ipWindow }
 * @returns {Function} - Express middleware
 */
export const customRateLimiter = (options) => {
  const { userLimit, userWindow, ipLimit, ipWindow, action = 'custom' } = options;

  // Update rate limiter configuration
  if (userLimit && userWindow) {
    rateLimiterService.updateLimit('user', action, { limit: userLimit, window: userWindow });
  }
  if (ipLimit && ipWindow) {
    rateLimiterService.updateLimit('ip', action, { limit: ipLimit, window: ipWindow });
  }

  return createRateLimiter(action);
};

export default {
  createRateLimiter,
  refreshRateLimiter,
  loginRateLimiter,
  apiRateLimiter,
  customRateLimiter,
};
