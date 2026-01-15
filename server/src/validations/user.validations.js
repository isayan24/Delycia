import validator from "validator";

const validateUserInput = (username, name, email, password, profile_pic) => {
  if (!username || !name || !email || !password)
    return { status: false, error: "All the fields are required." };

  if (!validator.isEmail(email))
    return { status: false, error: "Invalid email address." };

  if (!validator.isLength(password, { min: 6, max: 20 }))
    return {
      status: false,
      error: "Password length should be between 6 and 20 characters.",
    };
  if (!validator.isLength(username, { min: 3, max: 20 }))
    return {
      status: false,
      error: "Username length should be between 3 and 20 characters.",
    };

  if (!validator.isLength(name, { min: 3, max: 20 }))
    return {
      status: false,
      error: "Name should be between 3 and 20 characters.",
    };

  if (profile_pic && !validator.isURL(profile_pic)) {
    return {
      status: false,
      error: "Invalid profile URL",
    };
  }
};

const validateUserDeleteInput = (uid, password) => {
  if (!uid || !password) {
    return { status: false, error: "uid & password is required." };
  }
};

const validateUserUpdateInput = (params) => {
  let { verified, profile_pic, name, username } = params;

  if (Object.keys(params).length === 0) {
    return { status: false, error: "Nothing to update." };
  }
  if (verified && isNaN(verified)) {
    return { status: false, error: "Invalid data of 'verified'." };
  }
  if (name && !validator.isLength(name, { min: 3, max: 20 }))
    return {
      status: false,
      error: "Name should be between 3 and 20 characters.",
    };
  if (username && !validator.isLength(username, { min: 3, max: 20 }))
    return {
      status: false,
      error: "Username should be between 3 and 20 characters.",
    };

  if (profile_pic && !validator.isURL(profile_pic)) {
    return {
      status: false,
      error: "Invalid profile URL",
    };
  }
};

const isValidUsername = (username) => {
  const regex = /^[A-Za-z0-9]+$/;
  return regex.test(username);
};

export default {
  validateUserInput,
  validateUserDeleteInput,
  validateUserUpdateInput,
  isValidUsername,
};
