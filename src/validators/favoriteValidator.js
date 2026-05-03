// Request payload validation for assignment-required data integrity on APIs.
const mongoose = require("mongoose");
const AppError = require("../utils/AppError");

const allowedPriority = ["low", "medium", "high"];

const validateCreateFavoriteInput = (payload) => {
  const { propertyId, note, priorityLevel } = payload;

  if (!propertyId || !mongoose.Types.ObjectId.isValid(propertyId)) {
    throw new AppError("Valid propertyId is required", 400);
  }

  if (note !== undefined && String(note).length > 500) {
    throw new AppError("Note must be 500 characters or less", 400);
  }

  if (priorityLevel !== undefined && !allowedPriority.includes(priorityLevel)) {
    throw new AppError("Invalid priorityLevel", 400);
  }
};

const validateUpdateFavoriteInput = (payload) => {
  if (Object.keys(payload).length === 0) {
    throw new AppError("Provide at least one field to update", 400);
  }

  if (payload.note !== undefined && String(payload.note).length > 500) {
    throw new AppError("Note must be 500 characters or less", 400);
  }

  if (payload.priorityLevel !== undefined && !allowedPriority.includes(payload.priorityLevel)) {
    throw new AppError("Invalid priorityLevel", 400);
  }
};

const validateFavoriteIdParam = (favoriteId) => {
  if (!favoriteId || !mongoose.Types.ObjectId.isValid(favoriteId)) {
    throw new AppError("Invalid favorite id", 400);
  }
};

module.exports = {
  validateCreateFavoriteInput,
  validateUpdateFavoriteInput,
  validateFavoriteIdParam
};
