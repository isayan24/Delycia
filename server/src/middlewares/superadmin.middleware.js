import pool from "../config/db.connection.js";
import others from "../utils/others.js";

// Superadmin role constant - as defined in the design document
const SUPERADMIN_ROLE = 1000;

/**
 * Middleware to verify that the authenticated user has superadmin role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const verifySuperadmin = async (req, res, next) => {
  try {
    // Get user from JWT token
    const user = others.getUser(req);
    
    if (!user || !user.uid) {
      return res.status(401).json({
        status: false,
        error: "Authentication required.",
      });
    }

    // Query database to check user role
    const q = "SELECT role FROM users WHERE uid = ?";
    const [result] = await pool.query(q, [user.uid]);

    // Check if user exists
    if (result.length === 0) {
      return res.status(401).json({
        status: false,
        error: "User not found.",
      });
    }

    // Check if user has superadmin role
    if (result[0].role !== SUPERADMIN_ROLE) {
      return res.status(403).json({
        status: false,
        error: "Superadmin access required.",
      });
    }

    // User is verified as superadmin, proceed to next middleware
    next();
  } catch (error) {
    console.error("Superadmin middleware error:", error);
    return res.status(500).json({
      status: false,
      error: "An error occurred while verifying permissions.",
    });
  }
};

export default verifySuperadmin;
export { SUPERADMIN_ROLE };
