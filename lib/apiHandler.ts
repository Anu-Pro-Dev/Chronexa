import axios from "axios";
import toast from "react-hot-toast";
import { getAuthToken, setAuthToken, clearAuthToken } from "@/utils/auth";
import { DEFAULT_API_URL, ERROR_GENERIC, ERROR_NETWORK } from "@/utils/constants";

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
    const token = getAuthToken();

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
      // throw new Error(error.response.data.message || ERROR_GENERIC);
      throw error;
    } else {
      throw new Error(ERROR_NETWORK);
    }
  }
};

// Function for logging in
export const loginRequest = async (login: string, password: string, rememberMe: boolean) => {
    const response = await apiRequest("/auth/login", "POST", {
      login: login,
      password: password,
      rememberMe,
    });
  
    if (response.token) {
      setAuthToken(response.token, rememberMe);
      if (rememberMe) {
        localStorage.setItem("user", JSON.stringify(response.user));
      } else {
        sessionStorage.setItem("user", JSON.stringify(response.user));
      }
    }
  
    return response;
};

// Function for logging out
export const logoutRequest = async () => {
  const token = getAuthToken();
  
  if (!token) {
    console.warn("No authentication token found, skipping logout API call.");
    return;
  }

  try {
    await apiRequest("/auth/logout", "POST");
  } catch (error) {
    toast.error("Logout failed");
  } finally {
    clearAuthToken();
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
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
  const token = getAuthToken();

  if (!token) {
    throw new Error("No authentication token found.");
  }
  
  return apiRequest("/auth/reset-password", "POST", { newPassword });
};

// Function to fetch all countries
export const getAllCountries = async () => {
  return apiRequest("/countries/all", "GET");
};
  
// Function to delete tanle entity dynamically
export const deleteEntityRequest = (entity: string | undefined, id: string) => {
  console.log(`Deleting ${entity} with ID: ${id}`);
  return apiRequest(`/${entity}/delete/${id}`, "DELETE")
    .then(response => response)
    .catch(error => {
      throw error;
    });
};

// Function to fetch all location
export const getAllLocations = async () => {
  return apiRequest("/location/all", "GET");
};

// Function to add a new location
export const addLocationRequest = async (data: {
  location_id?: number;
  location_code: string;
  location_eng?: string;
  location_arb?: string;
  city?: string;
  region_name?: string;
  country_code?: string;
  geolocation?: string;
  radius?: number;
}) => {
  return apiRequest("/location/add", "POST", data);
};

// Function to edit a location by ID
export const editLocationRequest = async (data: {
  location_id?: number;
  location_code: string;
  location_eng?: string;
  location_arb?: string;
  city?: string;
  region_name?: string;
  country_code?: string;
  geolocation?: string;
  radius?: number;
}) => {
  return apiRequest(`/location/edit/${data.location_id}`, "PUT", data);
};

// Function to fetch all citizenship
export const getAllCitizenships = async () => {
  return apiRequest("/citizenship/all", "GET");
};

// Function to add a new citizenship
export const addCitizenshipRequest = async (data: {
  citizenship_id?: number;
  citizenship_code: string,
  citizenship_eng?: string,
  citizenship_arb?: string,
}) => {
  return apiRequest("/citizenship/add", "POST", data);
};

// Function to edit a citizenship by ID
export const editCitizenshipRequest = async (data: {
  citizenship_id?: number,
  citizenship_code: string,
  citizenship_eng?: string,
  citizenship_arb?: string,
}) => {
  return apiRequest(`/citizenship/edit/${data.citizenship_id}`, "PUT", data);
};

// Function to fetch all designations
export const getAllDesignations = async () => {
  return apiRequest("/designation/all", "GET");
};

// Function to add a new designation
export const addDesignationRequest = async (data: {
  designation_id?: number;
  designation_code: string;
  designation_eng?: string;
  designation_arb?: string;
}) => {
  return apiRequest("/designation/add", "POST", data);
};

// Function to edit a designation by ID
export const editDesignationRequest = async (data: {
  designation_id: number;
  designation_code?: string;
  designation_eng?: string;
  designation_arb?: string;
}) => {
  const { designation_id, ...payload } = data;

  return apiRequest(`/designation/edit/${designation_id}`, "PUT", payload);
};

// Function to fetch all grades
export const getAllGrades = async () => {
  return apiRequest("/grade/all", "GET");
};

// Function to add a new grade
export const addGradeRequest = async (data: {
  grade_id?: number;
  grade_code: string;
  grade_eng?: string;
  grade_arb?: string;
  overtime_eligible_flag?: boolean;
}) => {
  return apiRequest("/grade/add", "POST", data);
};

// Function to edit a grade by ID
export const editGradeRequest = async (data: {
  grade_id: number;
  grade_code?: string;
  grade_eng?: string;
  grade_arb?: string;
  overtime_eligible_flag?: boolean;
}) => {
  const { grade_id, ...payload } = data;

  return apiRequest(`/grade/edit/${grade_id}`, "PUT", payload);
};

// Function to fetch all organization type
export const getAllOrganizationType = async () => {
  return apiRequest("/organizationType/all", "GET");
};

// Function to add a new organization type
export const addOrganizationTypeRequest = async (hierarchy: number, organizationTypeNameEng: string, organizationTypeNameArb: string) => {
  return apiRequest("/organizationType/add", "POST", {
    hierarchy,
    organizationTypeNameEng,
    organizationTypeNameArb,
  });
};

// Function to edit a location by ID
export const editOrganizationTypeRequest = async (
  id: string,
  hierarchy: number,
  organizationTypeNameEng: string,
  organizationTypeNameArb: string,
) => {
  return apiRequest(`/organizationType/edit/${id}`, "PUT", {
    hierarchy,
    organizationTypeNameEng,
    organizationTypeNameArb,
  });
};

// // Function to fetch all organization
// export const getAllOrganization = async () => {
//   return apiRequest("/organization/all", "GET");
// };

// // Function to add a new organization
// export const addOrganizationRequest = async (organizationName: string, descriptionEng: string, descriptionArb: string, organizationType: string) => {
//   return apiRequest("/organization/add", "POST", {
//     organizationName,
//     descriptionEng,
//     descriptionArb,
//     organizationType,
//   });
// };


// // Function to fetch all employee groups
// export const getAllEmployeeGroup = async () => {
//   return apiRequest("/employeeGroup/all", "GET");
// };

// // Function to add a new employee group
// export const addEmployeeGroupRequest = async (groupName: string, descriptionEng: string, descriptionArb: string) => {
//   return apiRequest("/employeeGroup/add", "POST", {
//     groupName,
//     descriptionEng,
//     descriptionArb,
//   });
// };

// // Function to fetch all employee type
// export const getAllEmployeeType = async () => {
//   return apiRequest("/employeeType/all", "GET");
// };

// // Function to add a new employee type
// export const addEmployeeTypeRequest = async (typeName: string, descriptionEng: string, descriptionArb: string) => {
//   return apiRequest("/employeeType/add", "POST", {
//     typeName,
//     descriptionEng,
//     descriptionArb,
//   });
// };
