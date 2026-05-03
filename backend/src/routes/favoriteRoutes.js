// Route definitions for this module, wired with auth/role middleware as needed.
const express = require("express");
const { create, listMine, update, remove } = require("../controllers/favoriteController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/", create);
router.get("/me", listMine);
router.patch("/:id", update);
router.delete("/:id", remove);

module.exports = router;
