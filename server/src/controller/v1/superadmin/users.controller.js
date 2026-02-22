import usersModel from "../../../models/v1/superadmin/users.model.js";

/**
 * Superadmin Users Controller
 * Handles user management across all restaurants
 */

/**
 * Get all users with optional filters
 */
const getAllUsers = async (req, res) => {
  const response = await usersModel.getAllUsers(req);
  res.status(response.statusCode).json(response);
};

/**
 * Get single user details with activity logs
 */
const getUser = async (req, res) => {
  const response = await usersModel.getUserById(req);
  res.status(response.statusCode).json(response);
};

/**
 * Create new user
 */
const createUser = async (req, res) => {
  const response = await usersModel.createUser(req);
  res.status(response.statusCode).json(response);
};

/**
 * Update user details
 */
const updateUser = async (req, res) => {
  const response = await usersModel.updateUser(req);
  res.status(response.statusCode).json(response);
};

/**
 * Deactivate user (soft delete - preserve historical data)
 */
const deactivateUser = async (req, res) => {
  const response = await usersModel.deactivateUser(req);
  res.status(response.statusCode).json(response);
};

/**
 * Reset user password
 */
const resetPassword = async (req, res) => {
  const response = await usersModel.resetPassword(req);
  res.status(response.statusCode).json(response);
};

/**
 * Get user activity logs
 */
const getUserActivity = async (req, res) => {
  const response = await usersModel.getUserActivity(req);
  res.status(response.statusCode).json(response);
};

export default {
  getAllUsers,
  getUserById: getUser,
  createUser,
  updateUser,
  deactivateUser,
  resetPassword,
  getUserActivity,
};
