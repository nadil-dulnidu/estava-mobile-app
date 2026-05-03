// Service layer for booking visits and appointment status transitions.
const Appointment = require("../models/Appointment");
const Property = require("../models/Property");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { createAndDispatchNotification } = require("./notificationService");

const SELLER_ALLOWED_STATUS_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: []
};

const DELETABLE_APPOINTMENT_STATUSES = ["cancelled", "completed"];
const TERMINAL_APPOINTMENT_STATUSES = ["completed", "cancelled"];

const normalizeAppointmentStatus = (statusValue) =>
  typeof statusValue === "string" ? statusValue.trim().toLowerCase() : "";

const resolveAppointmentStatus = (appointment) =>
  normalizeAppointmentStatus(
    appointment.appointmentStatus ??
      (typeof appointment.get === "function" ? appointment.get("status") : appointment.status)
  );

const isBuyerForAppointment = (appointment, userId) =>
  appointment.userId.toString() === userId.toString();

const isSellerForAppointment = (appointment, userId) =>
  appointment.agentId.toString() === userId.toString();

const ACTIVE_APPOINTMENT_STATUSES = ["pending", "confirmed"];

const ensureAppointmentSlotAvailable = async ({ propertyId, date, time, excludeAppointmentId }) => {
  if (!propertyId || !date || !time) {
    return;
  }

  const filter = {
    propertyId,
    date,
    time,
    appointmentStatus: { $in: ACTIVE_APPOINTMENT_STATUSES }
  };

  if (excludeAppointmentId) {
    filter._id = { $ne: excludeAppointmentId };
  }

  const conflictingAppointment = await Appointment.findOne(filter).select("_id");
  if (conflictingAppointment) {
    throw new AppError("Another active appointment already exists for this property at that date and time", 409);
  }
};

const createAppointment = async (payload, userId) => {
  const property = await Property.findById(payload.propertyId).select("_id title createdBy listingStatus");
  if (!property) {
    throw new AppError("Property not found", 404);
  }

  if (property.listingStatus !== "available") {
    throw new AppError("Appointments are only allowed for available properties", 400);
  }

  if (property.createdBy.toString() === userId.toString()) {
    throw new AppError("You cannot book a visit for your own property", 400);
  }

  await ensureAppointmentSlotAvailable({
    propertyId: payload.propertyId,
    date: payload.date,
    time: payload.time
  });

  const appointment = await Appointment.create({
    propertyId: payload.propertyId,
    userId,
    agentId: property.createdBy,
    date: payload.date,
    time: payload.time,
    visitPurpose: payload.visitPurpose || "Property visit",
    appointmentStatus: "pending"
  });

  const buyer = await User.findById(userId).select("fullName email");
  const buyerName = buyer?.fullName || buyer?.email || "A buyer";
  const propertyTitle = property?.title || "your listing";

  await createAndDispatchNotification({
    userId: property.createdBy,
    title: `Visit request from ${buyerName}`,
    message: `${buyerName} requested a visit for "${propertyTitle}" on ${payload.date} at ${payload.time}.`,
    type: "appointment"
  });

  return appointment;
};

const listAppointmentsForUser = async (user) => {
  if (user.role === "admin") {
    return Appointment.find({})
      .populate("propertyId", "title location")
      .populate("userId", "fullName email")
      .populate("agentId", "fullName email")
      .sort({ createdAt: -1 });
  }

  return Appointment.find({
    $or: [
      {
        userId: user._id,
        isDeletedByBuyer: false
      },
      {
        agentId: user._id,
        isDeletedBySeller: false
      }
    ]
  })
    .populate("propertyId", "title location")
    .populate("userId", "fullName email")
    .populate("agentId", "fullName email")
    .sort({ createdAt: -1 });
};

