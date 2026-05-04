// Controller layer: validates HTTP intent and delegates business logic to services.
const catchAsync = require("../utils/catchAsync");
const { successResponse } = require("../utils/apiResponse");
const {
  validateFavoriteIdParam,    // Validates ID in request params
  validateCreateFavoriteInput,  // Validates input when creating a favorite
  validateUpdateFavoriteInput  // Validates input when updating a favorite
} = require("../validators/favoriteValidator");
const {
  createFavorite,
  listFavoritesByUser,
  updateFavorite,
  deleteFavorite
} = require("../services/favoriteService");

// Controller to handle creating a new favorite
const create = catchAsync(async (req, res) => {
  validateCreateFavoriteInput(req.body);
  const favorite = await createFavorite(req.body, req.user._id);
  return successResponse(res, favorite, "Favorite added successfully", 201);
});

// Controller to get all favorites of the logged-in user
const listMine = catchAsync(async (req, res) => {
  const favorites = await listFavoritesByUser(req.user._id);
  return successResponse(res, favorites, "Favorites fetched successfully", 200);
});

// Controller to update a specific favorite
const update = catchAsync(async (req, res) => {
  validateFavoriteIdParam(req.params.id);
  validateUpdateFavoriteInput(req.body);
  const favorite = await updateFavorite(req.params.id, req.body, req.user._id);
  return successResponse(res, favorite, "Favorite updated successfully", 200);
});

const remove = catchAsync(async (req, res) => {
  validateFavoriteIdParam(req.params.id);
  await deleteFavorite(req.params.id, req.user._id);
  return successResponse(res, null, "Favorite removed successfully", 200);
});

module.exports = {
  create,
  listMine,
  update,
  remove
};
