// Controller layer: validates HTTP intent and delegates business logic to services.
const catchAsync = require("../utils/catchAsync");
const { successResponse } = require("../utils/apiResponse");
const {
  coerceStringList,
  coerceFeatureList,
  validatePropertyIdParam,
  validateCreatePropertyInput,
  validateUpdatePropertyInput,
  validateListPropertiesQuery
} = require("../validators/propertyValidator");
const {
  createProperty,
  listProperties,
  listMyProperties,
  getPropertyById,
  updateProperty,
  deleteProperty
} = require("../services/propertyService");

const buildImageUrls = (req) => {
  if (!req.files || req.files.length === 0) return [];
  return req.files.map((file) => `${req.protocol}://${req.get("host")}/uploads/properties/${file.filename}`);
};

const normalizePayload = (payload) => {
  const data = { ...payload };
  const features = coerceFeatureList(data.features);
  if (features !== undefined) {
    data.features = features;
  }

  const removeImageUrls = coerceStringList(data.removeImageUrls);
  if (removeImageUrls !== undefined) {
    data.removeImageUrls = removeImageUrls;
  }

  if (data.replaceImages !== undefined) {
    if (typeof data.replaceImages === "string") {
      data.replaceImages = data.replaceImages.toLowerCase() === "true";
    } else {
      data.replaceImages = Boolean(data.replaceImages);
    }
  }

  return data;
};

const create = catchAsync(async (req, res) => {
  const payload = normalizePayload(req.body);
  validateCreatePropertyInput(payload);

  const imageUrls = buildImageUrls(req);
  const property = await createProperty(payload, req.user._id, imageUrls);

  return successResponse(res, property, "Property created successfully", 201);
});

const list = catchAsync(async (req, res) => {
  validateListPropertiesQuery(req.query);
  const result = await listProperties(req.query);
  return successResponse(res, result, "Properties fetched successfully", 200);
});

const listMine = catchAsync(async (req, res) => {
  validateListPropertiesQuery(req.query, { allowDelistedStatusFilter: true });
  const result = await listMyProperties(req.query, req.user._id);
  return successResponse(res, result, "Your properties fetched successfully", 200);
});

const getById = catchAsync(async (req, res) => {
  validatePropertyIdParam(req.params.id);
  const property = await getPropertyById(req.params.id, req.user);
  return successResponse(res, property, "Property fetched successfully", 200);
});

const update = catchAsync(async (req, res) => {
  validatePropertyIdParam(req.params.id);
  const payload = normalizePayload(req.body);
  validateUpdatePropertyInput(payload, {
    allowEmptyPayload: !!(req.files && req.files.length > 0)
  });

  const imageUrls = buildImageUrls(req);
  const property = await updateProperty(req.params.id, payload, imageUrls, req.user);

  return successResponse(res, property, "Property updated successfully", 200);
});

const remove = catchAsync(async (req, res) => {
  validatePropertyIdParam(req.params.id);
  await deleteProperty(req.params.id, req.user);
  return successResponse(res, null, "Property deleted successfully", 200);
});

module.exports = {
  create,
  list,
  listMine,
  getById,
  update,
  remove
};
