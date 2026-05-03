// Shared success response helper to keep API payloads consistent.
const successResponse = (res, data, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

module.exports = {
  successResponse
};