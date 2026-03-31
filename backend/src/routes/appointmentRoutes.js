// Route definitions for appointment module endpoints.
const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const controller = require("../controllers/appointmentController");

const router = express.Router();

router.use(protect);

router.post("/", controller.create);
router.get("/me", controller.listMine);
router.patch("/:id", controller.update);
router.delete("/:id", controller.remove);

module.exports = router;