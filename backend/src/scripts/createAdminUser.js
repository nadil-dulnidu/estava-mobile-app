// One-time admin bootstrap script for the Estava backend.
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");

const ADMIN_NAME = "admin";
const ADMIN_EMAIL = "admin@estava.local";
const ADMIN_PASSWORD = "Test1234";

const run = async () => {
  await connectDB();

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const existing = await User.findOne({
    $or: [
      { email: ADMIN_EMAIL.toLowerCase() },
      { fullName: ADMIN_NAME }
    ]
  });

  if (existing) {
    existing.fullName = ADMIN_NAME;
    existing.email = ADMIN_EMAIL.toLowerCase();
    existing.role = "admin";
    existing.password = hashedPassword;
    await existing.save();

    // eslint-disable-next-line no-console
    console.log("Admin user updated:", ADMIN_EMAIL);
  } else {
    await User.create({
      fullName: ADMIN_NAME,
      email: ADMIN_EMAIL.toLowerCase(),
      password: hashedPassword,
      role: "admin"
    });

    // eslint-disable-next-line no-console
    console.log("Admin user created:", ADMIN_EMAIL);
  }

  process.exit(0);
};

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to create admin user:", error);
  process.exit(1);
});