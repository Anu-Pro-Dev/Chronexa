import axios from "axios";
const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const USER_TOKEN: any = process.env.NEXT_PUBLIC_USER_TOKEN;

export const UserAxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});
export const PublicAxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});
UserAxiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(USER_TOKEN);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

UserAxiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.data.auth === "invalid") {
      localStorage.removeItem(USER_TOKEN);
      window.location.href = "/sign-in";
    }

    return Promise.reject(error);
  }
);

export const UserFormAxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "multipart/form-data",
    "ngrok-skip-browser-warning": "true",
  },
});

UserFormAxiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(USER_TOKEN);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

UserFormAxiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.data.auth === "invalid") {
      localStorage.removeItem(USER_TOKEN);
      window.location.href = "/sign-in";
    }

    return Promise.reject(error);
  }
);
