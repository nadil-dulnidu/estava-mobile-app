// API client helpers for backend communication and module-specific requests.
import axios from "axios";

// Keep production ready by reading hosted API from env.
const DEFAULT_API_BASE_URL = "http://10.0.2.2:5000/api";
const IS_PRODUCTION_BUILD =
  typeof __DEV__ === "boolean" ? !__DEV__ : process.env.NODE_ENV === "production";

const normalizeApiBaseUrl = (rawValue, { requireHttps = false } = {}) => {
  const candidate = String(rawValue || "").trim();
  if (!candidate) {
    throw new Error(
      "API base URL is empty. Set EXPO_PUBLIC_API_BASE_URL to your backend URL."
    );
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(candidate);
  } catch (_error) {
    throw new Error(
      `Invalid EXPO_PUBLIC_API_BASE_URL: \"${candidate}\". Use full URL like https://your-backend.com/api`
    );
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("API base URL must use http or https protocol.");
  }

  if (requireHttps && parsedUrl.protocol !== "https:") {
    throw new Error("Production API base URL must use https protocol.");
  }

  const normalizedPathname = parsedUrl.pathname === "/" ? "/api" : parsedUrl.pathname.replace(/\/+$/, "");
  const normalizedUrl = `${parsedUrl.origin}${normalizedPathname || "/api"}`;

  return {
    baseUrl: normalizedUrl,
    origin: parsedUrl.origin
  };
};

const resolvedApiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL || (IS_PRODUCTION_BUILD ? "" : DEFAULT_API_BASE_URL);

const { baseUrl: API_BASE_URL, origin: API_ORIGIN } = normalizeApiBaseUrl(resolvedApiBaseUrl, {
  requireHttps: IS_PRODUCTION_BUILD
});

const stripAuthorizationHeader = (headers) => {
  if (!headers) {
    return;
  }

  if (typeof headers.delete === "function") {
    headers.delete("Authorization");
    headers.delete("authorization");
    return;
  }

  delete headers.Authorization;
  delete headers.authorization;
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // Hosted free tiers can cold-start; allow a longer first request window.
  timeout: 45000,
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use((config) => {
  const requestUrl = config.url || "/";

  let resolvedUrl;
  try {
    resolvedUrl = new URL(requestUrl, config.baseURL || API_BASE_URL);
  } catch (_error) {
    stripAuthorizationHeader(config.headers);
    throw new Error("Invalid request URL. Check EXPO_PUBLIC_API_BASE_URL and API endpoint paths.");
  }

  if (resolvedUrl.origin !== API_ORIGIN) {
    stripAuthorizationHeader(config.headers);
    throw new Error("Blocked request to unexpected API origin. Check EXPO_PUBLIC_API_BASE_URL configuration.");
  }

  return config;
});

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};

export default apiClient;