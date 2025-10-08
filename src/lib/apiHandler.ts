import axios from "axios";
import toast from "react-hot-toast";
import { getAuthToken, setAuthToken, clearAuthToken } from "@/src/utils/authToken";
import { DEFAULT_API_URL, ERROR_GENERIC, ERROR_NETWORK } from "@/src/utils/constants";

const API_URL = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;

// Centralized axios instance for API requests
const apiInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
  // withCredentials: true,
});

// Function to handle API requests
export const apiRequest = async (endpoint: string, method: "GET" | "POST" | "PUT" | "DELETE", data?: any) => {
  try {
    const token = getAuthToken();

    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;

    const config = {
      method,
      url: endpoint,
      data,
      // withCredentials: true,
      headers: {
        ...(isFormData
          ? {}
          : { "Content-Type": "application/json" }),
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

// Function for Servertime
export const serverTimeRequest = async () => {
  return apiRequest("/systime", "GET");
}

// Function for Servertime with Zone
export const serverTimeZoneRequest = async () => {
  return apiRequest("/systime/autozone", "GET");
}

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
    performLogoutCleanup();
    return;
  }

  try {
    await apiRequest("/auth/logout", "POST");
  } catch (error) {
    toast.error("Logout failed");
  } finally {
    performLogoutCleanup();
  }
};

// Separate function to handle logout cleanup - PRESERVES punch timer state
const performLogoutCleanup = () => {
  clearAuthToken();
  localStorage.removeItem("user");
  sessionStorage.removeItem("user");
};

// Hook for components that need to trigger logout (preserves timer state)
export const useLogoutWithTimerPreservation = () => {
  return {
    logout: logoutRequest,
    clearAuthDataOnly: performLogoutCleanup
  };
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
  org_type_level: number;
  organization_type_eng?: string;
  organization_type_arb?: string;
}) => {
  return apiRequest("/organizationType/add", "POST", data);
};

// Function to edit a organization type by ID
export const editOrganizationTypeRequest = async (data: {
  organization_type_id: number;
  org_type_level?: number;
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
  organization_code?: string;
  organization_eng?: string;
  organization_arb?: string;
}) => {
  return apiRequest("/organization/add", "POST", data);
};

// Function to edit a organization type by ID
export const editOrganizationRequest = async (data: {
  organization_id: number;
  organization_type_id?: number;
  organization_code?: string;
  organization_eng?: string;
  organization_arb?: string;
}) => {
  const { organization_id, ...payload } = data;

  return apiRequest(`/organization/edit/${organization_id}`, "PUT", payload);
};

// Function to fetch organization by Id
export const getOrganizationById = async (organization_id: number) => {
  return apiRequest(`/organization/get/${organization_id}`, "GET");
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

// Function to fetch employee group by employee ID
export const getEmployeeGroupByEmployeeId = async (employee_id: number) => {
  return apiRequest(`/employeeGroup/get/${employee_id}`, "GET");
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

// Function to fetch employee by Id
export const getEmployeeByID = async (employee_id: number) => {
  return apiRequest(`/employee/get/${employee_id}`, "GET");
};

// Function to get a employees who is manager
export async function getManagerEmployees() {
  return apiRequest("/employee/all?manager_flag=true", "GET");
}

// Function to add a new user creditnals
export const addSecUserRequest = async (data: {
  employee_id: number;
  login: string;
  password: string;
}) => {
  return apiRequest("/secuser/add", "POST", data);
};

// Function to fetch secuser by Id
export const getSecUserByUserId = async (user_id: number) => {
  return apiRequest(`/secuser/get/${user_id}`, "GET");
};

// Function to get a user by its employee_id
export const getSecUserByEmployeeId = async (employee_id: number) => {
  return apiRequest(`/secuser/get-by-emp-id/${employee_id}`, "GET");
};

export const searchEmployees = async (searchTerm: string) => {
  return apiRequest(`/employee/search?search=${encodeURIComponent(searchTerm)}`, "GET");
};

// Function to add a new ramadan schedule
export const addRamadanScheduleRequest = async (data: {
  ramadan_id?: number;
  ramadan_name_eng?: string;
  ramadan_name_arb?: string;
  remarks?: string;
  from_date?: string;
  to_date?: string;
}) => {
  return apiRequest("/ramadan/add", "POST", data);
};

// Function to add a new ramadan schedule
export const editRamadanScheduleRequest = async (data: {
  ramadan_id: number;
  ramadan_name_eng?: string;
  ramadan_name_arb?: string;
  remarks?: string;
  from_date?: string;
  to_date?: string;
}) => {
  const { ramadan_id, ...payload } = data;

  return apiRequest(`/ramadan/edit/${ramadan_id}`, "PUT", payload);
};

// Function to add a new ramadan schedule
export const addHolidayScheduleRequest = async (data: {
  holiday_id?: number;
  holiday_eng?: string;
  holiday_arb?: string;
  remarks?: string;
  from_date?: string;
  to_date?: string;
  recurring_flag?: boolean;
  public_holiday_flag?: boolean;
}) => {
  return apiRequest("/holiday/add", "POST", data);
};

// Function to add a new ramadan schedule
export const editHolidayScheduleRequest = async (data: {
  holiday_id: number;
  holiday_eng?: string;
  holiday_arb?: string;
  remarks?: string;
  from_date?: string;
  to_date?: string;
  recurring_flag?: boolean;
  public_holiday_flag?: boolean;
}) => {
  const { holiday_id, ...payload } = data;

  return apiRequest(`/holiday/edit/${holiday_id}`, "PUT", payload);
};

// Function to add a new schedule
export const addScheduleRequest = async (data: {
  schedule_id?: number;
  schedule_code: string;
  organization_id: number;
  [key: string]: any;
}) => {
  return apiRequest("/schedule/add", "POST", data);
};

// Function to edit a schedule by ID
export const editScheduleRequest = async (data: {
  schedule_id: number;
  schedule_code?: string;
  organization_id: number;
  [key: string]: any;
}) => {
  const { schedule_id, ...payload } = data;

  return apiRequest(`/schedule/edit/${schedule_id}`, "PUT", payload);
};

// Function to get a schedules by ID
export async function getScheduleByID(schedule_id: number) {
  return apiRequest(`/schedule/get${schedule_id}`, "GET");
}

// Function to get a schedules by organization ID
export async function getScheduleByOrganization(organization_id: number) {
  return apiRequest(`/schedule/organization/${organization_id}`, "GET");
}

// Function to add a new weekly schedule
export const addOrgScheduleRequest = async (data: {
  organization_schedule_id?: number;
  organization_id: number;
  from_date: string;
  to_date?: string;
  [key: string]: any;
}) => {
  return apiRequest("/organizationSchedule/add", "POST", data);
};

// Function to edit a weekly schedule by ID
export const editOrgScheduleRequest = async (data: {
  organization_schedule_id: number;
  organization_id?: number;
  from_date?: string;
  to_date?: string;
  [key: string]: any;
}) => {
  const { organization_schedule_id, ...payload } = data;

  return apiRequest(`/organizationSchedule/edit/${organization_schedule_id}`, "PUT", payload);
};

// Function to get a schedules by organization ID
export async function getScheduleByEmployee(employee_id: number) {
  return apiRequest(`/schedule/employee/${employee_id}`, "GET");
}

// Function to add a new weekly schedule
export const addEmpScheduleRequest = async (data: {
  employee_schedule_id?: number;
  employee_id: number;
  from_date: string;
  to_date?: string;
  [key: string]: any;
}) => {
  return apiRequest("/employeeSchedule/add", "POST", data);
};

// Function to edit a weekly schedule by ID
export const editEmpScheduleRequest = async (data: {
  employee_schedule_id: number;
  employee_id?: number;
  from_date?: string;
  to_date?: string;
  [key: string]: any;
}) => {
  const { employee_schedule_id, ...payload } = data;

  return apiRequest(`/employeeSchedule/edit/${employee_schedule_id}`, "PUT", payload);
};

// Function to add a new workflow type
export const addWorkflowTypeRequest = async (data: {
  workflow_id?: number;
  workflow_code: string;
  workflow_name_eng?: string;
  workflow_name_arb?: string;
  workflow_category_eng?: string;
  workflow_category_arb?: string;
}) => {
  return apiRequest("/workflowType/add", "POST", data);
};

// Function to edit a workflow type
export const editWorkflowTypeRequest = async (data: {
  workflow_id: number;
  workflow_code?: string;
  workflow_name_eng?: string;
  workflow_name_arb?: string;
  workflow_category_eng?: string;
  workflow_category_arb?: string;
}) => {
  const { workflow_id, ...payload } = data;

  return apiRequest(`/workflowType/edit/${workflow_id}`, "PUT", payload);
};

// Function to add a new workflow type step
export const addWorkflowTypeStepRequest = async (data: {
  workflow_steps_id?: number;
  workflow_id?: number;
  step_order: number;
  step_eng?: string;
  step_arb?: string;
  role_id?: number;
  is_final_step?: boolean;
}) => {
  return apiRequest("/workflowTypeStep/add", "POST", data);
};

// Function to edit a workflow type step
export const editWorkflowTypeStepRequest = async (data: {
  workflow_steps_id?: number;
  workflow_id?: number;
  step_order: number;
  step_eng?: string;
  step_arb?: string;
  role_id?: number;
  is_final_step?: boolean;
}) => {
  const { workflow_steps_id, ...payload } = data;

  return apiRequest(`/workflowTypeStep/edit/${workflow_steps_id}`, "PUT", payload);
};

// Function to add a new permission type
export const addPermissionTypeRequest = async (data: {
  permission_type_id?: number;
  permission_type_code: string;
  permission_type_eng: string;
  permission_type_arb: string;
  group_apply_flag: boolean;
  status_flag: boolean;
  [key: string]: any;
}) => {
  return apiRequest("/permissionType/add", "POST", data);
};

// Function to edit a permission type
export const editPermissionTypeRequest = async (data: {
  permission_type_id: number;
  permission_type_code?: string;
  permission_type_eng?: string;
  permission_type_arb?: string;
  group_apply_flag?: boolean;
  status_flag?: boolean;
  [key: string]: any;
}) => {
  const { permission_type_id, ...payload } = data;

  return apiRequest(`/permissionType/edit/${permission_type_id}`, "PUT", payload);
};

// Function to add a new permission application
export const addShortPermissionRequest = async (data: {
  single_permission_id?: number;
  permission_type_id: number;
  employee_id: number;
  remarks?: string;
  from_date?: string;
  to_date?: string;
  from_time?: string;
  to_time?: string;
  perm_minutes?: number;
}) => {
  return apiRequest("/employeeShortPermission/add", "POST", data);
};

// Function to edit a permission application
export const editShortPermissionRequest = async (data: {
  single_permission_id: number;
  permission_type_id?: number;
  employee_id?: number;
  remarks?: string;
  from_date?: string;
  to_date?: string;
  from_time?: string;
  to_time?: string;
  perm_minutes?: number;
}) => {
  const { single_permission_id, ...payload } = data;

  return apiRequest(`/employeeShortPermission/edit/${single_permission_id}`, "PUT", payload);
};

// Function to get pending permissions
export const getPendingPermission= async () => {
  return apiRequest('/employeeShortPermission/pending', "GET");
};

// Function to approve or reject permissions
export const approvePermissionRequest= async (data: {
  single_permissions_id?: number;
  approve_reject_flag: number;
}) => {
  const { single_permissions_id, ...payload } = data;

  return apiRequest(`/employeeShortPermission/approve/${single_permissions_id}`, "PUT", payload);
};

// Function to fetch permission for a specific employee
export const getPermissionByEmployeeId = async (data: {
  employee_id?: number;
}) => {
  const { employee_id } = data;
  return apiRequest(`/employeeShortPermission/byemployee/${employee_id}`, "GET");
}

// Function to add a new leave type
export const addLeaveTypeRequest = async (data: {
  leave_type_id?: number;
  leave_type_code: string;
  leave_type_eng: string;
  leave_type_arb: string;
  status_flag: boolean;
  [key: string]: any;
}) => {
  return apiRequest("/leaveType/add", "POST", data);
};

// Function to edit a leave type
export const editLeaveTypeRequest = async (data: {
  leave_type_id: number;
  leave_type_code?: string;
  leave_type_eng?: string;
  leave_type_arb?: string;
  status_flag?: boolean;
  [key: string]: any;
}) => {
  const { leave_type_id, ...payload } = data;

  return apiRequest(`/leaveType/edit/${leave_type_id}`, "PUT", payload);
};

// Function to add a new leave
export const addLeaveRequest = async (form: {
  employee_leave_id?: number;
  leave_type_id: number;
  employee_id: number;
  from_date: string;
  to_date: string;
  [key: string]: any;
}) => {
  const formData = new FormData();

  for (const key in form) {
    const value = form[key];

    if (value !== undefined && value !== null) {
      // Handle files safely if needed
      if (value instanceof File || value instanceof Blob) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    }
  }

  return apiRequest("/employeeLeave/add", "POST", formData);
};


// Function to get pending permissions
export const getPendingLeave= async () => {
  return apiRequest('/employeeLeave/pending', "GET");
};

// Function to approve or reject permissions
export const approveLeaveRequest= async (data: {
  employee_leave_id?: number;
  approve_reject_flag: number;
}) => {
  const { employee_leave_id, ...payload } = data;

  return apiRequest(`/employeeLeave/approve/${employee_leave_id}`, "PUT", payload);
};

// Function to fetch event transaction of specfic employee
export const getEmployeeTransactionById = async (data: {
  employee_id?: number;
}) => {
  const { employee_id } = data;

  return apiRequest(`/employeeEventTransaction/employee/${employee_id}`, "GET");
};

// Function to add a new role privilege
export const addRolePrivilegeRequest = async (data: {
  role_id?: number;
  sub_module_id: number;
  scope?: string;
  access_flag?: boolean;
  view_flag?: boolean;
  create_flag?: boolean;
  edit_flag?: boolean;
  delete_flag?: boolean;
}) => {
  return apiRequest("/secRolePrivilege/add", "POST", data);
}

// Function to update a role privilege
export const editRolePrivilegeRequest = async (data: {
  role_privilege_id?:number;
  role_id?: number;
  sub_module_id?: number;
  scope?: string;
  access_flag?: boolean;
  view_flag?: boolean;
  create_flag?: boolean;
  edit_flag?: boolean;
  delete_flag?: boolean;
}) => {
  const { role_privilege_id, ...payload } = data;

  return apiRequest(`/secRolePrivilege/edit/${role_privilege_id}`, "PUT", payload);
}

// Function to add a new role privilege
export const addRoleTabPrivilegeRequest = async (data: {
  role_id?: number;
  tab_id: number;
  sub_module_id: number;
  access_flag?: boolean;
  view_flag?: boolean;
  create_flag?: boolean;
  edit_flag?: boolean;
  delete_flag?: boolean;
}) => {
  return apiRequest("/secRoleTabPrivilege/add", "POST", data);
}

// Function to update a role privilege
export const editRoleTabPrivilegeRequest = async (data: {
  role_tab_privilege_id?:number;
  role_id?: number;
  tab_id?: number;
  sub_module_id?: number;
  access_flag?: boolean;
  view_flag?: boolean;
  create_flag?: boolean;
  edit_flag?: boolean;
  delete_flag?: boolean;
}) => {
  const { role_tab_privilege_id, ...payload } = data;

  return apiRequest(`/secRoleTabPrivilege/edit/${role_tab_privilege_id}`, "PUT", payload);
}

// Function to add a new privilege
export const addPrivilegeRequest = async (data: {
  privilege_name?: string;
  module_id: number;
}) => {
  return apiRequest("/secPrivilege/add", "POST", data);
}

// Function to delete a privilege
export const deletePrivilegeRequest = async (privilege_id: number) => {
  return apiRequest(`/secPrivilege/delete/${privilege_id}`, "DELETE");
};

// Function to add new a user to role
export const addRoletoUser = async (data: {
  user_id: number;
  role_id: number;
}) => {
  return apiRequest("/secUserRole/add", "POST", data);
}

// Function to add new a transaction
export const addEventTransaction = async (data: {
  transaction_id?: number;
  employee_id: number;
  transaction_time: string;
  reason: string;
  user_entry_flag: boolean;
  [key: string]: any;
}) => {
  return apiRequest("/employeeEventTransaction/add", "POST", data);
}

// Function to fetch reports of specfic employee
export const getReportByEmployeeId = async (data: {
  employee_id?: number;
}) => {
  const { employee_id } = data;

  return apiRequest(`/report/employee/${employee_id}`, "GET");
};

// Function to add a new device
export const addDeviceRequest = async (data: {
  device_id?: number;
  device_no: string;
  device_name: string;
  device_status?: boolean;
}) => {
  return apiRequest("/device/add", "POST", data);
};

// Function to edit a device by ID
export const editDeviceRequest = async (data: {
  device_id: number;
  device_no: string;
  device_name: string;
  device_status?: boolean;
}) => {
  const { device_id, ...payload } = data;

  return apiRequest(`/device/edit/${device_id}`, "PUT", payload);
};

// Functions for dashboard
export const getDashboardData = async (action: string) => {
  return apiRequest(`/dashboard/data?action=${action}`, "GET");
};
// Functions for dashboard - separate endpoints
export const getAttendanceDetails = async () => {
  return apiRequest('/dashboard/attendance', "GET");
};

export const getWorkSchedule = async () => {
  return apiRequest('/dashboard/work-schedule', "GET");
};

export const getLeaveAnalytics = async (year?: number) => {
  const queryParam = year ? `?year=${year}` : '';
  return apiRequest(`/dashboard/leave-analytics${queryParam}`, "GET");
};

export const getWorkHourTrends = async (month?: string) => {
  const queryParam = month ? `?month=${month}` : '';
  return apiRequest(`/dashboard/work-hour-trends${queryParam}`, "GET");
};

// Helper function to fetch all dashboard data
export const getAllDashboardData = async () => {
  try {    
    const [attendance, schedule, leaves, workHours] = await Promise.all([
      getAttendanceDetails(),
      getWorkSchedule(),
      getLeaveAnalytics(),
      getWorkHourTrends()
    ]);
    
    console.log('Dashboard data fetched:', {
      attendance,
      schedule,
      leaves,
      workHours
    });
    
    return {
      success: true,
      data: {
        getMyAttnDetails: attendance?.success ? attendance.data : [],
        WorkSchedule: schedule?.success ? schedule.data : [],
        getLeaveAnalytics: leaves?.success ? leaves.data : [],
        WorkHourTrends: workHours?.success ? workHours.data : []
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      success: false,
      data: null,
      error: 'Failed to fetch dashboard data'
    };
  }
};

// Function to add a new db setting
export const addDBSettingRequest = async (data: {
  db_settings_id?: number;
  db_databasetype: string;
  db_databasename: string;
  db_host_name: string;
  db_port_no: string;
  db_username: string;
  db_password: string;
  em_encryption: string;
  connect_db_flag: boolean;
}) => {
  return apiRequest("/dbSetting/add", "POST", data);
};

// Function to edit an db setting by ID
export const editDBSettingRequest = async (data: {
  db_settings_id: number;
  db_databasetype: string;
  db_databasename: string;
  db_host_name: string;
  db_port_no: string;
  db_username: string;
  db_password: string;
  em_encryption: string;
  connect_db_flag: boolean;
}) => {
  const { db_settings_id, ...payload } = data;

  return apiRequest(`/dbSetting/edit/${db_settings_id}`, "PUT", payload);
};


// Function to add a new email setting
export const addEmailSettingRequest = async (data: {
  em_id?: number;
  em_smtp_name: string;
  em_smtp_password: string;
  em_host_name: string;
  em_port_no: string;
  em_from_email: string;
  em_encryption: string;
  em_active_smtp_flag: boolean;
  created_id: number;
  last_updated_id: number;
}) => {
  return apiRequest("/emailSetting/add", "POST", data);
};

// Function to edit an email setting by ID
export const editEmailSettingRequest = async (data: {
  em_id: number;
  em_smtp_name: string;
  em_smtp_password: string;
  em_host_name: string;
  em_port_no: string;
  em_from_email: string;
  em_encryption: string;
  em_active_smtp_flag: boolean;
  created_id?: number;
  last_updated_id: number;
}) => {
  const { em_id, ...payload } = data;

  return apiRequest(`/emailSetting/edit/${em_id}`, "PUT", payload);
};

// Function to send a test email
export const sendTestEmailRequest = async (data: {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
}) => {
  return apiRequest(`/emailSetting/test`, "POST", data);
};
