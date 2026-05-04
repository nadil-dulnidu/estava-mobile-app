// API client helpers for backend communication and module-specific requests.
import axios from "axios";

const LOCAL_DEVELOPMENT_BASE_URL = "http://10.0.2.2:5001/api";

const normalizeApiBaseUrl = (value) => {
  if (!value) {
    return LOCAL_DEVELOPMENT_BASE_URL;
  }

  const trimmed = value.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
  const withoutTrailingSlash = withProtocol.replace(/\/+$/, "");

  if (withoutTrailingSlash.endsWith("/api")) {
    return withoutTrailingSlash;
  }

  return `${withoutTrailingSlash}/api`;
};

// Keep production ready by reading the hosted API from env.
const API_BASE_URL = normalizeApiBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL);
const SOCKET_BASE_URL = API_BASE_URL.replace(/\/api$/, "");

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // Hosted free tiers can cold-start; allow a longer first request window.
  timeout: 45000
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      error.message = "Request timed out. The backend may be cold-starting.";
      return Promise.reject(error);
    }

    if (!error?.response) {
      error.message = "Network error. Check backend URL, internet access, or server status.";
      return Promise.reject(error);
    }

    const apiMessage = error.response?.data?.message;
    if (apiMessage) {
      error.message = apiMessage;
    }

    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};

export const getSocketBaseUrl = () => SOCKET_BASE_URL;

export default apiClient;
