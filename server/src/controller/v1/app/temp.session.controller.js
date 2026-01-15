import tempSessionModel from "../../../models/v1/app/temp.session.model.js";

const createTempSession = async (req, res) => {
  const response = await tempSessionModel.createTempSession(req);
  res.status(response.statusCode).json(response);
};

const getTempSessions = async (table_no) => {
  const response = await tempSessionModel.getTempSessions(table_no);
  return response;
};

export default { createTempSession, getTempSessions };
