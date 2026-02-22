import dashboardModel from "../../../models/v1/superadmin/dashboard.model.js";

/**
 * Superadmin Dashboard Controller
 * Handles dashboard statistics and analytics
 */

/**
 * Get dashboard statistics
 * Returns key metrics: total restaurants, active subscriptions, revenue, users, orders
 */
const getStats = async (req, res) => {
  console.log(`\n=== SUPERADMIN DASHBOARD ===\n📥 GET /v1/superadmin/dashboard/stats requested from ${req.ip}`);
  const response = await dashboardModel.getStats(req);
  console.log(`📤 Dashboard Stats response status: ${response.statusCode}`);
  res.status(response.statusCode).json(response);
};

/**
 * Get recent activity feed
 * Returns recent activity including new restaurants, subscription changes, and user registrations
 */
const getRecentActivity = async (req, res) => {
  const response = await dashboardModel.getRecentActivity(req);
  res.status(response.statusCode).json(response);
};

/**
 * Get analytics data
 * Returns growth trends over time for restaurants, subscriptions, users, and revenue
 */
const getAnalytics = async (req, res) => {
  const response = await dashboardModel.getAnalytics(req);
  res.status(response.statusCode).json(response);
};

/**
 * Get per-restaurant metrics
 * Returns detailed statistics for a specific restaurant including order volume and revenue
 */
const getRestaurantMetrics = async (req, res) => {
  const response = await dashboardModel.getRestaurantMetrics(req);
  res.status(response.statusCode).json(response);
};

export default {
  getStats,
  getRecentActivity,
  getAnalytics,
  getRestaurantMetrics,
};
