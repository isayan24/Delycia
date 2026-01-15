import embeddingModel from "../../../models/v1/web/embedding.model.js";

const inventory = async (req, res) => {
  const { id } = req.query;
  const response = await embeddingModel.inventory(id);
  return res.status(response.statusCode).json(response);
};
const restaurant = async (req, res) => {
  const { id } = req.query;
  const response = await embeddingModel.restaurant(id);
  return res.status(response.statusCode).json(response);
};
const category = async (req, res) => {
  const { id } = req.query;
  const response = await embeddingModel.category(id);
  return res.status(response.statusCode).json(response);
};

export default { inventory, restaurant, category };
