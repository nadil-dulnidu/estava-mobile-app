// Service layer for inquiry business rules and ownership checks.
const Inquiry = require("../models/Inquiry");
const Property = require("../models/Property");
const Notification = require("../models/Notification");
const AppError = require("../utils/AppError");

const getNextStatusFromPayload = (payload) => {
  return payload.inquiryStatus !== undefined ? payload.inquiryStatus : payload.status;
};

const normalizeTrimmedResponseMessage = (value) => {
  if (typeof value !== "string") {
    throw new AppError("responseMessage must be a string", 400);
  }

  return value.trim();
};

const inquiryHasResponse = (inquiry) => {
  if (typeof inquiry.hasResponse === "function") {
    return inquiry.hasResponse();
  }

  const responseMessage = typeof inquiry.responseMessage === "string" ? inquiry.responseMessage.trim() : "";
  return responseMessage.length > 0;
};

const clearInquiryResponseFields = (inquiry) => {
  if (typeof inquiry.clearResponse === "function") {
    inquiry.clearResponse();
    return;
  }

  inquiry.responseMessage = "";
  inquiry.respondedAt = null;

  if (inquiry.inquiryStatus === "replied") {
    inquiry.inquiryStatus = "pending";
  }
};

const createInquiry = async (payload, userId) => {
  const property = await Property.findById(payload.propertyId).select("_id createdBy listingStatus");
  if (!property) {
    throw new AppError("Property not found", 404);
  }

  if (property.listingStatus !== "available") {
    throw new AppError("Inquiries are only allowed for available properties", 400);
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
    $or: [
      {
        senderUserId: user._id,
        senderSoftDeleted: { $ne: true }
      },
      {
        agentId: user._id,
        agentSoftDeleted: { $ne: true }
      }
    ]
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

  const nextStatus = getNextStatusFromPayload(payload);
  const wantsContentUpdate =
    payload.subject !== undefined || payload.message !== undefined || payload.contactNumber !== undefined;
  const wantsResponseUpdate = payload.responseMessage !== undefined;
  const wantsStatusUpdate = nextStatus !== undefined;

  if (!isAdmin && isOwner && (wantsResponseUpdate || wantsStatusUpdate)) {
    throw new AppError("Only property owner/manager can respond to inquiries", 403);
  }

  if (!isAdmin && isAssignedAgent && wantsContentUpdate) {
    throw new AppError("Only the sender can edit inquiry content", 403);
  }

  if (wantsContentUpdate) {
    if (!isOwner && !isAdmin) {
      throw new AppError("Only the sender can edit inquiry content", 403);
    }

    if (payload.subject !== undefined) inquiry.subject = payload.subject;
    if (payload.message !== undefined) inquiry.message = payload.message;
    if (payload.contactNumber !== undefined) inquiry.contactNumber = payload.contactNumber;
  }

  const previousResponseMessage =
    typeof inquiry.responseMessage === "string" ? inquiry.responseMessage.trim() : "";
  const nextResponseMessage = wantsResponseUpdate
    ? normalizeTrimmedResponseMessage(payload.responseMessage)
    : undefined;

  if (wantsResponseUpdate) {
    if (!isAssignedAgent && !isAdmin) {
      throw new AppError("Only property owner/manager can respond to inquiries", 403);
    }

    inquiry.responseMessage = nextResponseMessage;
    inquiry.respondedAt = nextResponseMessage.length > 0 ? new Date() : null;

    if (!wantsStatusUpdate && inquiry.inquiryStatus === "pending" && nextResponseMessage.length > 0) {
      inquiry.inquiryStatus = "replied";
    }
  }

  if (wantsStatusUpdate) {
    if (!isAssignedAgent && !isAdmin) {
      throw new AppError("Only property owner/manager can update inquiry status", 403);
    }

    const willHaveResponse = wantsResponseUpdate ? nextResponseMessage.length > 0 : inquiryHasResponse(inquiry);

    if (nextStatus === "replied" && !willHaveResponse) {
      throw new AppError("A response message is required before marking as replied", 400);
    }

    inquiry.inquiryStatus = nextStatus;
  }

  await inquiry.save();

  if (
    (isAssignedAgent || isAdmin) &&
    wantsResponseUpdate &&
    nextResponseMessage !== previousResponseMessage
  ) {
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
  const isAssignedAgent = inquiry.agentId.toString() === user._id.toString();
  const isAdmin = user.role === "admin";

  if (!isOwner && !isAssignedAgent && !isAdmin) {
    throw new AppError("You do not have permission to remove this inquiry", 403);
  }

  if (isAdmin) {
    await Inquiry.findByIdAndDelete(inquiryId);
    return { deletedPermanently: true };
  }

  if (isOwner) {
    inquiry.senderSoftDeleted = true;
  }

  if (isAssignedAgent) {
    inquiry.agentSoftDeleted = true;
  }

  if (inquiry.senderSoftDeleted && inquiry.agentSoftDeleted) {
    await Inquiry.findByIdAndDelete(inquiryId);
    return { deletedPermanently: true };
  }

  await inquiry.save();
  return { deletedPermanently: false };
};

const clearInquiryResponse = async (inquiryId, user) => {
  const inquiry = await Inquiry.findById(inquiryId);
  if (!inquiry) {
    throw new AppError("Inquiry not found", 404);
  }

  const isAssignedAgent = inquiry.agentId.toString() === user._id.toString();
  const isAdmin = user.role === "admin";

  if (!isAssignedAgent && !isAdmin) {
    throw new AppError("Only property owner/manager can clear inquiry responses", 403);
  }

  if (!inquiryHasResponse(inquiry)) {
    throw new AppError("Inquiry response is already empty", 400);
  }

  clearInquiryResponseFields(inquiry);
  await inquiry.save();

  return inquiry;
};

module.exports = {
  createInquiry,
  listInquiriesForUser,
  updateInquiry,
  deleteInquiry,
  clearInquiryResponse
};