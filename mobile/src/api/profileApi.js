// Profile API client for authenticated user profile operations.
import apiClient from "./client";

const buildAvatarFormData = async (image) => {
  const formData = new FormData();

  if (!image?.uri) {
    throw new Error("Avatar image URI is required");
  }

  try {
    const extension = image.uri.split(".").pop() || "jpg";
    const fallbackName = `avatar-${Date.now()}.${extension}`;
    const fileName = image.fileName || fallbackName;

    // In React Native/Expo, FormData handles file:// and content:// URIs directly.
    formData.append("avatar", {
      uri: image.uri,
      type: image.mimeType || "image/jpeg",
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
