// Service layer: encapsulates business rules and database operations.
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const env = require("../config/env");

const signToken = (userId, role) => {
  return jwt.sign({ sub: userId, role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });
};

const normalizeUserPayload = (user) => {
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    phoneNumber: user.phoneNumber || null,
    profileImage: user.profileImage || null
  };
};

const registerUser = async ({ fullName, email, password, role }) => {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new AppError("Email already in use", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    fullName,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: role || "buyer"
  });

  const token = signToken(user._id.toString(), user.role);

  return {
    token,
    user: normalizeUserPayload(user)
  };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken(user._id.toString(), user.role);

  return {
    token,
    user: normalizeUserPayload(user)
  };
};

const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  return normalizeUserPayload(user);
};

const updateUserProfile = async (userId, payload) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (Object.prototype.hasOwnProperty.call(payload, "fullName")) {
    user.fullName = String(payload.fullName || "").trim();
  }

  if (Object.prototype.hasOwnProperty.call(payload, "phoneNumber")) {
    const normalizedPhoneNumber = payload.phoneNumber === null ? "" : String(payload.phoneNumber || "").trim();
    user.phoneNumber = normalizedPhoneNumber || null;
  }

  await user.save();
  return normalizeUserPayload(user);
};

const changeUserPassword = async (userId, payload) => {
  const { currentPassword, newPassword } = payload;

  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const passwordMatch = await bcrypt.compare(currentPassword, user.password);
  if (!passwordMatch) {
    throw new AppError("Current password is incorrect", 400);
  }

  const samePassword = await bcrypt.compare(newPassword, user.password);
  if (samePassword) {
    throw new AppError("New password must be different from current password", 400);
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  return normalizeUserPayload(user);
};

const updateUserAvatar = async (userId, profileImageUrl) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.profileImage = profileImageUrl;
  await user.save();

  return normalizeUserPayload(user);
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  updateUserAvatar
};