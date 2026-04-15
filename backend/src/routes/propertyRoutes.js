// Route definitions for this module, wired with auth/role middleware as needed.
const express = require("express");
const {
  create,
  list,
  getById,
  update,
  remove
} = require("../controllers/propertyController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const { uploadPropertyImages } = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.get("/", list);
router.get("/:id", getById);

router.post("/", protect, authorize("buyer", "seller", "admin"), uploadPropertyImages, create);
router.patch("/:id", protect, authorize("seller", "admin"), uploadPropertyImages, update);
router.delete("/:id", protect, authorize("seller", "admin"), remove);

module.exports = router;
