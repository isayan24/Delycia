import pool from "../../../config/db.connection.js";
import authUtil from "../../../utils/auth.js";
import apiResponse from "../../../utils/apiResponse.js";
import { SUPERADMIN_ROLE } from "../../../middlewares/superadmin.middleware.js";

/**
 * Superadmin Authentication Controller
 * Handles login and logout operations for superadmin users
 */

/**
 * Superadmin login handler
 * Validates credentials and verifies superadmin role (SUPERADMIN_ROLE = 1000)
 * Generates access and refresh tokens stored in httpOnly cookies
 * Returns user data without exposing tokens in response body
 */
const superadmin_login = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    console.log('=== SUPERADMIN LOGIN ATTEMPT ===');
    console.log('Request body:', { email, username, password: password ? '***' : undefined });

    // Validate required fields
    if (!password) {
      console.log('❌ Validation failed: Password is required');
      return res.status(400).json(apiResponse.error(400, "Password is required"));
    }

    if (!email && !username) {
      console.log('❌ Validation failed: Email or username is required');
      return res.status(400).json(
        apiResponse.error(400, "Email or username is required")
      );
    }

    // Build query to find user with superadmin role
    let query =
      "SELECT id, uid, role, name, username, email, phone_number, profile_pic FROM users WHERE role = ? AND password = ?";
    const params = [SUPERADMIN_ROLE, password];

    // Add email or username condition
    if (email) {
      query += " AND email = ?";
      params.push(email);
      console.log('🔍 Searching by email:', email);
    } else {
      query += " AND username = ?";
      params.push(username);
      console.log('🔍 Searching by username:', username);
    }

    console.log('📝 Query:', query);
    console.log('📝 Params:', [SUPERADMIN_ROLE, '***', email || username]);

    const [result] = await pool.query(query, params);

    console.log('📊 Query result count:', result.length);
    if (result.length > 0) {
      console.log('✅ User found:', {
        id: result[0].id,
        username: result[0].username,
        email: result[0].email,
        role: result[0].role
      });
    } else {
      console.log('❌ No user found with provided credentials');
    }

    // Check if user exists with superadmin role
    if (!result.length) {
      console.log('❌ Login failed: Invalid credentials');
      return res.status(400).json(
        apiResponse.error(400, "Invalid credentials")
      );
    }

    const userData = result[0];

    // Generate access and refresh tokens
    const access_token = authUtil.generateAccessToken(userData);
    const refresh_token = authUtil.generateRefreshToken(userData);

    console.log('🔑 Tokens generated successfully');

    // Store tokens in database
    await pool.query(
      "UPDATE users SET access_token = ?, refresh_token = ? WHERE uid = ?",
      [access_token, refresh_token, userData.uid]
    );

    console.log('💾 Tokens stored in database');

    // Set httpOnly cookies for tokens
    authUtil.setCookies(res, "access_token", access_token, 7);
    authUtil.setCookies(res, "refresh_token", refresh_token, 30);

    console.log('🍪 Cookies set successfully');
    console.log('✅ Login successful for user:', userData.username);

    // Return user data without tokens (tokens are in httpOnly cookies)
    return res.status(200).json(
      apiResponse.success(200, "Authentication successful", {
        data: {
          _id: userData.uid,
          id: userData.id,
          username: userData.username,
          name: userData.name,
          email: userData.email,
          phone_number: userData.phone_number,
          profile_pic: userData.profile_pic,
          role: userData.role,
        },
      })
    );
  } catch (error) {
    console.error("❌ Superadmin login error:", error);
    return res.status(500).json(
      apiResponse.error(500, "An error occurred during authentication")
    );
  }
};

/**
 * Superadmin logout handler
 * Invalidates tokens and clears session
 * Clears tokens from database and httpOnly cookies
 */
const superadmin_logout = async (req, res) => {
  try {
    // Get user from JWT token (from cookies or Authorization header)
    let access_token = req.headers?.authorization?.split(" ")[1];
    if (!access_token && req.cookies && req.cookies.access_token) {
      access_token = req.cookies.access_token;
    }

    if (!access_token) {
      return res.status(401).json(
        apiResponse.error(401, "No active session found")
      );
    }

    // Verify and decode the token to get user ID
    let decoded;
    try {
      decoded = authUtil.verifyToken(access_token);
    } catch (err) {
      // Token might be expired or invalid, but we still want to clear cookies
      decoded = null;
    }

    // If we have a valid token, clear it from the database
    if (decoded && decoded.uid) {
      await pool.query(
        "UPDATE users SET access_token = NULL, refresh_token = NULL WHERE uid = ?",
        [decoded.uid]
      );
    }

    // Clear httpOnly cookies by setting them to expire immediately
    res.cookie("access_token", "", {
      httpOnly: true,
      secure: process.env.SSL === "true",
      maxAge: 0,
      sameSite: "None",
    });

    res.cookie("refresh_token", "", {
      httpOnly: true,
      secure: process.env.SSL === "true",
      maxAge: 0,
      sameSite: "None",
    });

    return res.status(200).json(
      apiResponse.success(200, "Logout successful", {})
    );
  } catch (error) {
    console.error("Superadmin logout error:", error);
    
    // Even if there's an error, clear the cookies
    res.cookie("access_token", "", {
      httpOnly: true,
      secure: process.env.SSL === "true",
      maxAge: 0,
      sameSite: "None",
    });

    res.cookie("refresh_token", "", {
      httpOnly: true,
      secure: process.env.SSL === "true",
      maxAge: 0,
      sameSite: "None",
    });

    return res.status(200).json(
      apiResponse.success(200, "Logout successful", {})
    );
  }
};

export default {
  superadmin_login,
  superadmin_logout,
};
