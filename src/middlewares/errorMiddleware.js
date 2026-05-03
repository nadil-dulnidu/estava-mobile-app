// Centralized API error handlers for consistent status codes and response format.
const AppError = require("../utils/AppError");

const normalizeError = (err) => {
  if (err instanceof AppError) {
    return err;
  }

  if (err?.name === "CastError") {
    return new AppError(`Invalid ${err.path || "resource"} identifier`, 400);
  }

  if (err?.name === "ValidationError") {
    const messages = Object.values(err.errors || {})
      .map((entry) => entry.message)
      .filter(Boolean);

    return new AppError(messages[0] || "Validation failed", 400);
  }

  if (err?.code === 11000) {
    const duplicateField = Object.keys(err.keyPattern || err.keyValue || {})[0] || "field";
    return new AppError(`${duplicateField} already exists`, 409);
  }

  if (err?.name === "JsonWebTokenError") {
    return new AppError("Invalid authentication token", 401);
  }

  if (err?.name === "TokenExpiredError") {
    return new AppError("Authentication token has expired", 401);
  }

  if (err?.type === "entity.parse.failed") {
    return new AppError("Request body contains invalid JSON", 400);
  }

  return err;
};

const notFound = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

const errorHandler = (err, _req, res, _next) => {
  const normalizedError = normalizeError(err);
  const statusCode = normalizedError.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV !== "production";
  const isOperational = Boolean(normalizedError?.isOperational);
  const safeMessage =
    statusCode < 500 || isOperational || isDevelopment
      ? normalizedError.message || "Internal server error"
      : "Something went wrong. Please try again later.";

  const responseBody = {
    success: false,
    message: safeMessage,
    error: {
      statusCode,
      status: normalizedError.status || "error"
    }
  };

  if (isDevelopment && normalizedError?.stack) {
    responseBody.error.stack = normalizedError.stack;
  }

  return res.status(statusCode).json(responseBody);
};

module.exports = {
  notFound,
  errorHandler
};
