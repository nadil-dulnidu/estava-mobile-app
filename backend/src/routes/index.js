// Route definitions for this module, wired with auth/role middleware as needed.
const express = require("express");
const authRoutes = require("./authRoutes");
const healthRoutes = require("./healthRoutes");
const propertyRoutes = require("./propertyRoutes");
const favoriteRoutes = require("./favoriteRoutes");
const inquiryRoutes = require("./inquiryRoutes");
const appointmentRoutes = require("./appointmentRoutes");
const reviewRoutes = require("./reviewRoutes");
const notificationRoutes = require("./notificationRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/properties", propertyRoutes);
router.use("/favorites", favoriteRoutes);
router.use("/inquiries", inquiryRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/reviews", reviewRoutes);
router.use("/notifications", notificationRoutes);
router.use("/", healthRoutes);

module.exports = router;