import subscriptionsModel from "../../../models/v1/superadmin/subscriptions.model.js";

/**
 * Superadmin Subscriptions Controller
 * Handles subscription plans and assignments management
 */

/**
 * Get all subscription plans
 */
const getAllPlans = async (req, res) => {
  const response = await subscriptionsModel.getAllPlans(req);
  res.status(response.statusCode).json(response);
};

/**
 * Get single plan details with usage statistics
 */
const getPlan = async (req, res) => {
  const response = await subscriptionsModel.getPlanById(req);
  res.status(response.statusCode).json(response);
};

/**
 * Create new subscription plan
 */
const createPlan = async (req, res) => {
  const response = await subscriptionsModel.createPlan(req);
  res.status(response.statusCode).json(response);
};

/**
 * Update subscription plan
 */
const updatePlan = async (req, res) => {
  const response = await subscriptionsModel.updatePlan(req);
  res.status(response.statusCode).json(response);
};

/**
 * Deactivate subscription plan
 */
const deactivatePlan = async (req, res) => {
  const response = await subscriptionsModel.deactivatePlan(req);
  res.status(response.statusCode).json(response);
};

/**
 * Assign subscription plan to restaurant
 */
const assignPlan = async (req, res) => {
  const response = await subscriptionsModel.assignPlan(req);
  res.status(response.statusCode).json(response);
};

/**
 * Get restaurant subscription details
 */
const getRestaurantSubscription = async (req, res) => {
  const response = await subscriptionsModel.getRestaurantSubscription(req);
  res.status(response.statusCode).json(response);
};

/**
 * Get restaurant subscription history
 */
const getSubscriptionHistory = async (req, res) => {
  const response = await subscriptionsModel.getSubscriptionHistory(req);
  res.status(response.statusCode).json(response);
};

/**
 * Change restaurant subscription plan
 */
const changePlan = async (req, res) => {
  const response = await subscriptionsModel.changePlan(req);
  res.status(response.statusCode).json(response);
};

export default {
  getAllPlans,
  getPlanById: getPlan,
  getPlanStats: getPlan, // Reuse getPlan for stats endpoint
  createPlan,
  updatePlan,
  deactivatePlan,
  assignPlan,
  getRestaurantSubscription,
  getSubscriptionHistory,
  changePlan,
};
