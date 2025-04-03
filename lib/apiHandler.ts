import axios from "axios";

// Base API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// The user's token storage key (you can adjust this if needed)
const USER_TOKEN = "userToken";

// Centralized axios instance for API requests
const apiInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// Function to handle API requests
export const apiRequest = async (endpoint: string, method: "GET" | "POST" | "PUT" | "DELETE", data?: any) => {
  try {
    // Get token from localStorage or sessionStorage
    const token = typeof window !== "undefined" ? localStorage.getItem(USER_TOKEN) || sessionStorage.getItem(USER_TOKEN) : null;

    const config = {
      method,
      url: endpoint,
      data,
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    };

    const response = await apiInstance(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // If the error is coming from the server, handle it
      throw new Error(error.response.data.message || "An error occurred.");
    } else {
      throw new Error("Network error or something went wrong.");
    }
  }
};

// Function for logging in
export const loginRequest = async (username: number, password: string, rememberMe: boolean) => {
    const response = await apiRequest("/auth/login", "POST", {
      employeeId: username,
      password: password,
    });
  
    if (response.token) {
      if (typeof window !== "undefined") {
        if (rememberMe) {
          localStorage.setItem(USER_TOKEN, response.token);
        } else {
          sessionStorage.setItem(USER_TOKEN, response.token);
        }
      }
    }
  
    return response;
};
  

// Function for logging out
export const logoutRequest = async () => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem(USER_TOKEN) || sessionStorage.getItem(USER_TOKEN)
        : null;
  
    if (!token) {
      console.warn("No authentication token found, skipping logout API call.");
      return;
    }
  
    try {
      await apiRequest("/auth/logout", "POST", );
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Always remove token from storage
      localStorage.removeItem(USER_TOKEN);
      sessionStorage.removeItem(USER_TOKEN);
    }
};  

// Function for resetting password
export const resetPasswordRequest = async (newPassword: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem(USER_TOKEN) || sessionStorage.getItem(USER_TOKEN) : null;
  
    if (!token) {
      throw new Error("No authentication token found.");
    }
  
    return apiRequest("/auth/reset-password", "POST", { newPassword });
};
  
// Function to fetch all regions
export const getAllRegions = async () => {
  return apiRequest("/region/all", "GET");
};

// Function to add a new region
export const addRegionRequest = async (regionName: string, descriptionArb: string, descriptionEng: string) => {
  return apiRequest("/region/add", "POST", {
    regionName,
    descriptionArb,
    descriptionEng,
  });
};
