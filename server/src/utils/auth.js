import jwt from "jsonwebtoken";
import "dotenv/config";
import bcrypt from "bcrypt";
import crypto from "crypto";
const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
const HMAC_SECRECT = process.env.HMAC_SECRECT;

const createUserModel = (user) => {
  return {
    uid: user.uid,
    id: user.id,
    role: user.role,
  };
};

const generateAccessToken = (user) => {
  return jwt.sign(createUserModel(user), ACCESS_SECRET, {
    expiresIn: "15m", // 15 minutes - matches frontend expectation
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign(createUserModel(user), REFRESH_SECRET, { expiresIn: "30d" });
};

const setCookies = (res, key, value, days) => {
  res.cookie(key, value, {
    httpOnly: true,
    secure: process.env.SSL === "true",
    maxAge: days * 24 * 60 * 60 * 1000,
    sameSite: "None",
  });
};

const hashPassword = async (password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
};

const verifyPassword = async (password, hashedPassword) => {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
};

const isValidSignature = (receivedSignature, receivedPayload) => {
  const expectedSignature = crypto
    .createHmac("sha256", HMAC_SECRECT)
    .update(JSON.stringify(receivedPayload))
    .digest("hex");

  if (receivedSignature !== expectedSignature) {
    return false;
  }
  return true;
};

const verifyToken = (token) => {
  return jwt.verify(token, ACCESS_SECRET);
};

export default {
  generateAccessToken,
  generateRefreshToken,
  setCookies,
  hashPassword,
  verifyPassword,
  isValidSignature,
  verifyToken,
};
