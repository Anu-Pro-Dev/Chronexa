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
  
// Function to fetch all location
export const getAllLocations = async () => {
  return apiRequest("/region/all", "GET");
};

// Function to add a new location
export const addLocationRequest = async (regionName: string, descriptionEng: string, descriptionArb: string) => {
  return apiRequest("/region/add", "POST", {
    regionName,
    descriptionEng,
    descriptionArb,
  });
};

// Function for deleting a location by ID
export const deleteLocationRequest = (id: string) => {
  return apiRequest(`/region/delete/${id}`, "DELETE")
    .then(response => response)
    .catch(error => {
      console.error("Error deleting location:", error);
      throw error;
    });
};

// Function to fetch all citizenship
export const getAllCitizenship = async () => {
  return apiRequest("/nationality/all", "GET");
};

// Function to add a new citizenship
export const addCitizenshipRequest = async (nationalityName: string, descriptionEng: string, descriptionArb: string) => {
  return apiRequest("/nationality/add", "POST", {
    nationalityName,
    descriptionEng,
    descriptionArb,
  });
};

// Function for deleting a citizenship by ID
export const deleteCitizenshipRequest = (id: string) => {
  return apiRequest(`/nationality/delete/${id}`, "DELETE")
    .then(response => response)
    .catch(error => {
      console.error("Error deleting citizenship:", error);
      throw error;
    });
};

// Function to fetch all designations
export const getAllDesignations = async () => {
  return apiRequest("/designation/all", "GET");
};

// Function to add a new designation
export const addDesignationRequest = async (designationName: string, descriptionEng: string, descriptionArb: string, vacancy: number, remarks: string) => {
  return apiRequest("/designation/add", "POST", {
    designationName,
    descriptionEng,
    descriptionArb,
    vacancy,
    remarks,
  });
};

// Function for deleting a designation by ID
export const deleteDesignationRequest = (id: string) => {
  return apiRequest(`/designation/delete/${id}`, "DELETE")
    .then(response => response)
    .catch(error => {
      console.error("Error deleting designation:", error);
      throw error;
    });
};

// Function to fetch all grades
export const getAllGrades = async () => {
  return apiRequest("/grade/all", "GET");
};

// Function to add a new grade
export const addGradeRequest = async (gradeName: string, descriptionEng: string, descriptionArb: string, numberOfCl: number, numberOfSl: number, numberOfAl: number, overtimeEligibleFlag: string, seniorFlag: string) => {
  return apiRequest("/grade/add", "POST", {
    gradeName,
    descriptionEng,
    descriptionArb,
    numberOfCl,
    numberOfSl,
    numberOfAl,
    overtimeEligibleFlag,
    seniorFlag,
  });
};

// Function for deleting a grade by ID
export const deleteGradeRequest = (id: string) => {
  return apiRequest(`/grade/delete/${id}`, "DELETE")
    .then(response => response)
    .catch(error => {
      console.error("Error deleting grade:", error);
      throw error;
    });
};

// Function to fetch all organization
export const getAllOrganization = async () => {
  return apiRequest("/organization/all", "GET");
};

// Function to add a new grade
export const addOrganizationRequest = async (organizationName: string, descriptionEng: string, descriptionArb: string, organizationType: string) => {
  return apiRequest("/organization/add", "POST", {
    organizationName,
    descriptionEng,
    descriptionArb,
    organizationType,
  });
};

// Function for deleting a grade by ID
export const deleteOrganizationRequest = (id: string) => {
  return apiRequest(`/organization/delete/${id}`, "DELETE")
    .then(response => response)
    .catch(error => {
      console.error("Error deleting organization:", error);
      throw error;
    });
};