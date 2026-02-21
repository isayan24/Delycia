import featuresModel from "../../../models/v1/web/restaurant-features.model.js";

const get_features = async (req, res) => {
  const response = await featuresModel.get_features(req);
  return res.status(response.statusCode).json(response);
};

const update_features = async (req, res) => {
  const response = await featuresModel.update_features(req);
  return res.status(response.statusCode).json(response);
};

export default { get_features, update_features };
