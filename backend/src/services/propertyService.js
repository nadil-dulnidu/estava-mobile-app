const Property = require("../models/Property");
const AppError = require("../utils/AppError");

const mapNumericFields = (payload) => {
  const data = { ...payload };
  ["price", "bedrooms", "bathrooms", "areaSize"].forEach((field) => {
    if (data[field] !== undefined) {
      data[field] = Number(data[field]);
    }
  });
  return data;
};

const createProperty = async (payload, createdBy, imageUrls) => {
  const data = mapNumericFields(payload);
  data.createdBy = createdBy;
  data.imageUrls = imageUrls || [];

  return Property.create(data);
};

const listProperties = async (query) => {
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

  if (propertyType) filter.propertyType = propertyType;
  if (listingStatus) filter.listingStatus = listingStatus;
  if (location) filter.location = { $regex: location, $options: "i" };
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
      .populate("createdBy", "fullName email role")
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

const getPropertyById = async (id) => {
  const property = await Property.findById(id).populate("createdBy", "fullName email role");
  if (!property) {
    throw new AppError("Property not found", 404);
  }
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
  Object.assign(property, data);

  if (imageUrls && imageUrls.length > 0) {
    property.imageUrls = [...property.imageUrls, ...imageUrls];
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

  await Property.findByIdAndDelete(id);
};

module.exports = {
  createProperty,
  listProperties,
  getPropertyById,
  updateProperty,
  deleteProperty
};
