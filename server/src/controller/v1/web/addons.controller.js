import addonsModel from "../../../models/v1/web/addons.model.js";

const getAddons = async (req, res) => {
  try {
    const response = await addonsModel.getAddons(req);
    res.status(response.statusCode).json(response);
  } catch (error) {
    res.status(500).json({ status: false, error: error });
  }
};

const getAddonsForItem = async (req, res) => {
  try {
    const { inventory_id } = req.query;
    const response = await addonsModel.getAddonsForItem(inventory_id);
    res.status(response.statusCode).json(response);
  } catch (error) {
    res.status(500).json({ status: false, error: error });
  }
}
const createAddon = async (req, res) => {
  try {
    const response = await addonsModel.createAddon(req);
    res.status(response.statusCode).json(response);
  } catch (error) {
    res.status(500).json({ status: false, error: error });
  }
}
const updateAddon = async (req, res) => {
  try {
    const response = await addonsModel.updateAddon(req);
    res.status(response.statusCode).json(response);
  } catch (error) {
    res.status(500).json({ status: false, error: error });
  }
}
const deleteAddon = async (req, res) => {
  try {
    const response = await addonsModel.deleteAddon(req);
    res.status(response.statusCode).json(response);
  } catch (error) {
    res.status(500).json({ status: false, error: error });
  }
}
const linkAddonsToItem = async (req, res) => {
  try {
    const response = await addonsModel.linkAddonsToItem(req);
    res.status(response.statusCode).json(response);
  } catch (error) {
    res.status(500).json({ status: false, error: error });
  }
}
const unlinkAddonsFromItem = async (req, res) => {
  try {
    const response = await addonsModel.unlinkAddonsFromItem(req);
    res.status(response.statusCode).json(response);
  } catch (error) {
    res.status(500).json({ status: false, error: error });
  }
}
const linkAddonsToOrder = async (req, res) => {
  try {
    const response = await addonsModel.linkAddonsToOrder(req);
    res.status(response.statusCode).json(response);
  } catch (error) {
    res.status(500).json({ status: false, error: error });
  }
}

export default {
  getAddons,
  getAddonsForItem,
  createAddon,
  updateAddon,
  deleteAddon,
  linkAddonsToItem,
  unlinkAddonsFromItem,
  linkAddonsToOrder
}