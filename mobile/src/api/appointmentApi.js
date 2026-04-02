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

  // Get single appointment details
  getAppointment: async (appointmentId) => {
    return apiClient.get(`/appointments/${appointmentId}`);
  },

  // Update appointment (reschedule or change status)
  updateAppointment: async (appointmentId, data) => {
    return apiClient.patch(`/appointments/${appointmentId}`, data);
  },

  // Cancel appointment
  cancelAppointment: async (appointmentId) => {
    return apiClient.patch(`/appointments/${appointmentId}`, { status: "cancelled" });
  }
};

export default appointmentApi;