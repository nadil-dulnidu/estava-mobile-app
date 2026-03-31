const catchAsync = require("../utils/catchAsync");
const { successResponse } = require("../utils/apiResponse");
const { validateRegisterInput, validateLoginInput } = require("../validators/authValidator");
const { registerUser, loginUser } = require("../services/authService");

const register = catchAsync(async (req, res) => {
  validateRegisterInput(req.body);
  const data = await registerUser(req.body);

  return successResponse(res, data, "Registration successful", 201);
});

const login = catchAsync(async (req, res) => {
  validateLoginInput(req.body);
  const data = await loginUser(req.body);

  return successResponse(res, data, "Login successful", 200);
});

module.exports = {
  register,
  login
};