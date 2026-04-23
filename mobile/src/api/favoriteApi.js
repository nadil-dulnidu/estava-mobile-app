// Favorites API client for property wishlist management
import apiClient from "./client";

const assertFavoriteId = (favoriteId) => {
  const normalized = String(favoriteId || "").trim();
  if (!normalized) {
    throw new Error("Invalid favorite reference");
  }
  return encodeURIComponent(normalized);
};

export const favoriteApi = {
  // Add property to user favorites
  addFavorite: async (propertyId) => {
    return apiClient.post("/favorites", { propertyId });
  },

  // Get all favorites for current user
  getFavorites: async () => {
    return apiClient.get("/favorites/me");
  },

  // Remove property from favorites
  removeFavorite: async (favoriteId) => {
    const safeId = assertFavoriteId(favoriteId);
    return apiClient.delete(`/favorites/${safeId}`);
  },

  // Convenience helper for note-only updates from Favorites screen
  updateFavoriteNote: async (favoriteId, note) => {
    const safeId = assertFavoriteId(favoriteId);
    return apiClient.patch(`/favorites/${safeId}`, { note });
  }
};

export default favoriteApi;