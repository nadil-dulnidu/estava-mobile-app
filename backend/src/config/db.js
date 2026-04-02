// MongoDB connection bootstrap using external Atlas URI from environment variables.
const mongoose = require("mongoose");
const env = require("./env");

const connectDB = async () => {
  await mongoose.connect(env.mongoUri);
  // Keep logs simple and explicit for deployment diagnostics.
  // eslint-disable-next-line no-console
  console.log("MongoDB connected");
};

module.exports = connectDB;