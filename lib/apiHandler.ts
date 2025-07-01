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
    if ((error as any).isAxiosError && (error as any).response) {
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

// Function to add a new organization type
export const addOrganizationTypeRequest = async (data: {
  organization_type_id?: number;
  OrgTypeLevel: number;
  organization_type_eng?: string;
  organization_type_arb?: string;
}) => {
  return apiRequest("/organizationType/add", "POST", data);
};

// Function to edit a organization type by ID
export const editOrganizationTypeRequest = async (data: {
  organization_type_id: number;
  OrgTypeLevel?: number;
  organization_type_eng?: string;
  organization_type_arb?: string;
}) => {
  const { organization_type_id, ...payload } = data;

  return apiRequest(`/organizationType/edit/${organization_type_id}`, "PUT", payload);
};

// Function to add a new organization type
export const addOrganizationRequest = async (data: {
  organization_id?: number;
  organization_type_id?: number;
  code?: string;
  organization_eng?: string;
  organization_arb?: string;
}) => {
  return apiRequest("/organization/add", "POST", data);
};

// Function to edit a organization type by ID
export const editOrganizationRequest = async (data: {
  organization_id: number;
  organization_type_id?: number;
  code?: string;
  organization_eng?: string;
  organization_arb?: string;
}) => {
  const { organization_id, ...payload } = data;

  return apiRequest(`/organization/edit/${organization_id}`, "PUT", payload);
};

// Function to add a new designation
export const addEmployeeTypeRequest = async (data: {
  employee_type_id?: number;
  employee_type_code: string;
  employee_type_eng?: string;
  employee_type_arb?: string;
}) => {
  return apiRequest("/employeeType/add", "POST", data);
};

// Function to edit a designation by ID
export const editEmployeeTypeRequest = async (data: {
  employee_type_id: number;
  employee_type_code?: string;
  employee_type_eng?: string;
  employee_type_arb?: string;
}) => {
  const { employee_type_id, ...payload } = data;

  return apiRequest(`/employeeType/edit/${employee_type_id}`, "PUT", payload);
};

// Function to add a new employee group
export const addEmployeeGroupRequest = async (data: {
  employee_group_id?: number;
  group_code: string;
  group_name_eng?: string;
  group_name_arb?: string;
  schedule_flag?: boolean;
  reporting_group_flag?: boolean;
}) => {
  return apiRequest("/employeeGroup/add", "POST", data);
};

// Function to edit a employee group by ID
export const editEmployeeGroupRequest = async (data: {
  employee_group_id: number;
  group_code?: string;
  group_name_eng?: string;
  group_name_arb?: string;
  schedule_flag?: boolean;
  reporting_group_flag?: boolean;
}) => {
  const { employee_group_id, ...payload } = data;

  return apiRequest(`/employeeGroup/edit/${employee_group_id}`, "PUT", payload);
};


// Function to add a new employee group member
export const addEmployeeGroupMemberRequest = async (data: {
  employee_group_id?: number;
  employee_id?: number;
  active_flag?: boolean;
}) => {
  return apiRequest("/employeeGroupMember/add", "POST", data);
};

// Function to fetch members of a group by employee_group_id
export const getEmployeeGroupMembersByGroupId = async (employee_group_id: number) => {
  return apiRequest(`/employeeGroupMember/byGroup/${employee_group_id}`, "GET");
};

// Function to add a new employee
export const addEmployeeRequest = async (data: {
  employee_id?: number;
  emp_no: string;
  firstname_eng?: string;
  lastname_eng?: string;
  firstname_arb?: string;
  lastname_arb?: string;
  [key: string]: any;
}) => {
  return apiRequest("/employee/add", "POST", data);
};

// Function to edit a employee by ID
export const editEmployeeRequest = async (data: {
  employee_id: number;
  emp_no?: string;
  firstname_eng?: string;
  lastname_eng?: string;
  firstname_arb?: string;
  lastname_arb?: string;
  [key: string]: any;
}) => {
  const { employee_id, ...payload } = data;

  return apiRequest(`/employee/edit/${employee_id}`, "PUT", payload);
};

// Function to add a new user creditnals
export const addSecUserRequest = async (data: {
  employee_id: number;
  login: string;
  password: string;
}) => {
  return apiRequest("/secuser/add", "POST", data);
};
