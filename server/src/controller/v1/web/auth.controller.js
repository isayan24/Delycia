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
    
    // Verify the refresh token exists in the database and matches
    const [result] = await pool.query(
      "SELECT id, uid, role, name, username, email, phone_number, profile_pic, refresh_token FROM users WHERE uid = ?",
      [decoded.uid]
    );

    if (!result.length) {
      return res.status(401).json({ 
        status: false, 
        error: "User not found" 
      });
    }

    const userData = result[0];

    // Verify the refresh token matches the one in the database
    if (userData.refresh_token !== refresh_token) {
      return res.status(401).json({ 
        status: false, 
        error: "Invalid refresh token" 
      });
    }

    // Generate new access token AND new refresh token (token rotation)
    const newAccessToken = authUtil.generateAccessToken(userData);
    const newRefreshToken = authUtil.generateRefreshToken(userData);

    // Update the refresh token in the database
    await pool.query(
      "UPDATE users SET access_token = ?, refresh_token = ? WHERE uid = ?",
      [newAccessToken, newRefreshToken, userData.uid]
    );

    // Set new tokens in httpOnly cookies
    authUtil.setCookies(res, "access_token", newAccessToken, 7);
    authUtil.setCookies(res, "refresh_token", newRefreshToken, 30);

    // Return success response with new tokens
    res.status(200).json({ 
      status: true, 
      message: "Tokens refreshed successfully",
      access_token: newAccessToken,
      refresh_token: newRefreshToken
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(401).json({ 
      status: false, 
      error: "Token expired or invalid, please login again" 
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

export default {
  handleAuth,
  refresh,
  requestLoginLink,
  verifyMagicLink,
  admin_login,
  waiter_auth,
  create_admin,
};