const updateAppointment = async (appointmentId, payload, user) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  const isBuyer = isBuyerForAppointment(appointment, user._id);
  const isSeller = isSellerForAppointment(appointment, user._id);
  const isAdmin = user.role === "admin";

  if (!isBuyer && !isSeller && !isAdmin) {
    throw new AppError("You do not have permission to update this appointment", 403);
  }

  if (!isAdmin && isBuyer && appointment.isDeletedByBuyer) {
    throw new AppError("Appointment is hidden for buyer and cannot be updated", 400);
  }

  if (!isAdmin && isSeller && appointment.isDeletedBySeller) {
    throw new AppError("Appointment is hidden for seller and cannot be updated", 400);
  }

  const rawNextStatus =
    payload.appointmentStatus !== undefined ? payload.appointmentStatus : payload.status;
  const nextStatus =
    rawNextStatus !== undefined ? normalizeAppointmentStatus(rawNextStatus) : undefined;
  const currentStatus = resolveAppointmentStatus(appointment);
  const hasDateOrTimeUpdate = payload.date !== undefined || payload.time !== undefined;
  const resultingStatus = nextStatus !== undefined ? nextStatus : currentStatus;

  if (
    !isAdmin &&
    hasDateOrTimeUpdate &&
    TERMINAL_APPOINTMENT_STATUSES.includes(resultingStatus)
  ) {
    throw new AppError("Date or time cannot be updated for completed or cancelled appointments", 400);
  }

  if (nextStatus !== undefined && nextStatus !== currentStatus) {
    if (isAdmin) {
      // Admin may force transitions for support/operations use-cases.
    } else if (isBuyer) {
      if (nextStatus !== "cancelled") {
        throw new AppError("Buyer can only update status to cancelled", 403);
      }

      if (!["pending", "confirmed"].includes(currentStatus)) {
        throw new AppError("Only pending or confirmed appointments can be cancelled by buyer", 400);
      }
    } else if (isSeller) {
      const allowedTransitions = SELLER_ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
      if (!allowedTransitions.includes(nextStatus)) {
        throw new AppError(`Invalid status transition from ${currentStatus} to ${nextStatus}`, 400);
      }
    }
  }

  if (payload.date !== undefined) appointment.date = payload.date;
  if (payload.time !== undefined) appointment.time = payload.time;
  if (nextStatus !== undefined) appointment.appointmentStatus = nextStatus;

  await ensureAppointmentSlotAvailable({
    propertyId: appointment.propertyId,
    date: appointment.date,
    time: appointment.time,
    excludeAppointmentId: appointment._id
  });

  await appointment.save();

  if (isSeller || isAdmin) {
    const [property, updater] = await Promise.all([
      Property.findById(appointment.propertyId).select("title"),
      User.findById(user._id).select("fullName email")
    ]);
    const updaterName = updater?.fullName || updater?.email || "The property owner";
    const propertyTitle = property?.title || "your appointment";

    await createAndDispatchNotification({
      userId: appointment.userId,
      title: "Appointment updated",
      message: `${updaterName} updated "${propertyTitle}" to ${appointment.appointmentStatus}. Open Appointments for details.`,
      type: "appointment"
    });
  }

  return appointment;
};

const deleteAppointment = async (appointmentId, user) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  const isBuyer = isBuyerForAppointment(appointment, user._id);
  const isSeller = isSellerForAppointment(appointment, user._id);
  const isAdmin = user.role === "admin";

  if (!isBuyer && !isSeller && !isAdmin) {
    throw new AppError("You can only delete appointments you are part of", 403);
  }

  const deletionStatus = resolveAppointmentStatus(appointment);

  if (!DELETABLE_APPOINTMENT_STATUSES.includes(deletionStatus)) {
    throw new AppError("Only cancelled or completed appointments can be deleted", 400);
  }

  if (!isAdmin && isBuyer && appointment.isDeletedByBuyer) {
    throw new AppError("Appointment is already hidden for buyer", 400);
  }

  if (!isAdmin && isSeller && appointment.isDeletedBySeller) {
    throw new AppError("Appointment is already hidden for seller", 400);
  }

  if (isAdmin) {
    appointment.isDeletedByBuyer = true;
    appointment.isDeletedBySeller = true;
  } else if (isBuyer) {
    appointment.isDeletedByBuyer = true;
  } else if (isSeller) {
    appointment.isDeletedBySeller = true;
  }

  if (appointment.isDeletedByBuyer && appointment.isDeletedBySeller) {
    await Appointment.findByIdAndDelete(appointmentId);
    return { hardDeleted: true };
  }

  await appointment.save();
  return { hardDeleted: false };
};

module.exports = {
  createAppointment,
  listAppointmentsForUser,
  updateAppointment,
  deleteAppointment
};
