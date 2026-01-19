import ordersModel from "../../../models/v1/web/orders.model.js";

const create_orders = async (req, res) => {
  const resposne = await ordersModel.create_orders(req);

  res.status(resposne.statusCode).json(resposne);
};
const get_orders = async (req, res) => {
  const resposne = await ordersModel.get_orders(req);
  res.status(resposne.statusCode).json(resposne);
};
const get_all_orders = async (req, res) => {
  const resposne = await ordersModel.get_all_orders(req);
  res.status(resposne.statusCode).json(resposne);
};

const getOrders24Hours = async (playload) => {
  const ordersData = await ordersModel.getOrders24Hours(playload.rid);
  return ordersData;
};

const update_orders = async (req, res) => {
  const response = await ordersModel.update_orders(req);
  res.status(response.statusCode).json(response);
};
const delete_order = async (req, res) => {
  const response = await ordersModel.delete_order(req);
  res.status(response.statusCode).json(response);
};

const getOrderByTable = async (data) => {
  const response = await ordersModel.getOrderByTable(data);
  return response;
};

const get_paginated_orders = async (req, res) => {
  const response = await ordersModel.get_paginated_orders(req);
  res.status(response.statusCode).json(response);
};

export default {
  create_orders,
  get_orders,
  getOrders24Hours,
  update_orders,
  delete_order,
  getOrderByTable,
  get_all_orders,
  get_paginated_orders,
};
