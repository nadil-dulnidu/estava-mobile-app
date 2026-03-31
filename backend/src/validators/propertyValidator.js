// Request payload validation for assignment-required data integrity on APIs.
const AppError = require("../utils/AppError");

const allowedTypes = ["house", "apartment", "land", "villa", "commercial"];
const allowedStatuses = ["available", "sold", "rented"];

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

const validateCreatePropertyInput = (payload) => {
  const { title, description, price, location, propertyType, listingStatus } = payload;

  if (!title || title.trim().length < 5) {
    throw new AppError("Title must be at least 5 characters", 400);
  }
  if (!description || description.trim().length < 20) {
    throw new AppError("Description must be at least 20 characters", 400);
  }
  if (price === undefined || Number(price) < 0) {
    throw new AppError("Price must be a non-negative number", 400);
  }
  if (!location || location.trim().length < 2) {
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
  if (payload.price !== undefined && Number(payload.price) < 0) {
    throw new AppError("Price must be a non-negative number", 400);
  }
  if (payload.bedrooms !== undefined && Number(payload.bedrooms) < 0) {
    throw new AppError("Bedrooms cannot be negative", 400);
  }
  if (payload.bathrooms !== undefined && Number(payload.bathrooms) < 0) {
    throw new AppError("Bathrooms cannot be negative", 400);
  }
  if (payload.areaSize !== undefined && Number(payload.areaSize) < 0) {
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

module.exports = {
  coerceStringList,
  coerceFeatureList,
  validateCreatePropertyInput,
  validateUpdatePropertyInput
};
