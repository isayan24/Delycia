import rateLimit from "express-rate-limit";

/**
 * Rate limiter for login endpoints to prevent brute force attacks
 * Limits to 5 attempts per 15 minutes per IP address
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 5 requests per windowMs
  message: {
    status: false,
    statusCode: 429,
    error: "Too many login attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip successful requests (only count failed login attempts)
  skipSuccessfulRequests: false,
  // Skip failed requests (count all requests)
  skipFailedRequests: false,
});

/**
 * Stricter rate limiter for sensitive operations
 * Limits to 3 attempts per 15 minutes per IP address
 */
export const strictRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 3 requests per windowMs
  message: {
    status: false,
    statusCode: 429,
    error: "Too many attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API rate limiter
 * Limits to 100 requests per 15 minutes per IP address
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    status: false,
    statusCode: 429,
    error: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
