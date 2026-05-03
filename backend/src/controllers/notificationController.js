// Controller layer for notification endpoints.
const catchAsync = require("../utils/catchAsync");
const { successResponse } = require("../utils/apiResponse");
const { validateCreateNotificationInput } = require("../validators/notificationValidator");
const {
  createNotification,
  listMyNotifications,
  markNotificationRead,
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

const markRead = catchAsync(async (req, res) => {
  const notification = await markNotificationRead(req.params.id, req.user);
  return successResponse(res, notification, "Notification marked as read", 200);
});

const remove = catchAsync(async (req, res) => {
  await deleteNotification(req.params.id, req.user);
  return successResponse(res, null, "Notification removed successfully", 200);
});

module.exports = {
  create,
  listMine,
  markRead,
  remove
};