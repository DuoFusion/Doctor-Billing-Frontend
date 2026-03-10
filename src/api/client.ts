import axios from "axios";

// ============ Auth Token Key ============
export const AUTH_TOKEN_KEY = "auth_token";

// ============ Get Auth Token ============
export const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

// ============ Set Auth Token ============
export const setAuthToken = (token: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

// ============ Clear Auth Token ============
export const clearAuthToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

// ============ Create API Client ============
export const createApiClient = () => {
  const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_BASE_URL,
  });

  // ============ Request Interceptor (Attach Token) ============
  api.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // ============ Response Interceptor (Handle 419 Expiry) ============
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 419) {
        clearAuthToken();
      }
      return Promise.reject(error);
    }
  );

  return api;
};