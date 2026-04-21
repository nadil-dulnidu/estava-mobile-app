// Favorites API client for property wishlist management
import apiClient from "./client";

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
    return apiClient.delete(`/favorites/${favoriteId}`);
  },

  // Convenience helper for note-only updates from Favorites screen
  updateFavoriteNote: async (favoriteId, note) => {
    return apiClient.patch(`/favorites/${favoriteId}`, { note });
  }
};

export default favoriteApi;