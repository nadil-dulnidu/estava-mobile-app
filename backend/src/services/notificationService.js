// Service layer for notification CRUD and user-scoped visibility.
const Notification = require("../models/Notification");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const createNotification = async (payload) => {
  const recipient = await User.findById(payload.userId).select("_id");
  if (!recipient) {
    throw new AppError("Recipient user not found", 404);
  }

  return Notification.create({
    userId: payload.userId,
    title: payload.title,
    message: payload.message,
    type: payload.type || "system",
    status: "unread"
  });
};

const listMyNotifications = async (userId) => {
  return Notification.find({ userId }).sort({ createdAt: -1 });
};

const markNotificationRead = async (notificationId, user) => {
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  const isOwner = notification.userId.toString() === user._id.toString();
  const isAdmin = user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new AppError("You do not have permission to update this notification", 403);
  }

  notification.status = "read";
  await notification.save();
  return notification;
};

const deleteNotification = async (notificationId, user) => {
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  const isOwner = notification.userId.toString() === user._id.toString();
  const isAdmin = user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new AppError("You do not have permission to delete this notification", 403);
  }

  await Notification.findByIdAndDelete(notificationId);
};

module.exports = {
  createNotification,
  listMyNotifications,
  markNotificationRead,
  deleteNotification
};