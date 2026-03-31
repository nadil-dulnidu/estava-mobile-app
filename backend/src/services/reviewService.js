// Service layer for review creation and moderation rules.
const Review = require("../models/Review");
const Property = require("../models/Property");
const AppError = require("../utils/AppError");

const createReview = async (payload, userId) => {
  const property = await Property.findById(payload.propertyId).select("_id createdBy");
  if (!property) {
    throw new AppError("Property not found", 404);
  }

  if (property.createdBy.toString() === userId.toString()) {
    throw new AppError("You cannot review your own property", 400);
  }

  const existing = await Review.findOne({ userId, propertyId: payload.propertyId });
  if (existing) {
    throw new AppError("You already reviewed this property", 409);
  }

  return Review.create({
    userId,
    propertyId: payload.propertyId,
    rating: Number(payload.rating),
    comment: payload.comment || ""
  });
};

const listPropertyReviews = async (propertyId) => {
  const reviews = await Review.find({ propertyId })
    .populate("userId", "fullName")
    .sort({ createdAt: -1 });

  const total = reviews.length;
  const avgRating = total
    ? Number((reviews.reduce((sum, item) => sum + item.rating, 0) / total).toFixed(2))
    : 0;

  return { reviews, avgRating, total };
};

const updateReview = async (reviewId, payload, user) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new AppError("Review not found", 404);
  }

  const isOwner = review.userId.toString() === user._id.toString();
  const isAdmin = user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new AppError("You do not have permission to update this review", 403);
  }

  if (payload.rating !== undefined) review.rating = Number(payload.rating);
  if (payload.comment !== undefined) review.comment = payload.comment;

  await review.save();
  return review;
};

const deleteReview = async (reviewId, user) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new AppError("Review not found", 404);
  }

  const isOwner = review.userId.toString() === user._id.toString();
  const isAdmin = user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new AppError("You do not have permission to delete this review", 403);
  }

  await Review.findByIdAndDelete(reviewId);
};

module.exports = {
  createReview,
  listPropertyReviews,
  updateReview,
  deleteReview
};