import crmModel from "../../../models/v1/web/crm.model.js";

const getRestaurantCustomers = async (req, res) => {
  const { rid, timeRange } = req.query;

  if (!rid) {
    return res.status(400).json({ status: false, message: "Restaurant ID (rid) is required" });
  }

  const response = await crmModel.getRestaurantCustomers(rid, timeRange);
  res.status(response.statusCode).json(response);
};


const getCRMStats = async (req, res) => {
  const { rid, timeRange } = req.query;

  if (!rid) {
    return res.status(400).json({ status: false, message: "Restaurant ID is required" });
  }
  const response = await crmModel.getCRMStats(rid, timeRange);
  res.status(response.statusCode).json(response);
};

const getCustomerDetails = async (req, res) => {
  const { rid, customerId } = req.query;

  if (!rid || !customerId) {
    return res.status(400).json({ status: false, message: "Restaurant ID and Customer ID are required" });
  }

  const response = await crmModel.getCustomerDetails(rid, customerId);
  res.status(response.statusCode).json(response);
};

export default {
  getRestaurantCustomers,
  getCRMStats,
  getCustomerDetails
};
