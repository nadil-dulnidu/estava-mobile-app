// Route definitions for inquiry module endpoints.
const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const controller = require("../controllers/inquiryController");

const router = express.Router();

router.use(protect);

router.post("/", controller.create);
router.get("/me", controller.listMine);
router.patch("/:id", controller.update);
router.delete("/:id", controller.remove);

module.exports = router;