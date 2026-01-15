import variantModel from "../../../models/v1/web/variant.model.js";

const GET_VARIANTS = async (req, res) => {
  const response = await variantModel.GET_VARIANTS(req);
  res.status(response.statusCode).json(response);
};

const ADD_VARIANT = async (req, res) => {
  const response = await variantModel.ADD_VARIANT(req);
  res.status(response.statusCode).json(response);
};
const DELETE_VARIANT = async (req, res) => {
  const response = await variantModel.DELETE_VARIANT(req);
  res.status(response.statusCode).json(response);
};
const UPDATE_VARIANT = async (req, res) => {
  const response = await variantModel.UPDATE_VARIANT(req);
  res.status(response.statusCode).json(response);
};
export default {
  GET_VARIANTS,
  ADD_VARIANT,
  UPDATE_VARIANT,
  DELETE_VARIANT,
};
