// Service layer for inquiry business rules and ownership checks.
const Inquiry = require("../models/Inquiry");
const Property = require("../models/Property");
const Notification = require("../models/Notification");
const AppError = require("../utils/AppError");

const createInquiry = async (payload, userId) => {
  const property = await Property.findById(payload.propertyId).select("_id createdBy");
  if (!property) {
    throw new AppError("Property not found", 404);
  }

  if (property.createdBy.toString() === userId.toString()) {
    throw new AppError("You cannot inquire about your own property", 400);
  }

  const inquiry = await Inquiry.create({
    propertyId: payload.propertyId,
    senderUserId: userId,
    agentId: property.createdBy,
    subject: payload.subject,
    message: payload.message,
    contactNumber: payload.contactNumber || "",
    inquiryStatus: "pending"
  });

  // Notify listing owner that a new inquiry arrived.
  await Notification.create({
    userId: property.createdBy,
    title: "New inquiry received",
    message: "You received an inquiry for your listing.",
    type: "inquiry",
    status: "unread"
  });

  return inquiry;
};

const listInquiriesForUser = async (user) => {
  const query = {
    $or: [{ senderUserId: user._id }, { agentId: user._id }]
  };

  if (user.role === "admin") {
    return Inquiry.find({})
      .populate("propertyId", "title location")
      .populate("senderUserId", "fullName email")
      .populate("agentId", "fullName email")
      .sort({ createdAt: -1 });
  }

  return Inquiry.find(query)
    .populate("propertyId", "title location")
    .populate("senderUserId", "fullName email")
    .populate("agentId", "fullName email")
    .sort({ createdAt: -1 });
};

const updateInquiry = async (inquiryId, payload, user) => {
  const inquiry = await Inquiry.findById(inquiryId);
  if (!inquiry) {
    throw new AppError("Inquiry not found", 404);
  }

  const isOwner = inquiry.senderUserId.toString() === user._id.toString();
  const isAssignedAgent = inquiry.agentId.toString() === user._id.toString();
  const isAdmin = user.role === "admin";

  if (!isOwner && !isAssignedAgent && !isAdmin) {
    throw new AppError("You do not have permission to update this inquiry", 403);
  }

  const nextStatus = payload.inquiryStatus !== undefined ? payload.inquiryStatus : payload.status;

  if (isOwner && !isAssignedAgent && !isAdmin) {
    if (nextStatus !== undefined || payload.responseMessage !== undefined) {
      throw new AppError("Only property owner/manager can respond to inquiries", 403);
    }
    if (payload.subject !== undefined) inquiry.subject = payload.subject;
    if (payload.message !== undefined) inquiry.message = payload.message;
    if (payload.contactNumber !== undefined) inquiry.contactNumber = payload.contactNumber;
  }

  if (isAssignedAgent || isAdmin) {
    if (nextStatus !== undefined) inquiry.inquiryStatus = nextStatus;
    if (payload.responseMessage !== undefined) {
      inquiry.responseMessage = payload.responseMessage;
      inquiry.respondedAt = new Date();
    }

    if (payload.subject !== undefined) inquiry.subject = payload.subject;
    if (payload.message !== undefined) inquiry.message = payload.message;
    if (payload.contactNumber !== undefined) inquiry.contactNumber = payload.contactNumber;
  }

  await inquiry.save();

  if ((isAssignedAgent || isAdmin) && payload.responseMessage !== undefined) {
    await Notification.create({
      userId: inquiry.senderUserId,
      title: "Inquiry response",
      message: "Your inquiry has received a response from the property owner.",
      type: "inquiry",
      status: "unread"
    });
  }

  return inquiry;
};

const deleteInquiry = async (inquiryId, user) => {
  const inquiry = await Inquiry.findById(inquiryId);
  if (!inquiry) {
    throw new AppError("Inquiry not found", 404);
  }

  const isOwner = inquiry.senderUserId.toString() === user._id.toString();
  const isAdmin = user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new AppError("You can only delete your own inquiry", 403);
  }

  await Inquiry.findByIdAndDelete(inquiryId);
};

module.exports = {
  createInquiry,
  listInquiriesForUser,
  updateInquiry,
  deleteInquiry
};