import axios from "axios";
import { getAuthToken, setAuthToken } from "@/src/utils/authToken";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

if (typeof window !== "undefined") {
  UserAxiosInstance.interceptors.request.use(authInterceptor, (error) => Promise.reject(error));
  UserFormAxiosInstance.interceptors.request.use(authInterceptor, (error) => Promise.reject(error));

  const authErrorInterceptor = (error: any) => {
    if (error.response?.status === 401 || error.response?.data?.auth === "invalid") {
      setAuthToken(null, false);
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  };

  UserAxiosInstance.interceptors.response.use((response) => response, authErrorInterceptor);
  UserFormAxiosInstance.interceptors.response.use((response) => response, authErrorInterceptor);
}