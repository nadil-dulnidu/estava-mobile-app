// Request payload validation for review and rating endpoints.
const mongoose = require("mongoose");
const AppError = require("../utils/AppError");

const validateReviewIdParam = (reviewId) => {
  if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new AppError("Valid review id is required", 400);
  }
};

const validateReviewTargetId = (targetId, label) => {
  if (!targetId || !mongoose.Types.ObjectId.isValid(targetId)) {
    throw new AppError(`Valid ${label} is required`, 400);
  }
};

const validateCreateReviewInput = (payload) => {
  const { propertyId, rating, comment } = payload;

  if (!propertyId || !mongoose.Types.ObjectId.isValid(propertyId)) {
    throw new AppError("Valid propertyId is required", 400);
  }

  const numericRating = Number(rating);
  if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
    throw new AppError("rating must be a number between 1 and 5", 400);
  }

  if (comment !== undefined && String(comment).length > 1200) {
    throw new AppError("comment must be 1200 characters or less", 400);
  }
};

const validateUpdateReviewInput = (payload) => {
  if (Object.keys(payload).length === 0) {
    throw new AppError("Provide at least one field to update", 400);
  }

  if (payload.rating !== undefined) {
    const numericRating = Number(payload.rating);
    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      throw new AppError("rating must be a number between 1 and 5", 400);
    }
  }

  if (payload.comment !== undefined && String(payload.comment).length > 1200) {
    throw new AppError("comment must be 1200 characters or less", 400);
  }
};

module.exports = {
  validateReviewIdParam,
  validateReviewTargetId,
  validateCreateReviewInput,
  validateUpdateReviewInput
};
