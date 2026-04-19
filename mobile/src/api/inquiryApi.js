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

  // Update inquiry (change status or message)
  updateInquiry: async (inquiryId, data) => {
    return apiClient.patch(`/inquiries/${inquiryId}`, data);
  },

  // Update sender-managed inquiry fields (subject/message/contact)
  updateInquiryDetails: async (inquiryId, data) => {
    return apiClient.patch(`/inquiries/${inquiryId}`, data);
  },

  // Create or edit agent/admin response message
  saveInquiryResponse: async (inquiryId, responseMessage) => {
    return apiClient.patch(`/inquiries/${inquiryId}`, {
      responseMessage
    });
  },

  // Clear agent/admin response message from inquiry
  clearInquiryResponse: async (inquiryId) => {
    return apiClient.delete(`/inquiries/${inquiryId}/response`);
  },

  // Delete inquiry
  deleteInquiry: async (inquiryId) => {
    return apiClient.delete(`/inquiries/${inquiryId}`);
  },

  // Convenience alias for inquiry deletion
  removeInquiry: async (inquiryId) => {
    return apiClient.delete(`/inquiries/${inquiryId}`);
  }
};

export default inquiryApi;