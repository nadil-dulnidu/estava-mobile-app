// Data model for user ratings and comments on properties.
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1200,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

reviewSchema.index({ userId: 1, propertyId: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);