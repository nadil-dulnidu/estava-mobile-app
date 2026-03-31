// Request payload validation for inquiry module endpoints.
const mongoose = require("mongoose");
const AppError = require("../utils/AppError");

const validStatuses = ["pending", "replied", "closed"];

const validateCreateInquiryInput = (payload) => {
  const { propertyId, subject, message, contactNumber } = payload;

  if (!propertyId || !mongoose.Types.ObjectId.isValid(propertyId)) {
    throw new AppError("Valid propertyId is required", 400);
  }

  if (!subject || String(subject).trim().length < 3) {
    throw new AppError("Subject must be at least 3 characters", 400);
  }

  if (!message || String(message).trim().length < 10) {
    throw new AppError("Message must be at least 10 characters", 400);
  }

  if (contactNumber !== undefined && String(contactNumber).trim().length > 40) {
    throw new AppError("contactNumber must be 40 characters or less", 400);
  }
};

const validateUpdateInquiryInput = (payload) => {
  if (Object.keys(payload).length === 0) {
    throw new AppError("Provide at least one field to update", 400);
  }

  if (payload.subject !== undefined && String(payload.subject).trim().length < 3) {
    throw new AppError("Subject must be at least 3 characters", 400);
  }

  if (payload.message !== undefined && String(payload.message).trim().length < 10) {
    throw new AppError("Message must be at least 10 characters", 400);
  }

  if (payload.contactNumber !== undefined && String(payload.contactNumber).trim().length > 40) {
    throw new AppError("contactNumber must be 40 characters or less", 400);
  }

  if (payload.inquiryStatus !== undefined && !validStatuses.includes(payload.inquiryStatus)) {
    throw new AppError("Invalid inquiryStatus", 400);
  }
};

module.exports = {
  validateCreateInquiryInput,
  validateUpdateInquiryInput
};