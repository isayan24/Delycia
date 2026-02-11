import auth from "../../../models/v1/web/auth.model.js";
import authUtil from "../../../utils/auth.js";
import jwt from "jsonwebtoken";

const handleAuth = async (req, res) => {
  const response = await auth.handleAuth(req);
  if (response.statusCode === 200) {
    authUtil.setCookies(res, "access_token", response.data.access_token, 7);
    authUtil.setCookies(res, "refresh_token", response.data.refresh_token, 30);
  }
  return res.status(response.statusCode).json(response);
};

const refresh = async (req, res) => {
  let refresh_token = req.headers?.authorization?.split(" ")[1];
  try {
    const users = jwt.verify(refresh_token, process.env.REFRESH_SECRET);
    const newAccessToken = authUtil.generateAccessToken(users);
    authUtil.setCookies(res, "access_token", newAccessToken, 7);
    res
      .status(200)
      .json({ status: true, refresh_token, access_token: newAccessToken });
  } catch (error) {
    res
      .status(401)
      .json({ status: false, error: "Token expired, please login again" });
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
