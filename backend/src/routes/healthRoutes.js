// Route definitions for this module, wired with auth/role middleware as needed.
const express = require("express");

const router = express.Router();

router.get("/health", (_req, res) => {
  const dbConnected = Boolean(_req.app.locals.dbConnected);
  res.status(200).json({
    success: true,
    message: "API is healthy",
    dbConnected
  });
});

module.exports = router;