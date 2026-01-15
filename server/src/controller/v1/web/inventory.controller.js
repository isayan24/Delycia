import inventoryModel from "../../../models/v1/web/inventory.model.js";

const addItem = async (req, res) => {
  const response = await inventoryModel.addItem(req);
  res.status(response.statusCode).json(response);
};

const deleteItem = async (req, res) => {
  const response = await inventoryModel.deleteItem(req);
  res.status(response.statusCode).json(response);
};

const updateItem = async (req, res) => {
  const response = await inventoryModel.updateItem(req);
  res.status(response.statusCode).json(response);
};

const getItems = async (req, res) => {
  const response = await inventoryModel.getItems(req);
  res.status(response.statusCode).json(response);
};

const getRecommendedList = async (req, res) => {
  const response = await inventoryModel.getRecommendedList(req);
  res.status(response.statusCode).json(response);
};


// NEW: Bulk insert - optimized single query (fastest, best for large datasets)
const bulkAddItemsOptimized = async (req, res) => {
  const response = await inventoryModel.bulkAddItemsOptimized(req);
  res.status(response.statusCode).json(response);
};

export default {
  addItem,
  deleteItem,
  updateItem,
  getItems,
  getRecommendedList,
  bulkAddItemsOptimized,  // NEW
};
