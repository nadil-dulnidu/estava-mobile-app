// Data model for a core assignment entity stored in MongoDB Atlas.
const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
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
    note: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    },
    priorityLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    }
  },
  {
    timestamps: true
  }
);

favoriteSchema.index({ userId: 1, propertyId: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);
