import dashboardModel from "../../../models/v1/web/dashboard.model.js";

const getDashboardOverview = async (req, res) => {
  const response = await dashboardModel.getDashboardOverview(req);
  res.status(response.statusCode).json(response);
};

const getDashboardStats = async (req, res) => {
  const response = await dashboardModel.getDashboardStats(req);
  res.status(response.statusCode).json(response);
};

const getSalesTrend = async (req, res) => {
  const response = await dashboardModel.getSalesTrend(req);
  res.status(response.statusCode).json(response);
};

const getOrderStatusDistribution = async (req, res) => {
  const response = await dashboardModel.getOrderStatusDistribution(req);
  res.status(response.statusCode).json(response);
};

const getTopSellingItems = async (req, res) => {
  const response = await dashboardModel.getTopSellingItems(req);
  res.status(response.statusCode).json(response);
};

const getInventoryLevels = async (req, res) => {
  const response = await dashboardModel.getInventoryLevels(req);
  res.status(response.statusCode).json(response);
};

const getRevenueByCategory = async (req, res) => {
  const response = await dashboardModel.getRevenueByCategory(req);
  res.status(response.statusCode).json(response);
};

const getRecentOrders = async (req, res) => {
  const response = await dashboardModel.getRecentOrders(req);
  res.status(response.statusCode).json(response);
};



const getDeliveryTypeDistribution = async (req, res) => {
  const response = await dashboardModel.getDeliveryTypeDistribution(req);
  res.status(response.statusCode).json(response);
};

const getCompleteDashboard = async (req, res) => {
  const response = await dashboardModel.getCompleteDashboard(req);
  res.status(response.statusCode).json(response);
};

const getCustomerOrders = async (req, res) => {
  const response = await dashboardModel.getCustomerOrders(req);
  res.status(response.statusCode).json(response);
};

export default {
  getDashboardOverview,
  getDashboardStats,
  getSalesTrend,
  getOrderStatusDistribution,
  getTopSellingItems,
  getInventoryLevels,
  getRevenueByCategory,
  getRecentOrders,
  getRecentOrders,
  getDeliveryTypeDistribution,
  getCompleteDashboard,
  getCustomerOrders,
};
