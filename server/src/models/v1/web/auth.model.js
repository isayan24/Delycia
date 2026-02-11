import pool from "../../../config/db.connection.js";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import authUtil from "../../../utils/auth.js";
import apiResponse from "../../../utils/apiResponse.js";
import msg91 from "../../../utils/msg91.js";

// Configuration
const MAGIC_LINK_EXPIRY_MINUTES = parseInt(process.env.MAGIC_LINK_EXPIRY_MINUTES) || 5;
const MAGIC_LINK_BASE_URL = process.env.MAGIC_LINK_BASE_URL || "https://app.delycia.com";
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MINUTES = 60;

/**
 * Generate a cryptographically secure random token
 * @returns {string} - 64 character hex string (32 bytes)
 */
const generateSecureToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Hash a token using SHA256
 * @param {string} token - Raw token
 * @returns {string} - SHA256 hash of the token
 */
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Handle direct authentication (used internally after magic link verification)
 */
const handleAuth = async (req) => {
  const { country_code, phone_number } = req.body;

  try {
    if (!country_code || !phone_number) {
      return apiResponse.error(
        400,
        "Country code and phone number are required."
      );
    }

    const [existingUser] = await pool.query(
      "SELECT id, uid, refresh_token FROM users WHERE country_code = ? AND phone_number = ?",
      [country_code, phone_number]
    );

    let userData;

    if (existingUser.length === 1) {
      // User found - Login scenario
      userData = existingUser[0];
    } else {
      // User not found - Signup scenario
      const uid = uuidv4();

      const [insertResult] = await pool.query(
        "INSERT INTO users (uid, country_code, phone_number) VALUES (?, ?, ?)",
        [uid, country_code, phone_number]
      );

      userData = { id: insertResult.insertId, uid };
    }

    //Generate tokens
    const access_token = authUtil.generateAccessToken(userData);
    const refresh_token = authUtil.generateRefreshToken(userData);

    await pool.query(
      "UPDATE users SET access_token = ?, refresh_token = ? WHERE uid = ?",
      [access_token, refresh_token, userData.uid]
    );

    return apiResponse.success(200, "Authentication successful", {
      data: {
        id: userData.id,
        uid: userData.uid,
        country_code,
        phone_number,
        access_token,
        refresh_token,
      },
    });
  } catch (error) {
    return apiResponse.error(500, error);
  }
};

/**
 * Request a magic login link - sends WhatsApp message with secure link
 */
