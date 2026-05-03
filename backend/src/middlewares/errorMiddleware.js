// Centralized API error handlers for consistent status codes and response format.
const AppError = require("../utils/AppError");

const notFound = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV !== "production";
  const isOperational = Boolean(err?.isOperational);
  const safeMessage =
    statusCode < 500 || isOperational || isDevelopment
      ? err.message || "Internal server error"
      : "Something went wrong. Please try again later.";

  const responseBody = {
    success: false,
    message: safeMessage,
    error: {
      statusCode,
      status: err.status || "error"
    }
  };

  if (isDevelopment && err?.stack) {
    responseBody.error.stack = err.stack;
  }

  return res.status(statusCode).json(responseBody);
};

module.exports = {
  notFound,
  errorHandler
};