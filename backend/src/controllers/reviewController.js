// Controller layer for review/rating endpoints.
const catchAsync = require("../utils/catchAsync");
const { successResponse } = require("../utils/apiResponse");
const {
  validateCreateReviewInput,
  validateUpdateReviewInput
} = require("../validators/reviewValidator");
const {
  createReview,
  listPropertyReviews,
  listUserReviews,
  listAgentReviews,
  updateReview,
  deleteReview
} = require("../services/reviewService");

const create = catchAsync(async (req, res) => {
  validateCreateReviewInput(req.body);
  const review = await createReview(req.body, req.user._id);
  return successResponse(res, review, "Review submitted successfully", 201);
});

const listByProperty = catchAsync(async (req, res) => {
  const data = await listPropertyReviews(req.params.propertyId);
  return successResponse(res, data, "Reviews fetched successfully", 200);
});

const listByUser = catchAsync(async (req, res) => {
  const reviews = await listUserReviews(req.user._id);
  return successResponse(res, reviews, "User reviews fetched successfully", 200);
});

const listByAgent = catchAsync(async (req, res) => {
  const data = await listAgentReviews(req.params.agentId);
  return successResponse(res, data, "Agent reviews fetched successfully", 200);
});

const update = catchAsync(async (req, res) => {
  validateUpdateReviewInput(req.body);
  const review = await updateReview(req.params.id, req.body, req.user);
  return successResponse(res, review, "Review updated successfully", 200);
});

const remove = catchAsync(async (req, res) => {
  await deleteReview(req.params.id, req.user);
  return successResponse(res, null, "Review deleted successfully", 200);
});

module.exports = {
  create,
  listByProperty,
  listByUser,
  listByAgent,
  update,
  remove
};