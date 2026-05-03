// Route definitions for this module, wired with auth/role middleware as needed.
const express = require("express");
const {
  register,
  login,
  profile,
  updateProfile,
  changePassword,
  updateAvatar
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const { uploadAvatarImage } = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, profile);
router.patch("/profile", protect, updateProfile);
router.patch("/change-password", protect, changePassword);
router.patch("/profile/avatar", protect, uploadAvatarImage, updateAvatar);

module.exports = router;