const AppError = require("../utils/AppError");

const isEmail = (value) => /\S+@\S+\.\S+/.test(value);

const validateRegisterInput = (payload) => {
  const { fullName, email, password, role } = payload;

  if (!fullName || fullName.trim().length < 2) {
    throw new AppError("Full name must be at least 2 characters", 400);
  }

  if (!email || !isEmail(email)) {
    throw new AppError("Please provide a valid email", 400);
  }

  if (!password || password.length < 8) {
    throw new AppError("Password must be at least 8 characters", 400);
  }

  const allowedRoles = ["buyer", "seller", "admin"];
  if (role && !allowedRoles.includes(role)) {
    throw new AppError("Invalid role", 400);
  }
};

const validateLoginInput = (payload) => {
  const { email, password } = payload;

  if (!email || !isEmail(email)) {
    throw new AppError("Please provide a valid email", 400);
  }

  if (!password || password.length < 8) {
    throw new AppError("Password must be at least 8 characters", 400);
  }
};

module.exports = {
  validateRegisterInput,
  validateLoginInput
};