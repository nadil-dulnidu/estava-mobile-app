// Route definitions for this module, wired with auth/role middleware as needed.
const express = require("express");

const router = express.Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy"
  });
});

module.exports = router;