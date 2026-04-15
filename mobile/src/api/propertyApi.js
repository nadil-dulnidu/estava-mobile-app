// API client helpers for backend communication and module-specific requests.
import apiClient from "./client";

export async function getProperties(params = {}) {
  const response = await apiClient.get("/properties", { params });
  return response.data?.data;
}

export async function getPropertyById(id) {
  const response = await apiClient.get(`/properties/${id}`);
  return response.data?.data;
}

export async function createProperty(payload) {
  const response = await apiClient.post("/properties", payload);
  return response.data?.data;
}
