// Auth and role middleware to enforce JWT-protected, role-aware routes.
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const env = require("../config/env");

const protect = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    throw new AppError("You are not logged in", 401);
  }

  const decoded = jwt.verify(token, env.jwtSecret);
  const user = await User.findById(decoded.sub);

  if (!user) {
    throw new AppError("The user belonging to this token no longer exists", 401);
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