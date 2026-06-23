import { create } from "axios";

const isWeb = typeof window !== "undefined";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (isWeb ? "http://localhost:8090" : "http://192.168.1.53:8086");

export const API_PREFIX = "/v1/api";

const AUTH_HEADER_KEY = "angoma_auth_header";

let memoryAuthHeader = "";

const readStoredAuthHeader = () => {
  try {
    if (typeof globalThis.localStorage === "undefined") {
      return "";
    }

    return globalThis.localStorage.getItem(AUTH_HEADER_KEY) || "";
  } catch {
    return "";
  }
};

export const getAuthHeader = () => memoryAuthHeader || readStoredAuthHeader();

export const setAuthHeader = (authHeader: string) => {
  memoryAuthHeader = authHeader;

  try {
    if (typeof globalThis.localStorage !== "undefined") {
      globalThis.localStorage.setItem(AUTH_HEADER_KEY, authHeader);
    }
  } catch {
    // Storage is optional in native environments.
  }
};

export const setBearerToken = (token: string) => {
  setAuthHeader(`Bearer ${token}`);
};

export const setBasicCredentials = (username: string, password: string) => {
  const encoded =
    typeof btoa === "function"
      ? btoa(`${username}:${password}`)
      : Buffer.from(`${username}:${password}`).toString("base64");

  setAuthHeader(`Basic ${encoded}`);
};

export const clearAuthToken = () => {
  memoryAuthHeader = "";

  try {
    if (typeof globalThis.localStorage !== "undefined") {
      globalThis.localStorage.removeItem(AUTH_HEADER_KEY);
    }
  } catch {
    // Storage is optional in native environments.
  }
};

export const apiClient = create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const authHeader = getAuthHeader();

  if (authHeader) {
    config.headers.Authorization = authHeader;
  }

  return config;
});

export const getApiErrorMessage = (error: any, fallback: string) => {
  if (error?.response?.status === 401) {
    return "No autorizado. Inicia sesion con un usuario valido antes de consultar datos.";
  }

  const backendMessage =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data;

  if (typeof backendMessage === "string") {
    return backendMessage;
  }

  return error?.message || fallback;
};
