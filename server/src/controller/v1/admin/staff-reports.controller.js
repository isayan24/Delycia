import staffReportsModel from "../../../models/v1/admin/staff-reports.model.js";

/**
 * Get staff performance leaderboard
 */
const getStaffLeaderboard = async (req, res) => {
  const response = await staffReportsModel.getStaffLeaderboard(req);
  res.status(response.statusCode).json(response);
};

/**
 * Get individual staff member's orders
 */
const getStaffOrders = async (req, res) => {
  const response = await staffReportsModel.getStaffOrders(req);
  res.status(response.statusCode).json(response);
};

export default {
  getStaffLeaderboard,
  getStaffOrders,
};
