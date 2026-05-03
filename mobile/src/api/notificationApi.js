// Notification API client for system notifications and alerts
import apiClient from "./client";

export const notificationApi = {
  // Get all notifications for current user
  getNotifications: async () => {
    return apiClient.get("/notifications/me");
  },

  // Mark single notification as read
  markAsRead: async (notificationId) => {
    return apiClient.patch(`/notifications/${notificationId}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    return apiClient.patch("/notifications/read-all");
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    return apiClient.delete(`/notifications/${notificationId}`);
  }
};

export default notificationApi;