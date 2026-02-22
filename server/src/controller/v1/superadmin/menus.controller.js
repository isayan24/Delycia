import menusModel from "../../../models/v1/superadmin/menus.model.js";

/**
 * Superadmin Menus Controller
 * Handles menu management across all restaurants
 */

/**
 * Get all menu items with optional filters
 */
const getAllMenus = async (req, res) => {
  const response = await menusModel.getAllMenus(req);
  res.status(response.statusCode).json(response);
};

/**
 * Get single menu item details
 */
const getMenuItem = async (req, res) => {
  const response = await menusModel.getMenuItemById(req);
  res.status(response.statusCode).json(response);
};

/**
 * Update menu item
 */
const updateMenuItem = async (req, res) => {
  const response = await menusModel.updateMenuItem(req);
  res.status(response.statusCode).json(response);
};

/**
 * Delete menu item (soft delete)
 */
const deleteMenuItem = async (req, res) => {
  const response = await menusModel.deleteMenuItem(req);
  res.status(response.statusCode).json(response);
};

/**
 * Create menu category
 */
const createCategory = async (req, res) => {
  const response = await menusModel.createCategory(req);
  res.status(response.statusCode).json(response);
};

/**
 * Update menu category
 */
const updateCategory = async (req, res) => {
  const response = await menusModel.updateCategory(req);
  res.status(response.statusCode).json(response);
};

/**
 * Delete menu category
 */
const deleteCategory = async (req, res) => {
  const response = await menusModel.deleteCategory(req);
  res.status(response.statusCode).json(response);
};

/**
 * Bulk update menu items
 */
const bulkUpdateMenus = async (req, res) => {
  const response = await menusModel.bulkUpdateMenuItems(req);
  res.status(response.statusCode).json(response);
};

export default {
  getAllMenus,
  getMenuItemById: getMenuItem,
  updateMenuItem,
  deleteMenuItem,
  createCategory,
  updateCategory,
  deleteCategory,
  bulkUpdateMenuItems: bulkUpdateMenus,
};
