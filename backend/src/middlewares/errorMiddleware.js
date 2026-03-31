const AppError = require("../utils/AppError");

const notFound = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  return res.status(statusCode).json({
    success: false,
    message,
    error: {
      statusCode,
      status: err.status || "error"
    }
  });
};

module.exports = {
  notFound,
  errorHandler
};