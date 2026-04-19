// Review API client for property and agent ratings
import apiClient from "./client";

const unwrapData = (response) => response?.data?.data;

export const reviewApi = {
  // Submit review and rating for property or agent
  submitReview: async (data) => {
    return apiClient.post("/reviews", data);
  },

  // Get all reviews for a property
  getPropertyReviews: async (propertyId) => {
    const response = await apiClient.get(`/reviews/property/${propertyId}`);
    return unwrapData(response);
  },

  // Get all reviews for an agent
  getAgentReviews: async (agentId) => {
    return apiClient.get(`/reviews/agent/${agentId}`);
  },

  // Get user's own reviews
  getMyReviews: async () => {
    return apiClient.get("/reviews/me");
  },

  // Update review
  updateReview: async (reviewId, data) => {
    return apiClient.patch(`/reviews/${reviewId}`, data);
  },

  // Delete review
  deleteReview: async (reviewId) => {
    return apiClient.delete(`/reviews/${reviewId}`);
  }
};

export default reviewApi;