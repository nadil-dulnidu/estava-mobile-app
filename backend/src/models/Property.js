// Data model for a core assignment entity stored in MongoDB Atlas.
const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 150
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: 4000
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be positive"]
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: 200,
      index: true
    },
    propertyType: {
      type: String,
      required: [true, "Property type is required"],
      enum: ["house", "apartment", "land", "villa", "commercial"]
    },
    bedrooms: {
      type: Number,
      min: [0, "Bedrooms cannot be negative"],
      default: 0
    },
    bathrooms: {
      type: Number,
      min: [0, "Bathrooms cannot be negative"],
      default: 0
    },
    areaSize: {
      type: Number,
      min: [0, "Area size cannot be negative"]
    },
    features: {
      type: [String],
      default: []
    },
    imageUrls: {
      type: [String],
      default: []
    },
    listingStatus: {
      type: String,
      enum: ["available", "sold", "rented"],
      default: "available"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

propertySchema.index({ title: "text", description: "text", location: "text" });

module.exports = mongoose.model("Property", propertySchema);
