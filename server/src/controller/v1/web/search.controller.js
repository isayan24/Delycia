import searchModel from "../../../models/v1/web/search.model.js";

const search = async (req, res) => {
  const response = await searchModel.search(req);
  return res.status(response.statusCode).json(response);
};
const suggestions = async (req, res) => {
  const response = await searchModel.suggestions(req);
  return res.status(response.statusCode).json(response);
};

export default { search, suggestions };
