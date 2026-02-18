import auth from "../../../models/v1/web/auth.model.js";
import authUtil from "../../../utils/auth.js";
import jwt from "jsonwebtoken";
import pool from "../../../config/db.connection.js";

const handleAuth = async (req, res) => {
  const response = await auth.handleAuth(req);
  if (response.statusCode === 200) {
    authUtil.setCookies(res, "access_token", response.data.access_token, 7);
    authUtil.setCookies(res, "refresh_token", response.data.refresh_token, 30);
  }
  return res.status(response.statusCode).json(response);
};

const refresh = async (req, res) => {
  // Get refresh token from Authorization header or cookies
  let refresh_token = req.headers?.authorization?.split(" ")[1] || req.cookies?.refresh_token;
  
  if (!refresh_token) {
    return res.status(401).json({ 
      status: false, 
      error: "Refresh token not provided" 
    });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refresh_token, process.env.REFRESH_SECRET);
    
    // Get user data
    const [userResult] = await pool.query(
      "SELECT id, uid, role, name, username, email, phone_number, profile_pic FROM users WHERE uid = ?",
      [decoded.uid]
    );

    if (!userResult.length) {
      return res.status(401).json({ 
        status: false, 
        error: "User not found" 
      });
    }

    const userData = userResult[0];

    // Check if this refresh token exists in user_sessions table
    const [sessionResult] = await pool.query(
      "SELECT id, expires_at FROM user_sessions WHERE user_id = ? AND refresh_token = ? AND expires_at > NOW()",
      [userData.id, refresh_token]
    );

    if (!sessionResult.length) {
      // Fallback: Check old single-token system (for backward compatibility)
      const [legacyCheck] = await pool.query(
        "SELECT refresh_token FROM users WHERE id = ? AND refresh_token = ?",
        [userData.id, refresh_token]
      );
      
      if (!legacyCheck.length) {
        return res.status(401).json({ 
          status: false, 
          error: "Invalid refresh token" 
        });
      }
    }

    // Generate new access token (keep same refresh token for multi-device support)
    const newAccessToken = authUtil.generateAccessToken(userData);

    // Update access token in users table
    await pool.query(
      "UPDATE users SET access_token = ? WHERE uid = ?",
      [newAccessToken, userData.uid]
    );

    // Update last_used_at in user_sessions if session exists
    if (sessionResult.length) {
      await pool.query(
        "UPDATE user_sessions SET last_used_at = NOW() WHERE id = ?",
        [sessionResult[0].id]
      );
    }

    // Set new access token in httpOnly cookie (keep refresh token unchanged)
    authUtil.setCookies(res, "access_token", newAccessToken, 7);

    // Return success response with new access token
    res.status(200).json({ 
      status: true, 
      message: "Token refreshed successfully",
      access_token: newAccessToken,
      refresh_token: refresh_token // Return same refresh token
    });
  } catch (error) {
    console.error("[refresh] Token refresh error:", error.message);
    res.status(401).json({ 
      status: false, 
      error: "Invalid refresh token" 
    });
  }
};

/**
 * Request a magic login link to be sent via WhatsApp
 */
const requestLoginLink = async (req, res) => {
  const response = await auth.requestLoginLink(req);
  res.status(response.statusCode).json(response);
};

/**
 * Verify magic link token and authenticate user
 */
const verifyMagicLink = async (req, res) => {
  const response = await auth.verifyMagicLink(req);
  if (response.statusCode === 200 && response.data) {
    authUtil.setCookies(res, "access_token", response.data.access_token, 7);
    authUtil.setCookies(res, "refresh_token", response.data.refresh_token, 30);
  }
  return res.status(response.statusCode).json(response);
};

const admin_login = async (req, res) => {
  const response = await auth.admin_login(req);
  res.status(response.statusCode).json(response);
};

const waiter_auth = async (req, res) => {
  const response = await auth.waiter_auth(req);
  res.status(response.statusCode).json(response);
};

const create_admin = async (req, res) => {
  const response = await auth.create_admin(req);
  res.status(response.statusCode).json(response);
};

const logout = async (req, res) => {
  const refresh_token = req.cookies?.refresh_token || req.headers?.authorization?.split(" ")[1];
  
  console.log('[logout] Logout request received');
  
  if (!refresh_token) {
    console.log('[logout] No refresh token provided');
    // Clear cookies anyway
    authUtil.setCookies(res, "access_token", "", -1);
    authUtil.setCookies(res, "refresh_token", "", -1);
    return res.status(200).json({ 
      status: true, 
      message: "Logged out successfully" 
    });
  }

  try {
    // Verify the refresh token to get user info
    const decoded = jwt.verify(refresh_token, process.env.REFRESH_SECRET);
    console.log('[logout] Logging out user:', decoded.uid);
    
    // Delete this specific session from user_sessions
    const [deleteResult] = await pool.query(
      "DELETE FROM user_sessions WHERE refresh_token = ?",
      [refresh_token]
    );
    
    console.log('[logout] Deleted session, affected rows:', deleteResult.affectedRows);
    
    // Clear cookies
    authUtil.setCookies(res, "access_token", "", -1);
    authUtil.setCookies(res, "refresh_token", "", -1);
    
    console.log('[logout] ✅ Logout successful for user:', decoded.uid);
    
    res.status(200).json({ 
      status: true, 
      message: "Logged out successfully" 
    });
  } catch (error) {
    console.error("[logout] Logout error:", error.message);
    // Clear cookies anyway
    authUtil.setCookies(res, "access_token", "", -1);
    authUtil.setCookies(res, "refresh_token", "", -1);
    res.status(200).json({ 
      status: true, 
      message: "Logged out successfully" 
    });
  }
};

export default {
  handleAuth,
  refresh,
  logout,
  requestLoginLink,
  verifyMagicLink,
  admin_login,
  waiter_auth,
  create_admin,
};
