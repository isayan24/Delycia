import { doubleCsrf } from "csrf-csrf";
import "dotenv/config";

/**
 * CSRF Protection Middleware
 * 
 * Implements Double Submit Cookie pattern for CSRF protection.
 * This is required for all state-changing operations (POST, PUT, PATCH, DELETE)
 * since we're using httpOnly cookies for authentication.
 * 
 * Requirements: 8.7, 9.6
 */

// Configure CSRF protection
const {
  generateCsrfToken, // Generates a CSRF token
  doubleCsrfProtection, // Middleware to validate CSRF tokens
} = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || "default-csrf-secret-change-in-production",
  getSessionIdentifier: (req) => {
    // Use a combination of user agent and IP as session identifier
    // In production, you might want to use a proper session ID
    return `${req.headers['user-agent'] || 'unknown'}-${req.ip || 'unknown'}`;
  },
  cookieName: "x-csrf-token",
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax", // Changed from "strict" to "lax" to allow cross-origin requests
    secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
    path: "/",
  },
  size: 64, // Token size in bytes
  ignoredMethods: ["GET", "HEAD", "OPTIONS"], // Methods that don't need CSRF protection
  getCsrfTokenFromRequest: (req) => {
    // Check multiple sources for the CSRF token
    return (
      req.headers["x-csrf-token"] || // Header (preferred)
      req.body?._csrf || // Body field
      req.query?._csrf // Query parameter (fallback)
    );
  },
});

/**
 * Middleware to generate and attach CSRF token to response
 * This should be called on routes that render forms or need to provide tokens
 */
export const csrfTokenGenerator = (req, res, next) => {
  try {
    const token = generateCsrfToken(req, res, { overwrite: true });
    // Attach token to response locals so it can be accessed in routes
    res.locals.csrfToken = token;
    next();
  } catch (error) {
    console.error("CSRF token generation error:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      status: false,
      error: "Failed to generate CSRF token",
      message: error.message,
    });
  }
};

/**
 * Middleware to validate CSRF tokens on state-changing requests
 * This should be applied to all POST, PUT, PATCH, DELETE routes
 */
export const csrfProtection = (req, res, next) => {
  console.log('=== CSRF VALIDATION ===');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('CSRF Token from header:', req.headers["x-csrf-token"]);
  console.log('CSRF Cookie:', req.cookies["x-csrf-token"]);
  console.log('User-Agent:', req.headers['user-agent']);
  console.log('IP:', req.ip);
  
  // Apply the double CSRF protection middleware
  doubleCsrfProtection(req, res, (err) => {
    if (err) {
      console.error("❌ CSRF validation error:", err);
      return res.status(403).json({
        status: false,
        error: "Invalid or missing CSRF token",
      });
    }
    console.log('✅ CSRF validation passed');
    next();
  });
};

/**
 * Route handler to get CSRF token
 * This endpoint should be called by clients to obtain a CSRF token
 * before making state-changing requests
 */
export const getCsrfToken = (req, res) => {
  try {
    console.log('=== CSRF TOKEN GENERATION ===');
    console.log('User-Agent:', req.headers['user-agent']);
    console.log('IP:', req.ip);
    
    // The generateCsrfToken function needs to be called with proper context
    // It will set the CSRF cookie automatically
    const token = generateCsrfToken(req, res, { overwrite: true });
    
    console.log('✅ CSRF token generated:', token.substring(0, 20) + '...');
    console.log('Cookie will be set with name: x-csrf-token');
    
    return res.json({
      status: true,
      csrfToken: token,
    });
  } catch (error) {
    console.error("❌ CSRF token generation error:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      status: false,
      error: "Failed to generate CSRF token",
      message: error.message,
    });
  }
};

export { generateCsrfToken };
