// Service layer: encapsulates business rules and database operations.
const Property = require("../models/Property");
const AppError = require("../utils/AppError");
const { deleteManyLocalFilesByUrls } = require("../utils/fileStorage");

const CREATE_ALLOWED_FIELDS = [
  "title",
  "description",
  "price",
  "location",
  "propertyType",
  "bedrooms",
  "bathrooms",
  "areaSize",
  "features",
  "listingStatus"
];

const UPDATE_ALLOWED_FIELDS = [
  "title",
  "description",
  "price",
  "location",
  "propertyType",
  "bedrooms",
  "bathrooms",
  "areaSize",
  "features",
  "listingStatus"
];

const PUBLIC_OWNER_FIELDS = "fullName";
const PRIVATE_OWNER_FIELDS = "fullName email role";

const mapNumericFields = (payload) => {
  const data = { ...payload };
  ["price", "bedrooms", "bathrooms", "areaSize"].forEach((field) => {
    if (data[field] !== undefined) {
      data[field] = Number(data[field]);
    }
  });
  return data;
};

const escapeRegexLiteral = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const buildCreatePayload = (payload, createdBy, imageUrls) => {
  const whitelistedPayload = {};

  CREATE_ALLOWED_FIELDS.forEach((field) => {
    if (payload[field] !== undefined) {
      whitelistedPayload[field] = payload[field];
    }
  });

  const data = mapNumericFields(whitelistedPayload);
  data.createdBy = createdBy;
  data.imageUrls = Array.isArray(imageUrls) ? imageUrls : [];

  return data;
};

const createProperty = async (payload, createdBy, imageUrls) => {
  const data = buildCreatePayload(payload, createdBy, imageUrls);
  return Property.create(data);
};

const listProperties = async (query, options = {}) => {
  const { ownerId, includeDelisted = false, includeOwnerPrivateData = false } = options;
  const {
    q,
    propertyType,
    listingStatus,
    minPrice,
    maxPrice,
    location,
    page = 1,
    limit = 20
  } = query;

  const filter = {};

  if (ownerId) filter.createdBy = ownerId;
  if (propertyType) filter.propertyType = propertyType;
  if (listingStatus) {
    filter.listingStatus = listingStatus;
  } else if (!includeDelisted) {
    filter.listingStatus = { $ne: "delisted" };
  }

  if (typeof location === "string" && location.trim().length > 0) {
    filter.location = { $regex: escapeRegexLiteral(location.trim()), $options: "i" };
  }

  if (q) filter.$text = { $search: q };

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
  }

  const pageNumber = Math.max(Number(page), 1);
  const pageSize = Math.min(Math.max(Number(limit), 1), 100);

  const [items, total] = await Promise.all([
    Property.find(filter)
      .populate("createdBy", includeOwnerPrivateData ? PRIVATE_OWNER_FIELDS : PUBLIC_OWNER_FIELDS)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize),
    Property.countDocuments(filter)
  ]);

  return {
    items,
    pagination: {
      total,
      page: pageNumber,
      limit: pageSize,
      pages: Math.ceil(total / pageSize)
    }
  };
};

const listMyProperties = async (query, currentUserId) => {
  return listProperties(query, {
    ownerId: currentUserId,
    includeDelisted: true,
    includeOwnerPrivateData: true
  });
};

const canViewDelistedProperty = (property, currentUser) => {
  if (!currentUser) return false;
  if (currentUser.role === "admin") return true;

  return property.createdBy.toString() === currentUser._id.toString();
};

const getPropertyById = async (id, currentUser) => {
  const property = await Property.findById(id);
  if (!property) {
    throw new AppError("Property not found", 404);
  }

  if (property.listingStatus === "delisted" && !canViewDelistedProperty(property, currentUser)) {
    throw new AppError("Property not found", 404);
  }

  const ownerFields = canViewDelistedProperty(property, currentUser)
    ? PRIVATE_OWNER_FIELDS
    : PUBLIC_OWNER_FIELDS;

  await property.populate("createdBy", ownerFields);

  return property;
};

const updateProperty = async (id, payload, imageUrls, currentUser) => {
  const property = await Property.findById(id);
  if (!property) {
    throw new AppError("Property not found", 404);
  }

  const ownerId = property.createdBy.toString();
  const currentUserId = currentUser._id.toString();
  const canModify = currentUser.role === "admin" || ownerId === currentUserId;
  if (!canModify) {
    throw new AppError("You can only update your own properties", 403);
  }

  const data = mapNumericFields(payload);

  const removeImageUrls = Array.isArray(data.removeImageUrls) ? data.removeImageUrls : [];
  const replaceImages = data.replaceImages === true;

  delete data.removeImageUrls;
  delete data.replaceImages;

  UPDATE_ALLOWED_FIELDS.forEach((field) => {
    if (data[field] !== undefined) {
      property[field] = data[field];
    }
  });

  if (removeImageUrls.length > 0) {
    const removableSet = new Set(removeImageUrls);
    const existingRemovals = property.imageUrls.filter((url) => removableSet.has(url));
    await deleteManyLocalFilesByUrls(existingRemovals);
    property.imageUrls = property.imageUrls.filter((url) => !removableSet.has(url));
  }

  if (imageUrls && imageUrls.length > 0) {
    if (replaceImages) {
      await deleteManyLocalFilesByUrls(property.imageUrls);
      property.imageUrls = [...imageUrls];
    } else {
      property.imageUrls = [...property.imageUrls, ...imageUrls];
    }
  }

  await property.save();
  return property;
};

const deleteProperty = async (id, currentUser) => {
  const property = await Property.findById(id);
  if (!property) {
    throw new AppError("Property not found", 404);
  }

  const ownerId = property.createdBy.toString();
  const currentUserId = currentUser._id.toString();
  const canModify = currentUser.role === "admin" || ownerId === currentUserId;
  if (!canModify) {
    throw new AppError("You can only delete your own properties", 403);
  }

  await deleteManyLocalFilesByUrls(property.imageUrls);
  await Property.findByIdAndDelete(id);
};

module.exports = {
  createProperty,
  listProperties,
  listMyProperties,
  getPropertyById,
  updateProperty,
  deleteProperty
};
