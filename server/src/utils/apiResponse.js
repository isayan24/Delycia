const success = (statusCode, message, data) => {
  return { statusCode, message, ...data };
};
const error = (statusCode, error) => {
  return { statusCode, error };
};

export default { success, error };
