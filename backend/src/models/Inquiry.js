// Data model for inquiry/contact messages between buyers and sellers.
const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true
    },
    senderUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000
    },
    contactNumber: {
      type: String,
      trim: true,
      maxlength: 40
    },
    inquiryStatus: {
      type: String,
      enum: ["pending", "replied", "closed"],
      default: "pending",
      index: true
    },
    responseMessage: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: ""
    },
    respondedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Inquiry", inquirySchema);