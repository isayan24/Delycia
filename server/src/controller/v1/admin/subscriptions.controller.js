import subscriptionsModel from "../../../models/v1/web/subscriptions.model.js";

/**
 * Get subscription details for a restaurant
 */
const getSubscription = async (req, res) => {
  const response = await subscriptionsModel.get_subscription(req);
  res.status(response.statusCode).json(response);
};

/**
 * Get available subscription plans
 */
const getPlans = async (req, res) => {
  const response = await subscriptionsModel.get_plans();
  res.status(response.statusCode).json(response);
};

export default {
  getSubscription,
  getPlans,
};
