const adminFlag = (req, res, next) => {
  req.admin = true;
  next();
};

export default adminFlag;
