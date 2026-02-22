import authModel from "../../../models/v1/superadmin/auth.model.js";
import authUtil from "../../../utils/auth.js";

/**
 * Superadmin Authentication Controller
 * Handles login and logout operations for superadmin users
 */

/**
 * Superadmin login handler
 * Validates credentials and verifies superadmin role
 * Generates access and refresh tokens stored in httpOnly cookies
 * Returns user data without exposing tokens in response body
 */
const superadmin_login = async (req, res) => {
  const response = await authModel.superadminLogin(req);

  // If login successful, set cookies
  // response structure from model: { statusCode: 200, message: "...", data: {...}, tokens: {...} }
  if (response.statusCode === 200 && response.tokens) {
    const { access_token, refresh_token } = response.tokens;

    // Set httpOnly cookies for tokens with superadmin_ prefix
    authUtil.setCookies(res, "superadmin_access_token", access_token, 7);
    authUtil.setCookies(res, "superadmin_refresh_token", refresh_token, 30);

    console.log('🍪 Cookies set successfully');

    // Remove tokens from response body (they're in httpOnly cookies)
    delete response.tokens;
  }

  res.status(response.statusCode).json(response);
};

/**
 * Superadmin logout handler
 * Invalidates tokens and clears session
 * Clears tokens from database and httpOnly cookies
 */
const superadmin_logout = async (req, res) => {
  const response = await authModel.superadminLogout(req);

  // Clear httpOnly cookies by setting them to expire immediately
  res.cookie("superadmin_access_token", "", {
    httpOnly: true,
    secure: process.env.SSL === "true",
    maxAge: 0,
    sameSite: "None",
  });

  res.cookie("superadmin_refresh_token", "", {
    httpOnly: true,
    secure: process.env.SSL === "true",
    maxAge: 0,
    sameSite: "None",
  });

  res.status(response.statusCode).json(response);
};

export default {
  superadmin_login,
  superadmin_logout,
};
