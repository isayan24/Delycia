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

// REST endpoint version for HTTP requests
const get_orders_by_table = async (req, res) => {
  const { table_no, rid } = req.body;
  const response = await ordersModel.getOrderByTable({
    table_no,
    rid,
    customer_ids: [],
  });

  if (response.status) {
    res.status(200).json(response);
  } else {
    res.status(400).json(response);
  }
};

const merge_orders = async (req, res) => {
  const response = await ordersModel.merge_orders(req);
  res.status(response.statusCode).json(response);
};

const get_paginated_orders = async (req, res) => {
  const response = await ordersModel.get_paginated_orders(req);
  res.status(response.statusCode).json(response);
};

const settle_customer = async (req, res) => {
  const response = await ordersModel.settleCustomerOrders(req);
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
  merge_orders,
  get_orders_by_table,
  settle_customer,
};
