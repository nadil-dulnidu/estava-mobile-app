// Service layer: encapsulates business rules and database operations.
const Favorite = require("../models/Favorite");
const Property = require("../models/Property");
const AppError = require("../utils/AppError");

const createFavorite = async (payload, userId) => {
  const property = await Property.findById(payload.propertyId).select("_id listingStatus");
  if (!property) {
    throw new AppError("Property not found", 404);
  }

  try {
    return await Favorite.create({
      userId,
      propertyId: payload.propertyId,
      note: payload.note || "",
      priorityLevel: payload.priorityLevel || "medium"
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw new AppError("Property is already in favorites", 409);
    }
    throw error;
  }
};

const listFavoritesByUser = async (userId) => {
  return Favorite.find({ userId })
    .populate({
      path: "propertyId",
      select: "title location price propertyType listingStatus imageUrls"
    })
    .sort({ createdAt: -1 });
};

const updateFavorite = async (favoriteId, payload, userId) => {
  const favorite = await Favorite.findById(favoriteId);
  if (!favorite) {
    throw new AppError("Favorite not found", 404);
  }

  if (favorite.userId.toString() !== userId.toString()) {
    throw new AppError("You can only update your own favorites", 403);
  }

  if (payload.note !== undefined) favorite.note = payload.note;
  if (payload.priorityLevel !== undefined) favorite.priorityLevel = payload.priorityLevel;

  await favorite.save();
  return favorite;
};

const deleteFavorite = async (favoriteId, userId) => {
  const favorite = await Favorite.findById(favoriteId);
  if (!favorite) {
    throw new AppError("Favorite not found", 404);
  }

  if (favorite.userId.toString() !== userId.toString()) {
    throw new AppError("You can only delete your own favorites", 403);
  }

  await Favorite.findByIdAndDelete(favoriteId);
};

module.exports = {
  createFavorite,
  listFavoritesByUser,
  updateFavorite,
  deleteFavorite
};
