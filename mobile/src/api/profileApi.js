// Profile API client for authenticated user profile operations.
import apiClient from "./client";

const buildAvatarFormData = (image) => {
  const formData = new FormData();

  if (!image?.uri) {
    throw new Error("Avatar image URI is required");
  }

  const extension = image.uri.split(".").pop() || "jpg";
  const fallbackName = `avatar-${Date.now()}.${extension}`;

  formData.append("avatar", {
    uri: image.uri,
    name: image.fileName || fallbackName,
    type: image.mimeType || "image/jpeg"
  });

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
  const formData = buildAvatarFormData(image);
  const response = await apiClient.patch("/auth/profile/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  return response.data?.data;
}
