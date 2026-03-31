// Request payload validation for notification module endpoints.
const mongoose = require("mongoose");
const AppError = require("../utils/AppError");

const validTypes = ["system", "inquiry", "appointment", "review", "listing"];

const validateCreateNotificationInput = (payload) => {
  const { userId, title, message, type } = payload;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError("Valid userId is required", 400);
  }

  if (!title || String(title).trim().length < 3) {
    throw new AppError("title must be at least 3 characters", 400);
  }

  if (!message || String(message).trim().length < 3) {
    throw new AppError("message must be at least 3 characters", 400);
  }

  if (type !== undefined && !validTypes.includes(type)) {
    throw new AppError("Invalid notification type", 400);
  }
};

module.exports = {
  validateCreateNotificationInput
};