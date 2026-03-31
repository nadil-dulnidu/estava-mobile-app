// Service layer for inquiry business rules and ownership checks.
const Inquiry = require("../models/Inquiry");
const Property = require("../models/Property");
const AppError = require("../utils/AppError");

const createInquiry = async (payload, userId) => {
  const property = await Property.findById(payload.propertyId).select("_id createdBy");
  if (!property) {
    throw new AppError("Property not found", 404);
  }

  if (property.createdBy.toString() === userId.toString()) {
    throw new AppError("You cannot inquire about your own property", 400);
  }

  return Inquiry.create({
    propertyId: payload.propertyId,
    senderUserId: userId,
    agentId: property.createdBy,
    subject: payload.subject,
    message: payload.message,
    contactNumber: payload.contactNumber || "",
    inquiryStatus: "pending"
  });
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

  if (payload.subject !== undefined) inquiry.subject = payload.subject;
  if (payload.message !== undefined) inquiry.message = payload.message;
  if (payload.contactNumber !== undefined) inquiry.contactNumber = payload.contactNumber;
  if (payload.inquiryStatus !== undefined) inquiry.inquiryStatus = payload.inquiryStatus;

  await inquiry.save();
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