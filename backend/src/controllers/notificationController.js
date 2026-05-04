// Controller layer for notification endpoints.
const catchAsync = require("../utils/catchAsync");
const { successResponse } = require("../utils/apiResponse");
const {
  validateNotificationIdParam,
  validateCreateNotificationInput
} = require("../validators/notificationValidator");
const {
  createNotification,
  listMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification
} = require("../services/notificationService");

const create = catchAsync(async (req, res) => {
  validateCreateNotificationInput(req.body);
  const notification = await createNotification(req.body);
  return successResponse(res, notification, "Notification created successfully", 201);
});

const listMine = catchAsync(async (req, res) => {
  const notifications = await listMyNotifications(req.user._id);
  return successResponse(res, notifications, "Notifications fetched successfully", 200);
});

const markAllRead = catchAsync(async (req, res) => {
  const result = await markAllNotificationsRead(req.user._id);
  return successResponse(
    res,
    result,
    result.modifiedCount > 0
      ? "All unread notifications marked as read"
      : "No unread notifications to update",
    200
  );
});

const markRead = catchAsync(async (req, res) => {
  validateNotificationIdParam(req.params.id);
  const notification = await markNotificationRead(req.params.id, req.user);
  return successResponse(res, notification, "Notification marked as read", 200);
});

const remove = catchAsync(async (req, res) => {
  validateNotificationIdParam(req.params.id);
  await deleteNotification(req.params.id, req.user);
  return successResponse(res, null, "Notification removed successfully", 200);
});

module.exports = {
  create,
  listMine,
  markAllRead,
  markRead,
  remove
};
