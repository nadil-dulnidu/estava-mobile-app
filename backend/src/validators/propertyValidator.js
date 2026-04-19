// Request payload validation for assignment-required data integrity on APIs.
const mongoose = require("mongoose");
const AppError = require("../utils/AppError");

const allowedTypes = ["house", "apartment", "land", "villa", "commercial"];
const allowedStatuses = ["available", "sold", "rented", "delisted"];

const ensureNonNegativeNumber = (value, fieldName) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new AppError(`${fieldName} must be a non-negative number`, 400);
  }
};

const ensurePositiveInteger = (value, fieldName) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new AppError(`${fieldName} must be a positive integer`, 400);
  }
};

const coerceFeatureList = (features) => {
  if (features === undefined) return undefined;
  if (Array.isArray(features)) return features.map((item) => String(item).trim()).filter(Boolean);
  if (typeof features === "string") {
    return features.split(",").map((item) => item.trim()).filter(Boolean);
  }
  throw new AppError("Features must be an array or comma-separated string", 400);
};

const coerceStringList = (value) => {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  throw new AppError("Value must be an array or comma-separated string", 400);
};

const validatePropertyIdParam = (id) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid property id", 400);
  }
};

const validateCreatePropertyInput = (payload) => {
  const { title, description, price, location, propertyType, listingStatus } = payload;

  if (typeof title !== "string" || title.trim().length < 5) {
    throw new AppError("Title must be at least 5 characters", 400);
  }
  if (typeof description !== "string" || description.trim().length < 20) {
    throw new AppError("Description must be at least 20 characters", 400);
  }
  const parsedPrice = Number(price);
  if (price === undefined || !Number.isFinite(parsedPrice) || parsedPrice < 0) {
    throw new AppError("Price must be a non-negative number", 400);
  }
  if (typeof location !== "string" || location.trim().length < 2) {
    throw new AppError("Location is required", 400);
  }
  if (!propertyType || !allowedTypes.includes(propertyType)) {
    throw new AppError("Invalid property type", 400);
  }
  if (listingStatus && !allowedStatuses.includes(listingStatus)) {
    throw new AppError("Invalid listing status", 400);
  }
};

const validateUpdatePropertyInput = (payload, options = {}) => {
  if (Object.keys(payload).length === 0 && !options.allowEmptyPayload) {
    throw new AppError("Provide at least one field to update", 400);
  }

  if (payload.propertyType && !allowedTypes.includes(payload.propertyType)) {
    throw new AppError("Invalid property type", 400);
  }
  if (payload.listingStatus && !allowedStatuses.includes(payload.listingStatus)) {
    throw new AppError("Invalid listing status", 400);
  }
  if (payload.price !== undefined && (!Number.isFinite(Number(payload.price)) || Number(payload.price) < 0)) {
    throw new AppError("Price must be a non-negative number", 400);
  }
  if (
    payload.bedrooms !== undefined &&
    (!Number.isFinite(Number(payload.bedrooms)) || Number(payload.bedrooms) < 0)
  ) {
    throw new AppError("Bedrooms cannot be negative", 400);
  }
  if (
    payload.bathrooms !== undefined &&
    (!Number.isFinite(Number(payload.bathrooms)) || Number(payload.bathrooms) < 0)
  ) {
    throw new AppError("Bathrooms cannot be negative", 400);
  }
  if (
    payload.areaSize !== undefined &&
    (!Number.isFinite(Number(payload.areaSize)) || Number(payload.areaSize) < 0)
  ) {
    throw new AppError("Area size cannot be negative", 400);
  }

  if (payload.replaceImages !== undefined && typeof payload.replaceImages !== "boolean") {
    throw new AppError("replaceImages must be a boolean", 400);
  }

  if (payload.removeImageUrls !== undefined) {
    if (!Array.isArray(payload.removeImageUrls)) {
      throw new AppError("removeImageUrls must be an array", 400);
    }
    const invalidItem = payload.removeImageUrls.find((item) => typeof item !== "string");
    if (invalidItem !== undefined) {
      throw new AppError("removeImageUrls entries must be strings", 400);
    }
  }
};

const validateListPropertiesQuery = (query, options = {}) => {
  const { allowDelistedStatusFilter = false } = options;
  const { q, propertyType, listingStatus, minPrice, maxPrice, page, limit, location } = query;

  if (q !== undefined) {
    if (typeof q !== "string") {
      throw new AppError("q must be a string", 400);
    }

    const normalizedQuery = q.trim();
    if (q.length > 0 && normalizedQuery.length === 0) {
      throw new AppError("q cannot be empty", 400);
    }

    if (normalizedQuery.length > 200) {
      throw new AppError("q must be 200 characters or less", 400);
    }
  }

  if (propertyType && !allowedTypes.includes(propertyType)) {
    throw new AppError("Invalid property type", 400);
  }

  if (listingStatus) {
    if (!allowedStatuses.includes(listingStatus)) {
      throw new AppError("Invalid listing status", 400);
    }
    if (!allowDelistedStatusFilter && listingStatus === "delisted") {
      throw new AppError("Delisted properties are only available in owner listings", 400);
    }
  }

  if (minPrice !== undefined) {
    ensureNonNegativeNumber(minPrice, "minPrice");
  }
  if (maxPrice !== undefined) {
    ensureNonNegativeNumber(maxPrice, "maxPrice");
  }
  if (minPrice !== undefined && maxPrice !== undefined && Number(minPrice) > Number(maxPrice)) {
    throw new AppError("minPrice cannot be greater than maxPrice", 400);
  }

  if (location !== undefined) {
    if (typeof location !== "string") {
      throw new AppError("location must be a string", 400);
    }

    if (location.trim().length > 200) {
      throw new AppError("location must be 200 characters or less", 400);
    }
  }

  if (page !== undefined) {
    ensurePositiveInteger(page, "page");
  }
  if (limit !== undefined) {
    ensurePositiveInteger(limit, "limit");
    if (Number(limit) > 100) {
      throw new AppError("limit cannot exceed 100", 400);
    }
  }
};

module.exports = {
  coerceStringList,
  coerceFeatureList,
  validatePropertyIdParam,
  validateCreatePropertyInput,
  validateUpdatePropertyInput,
  validateListPropertiesQuery
};
