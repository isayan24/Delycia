
import notificationsModel from "../../../models/v1/web/notifications.model.js";

const getNotifications = async (req, res) => {
  const result = await notificationsModel.getNotifications(req);
  return res.status(result.statusCode).json(result);
};

const markAllAsRead = async (req, res) => {
  const result = await notificationsModel.markAllAsRead(req);
  return res.status(result.statusCode).json(result);
};

const markAsRead = async (req, res) => {
  const result = await notificationsModel.markAsRead(req);
  return res.status(result.statusCode).json(result);
};

const deleteNotification = async (req, res) => {
  const result = await notificationsModel.deleteNotification(req);
  return res.status(result.statusCode).json(result);
};

export default {
  getNotifications,
  markAllAsRead,
  markAsRead,
  deleteNotification,
};