const requestLoginLink = async (req) => {
  try {
    const { phone_number, country_code } = req.body;
    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.headers['user-agent'] || null;

    if (!phone_number) {
      return apiResponse.error(400, "Phone number is required!");
    }

    const fullPhoneNumber = country_code
      ? `${country_code.replace(/\+/g, "")}${phone_number}`
      : phone_number;

    // Rate limiting check
    const [recentAttempts] = await pool.query(
      `SELECT COUNT(*) as count FROM login_tokens 
       WHERE phone_number = ? 
       AND created_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)`,
      [fullPhoneNumber, RATE_LIMIT_WINDOW_MINUTES]
    );

    // fix uncomment this-.
    if (recentAttempts[0].count >= RATE_LIMIT_MAX_ATTEMPTS) {
      return apiResponse.error(
        429,
        `Too many login attempts. Please wait ${RATE_LIMIT_WINDOW_MINUTES} minutes before trying again.`
      );
    }

    // Generate secure token
    const rawToken = generateSecureToken();
    const tokenHash = hashToken(rawToken);

    // Calculate expiry
    const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRY_MINUTES * 60 * 1000);

    // Get user ID if known (optional, beneficial for tracking)
    const [existingUser] = await pool.query(
      "SELECT id, name FROM users WHERE phone_number = ? LIMIT 1",
      [phone_number]
    );
    const userId = existingUser[0]?.id || null;
    const userName = existingUser[0]?.name || "there";

    // Store token hash in database with additional metadata
    await pool.query(
      `INSERT INTO login_tokens (phone_number, user_id, token_hash, expires_at, ip_address, user_agent) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [fullPhoneNumber, userId, tokenHash, expiresAt, ip_address, user_agent]
    );

    // Build magic link URL
    const magicLinkUrl = `${MAGIC_LINK_BASE_URL}/auth/magic?token=${rawToken}`;

    // Send WhatsApp message via MSG91
    const sent = await msg91.sendLoginLink(fullPhoneNumber, userName, magicLinkUrl);

    if (!sent) {
      return apiResponse.error(500, "Failed to send login link. Please try again.");
    }

    return apiResponse.success(200, "Login link sent to your WhatsApp!", {
      data: {
        expiresIn: MAGIC_LINK_EXPIRY_MINUTES * 60, // seconds
        phone: fullPhoneNumber.slice(-4).padStart(fullPhoneNumber.length, "*") // Masked phone
      }
    });
  } catch (error) {
    console.error("requestLoginLink Error:", error);
    return apiResponse.error(500, "Internal server error: " + error.message);
  }
};

/**
 * Verify magic link token and authenticate user
 */
const verifyMagicLink = async (req) => {
  try {
    const { token } = req.query;

    if (!token) {
      return apiResponse.error(400, "Login token is required!");
    }

    // Hash the incoming token to compare with stored hash
    const tokenHash = hashToken(token);

    // Find valid token
    const [tokenRecords] = await pool.query(
      `SELECT id, phone_number, expires_at, used_at, attempt_count 
       FROM login_tokens 
       WHERE token_hash = ? 
       LIMIT 1`,
      [tokenHash]
    ); 

    if (!tokenRecords.length) {
      return apiResponse.error(400, "Invalid login link. Please request a new one.");
    }

    const tokenRecord = tokenRecords[0];

    // Check if token is already used
    if (tokenRecord.used_at) {
      return apiResponse.error(400, "This link has already been used. Please request a new one.");
    }

    // Check if token is expired
    // if (new Date(tokenRecord.expires_at) < new Date()) {
    //   return apiResponse.error(400, "This link has expired. Please request a new one.");
    // }

    // Mark token as used
    await pool.query(
      "UPDATE login_tokens SET used_at = NOW() WHERE id = ?",
      [tokenRecord.id]
    );

    // Extract country code and phone number
    const fullPhone = tokenRecord.phone_number;
    let country_code = "+91"; // Default
    let phone_number = fullPhone;

    // Try to extract country code if present
    if (fullPhone.startsWith("+")) {
      country_code = fullPhone.slice(0, 3);
      phone_number = fullPhone.slice(3);
    } else if (fullPhone.length > 10) {
      country_code = "+" + fullPhone.slice(0, fullPhone.length - 10);
      phone_number = fullPhone.slice(-10);
    }

    // Find or create user
    const [existingUser] = await pool.query(
      "SELECT id, uid, name, refresh_token FROM users WHERE phone_number = ?",
      [phone_number]
    );

    let userData;
    let isNewUser = false;

    if (existingUser.length === 1) {
      userData = existingUser[0];
      isNewUser = !userData.name; // User exists but may not have name
    } else {
      // Create new user
      const uid = uuidv4();
      const [insertResult] = await pool.query(
        "INSERT INTO users (uid, country_code, phone_number) VALUES (?, ?, ?)",
        [uid, country_code, phone_number]
      );
      userData = { id: insertResult.insertId, uid };
      isNewUser = true;
    }

    // Update user_id in login_tokens for tracking
    await pool.query(
      "UPDATE login_tokens SET user_id = ? WHERE id = ?",
      [userData.id, tokenRecord.id]
    );

    // Generate tokens
    const access_token = authUtil.generateAccessToken(userData);
    const refresh_token = authUtil.generateRefreshToken(userData);
    
    await pool.query(
      "UPDATE users SET access_token = ?, refresh_token = ? WHERE id = ?",
      [access_token, refresh_token, userData.id]
    ); 

    return apiResponse.success(200, "Authentication successful", {
      data: {
        id: userData.id,
        uid: userData.uid,
        country_code,
        phone_number,
        name: userData.name || null,
        access_token,
        refresh_token,
        isNewUser,
        requiresName: isNewUser || !userData.name
      },
    });
  } catch (error) {
    console.error("verifyMagicLink Error:", error);
    return apiResponse.error(500, "Internal server error: " + error.message);
  }
};

const admin_login = async (req) => {
  try {
    const { phone_number, username, password } = req.body;

    if (!password) return apiResponse.error(400, "Password is required!");

    if (!phone_number && !username)
      return apiResponse.error(400, "Phone number or Username is required!");

    // Select full user details including name, email, phone_number, profile_pic
    let query =
      "SELECT id, uid, role, name, username, email, phone_number, profile_pic FROM users WHERE role != 0 AND password = ?";
    const params = [password];

    if (phone_number) {
      query += " AND phone_number = ?";
      params.push(phone_number);
    } else {
      query += " AND username = ?";
      params.push(username);
    }

    const [result] = await pool.query(query, params);

    if (!result.length) return apiResponse.error(400, "user doesn't exist");

    const userData = result[0];
    const access_token = authUtil.generateAccessToken(userData);
    const refresh_token = authUtil.generateRefreshToken(userData);

    await pool.query(
      "UPDATE users SET access_token = ?, refresh_token = ? WHERE uid = ?",
      [access_token, refresh_token, userData.uid]
    );

    let [restaurant_rids] = await pool.query(
      "SELECT rid FROM restaurant_access WHERE user_id = ? ",
      userData.id
    );

    restaurant_rids = restaurant_rids.map((row) => row.rid);

    return apiResponse.success(200, "Authentication successful", {
      data: {
        id: userData.id,
        uid: userData.uid,
        role: userData.role,
        name: userData.name,
        username: userData.username,
        email: userData.email,
        phone_number: userData.phone_number,
        profile_pic: userData.profile_pic,
        access_token,
        refresh_token,
        restaurant_rids,
      },
    });
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};


const waiter_auth = async (req, res) => {
  const { name, username, phone_number } = req.body;
  const uid = uuidv4();

  if (!name || !username || !phone_number) {
    return apiResponse.error(400, {
      message: "Missing required fields: name, username, or phone_number",
    });
  }

  try {
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE phone_number = ?",
      [phone_number]
    );

    if (existing.length > 0) {
      // User exists
      return apiResponse.success(200, "User already exists", {
        id: existing[0].id,
      });
    }

    // Insert new user
    const [result] = await pool.query(
      `INSERT INTO users (uid, name, username, phone_number)
       VALUES (?, ?, ?, ?)`,
      [uid, name, username, phone_number]
    );

    return apiResponse.success(201, "User created successfully", {
      id: result.insertId,
    });
  } catch (error) {
    console.error(error);
    return apiResponse.error(500, error);
  }
};

const create_admin = async (req) => {
  try {
    const { name, username, password, role, rid } = req.body;

    if (!name || !username || !password || !role || !rid)
      return apiResponse.error(400, "All fields (including rid) are required!");

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );

    if (existing.length)
      return apiResponse.error(400, "Username already exists!");

    const uid = uuidv4();

    const [result] = await pool.query(
      "INSERT INTO users (uid, name, username, password, role) VALUES (?, ?, ?, ?, ?)",
      [uid, name, username, password, role]
    );

    // Link user to restaurant
    await pool.query(
      "INSERT INTO restaurant_access (user_id, rid) VALUES (?, ?)",
      [result.insertId, rid]
    );


    return apiResponse.success(201, "Admin created successfully", {
      id: result.insertId,
    });
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

export default { handleAuth, requestLoginLink, verifyMagicLink, admin_login, waiter_auth, create_admin };
