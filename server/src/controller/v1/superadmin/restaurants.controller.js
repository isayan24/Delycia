import restaurantsModel from "../../../models/v1/superadmin/restaurants.model.js";

/**
 * Superadmin Restaurants Controller
 * Handles CRUD operations for restaurant management
 */

/**
 * Get all restaurants with optional filters
 */
const getAllRestaurants = async (req, res) => {
  console.log(`\n=== SUPERADMIN RESTAURANTS ===\n📥 GET /v1/superadmin/restaurants requested from ${req.ip}`);
  const response = await restaurantsModel.getAllRestaurants(req);
  console.log(`📤 Restaurants list response status: ${response.statusCode}`);
  res.status(response.statusCode).json(response);
};

/**
 * Get single restaurant details
 */
const getRestaurant = async (req, res) => {
  console.log(`\n=== SUPERADMIN RESTAURANTS ===\n📥 GET /v1/superadmin/restaurants/${req.params.id} requested from ${req.ip}`);
  const response = await restaurantsModel.getRestaurantById(req);
  console.log(`📤 Single restaurant response status: ${response.statusCode}`);
  res.status(response.statusCode).json(response);
};

/**
 * Create new restaurant
 */
const createRestaurant = async (req, res) => {
  const response = await restaurantsModel.createRestaurant(req);
  res.status(response.statusCode).json(response);
};

/**
 * Update restaurant details
 */
const updateRestaurant = async (req, res) => {
  const response = await restaurantsModel.updateRestaurant(req);
  res.status(response.statusCode).json(response);
};

/**
 * Deactivate restaurant
 */
const deactivateRestaurant = async (req, res) => {
  const response = await restaurantsModel.deactivateRestaurant(req);
  res.status(response.statusCode).json(response);
};

export default {
  getAllRestaurants,
  getRestaurantById: getRestaurant,
  createRestaurant,
  updateRestaurant,
  deactivateRestaurant,
};
