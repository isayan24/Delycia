import voiceModel from "../../../models/v1/app/voice.model.js";

const speak = async (req, res) => {
  const response = await voiceModel.speak(req);
  res.status(response.statusCode).json(response);
};
const welcome = async (req, res) => {
  const response = await voiceModel.welcome(req);
  res.status(response.statusCode).json(response);
};

export default { speak, welcome };
