import tableModel from "../../../models/v1/web/tables.model.js";

const get_all_tables = async (req, res) => {
  const response = await tableModel.get_all(req);
  res.status(response.statusCode).json(response);
};
const get_all_zone = async (req, res) => {
  const response = await tableModel.get_all_zone(req);
  res.status(response.statusCode).json(response);
};
const get_table_details = async (req, res) => {
  const response = await tableModel.get_table_details(req);
  res.status(response.statusCode).json(response);
};

const create_table = async (req, res) => {
  const response = await tableModel.create(req);
  res.status(response.statusCode).json(response);
};

const update_table = async (req, res) => {
  const response = await tableModel.update(req);
  res.status(response.statusCode).json(response);
};

const delete_table = async (req, res) => {
  const response = await tableModel.delete(req);
  res.status(response.statusCode).json(response);
};

export default {
  get_all_tables,
  get_table_details,
  get_all_zone,
  create_table,
  update_table,
  delete_table,
};
