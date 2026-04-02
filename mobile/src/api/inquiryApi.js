// Inquiry API client for property inquiry and messaging
import apiClient from "./client";

export const inquiryApi = {
  // Send new inquiry about a property
  sendInquiry: async (data) => {
    return apiClient.post("/inquiries", data);
  },

  // Get all inquiries for current user
  getMyInquiries: async () => {
    return apiClient.get("/inquiries/me");
  },

  // Get all inquiries for a property (for sellers/agents)
  getPropertyInquiries: async (propertyId) => {
    return apiClient.get(`/inquiries/property/${propertyId}`);
  },

  // Get single inquiry details
  getInquiry: async (inquiryId) => {
    return apiClient.get(`/inquiries/${inquiryId}`);
  },

  // Update inquiry (change status or message)
  updateInquiry: async (inquiryId, data) => {
    return apiClient.patch(`/inquiries/${inquiryId}`, data);
  },

  // Delete inquiry
  deleteInquiry: async (inquiryId) => {
    return apiClient.delete(`/inquiries/${inquiryId}`);
  }
};

export default inquiryApi;