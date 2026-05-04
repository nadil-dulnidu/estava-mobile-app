// API client helpers for backend communication and module-specific requests.
import apiClient from "./client";

const buildPropertyCreateFormData = async (payload) => {
  const formData = new FormData();

  const appendIfPresent = (key, value) => {
    if (value === undefined || value === null) return;
    const normalized = typeof value === "string" ? value.trim() : value;
    if (normalized === "") return;
    formData.append(key, String(normalized));
  };

  appendIfPresent("title", payload.title);
  appendIfPresent("description", payload.description);
  appendIfPresent("location", payload.location);
  appendIfPresent("price", payload.price);
  appendIfPresent("propertyType", payload.propertyType);
  appendIfPresent("listingStatus", payload.listingStatus);
  appendIfPresent("bedrooms", payload.bedrooms);
  appendIfPresent("bathrooms", payload.bathrooms);
  appendIfPresent("areaSize", payload.areaSize);

  if (Array.isArray(payload.features) && payload.features.length > 0) {
    formData.append("features", payload.features.join(","));
  }

  // In React Native/Expo, FormData handles file:// and content:// URIs directly.
  // Do NOT use fetch() on Android content:// URIs - it fails.
  if (Array.isArray(payload.images) && payload.images.length > 0) {
    for (let i = 0; i < payload.images.length; i++) {
      const image = payload.images[i];
      if (!image?.uri) continue;

      try {
        const extension = image.uri.split(".").pop() || "jpg";
        const fallbackName = `property-image-${Date.now()}-${i}.${extension}`;
        const fileName = image.fileName || fallbackName;

        // Directly append the image object with URI, type, and name.
        // React Native FormData will handle file:// and content:// URIs.
        formData.append("images", {
          uri: image.uri,
          type: image.mimeType || "image/jpeg",
          name: fileName
        });
      } catch (error) {
        console.error(`Failed to process image ${i}:`, error);
        throw error;
      }
    }
  }

  return formData;
};

const buildPropertyUpdateFormData = async (payload) => {
  const formData = new FormData();

  const appendIfPresent = (key, value) => {
    if (value === undefined || value === null) return;
    const normalized = typeof value === "string" ? value.trim() : value;
    if (normalized === "") return;
    formData.append(key, String(normalized));
  };

  [
    "title",
    "description",
    "location",
    "price",
    "propertyType",
    "listingStatus",
    "bedrooms",
    "bathrooms",
    "areaSize"
  ].forEach((field) => appendIfPresent(field, payload[field]));

  if (Array.isArray(payload.features) && payload.features.length > 0) {
    formData.append("features", payload.features.join(","));
  }

  if (Array.isArray(payload.removeImageUrls) && payload.removeImageUrls.length > 0) {
    payload.removeImageUrls.forEach((url) => {
      formData.append("removeImageUrls", String(url));
    });
  }

  if (payload.replaceImages !== undefined) {
    formData.append("replaceImages", payload.replaceImages ? "true" : "false");
  }

  // In React Native/Expo, FormData handles file:// and content:// URIs directly.
  // Do NOT use fetch() on Android content:// URIs - it fails.
  if (Array.isArray(payload.images) && payload.images.length > 0) {
    for (let i = 0; i < payload.images.length; i++) {
      const image = payload.images[i];
      if (!image?.uri) continue;

      try {
        const extension = image.uri.split(".").pop() || "jpg";
        const fallbackName = `property-image-${Date.now()}-${i}.${extension}`;
        const fileName = image.fileName || fallbackName;

        // Directly append the image object with URI, type, and name.
        // React Native FormData will handle file:// and content:// URIs.
        formData.append("images", {
          uri: image.uri,
          type: image.mimeType || "image/jpeg",
          name: fileName
        });
      } catch (error) {
        console.error(`Failed to process image ${i}:`, error);
        throw error;
      }
    }
  }

  return formData;
};

export async function getProperties(params = {}) {
  const response = await apiClient.get("/properties", { params });
  return response.data?.data;
}

export async function getPropertyById(id) {
  const response = await apiClient.get(`/properties/${id}`);
  return response.data?.data;
}

export async function getMyProperties(params = {}) {
  const response = await apiClient.get("/properties/mine", { params });
  return response.data?.data;
}

export async function createProperty(payload) {
  const hasImages = Array.isArray(payload?.images) && payload.images.length > 0;

  if (hasImages) {
    const formData = await buildPropertyCreateFormData(payload);
    // Don't explicitly set Content-Type; let axios auto-set it with correct boundary
    const response = await apiClient.post("/properties", formData);
    return response.data?.data;
  }

  const response = await apiClient.post("/properties", payload);
  return response.data?.data;
}

export async function updateProperty(id, payload) {
  const hasImages = Array.isArray(payload?.images) && payload.images.length > 0;
  const hasImageRemoval = Array.isArray(payload?.removeImageUrls) && payload.removeImageUrls.length > 0;
  const hasReplaceFlag = payload?.replaceImages !== undefined;

  if (hasImages || hasImageRemoval || hasReplaceFlag) {
    const formData = await buildPropertyUpdateFormData(payload);
    // Don't explicitly set Content-Type; let axios auto-set it with correct boundary
    const response = await apiClient.patch(`/properties/${id}`, formData);
    return response.data?.data;
  }

  const response = await apiClient.patch(`/properties/${id}`, payload);
  return response.data?.data;
}

export async function deleteProperty(id) {
  const response = await apiClient.delete(`/properties/${id}`);
  return response.data?.data;
}
