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

const updateUser = async (req, res) => {
  let params = req.body;
  let uid = req.body.uid;

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
  // Deleteing the params that are not in the allowed list
  for (let key in params) {
    if (!allowedParams.includes(key)) {
      delete params[key];
    }
  }
  validationError = validator.validateUserUpdateInput(params);

  if (validationError) {
    return res.status(400).json(validationError);
  }
  params = { uid, params };
  const response = await userModel.updateUser(params);

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
    const response = await userModel.getUserByName(req.query.name);
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
  updateUser,
  getUser,
  checkUser,
  getAllUsers,
  getUserByName
};
