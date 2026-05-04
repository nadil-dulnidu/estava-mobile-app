// Profile API client for authenticated user profile operations.
import apiClient from "./client";

const IMAGE_MIME_BY_EXTENSION = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif"
};

const getFileExtension = (value) => {
  const cleaned = String(value || "").split("?")[0].trim().toLowerCase();
  const match = cleaned.match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : "";
};

const buildFileName = (image) => {
  const existingName = String(image?.fileName || "").trim();
  if (existingName) {
    return existingName;
  }

  const extension = getFileExtension(image?.fileName || image?.uri) || "jpg";
  return `avatar-${Date.now()}.${extension}`;
};

const inferMimeType = (image) => {
  const rawMimeType = String(image?.mimeType || "").trim().toLowerCase();
  if (rawMimeType) {
    return rawMimeType === "image/jpg" ? "image/jpeg" : rawMimeType;
  }

  const extension = getFileExtension(image?.fileName || image?.uri);
  return IMAGE_MIME_BY_EXTENSION[extension] || "image/jpeg";
};

const buildAvatarFormData = async (image) => {
  const formData = new FormData();

  if (!image?.uri) {
    throw new Error("Avatar image URI is required");
  }

  try {
    const fileName = buildFileName(image);

    // In React Native/Expo, FormData handles file:// and content:// URIs directly.
    formData.append("avatar", {
      uri: image.uri,
      type: inferMimeType(image),
      name: fileName
    });
  } catch (error) {
    console.error("Failed to process avatar image:", error);
    throw error;
  }

  return formData;
};

export async function getProfile() {
  const response = await apiClient.get("/auth/profile");
  return response.data?.data;
}

export async function updateProfile(payload) {
  const response = await apiClient.patch("/auth/profile", payload);
  return response.data?.data;
}

export async function changePassword(payload) {
  const response = await apiClient.patch("/auth/change-password", payload);
  return response.data?.data;
}

export async function uploadProfileAvatar(image) {
  const formData = await buildAvatarFormData(image);
  // Don't explicitly set Content-Type; let axios auto-set it with correct boundary
  const response = await apiClient.patch("/auth/profile/avatar", formData);

  return response.data?.data;
}
