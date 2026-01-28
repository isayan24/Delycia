import pool from "../../../config/db.connection.js";
import { v4 as uuidv4 } from "uuid";
import authUtil from "../../../utils/auth.js";
import apiResponse from "../../../utils/apiResponse.js";
import others from "../../../utils/others.js";
import whatsapp from "../../../utils/whatsapp.js";
import MyTwilio from "../../../utils/twilio.js";

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

const sendOTP = async (req) => {
  try {
    const { phone_number, channel } = req.body;
    if (!phone_number || !channel)
      return apiResponse.error(400, "Phone number & channel is required!");

    const OTP_LENGTH = 6;
    const ATTEMPT_LIMIT = 2;
    let OTP;

    const [existing] = await pool.query(
      "SELECT code, attempts FROM otps WHERE phone_number = ? LIMIT 1",
      [phone_number]
    );

    if (existing.length) {
      const record = existing[0];

      if (record.attempts >= ATTEMPT_LIMIT) {
        return apiResponse.error(
          429,
          "You've reached the limit. Please wait 10 minutes before trying again."
        );
      }

      OTP = record.code || others.generateRandomNumber(OTP_LENGTH);
    } else {
      OTP = others.generateRandomNumber(OTP_LENGTH);

      await pool.query("INSERT INTO otps (phone_number, code) VALUES (?, ?)", [
        phone_number,
        OTP,
      ]);
    }

    const sent =
      channel == "sms"
        ? await MyTwilio.sendOTP(phone_number, OTP)
        : await whatsapp.sendOtp(phone_number, OTP);

    if (!sent) return apiResponse.error(500, "Failed to send OTP");

    await pool.query(
      "UPDATE otps SET attempts = attempts + 1 WHERE phone_number = ?",
      [phone_number]
    );

    return apiResponse.success(200, "OTP has been sent successfully!");
  } catch (error) {
    console.error("sendOTP Error:", error);
    return apiResponse.error(500, "Internal server error: " + error.message);
  }
};

const verifyOTP = async (req) => {
  const { phone_number, code } = req.body;
  try {
    if (!phone_number || !code)
      return apiResponse.error(400, "Data is required!");

    const [result] = await pool.query(
      "SELECT code FROM otps WHERE phone_number = ? AND code = ?",
      [phone_number, code]
    );

    await pool.query("DELETE FROM otps WHERE phone_number = ? AND code = ?", [
      phone_number,
      code,
    ]);

    return result.length
      ? apiResponse.success(
        200,
        "Your account has been successfully activated."
      )
      : apiResponse.error(
        400,
        "The OTP or phone number you entered is incorrect."
      );
  } catch (error) {
    return apiResponse.error(500, error.message);
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

export default { handleAuth, sendOTP, verifyOTP, admin_login, waiter_auth, create_admin };
