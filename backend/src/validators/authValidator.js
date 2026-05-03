// Request payload validation for assignment-required data integrity on APIs.
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

  if (!email || String(email).trim().length < 2) {
    throw new AppError("Please provide an email or username", 400);
  }

  if (!password || password.length < 8) {
    throw new AppError("Password must be at least 8 characters", 400);
  }
};

const isValidPhoneNumber = (value) => /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(value);

const validateUpdateProfileInput = (payload) => {
  const allowedFields = ["fullName", "phoneNumber"];
  const payloadKeys = Object.keys(payload || {});
  const unexpectedField = payloadKeys.find((key) => !allowedFields.includes(key));
  if (unexpectedField) {
    throw new AppError(`Unexpected field: ${unexpectedField}`, 400);
  }

  const hasFullName = Object.prototype.hasOwnProperty.call(payload, "fullName");
  const hasPhoneNumber = Object.prototype.hasOwnProperty.call(payload, "phoneNumber");

  if (!hasFullName && !hasPhoneNumber) {
    throw new AppError("Please provide fullName or phoneNumber to update", 400);
  }

  if (hasFullName) {
    if (typeof payload.fullName !== "string") {
      throw new AppError("Full name must be a string", 400);
    }

    const normalizedFullName = String(payload.fullName || "").trim();
    if (normalizedFullName.length < 2) {
      throw new AppError("Full name must be at least 2 characters", 400);
    }
  }

  if (hasPhoneNumber && payload.phoneNumber !== null) {
    if (typeof payload.phoneNumber !== "string") {
      throw new AppError("Phone number must be a string", 400);
    }

    const normalizedPhoneNumber = String(payload.phoneNumber || "").trim();
    if (normalizedPhoneNumber.length > 0) {
      if (normalizedPhoneNumber.length < 7 || normalizedPhoneNumber.length > 20) {
        throw new AppError("Phone number must be between 7 and 20 characters", 400);
      }

      if (!isValidPhoneNumber(normalizedPhoneNumber)) {
        throw new AppError("Please provide a valid phone number", 400);
      }
    }
  }
};

const validateChangePasswordInput = (payload) => {
  const allowedFields = ["currentPassword", "newPassword"];
  const payloadKeys = Object.keys(payload || {});
  const unexpectedField = payloadKeys.find((key) => !allowedFields.includes(key));
  if (unexpectedField) {
    throw new AppError(`Unexpected field: ${unexpectedField}`, 400);
  }

  const { currentPassword, newPassword } = payload;

  if (typeof currentPassword !== "string") {
    throw new AppError("Current password must be a string", 400);
  }

  if (typeof newPassword !== "string") {
    throw new AppError("New password must be a string", 400);
  }

  if (!currentPassword || String(currentPassword).length < 8) {
    throw new AppError("Current password must be at least 8 characters", 400);
  }

  if (!newPassword || String(newPassword).length < 8) {
    throw new AppError("New password must be at least 8 characters", 400);
  }

  if (String(currentPassword) === String(newPassword)) {
    throw new AppError("New password must be different from current password", 400);
  }
};

module.exports = {
  validateRegisterInput,
  validateLoginInput,
  validateUpdateProfileInput,
  validateChangePasswordInput
};