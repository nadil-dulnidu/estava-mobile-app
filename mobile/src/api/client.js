// API client helpers for backend communication and module-specific requests.
import axios from "axios";

// Keep production ready by reading the hosted API from env.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://10.0.2.2:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // Hosted free tiers can cold-start; allow a longer first request window.
  timeout: 45000,
  headers: {
    "Content-Type": "application/json"
  }
});

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};

export default apiClient;