// Route definitions for review module endpoints.
const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const controller = require("../controllers/reviewController");

const router = express.Router();

router.get("/property/:propertyId", controller.listByProperty);

router.use(protect);
router.post("/", controller.create);
router.patch("/:id", controller.update);
router.delete("/:id", controller.remove);

module.exports = router;