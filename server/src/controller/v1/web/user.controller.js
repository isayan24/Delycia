import userModel from "../../../models/v1/web/user.model.js";
import validator from "../../../validations/user.validations.js";
import otherUtils from "../../../utils/others.js";
// Global variables
let validationError = null;

const deleteUser = async (req, res) => {
  try {
    const { uid, password } = req.body;

    validationError = validator.validateUserDeleteInput(uid, password);
    if (validationError) {
      return res.status(400).json(validationError);
    }
    const response = await userModel.deleteUser(uid, password);

    if (response instanceof Error) {
      return res.status(400).json({ status: false, error: response.message });
    }

    if (response.status === false) {
      return res.status(400).json(response);
    }
    res.status(200).json({ status: true, message: "User has been deleted." });
  } catch (error) {
    res.status(500).json({
      status: false,
      error: `Internal server error : ${error.message} `,
    });
  }
};

const deleteStaff = async (req, res) => {
  try {
    const { uid } = req.params;

    if (!uid) {
      return res.status(400).json({ status: false, error: "UID is required." });
    }

    const response = await userModel.deleteStaff(uid);
    res.status(response.statusCode).json(response);
  } catch (error) {
    res.status(500).json({
      status: false,
      error: `Internal server error : ${error.message} `,
    });
  }
};

const updateUser = async (req, res) => {
  const { uid, ...params } = req.body;

  const allowedParams = [
    "username",
    "name",
    "phone_number",
    "profile_pic",
    "refresh_token",
    "password",
    "role",
    "verified",
  ];

  // Filter to only allowed params
  const filteredParams = {};
  for (let key in params) {
    if (allowedParams.includes(key)) {
      filteredParams[key] = params[key];
    }
  }

  validationError = validator.validateUserUpdateInput(filteredParams);

  if (validationError) {
    return res.status(400).json(validationError);
  }

  // Pass flat object with uid
  const response = await userModel.updateUser({ uid, ...filteredParams });

  if (response.status === false) {
    return res.status(400).json(response);
  }
  res.status(200).json(response);
};

const getUser = async (req, res) => {
  try {
    const user = otherUtils.getUser(req);
    const response = await userModel.getUser(user.uid);
    if (!response.status) return res.status(400).json(response);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ status: false, error: error });
  }
};
const getUserByName = async (req, res) => {
  try {
    const { name, rid } = req.query;
    const response = await userModel.getUserByName(name, rid);
    if (!response.status) return res.status(400).json(response);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ status: false, error: error });
  }
};
const getAllUsers = async (req, res) => {
  const resposne = await userModel.getAllUsers(req);
  res.status(resposne.statusCode).json(resposne);
};

const checkUser = async (req, res) => {
  const response = await userModel.checkUser(req.query.phone_number);
  res.status(response.statusCode).json(response);
};

export default {
  deleteUser,
  deleteStaff,
  updateUser,
  getUser,
  checkUser,
  getAllUsers,
  getUserByName
};
