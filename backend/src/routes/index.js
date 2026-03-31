// Route definitions for this module, wired with auth/role middleware as needed.
const express = require("express");
const authRoutes = require("./authRoutes");
const healthRoutes = require("./healthRoutes");
const propertyRoutes = require("./propertyRoutes");
const favoriteRoutes = require("./favoriteRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/properties", propertyRoutes);
router.use("/favorites", favoriteRoutes);
router.use("/", healthRoutes);

module.exports = router;