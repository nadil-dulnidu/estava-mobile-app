// Multer configuration for validated image uploads required by property management.
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const AppError = require("../utils/AppError");

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const propertyUploadDir = path.join(__dirname, "../../uploads/properties");
const avatarUploadDir = path.join(__dirname, "../../uploads/avatars");

ensureDir(propertyUploadDir);
ensureDir(avatarUploadDir);

const buildStorage = (uploadDir) => multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "-").toLowerCase();
    cb(null, `${Date.now()}-${base}${ext}`);
  }
});

const fileFilter = (_req, file, cb) => {
  const mimeType = String(file.mimetype || "").toLowerCase();
  const extension = path.extname(String(file.originalname || "")).toLowerCase();
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic", ".heif"];

  if (!mimeType.startsWith("image/") && !allowedExtensions.includes(extension)) {
    return cb(new AppError("Only JPG, PNG, and WEBP images are allowed", 400));
  }
  return cb(null, true);
};

const uploadPropertyImages = multer({
  storage: buildStorage(propertyUploadDir),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 8
  }
}).array("images", 8);

// Wrap multer with error handling
const uploadPropertyImagesHandler = (req, res, next) => {
  uploadPropertyImages(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return next(new AppError("Each property image must be 5MB or less", 400));
      }

      if (error.code === "LIMIT_FILE_COUNT") {
        return next(new AppError("You can upload up to 8 property images", 400));
      }

      return next(new AppError("Invalid property image upload request", 400));
    }

    return next(error);
  });
};

const avatarUpload = multer({
  storage: buildStorage(avatarUploadDir),
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1
  }
}).single("avatar");

const uploadAvatarImage = (req, res, next) => {
  avatarUpload(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return next(new AppError("Avatar image must be 2MB or less", 400));
      }

      return next(new AppError("Invalid avatar upload request", 400));
    }

    return next(error);
  });
};

module.exports = {
  uploadPropertyImages: uploadPropertyImagesHandler,
  uploadAvatarImage
};
