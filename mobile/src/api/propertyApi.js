// API client helpers for backend communication and module-specific requests.
import apiClient from "./client";

// Convert image URI to blob for proper React Native FormData handling.
const uriToBlob = async (uri) => {
  try {
    const response = await fetch(uri);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
    return await response.blob();
  } catch (error) {
    console.error("Error converting URI to blob:", error);
    throw error;
  }
};

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

  // Async: convert image URIs to blobs before appending to FormData
  if (Array.isArray(payload.images) && payload.images.length > 0) {
    for (let i = 0; i < payload.images.length; i++) {
      const image = payload.images[i];
      if (!image?.uri) continue;

      try {
        const blob = await uriToBlob(image.uri);
        const extension = image.uri.split(".").pop() || "jpg";
        const fallbackName = `property-image-${Date.now()}-${i}.${extension}`;
        const fileName = image.fileName || fallbackName;

        // Append blob directly with proper metadata
        formData.append("images", blob, fileName);
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

  // Async: convert image URIs to blobs before appending to FormData
  if (Array.isArray(payload.images) && payload.images.length > 0) {
    for (let i = 0; i < payload.images.length; i++) {
      const image = payload.images[i];
      if (!image?.uri) continue;

      try {
        const blob = await uriToBlob(image.uri);
        const extension = image.uri.split(".").pop() || "jpg";
        const fallbackName = `property-image-${Date.now()}-${i}.${extension}`;
        const fileName = image.fileName || fallbackName;

        // Append blob directly with proper metadata
        formData.append("images", blob, fileName);
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
