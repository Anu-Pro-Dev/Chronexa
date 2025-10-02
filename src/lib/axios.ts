import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const USER_TOKEN = "userToken";

export const getStoredToken = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      return localStorage.getItem(USER_TOKEN);
    } catch (error) {
      console.warn('localStorage not available:', error);
      return null;
    }
  }
  return null;
};

export const setAuthToken = (newToken: string | null) => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      if (newToken) {
        localStorage.setItem(USER_TOKEN, newToken);
      } else {
        localStorage.removeItem(USER_TOKEN);
      }
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
  }
};

export const PublicAxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

export const UserAxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

export const UserFormAxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "multipart/form-data",
    "ngrok-skip-browser-warning": "true",
  },
});

const authInterceptor = (config: any) => {
  if (typeof window !== "undefined") {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
};

if (typeof window !== "undefined") {
  UserAxiosInstance.interceptors.request.use(authInterceptor, (error) => Promise.reject(error));
  UserFormAxiosInstance.interceptors.request.use(authInterceptor, (error) => Promise.reject(error));

  const authErrorInterceptor = (error: any) => {
    if (error.response?.status === 401 || error.response?.data?.auth === "invalid") {
      setAuthToken(null); // Remove token from storage
      if (window.location.pathname !== "/") {
        window.location.href = "/"; // Redirect user to login page
      }
    }
    return Promise.reject(error);
  };

  UserAxiosInstance.interceptors.response.use((response) => response, authErrorInterceptor);
  UserFormAxiosInstance.interceptors.response.use((response) => response, authErrorInterceptor);
}