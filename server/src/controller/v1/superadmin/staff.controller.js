import staffModel from "../../../models/v1/superadmin/staff.model.js";

/**
 * Superadmin Staff Controller
 * Handles staff management across all restaurants
 */

/**
 * Get all staff with optional filters
 */
const getAllStaff = async (req, res) => {
  const response = await staffModel.getAllStaff(req);
  res.status(response.statusCode).json(response);
};

/**
 * Get single staff member details with activity
 */
const getStaff = async (req, res) => {
  const response = await staffModel.getStaffById(req);
  res.status(response.statusCode).json(response);
};

/**
 * Create new staff member
 */
const createStaff = async (req, res) => {
  const response = await staffModel.createStaff(req);
  res.status(response.statusCode).json(response);
};

/**
 * Update staff member details
 */
const updateStaff = async (req, res) => {
  const response = await staffModel.updateStaff(req);
  res.status(response.statusCode).json(response);
};

/**
 * Deactivate staff member (soft delete - preserve historical data)
 */
const deactivateStaff = async (req, res) => {
  const response = await staffModel.deactivateStaff(req);
  res.status(response.statusCode).json(response);
};

/**
 * Get staff activity logs
 */
const getStaffActivity = async (req, res) => {
  const response = await staffModel.getStaffActivity(req);
  res.status(response.statusCode).json(response);
};

export default {
  getAllStaff,
  getStaffById: getStaff,
  createStaff,
  updateStaff,
  deactivateStaff,
  getStaffActivity,
};
