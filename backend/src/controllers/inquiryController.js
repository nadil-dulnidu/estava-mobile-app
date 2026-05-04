// Controller layer for inquiry endpoints.
const catchAsync = require("../utils/catchAsync");
const { successResponse } = require("../utils/apiResponse");
const {
  validateCreateInquiryInput,
  validateUpdateInquiryInput,
  validateInquiryIdParam,
  validateClearResponseInput
} = require("../validators/inquiryValidator");
const {
  createInquiry,
  listInquiriesForUser,
  updateInquiry,
  deleteInquiry,
  clearInquiryResponse
} = require("../services/inquiryService");

const create = catchAsync(async (req, res) => {
  validateCreateInquiryInput(req.body);
  const inquiry = await createInquiry(req.body, req.user._id);
  return successResponse(res, inquiry, "Inquiry created successfully", 201);
});

const listMine = catchAsync(async (req, res) => {
  const inquiries = await listInquiriesForUser(req.user);
  return successResponse(res, inquiries, "Inquiries fetched successfully", 200);
});

const update = catchAsync(async (req, res) => {
  validateInquiryIdParam(req.params.id);
  validateUpdateInquiryInput(req.body);
  const inquiry = await updateInquiry(req.params.id, req.body, req.user);
  return successResponse(res, inquiry, "Inquiry updated successfully", 200);
});

const remove = catchAsync(async (req, res) => {
  validateInquiryIdParam(req.params.id);
  const result = await deleteInquiry(req.params.id, req.user);

  const message = result?.deletedPermanently
    ? "Inquiry removed permanently"
    : "Inquiry removed from your view";

  return successResponse(res, null, message, 200);
});

const clearResponse = catchAsync(async (req, res) => {
  validateInquiryIdParam(req.params.id);
  validateClearResponseInput(req.body || {});

  const inquiry = await clearInquiryResponse(req.params.id, req.user);
  return successResponse(res, inquiry, "Inquiry response cleared successfully", 200);
});

module.exports = {
  create,
  listMine,
  update,
  remove,
  clearResponse
};