// Service layer for notification CRUD and user-scoped visibility.
const Notification = require("../models/Notification");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { emitNotificationToUser } = require("../socket");

const assertNotificationAccess = (notification, user, action) => {
  const isOwner = notification.userId.toString() === user._id.toString();
  const isAdmin = user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new AppError(`You do not have permission to ${action} this notification`, 403);
  }
};

const createAndDispatchNotification = async (payload) => {
  const recipient = await User.findById(payload.userId).select("_id");
  if (!recipient) {
    throw new AppError("Recipient user not found", 404);
  }

  const notification = await Notification.create({
    userId: payload.userId,
    title: payload.title,
    message: payload.message,
    type: payload.type || "system",
    status: "unread"
  });

  emitNotificationToUser(payload.userId, notification.toObject());

  return notification;
};

const createNotification = async (payload) => {
  return createAndDispatchNotification(payload);
};

const listMyNotifications = async (userId) => {
  return Notification.find({ userId }).sort({ createdAt: -1 });
};

const markNotificationRead = async (notificationId, user) => {
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  assertNotificationAccess(notification, user, "update");

  if (notification.status === "read") {
    return notification;
  }

  notification.status = "read";
  await notification.save();
  return notification;
};

const markAllNotificationsRead = async (userId) => {
  const result = await Notification.updateMany(
    {
      userId,
      status: "unread"
    },
    {
      $set: {
        status: "read"
      }
    }
  );

  return {
    modifiedCount: result.modifiedCount || 0
  };
};

const deleteNotification = async (notificationId, user) => {
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  assertNotificationAccess(notification, user, "delete");

  await Notification.findByIdAndDelete(notificationId);
};

module.exports = {
  createNotification,
  createAndDispatchNotification,
  listMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification
};
