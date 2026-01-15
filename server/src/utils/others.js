import jwt from "jsonwebtoken";
import pool from "../config/db.connection.js";

const convertToMin = (str) => {
  const date = new Date(str);
  const currentDate = new Date();
  const mSec = currentDate - date;
  return Math.floor(mSec / (1000 * 60));
};

const getUser = (req) => {
  const access_token = req.headers?.authorization?.split(" ")[1];
  return jwt.verify(access_token, process.env.ACCESS_SECRET);
};

const getGreeting = () => {
  const now = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const currentHour = new Date(now).getHours();

  if (currentHour < 12) {
    return "Good Morning";
  } else if (currentHour < 18) {
    return "Good Afternoon";
  } else {
    return "Good Evening";
  }
};

const getPower = async (request) => {
  try {
    const user = getUser(request);
    let [[{ power }]] = await pool.query(
      "SELECT roles.power FROM users JOIN roles ON users.role = roles.id WHERE users.uid = ?",
      user.uid
    );
    return power;
  } catch (error) {
    return 0;
  }
};

/**
 * NEW: Check if user has access to a specific restaurant
 * Checks the restaurant_access table to verify user-restaurant relationship
 */
const hasRestaurantAccess = async (req, rid) => {
  try {
    // Get user from JWT token
    const user = getUser(req);
    if (!user || !user.uid) {
      console.log("hasRestaurantAccess: No user found in token");
      return false;
    }

    // Super admin (power >= 90) has access to ALL restaurants
    const power = await getPower(req);
    if (power >= 90) {
      console.log(`hasRestaurantAccess: User ${user.uid} is super admin, access granted to rid ${rid}`);
      return true;
    }

    // Check if user has access to this specific restaurant via restaurant_access table
    const [access] = await pool.query(
      "SELECT 1 FROM restaurant_access WHERE user_id = ? AND rid = ? LIMIT 1",
      [user.uid, rid]
    );

    const hasAccess = access.length > 0;
    console.log(`hasRestaurantAccess: User ${user.uid} ${hasAccess ? 'HAS' : 'DOES NOT HAVE'} access to rid ${rid}`);

    return hasAccess;
  } catch (error) {
    console.error("hasRestaurantAccess error:", error);
    return false;
  }
};

const generateRandomNumber = (length) => {
  if (length <= 0) return 0;

  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;

  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateRandomString = (length) => {
  if (isNaN(length) || length <= 0) {
    console.log("Please enter a valid positive number.");
    return;
  }

  const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
};

export default {
  convertToMin,
  getUser,
  getGreeting,
  getPower,
  hasRestaurantAccess,    // NEW: Add this
  generateRandomNumber,
  generateRandomString,
};
