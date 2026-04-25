// Request payload validation for appointment/visit booking endpoints.
const mongoose = require("mongoose");
const AppError = require("../utils/AppError");

const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
const allowedUpdateFields = ["date", "time", "appointmentStatus", "status"];

const validateAppointmentIdParam = (id) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid appointment id", 400);
  }
};

const validateAllowedFields = (payload, allowedFields) => {
  const providedFields = Object.keys(payload);
  const unexpectedFields = providedFields.filter((field) => !allowedFields.includes(field));

  if (unexpectedFields.length > 0) {
    throw new AppError(`Unexpected field(s): ${unexpectedFields.join(", ")}`, 400);
  }
};

const validateCreateAppointmentInput = (payload) => {
  const { propertyId, date, time, visitPurpose } = payload;

  if (!propertyId || !mongoose.Types.ObjectId.isValid(propertyId)) {
    throw new AppError("Valid propertyId is required", 400);
  }

  if (!date || String(date).trim().length < 8) {
    throw new AppError("Valid date is required", 400);
  }

  if (!time || String(time).trim().length < 3) {
    throw new AppError("Valid time is required", 400);
  }

  if (visitPurpose !== undefined && String(visitPurpose).length > 300) {
    throw new AppError("visitPurpose must be 300 characters or less", 400);
  }
};

const validateUpdateAppointmentInput = (payload) => {
  if (Object.keys(payload).length === 0) {
    throw new AppError("Provide at least one field to update", 400);
  }

  validateAllowedFields(payload, allowedUpdateFields);

  if (
    payload.appointmentStatus !== undefined &&
    payload.status !== undefined &&
    payload.appointmentStatus !== payload.status
  ) {
    throw new AppError("status and appointmentStatus must match", 400);
  }

  const nextStatus = payload.appointmentStatus !== undefined ? payload.appointmentStatus : payload.status;

  if (payload.date !== undefined && String(payload.date).trim().length < 8) {
    throw new AppError("Valid date is required", 400);
  }

  if (payload.time !== undefined && String(payload.time).trim().length < 3) {
    throw new AppError("Valid time is required", 400);
  }

  if (nextStatus !== undefined && !validStatuses.includes(nextStatus)) {
    throw new AppError("Invalid appointmentStatus", 400);
  }
};

module.exports = {
  validateAppointmentIdParam,
  validateCreateAppointmentInput,
  validateUpdateAppointmentInput
};