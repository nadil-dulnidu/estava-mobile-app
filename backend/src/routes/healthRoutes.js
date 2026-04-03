// Route definitions for this module, wired with auth/role middleware as needed.
const express = require("express");

const router = express.Router();

router.get("/health", (_req, res) => {
  const dbConnected = Boolean(_req.app.locals.dbConnected);
  const jwtConfigured = process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 16;
  res.status(200).json({
    success: true,
    message: "API is healthy",
    dbConnected,
    jwtConfigured
  });
});

module.exports = router;