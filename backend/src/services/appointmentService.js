// Service layer for booking visits and appointment status transitions.
const Appointment = require("../models/Appointment");
const Property = require("../models/Property");
const Notification = require("../models/Notification");
const AppError = require("../utils/AppError");

const createAppointment = async (payload, userId) => {
  const property = await Property.findById(payload.propertyId).select("_id createdBy");
  if (!property) {
    throw new AppError("Property not found", 404);
  }

  if (property.createdBy.toString() === userId.toString()) {
    throw new AppError("You cannot book a visit for your own property", 400);
  }

  const appointment = await Appointment.create({
    propertyId: payload.propertyId,
    userId,
    agentId: property.createdBy,
    date: payload.date,
    time: payload.time,
    visitPurpose: payload.visitPurpose || "Property visit",
    appointmentStatus: "pending"
  });

  await Notification.create({
    userId: property.createdBy,
    title: "New appointment request",
    message: "A buyer requested a new property visit appointment.",
    type: "appointment",
    status: "unread"
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
    $or: [{ userId: user._id }, { agentId: user._id }]
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

  const isBuyer = appointment.userId.toString() === user._id.toString();
  const isAgent = appointment.agentId.toString() === user._id.toString();
  const isAdmin = user.role === "admin";

  if (!isBuyer && !isAgent && !isAdmin) {
    throw new AppError("You do not have permission to update this appointment", 403);
  }

  const nextStatus = payload.appointmentStatus !== undefined ? payload.appointmentStatus : payload.status;

  if (payload.date !== undefined) appointment.date = payload.date;
  if (payload.time !== undefined) appointment.time = payload.time;
  if (payload.visitPurpose !== undefined) appointment.visitPurpose = payload.visitPurpose;
  if (nextStatus !== undefined) appointment.appointmentStatus = nextStatus;

  await appointment.save();

  if (isAgent || isAdmin) {
    await Notification.create({
      userId: appointment.userId,
      title: "Appointment updated",
      message: `Your appointment status is now ${appointment.appointmentStatus}.`,
      type: "appointment",
      status: "unread"
    });
  }

  return appointment;
};

const deleteAppointment = async (appointmentId, user) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  const isBuyer = appointment.userId.toString() === user._id.toString();
  const isAdmin = user.role === "admin";

  if (!isBuyer && !isAdmin) {
    throw new AppError("You can only cancel your own appointment", 403);
  }

  await Appointment.findByIdAndDelete(appointmentId);
};

module.exports = {
  createAppointment,
  listAppointmentsForUser,
  updateAppointment,
  deleteAppointment
};