import inventoryStatsModel from "../../../models/v1/web/inventory-stats.model.js";

const getItemStats = async (req, res) => {
  const response = await inventoryStatsModel.getItemStats(req);
  res.status(response.statusCode).json(response);
};

export default {
  getItemStats,
};
