// API client helpers for backend communication and module-specific requests.
import apiClient from "./client";

const buildPropertyCreateFormData = (payload) => {
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

  if (Array.isArray(payload.images)) {
    payload.images.forEach((image, index) => {
      if (!image?.uri) return;

      const extension = image.uri.split(".").pop() || "jpg";
      const fallbackName = `property-image-${Date.now()}-${index}.${extension}`;

      formData.append("images", {
        uri: image.uri,
        name: image.fileName || fallbackName,
        type: image.mimeType || "image/jpeg"
      });
    });
  }

  return formData;
};

const buildPropertyUpdateFormData = (payload) => {
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

  if (Array.isArray(payload.images)) {
    payload.images.forEach((image, index) => {
      if (!image?.uri) return;

      const extension = image.uri.split(".").pop() || "jpg";
      const fallbackName = `property-image-${Date.now()}-${index}.${extension}`;

      formData.append("images", {
        uri: image.uri,
        name: image.fileName || fallbackName,
        type: image.mimeType || "image/jpeg"
      });
    });
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
    const formData = buildPropertyCreateFormData(payload);
    const response = await apiClient.post("/properties", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
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
    const formData = buildPropertyUpdateFormData(payload);
    const response = await apiClient.patch(`/properties/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return response.data?.data;
  }

  const response = await apiClient.patch(`/properties/${id}`, payload);
  return response.data?.data;
}

export async function deleteProperty(id) {
  const response = await apiClient.delete(`/properties/${id}`);
  return response.data?.data;
}
