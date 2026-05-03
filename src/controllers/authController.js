// Controller layer: validates HTTP intent and delegates business logic to services.
const catchAsync = require("../utils/catchAsync");
const { successResponse } = require("../utils/apiResponse");
const AppError = require("../utils/AppError");
const {
  validateRegisterInput,
  validateLoginInput,
  validateUpdateProfileInput,
  validateChangePasswordInput
} = require("../validators/authValidator");
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  updateUserAvatar
} = require("../services/authService");

const buildAvatarUrl = (req) => {
  if (!req.file) {
    throw new AppError("Avatar image is required", 400);
  }

  return `${req.protocol}://${req.get("host")}/uploads/avatars/${req.file.filename}`;
};

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

const profile = catchAsync(async (req, res) => {
  const data = await getUserProfile(req.user._id);
  return successResponse(res, data, "Profile fetched successfully", 200);
});

const updateProfile = catchAsync(async (req, res) => {
  validateUpdateProfileInput(req.body);
  const data = await updateUserProfile(req.user._id, req.body);
  return successResponse(res, data, "Profile updated successfully", 200);
});

const changePassword = catchAsync(async (req, res) => {
  validateChangePasswordInput(req.body);
  const data = await changeUserPassword(req.user._id, req.body);
  return successResponse(res, data, "Password changed successfully", 200);
});

const updateAvatar = catchAsync(async (req, res) => {
  const avatarUrl = buildAvatarUrl(req);
  const data = await updateUserAvatar(req.user._id, avatarUrl);
  return successResponse(res, data, "Profile image updated successfully", 200);
});

module.exports = {
  register,
  login,
  profile,
  updateProfile,
  changePassword,
  updateAvatar
};