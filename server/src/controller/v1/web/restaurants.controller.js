import restaurantsModel from "../../../models/v1/web/restaurants.model.js";

const create_restaurant = async (req, res) => {
  const response = await restaurantsModel.create_restaurant(req);
  return res.status(response.statusCode).json(response);
};
const update_restaurant = async (req, res) => {
  const response = await restaurantsModel.update_restaurant(req);
  return res.status(response.statusCode).json(response);
};
const get_restaurant_admin = async (req, res) => {
  const response = await restaurantsModel.get_restaurant(req);
  return res.status(response.statusCode).json(response);
};
const get_restaurant = async (req, res) => {
  const admin = false;
  const response = await restaurantsModel.get_restaurant(req, admin);
  return res.status(response.statusCode).json(response);
};

export default {
  create_restaurant,
  update_restaurant,
  get_restaurant_admin,
  get_restaurant,
};
