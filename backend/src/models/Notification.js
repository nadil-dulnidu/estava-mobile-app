// Data model for in-app notifications shown to users.
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1500
    },
    type: {
      type: String,
      enum: ["system", "inquiry", "appointment", "review", "listing"],
      default: "system"
    },
    status: {
      type: String,
      enum: ["unread", "read"],
      default: "unread",
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Notification", notificationSchema);