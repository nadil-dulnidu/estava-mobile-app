// API client helpers for backend communication and module-specific requests.
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

const buildImageName = (image, prefix, index) => {
  const existingName = String(image?.fileName || "").trim();
  if (existingName) {
    return existingName;
  }

  const extension = getFileExtension(image?.fileName || image?.uri) || "jpg";
  return `${prefix}-${Date.now()}-${index}.${extension}`;
};

const inferImageMimeType = (image) => {
  const rawMimeType = String(image?.mimeType || "").trim().toLowerCase();
  if (rawMimeType) {
    return rawMimeType === "image/jpg" ? "image/jpeg" : rawMimeType;
  }

  const extension = getFileExtension(image?.fileName || image?.uri);
  return IMAGE_MIME_BY_EXTENSION[extension] || "image/jpeg";
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

  // In React Native/Expo, FormData handles file:// and content:// URIs directly.
  // Do NOT use fetch() on Android content:// URIs - it fails.
  if (Array.isArray(payload.images) && payload.images.length > 0) {
    for (let i = 0; i < payload.images.length; i++) {
      const image = payload.images[i];
      if (!image?.uri) continue;

      try {
        const fileName = buildImageName(image, "property-image", i);

        // Directly append the image object with URI, type, and name.
        // React Native FormData will handle file:// and content:// URIs.
        formData.append("images", {
          uri: image.uri,
          type: inferImageMimeType(image),
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
        const fileName = buildImageName(image, "property-image", i);

        // Directly append the image object with URI, type, and name.
        // React Native FormData will handle file:// and content:// URIs.
        formData.append("images", {
          uri: image.uri,
          type: inferImageMimeType(image),
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
