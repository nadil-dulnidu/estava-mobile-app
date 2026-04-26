// Auth and role middleware to enforce JWT-protected, role-aware routes.
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const env = require("../config/env");

const AUTH_FAILURE_MESSAGE = "Authentication failed";

const extractBearerToken = (authHeader) => {
  const headerValue = String(authHeader || "").trim();
  const match = /^Bearer\s+(.+)$/i.exec(headerValue);

  if (!match) {
    return null;
  }

  const token = match[1].trim();
  return token || null;
};

const verifyAuthToken = (token) => {
  try {
    return jwt.verify(token, env.jwtSecret);
  } catch (_error) {
    throw new AppError(AUTH_FAILURE_MESSAGE, 401);
  }
};

const protect = catchAsync(async (req, res, next) => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    throw new AppError(AUTH_FAILURE_MESSAGE, 401);
  }

  const decoded = verifyAuthToken(token);
  const userId = typeof decoded?.sub === "string" ? decoded.sub.trim() : "";
  const hasValidUserIdFormat =
    typeof mongoose.isObjectIdOrHexString === "function"
      ? mongoose.isObjectIdOrHexString(userId)
      : mongoose.Types.ObjectId.isValid(userId);

  if (!userId || !hasValidUserIdFormat) {
    throw new AppError(AUTH_FAILURE_MESSAGE, 401);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(AUTH_FAILURE_MESSAGE, 401);
  }

  req.user = user;
  next();
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action", 403));
    }
    return next();
  };
};

module.exports = {
  protect,
  authorize
};