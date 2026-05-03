// File utility helpers for safe cleanup of uploaded property images.
const fs = require("fs");
const path = require("path");

const uploadsRoot = path.join(__dirname, "../../uploads");

const toLocalUploadPathFromUrl = (fileUrl) => {
  if (!fileUrl || typeof fileUrl !== "string") return null;

  try {
    const parsed = new URL(fileUrl);
    const pathname = decodeURIComponent(parsed.pathname || "");
    if (!pathname.startsWith("/uploads/")) return null;
    return path.join(__dirname, "../..", pathname);
  } catch (_error) {
    if (fileUrl.startsWith("/uploads/")) {
      return path.join(__dirname, "../..", fileUrl);
    }
    return null;
  }
};

const isWithinUploadsRoot = (targetPath) => {
  if (!targetPath) return false;
  const normalizedTarget = path.resolve(targetPath);
  const normalizedRoot = path.resolve(uploadsRoot);
  return normalizedTarget.startsWith(normalizedRoot);
};

const deleteLocalFileByUrl = async (fileUrl) => {
  const localPath = toLocalUploadPathFromUrl(fileUrl);
  if (!localPath || !isWithinUploadsRoot(localPath)) return;

  try {
    await fs.promises.unlink(localPath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
};

const deleteManyLocalFilesByUrls = async (urls = []) => {
  await Promise.all(urls.map((url) => deleteLocalFileByUrl(url)));
};

module.exports = {
  deleteLocalFileByUrl,
  deleteManyLocalFilesByUrls
};