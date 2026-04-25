// Request payload validation for inquiry module endpoints.
const mongoose = require("mongoose");
const AppError = require("../utils/AppError");

const validStatuses = ["pending", "replied", "closed"];
const createFields = ["propertyId", "subject", "message", "contactNumber"];
const updateFields = [
  "subject",
  "message",
  "contactNumber",
  "inquiryStatus",
  "status",
  "responseMessage"
];

const ensureObjectPayload = (payload, message) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new AppError(message, 400);
  }
};

const ensureNoUnexpectedFields = (payload, allowedFields) => {
  const unexpected = Object.keys(payload).filter((key) => !allowedFields.includes(key));
  if (unexpected.length > 0) {
    throw new AppError(`Unexpected field(s): ${unexpected.join(", ")}`, 400);
  }
};

const validateInquiryIdParam = (id) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid inquiry id", 400);
  }
};

const validateCreateInquiryInput = (payload) => {
  ensureObjectPayload(payload, "Invalid inquiry payload");
  ensureNoUnexpectedFields(payload, createFields);

  const { propertyId, subject, message, contactNumber } = payload;

  if (!propertyId || !mongoose.Types.ObjectId.isValid(propertyId)) {
    throw new AppError("Valid propertyId is required", 400);
  }

  if (typeof subject !== "string") {
    throw new AppError("Subject must be a string", 400);
  }

  const trimmedSubject = subject.trim();
  if (trimmedSubject.length < 3 || trimmedSubject.length > 160) {
    throw new AppError("Subject must be between 3 and 160 characters", 400);
  }

  if (typeof message !== "string") {
    throw new AppError("Message must be a string", 400);
  }

  const trimmedMessage = message.trim();
  if (trimmedMessage.length < 10 || trimmedMessage.length > 3000) {
    throw new AppError("Message must be between 10 and 3000 characters", 400);
  }

  if (contactNumber !== undefined) {
    const normalizedContact = String(contactNumber).trim();
    if (normalizedContact.length > 40) {
      throw new AppError("contactNumber must be 40 characters or less", 400);
    }
  }
};

const validateUpdateInquiryInput = (payload) => {
  ensureObjectPayload(payload, "Invalid inquiry update payload");

  if (Object.keys(payload).length === 0) {
    throw new AppError("Provide at least one field to update", 400);
  }

  ensureNoUnexpectedFields(payload, updateFields);

  const nextStatus = payload.inquiryStatus !== undefined ? payload.inquiryStatus : payload.status;

  if (
    payload.inquiryStatus !== undefined &&
    payload.status !== undefined &&
    payload.inquiryStatus !== payload.status
  ) {
    throw new AppError("status and inquiryStatus cannot conflict", 400);
  }

  if (payload.subject !== undefined) {
    if (typeof payload.subject !== "string") {
      throw new AppError("Subject must be a string", 400);
    }

    const trimmedSubject = payload.subject.trim();
    if (trimmedSubject.length < 3 || trimmedSubject.length > 160) {
      throw new AppError("Subject must be between 3 and 160 characters", 400);
    }
  }

  if (payload.message !== undefined) {
    if (typeof payload.message !== "string") {
      throw new AppError("Message must be a string", 400);
    }

    const trimmedMessage = payload.message.trim();
    if (trimmedMessage.length < 10 || trimmedMessage.length > 3000) {
      throw new AppError("Message must be between 10 and 3000 characters", 400);
    }
  }

  if (payload.contactNumber !== undefined) {
    const normalizedContact = String(payload.contactNumber).trim();
    if (normalizedContact.length > 40) {
      throw new AppError("contactNumber must be 40 characters or less", 400);
    }
  }

  if (nextStatus !== undefined && !validStatuses.includes(nextStatus)) {
    throw new AppError("Invalid inquiryStatus", 400);
  }

  if (payload.responseMessage !== undefined) {
    if (typeof payload.responseMessage !== "string") {
      throw new AppError("responseMessage must be a string", 400);
    }

    const trimmedResponse = payload.responseMessage.trim();
    if (trimmedResponse.length < 3 || trimmedResponse.length > 3000) {
      throw new AppError("responseMessage must be between 3 and 3000 characters", 400);
    }
  }
};

const validateClearResponseInput = (payload = {}) => {
  ensureObjectPayload(payload, "Invalid clear response payload");

  if (Object.keys(payload).length > 0) {
    throw new AppError("This endpoint does not accept a request body", 400);
  }
};

module.exports = {
  validateCreateInquiryInput,
  validateUpdateInquiryInput,
  validateInquiryIdParam,
  validateClearResponseInput
};