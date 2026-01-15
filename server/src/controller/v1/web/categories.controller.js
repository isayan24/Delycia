import categoriesModel from "../../../models/v1/web/categories.model.js";

const createCategory = async (req, res) => {
  const response = await categoriesModel.createCategory(req);
  res.status(response.statusCode).json(response);
};

const getCategories = async (req, res) => {
  const response = await categoriesModel.getCategories(req);
  res.status(response.statusCode).json(response);
};

const deleteCategory = async (req, res) => {
  const response = await categoriesModel.deleteCategory(req);
  res.status(response.statusCode).json(response);
};

const updateCategory = async (req, res) => {
  const response = await categoriesModel.updateCategory(req);
  res.status(response.statusCode).json(response);
};

const getCategoryTemplates = async (req, res) => {
  const response = await categoriesModel.getCategoryTemplates(req);
  res.status(response.statusCode).json(response);
};

const createFromTemplate = async (req, res) => {
  const response = await categoriesModel.createFromTemplate(req);
  res.status(response.statusCode).json(response);
};

const bulkCreateFromTemplates = async (req, res) => {
  const response = await categoriesModel.bulkCreateFromTemplates(req);
  res.status(response.statusCode).json(response);
};

const createCategoryAsTemplate = async (req, res) => {
  const response = await categoriesModel.createCategoryAsTemplate(req);
  res.status(response.statusCode).json(response);
};

export default {
  // Existing functions
  createCategory,
  getCategories,
  deleteCategory,
  updateCategory,

  // NEW functions
  getCategoryTemplates,
  createFromTemplate,
  bulkCreateFromTemplates,
  createCategoryAsTemplate, // NEW
};
