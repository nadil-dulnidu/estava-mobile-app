const express = require("express");
const authRoutes = require("./authRoutes");
const healthRoutes = require("./healthRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/", healthRoutes);

module.exports = router;