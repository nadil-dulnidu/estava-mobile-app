// MongoDB connection bootstrap using external Atlas URI from environment variables.
const mongoose = require("mongoose");
const env = require("./env");

const connectDB = async () => {
  if (!env.mongoUri) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000
  });
  // Keep logs simple and explicit for deployment diagnostics.
  // eslint-disable-next-line no-console
  console.log("MongoDB connected");

  return mongoose.connection;
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
};

module.exports = {
  connectDB,
  disconnectDB
};
