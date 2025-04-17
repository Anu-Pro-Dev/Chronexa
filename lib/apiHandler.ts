import axios from "axios";
import { toast } from "sonner";
import { USER_TOKEN, DEFAULT_API_URL, ERROR_GENERIC, ERROR_NETWORK } from "@/utils/constants";

const API_URL = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;

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
      throw new Error(error.response.data.message || ERROR_GENERIC);
    } else {
      throw new Error(ERROR_NETWORK);
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
      toast.error("Logout failed:");
    } finally {
      // Always remove token from storage
      localStorage.removeItem(USER_TOKEN);
      sessionStorage.removeItem(USER_TOKEN);
    }
};  

// Function for initiating forgot password
export const forgotPasswordRequest = async (employeeId: number) => {
  return apiRequest("/auth/forgot-password", "POST", {
    employeeId,
  });
};

// Function for resetting password
export const resetPasswordRequest = async (newPassword: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem(USER_TOKEN) || sessionStorage.getItem(USER_TOKEN) : null;
  
    if (!token) {
      throw new Error("No authentication token found.");
    }
  
    return apiRequest("/auth/reset-password", "POST", { newPassword });
};
  
// Function to delete tanle entity dynamically
export const deleteEntityRequest = (entity: string | undefined, id: string) => {
  return apiRequest(`/${entity}/delete/${id}`, "DELETE")
    .then(response => response)
    .catch(error => {
      toast.error(`Error deleting ${entity}:`, error);
      throw error;
    });
};

// Function to fetch all location
export const getAllLocations = async () => {
  return apiRequest("/location/all", "GET");
};

// Function to add a new location
export const addLocationRequest = async (locationNameEnglish: string, locationNameArab: string) => {
  return apiRequest("/location/add", "POST", {
    locationNameEnglish,
    locationNameArab,
  });
};

// Function to edit a location by ID
export const editLocationRequest = async (
  id: string,
  locationNameEnglish: string,
  locationNameArab: string,
) => {
  return apiRequest(`/location/edit/${id}`, "PUT", {
    locationNameEnglish,
    locationNameArab,
  });
};

// Function to fetch all citizenship
export const getAllCitizenship = async () => {
  return apiRequest("/citizenship/all", "GET");
};

// Function to add a new citizenship
export const addCitizenshipRequest = async (countryCode: string, citizenshipEng: string, citizenshipArb: string) => {
  return apiRequest("/citizenship/add", "POST", {
    countryCode,
    citizenshipEng,
    citizenshipArb,
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


// Function to fetch all user groups
export const getAllUserGroups = async () => {
  return apiRequest("/employeeGroup/all", "GET");
};

// Function to add a new user group
export const addUserGroupRequest = async (groupName: string, descriptionEng: string, descriptionArb: string) => {
  return apiRequest("/employeeGroup/add", "POST", {
    groupName,
    descriptionEng,
    descriptionArb,
  });
};

// Function to fetch all user types
export const getAllUserTypes = async () => {
  return apiRequest("/employeeType/all", "GET");
};

// Function to add a new user type
export const addUserTypeRequest = async (typeName: string, descriptionEng: string, descriptionArb: string) => {
  return apiRequest("/employeeType/add", "POST", {
    typeName,
    descriptionEng,
    descriptionArb,
  });
};
