// Route definitions for this module, wired with auth/role middleware as needed.
const express = require("express");
const {
  create,
  list,
  listMine,
  getById,
  update,
  remove
} = require("../controllers/propertyController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const { uploadPropertyImages } = require("../middlewares/uploadMiddleware");

const router = express.Router();

const optionalProtect = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return next();
  }

  return protect(req, res, next);
};

router.get("/", list);
router.get("/mine", protect, authorize("buyer", "seller", "admin"), listMine);
router.get("/:id", optionalProtect, getById);

router.post("/", protect, authorize("buyer", "seller", "admin"), uploadPropertyImages, create);
router.patch("/:id", protect, authorize("buyer", "seller", "admin"), uploadPropertyImages, update);
router.delete("/:id", protect, authorize("buyer", "seller", "admin"), remove);

module.exports = router;
