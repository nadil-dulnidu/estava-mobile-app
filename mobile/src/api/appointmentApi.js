// Appointment API client for property visit scheduling
import apiClient from "./client";

export const appointmentApi = {
  // Create new appointment/visit booking
  createAppointment: async (data) => {
    return apiClient.post("/appointments", data);
  },

  // Get all appointments for current user
  getMyAppointments: async () => {
    return apiClient.get("/appointments/me");
  },

  // Update appointment (reschedule or change status)
  updateAppointment: async (appointmentId, data) => {
    return apiClient.patch(`/appointments/${appointmentId}`, data);
  },

  // Update appointment status to cancelled.
  cancelAppointment: async (appointmentId) => {
    return apiClient.patch(`/appointments/${appointmentId}`, { appointmentStatus: "cancelled" });
  },

  // Hide appointment from caller side (soft delete).
  softDeleteAppointment: async (appointmentId) => {
    return apiClient.delete(`/appointments/${appointmentId}`);
  }
};

export default appointmentApi;