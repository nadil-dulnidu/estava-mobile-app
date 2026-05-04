// Route definitions for notification module endpoints.
const express = require("express");
const { protect, authorize } = require("../middlewares/authMiddleware");
const controller = require("../controllers/notificationController");

const router = express.Router();

router.use(protect);

router.post("/", authorize("admin"), controller.create);
router.get("/me", controller.listMine);
router.patch("/read-all", controller.markAllRead);
router.patch("/:id/read", controller.markRead);
router.delete("/:id", controller.remove);

module.exports = router;
