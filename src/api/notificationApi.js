// Notification API client for system notifications and alerts
import apiClient from "./client";

export const notificationApi = {
  // Create a notification for a target user (admin-only endpoint)
  createNotification: async (data) => {
    return apiClient.post("/notifications", data);
  },

  // Get all notifications for current user
  getNotifications: async () => {
    return apiClient.get("/notifications/me");
  },

  // Mark single notification as read
  markAsRead: async (notificationId) => {
    return apiClient.patch(`/notifications/${notificationId}/read`);
  },

  // Mark all notifications as read for current user
  markAllAsRead: async () => {
    return apiClient.patch("/notifications/read-all");
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    return apiClient.delete(`/notifications/${notificationId}`);
  }
};

export default notificationApi;
