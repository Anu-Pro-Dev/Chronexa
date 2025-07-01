// Employee API request functions
import { apiRequest } from "@/lib/apiHandler"; // Assuming you have a similar apiRequest utility

// Types for employee data
export interface EmployeeFormData {
  // Personal Form Fields
  emp_no: string;
  emp_id: string;
  firstname: string;
  lastname: string;
  mobile: string;
  email: string;
  join_date: Date;
  inactive_date: Date;
  card_number?: string;
  pin?: string;
  gender?: string;
  passport_number?: string;
  passport_expiry?: Date;
  passport_issued?: string;
  national_id_number?: string;
  national_id_expiry?: Date;
  remarks?: string;
  employee_system_activation?: Date;
  
  // Credentials Form Fields
  username: string;
  password: string;
  
  // Official Form Fields
  user_type: string;
  location: string;
  citizenship: string;
  designation: string;
  grade: string;
  organization_type: string;
  organization: string;
  manager?: string;
  manager_flag: boolean;
  
  // Flags Form Fields
  active: boolean;
  punch: boolean;
  overtime: boolean;
  inpayroll: boolean;
  email_notification: boolean;
  open_shift: boolean;
  monthly_missed_hours: boolean;
  exclude_from_integration: boolean;
  shift: boolean;
  on_report: boolean;
  share_roster: boolean;
  include_in_email: boolean;
  web_punch: boolean;
  check_selfie: boolean;
  geo_fench: boolean;
}

// Transform frontend form data to match API structure
const transformEmployeeData = (formData: EmployeeFormData) => {
  return {
    emp_no: formData.emp_no,
    firstname_eng: formData.firstname,
    lastname_eng: formData.lastname,
    firstname_arb: "", // You might want to add Arabic name fields to your form
    lastname_arb: "",
    card_number: formData.card_number || "",
    pin: formData.pin || "",
    organization_id: parseInt(formData.organization) || 1,
    grade_id: parseInt(formData.grade) || 1,
    designation_id: parseInt(formData.designation) || 1,
    citizenship_id: parseInt(formData.citizenship) || 1,
    employee_type_id: parseInt(formData.user_type) || 1,
    join_date: formData.join_date.toISOString(),
    active_date: formData.employee_system_activation?.toISOString() || formData.join_date.toISOString(),
    inactive_date: formData.inactive_date ? formData.inactive_date.toISOString() : null,
    national_id: formData.national_id_number || "",
    national_id_expiry_date: formData.national_id_expiry?.toISOString() || null,
    passport_number: formData.passport_number || "",
    passport_expiry_date: formData.passport_expiry?.toISOString() || null,
    passport_issue_country_Id: 1, // You might want to derive this from passport_issued
    mobile: formData.mobile,
    email: formData.email,
    active_flag: formData.active,
    gender: formData.gender === "1" ? "F" : formData.gender === "2" ? "M" : "M",
    local_flag: true, // Default value, you might want to add this to your form
    punch_flag: formData.punch,
    on_reports_flag: formData.on_report,
    email_notifications_flag: formData.email_notification,
    include_email_flag: formData.include_in_email,
    open_shift_flag: formData.open_shift,
    overtime_flag: formData.overtime,
    web_punch_flag: formData.web_punch,
    shift_flag: formData.shift,
    check_inout_selfie_flag: formData.check_selfie,
    calculate_monthly_missed_hrs_flag: formData.monthly_missed_hours,
    exclude_from_integration_flag: formData.exclude_from_integration,
    photo_file_name: "", // You might want to add photo upload functionality
    manager_flag: formData.manager_flag,
    manager_id: formData.manager ? parseInt(formData.manager) : null,
    inpayroll_flag: formData.inpayroll,
    share_roster_flag: formData.share_roster,
    location_id: parseInt(formData.location) || 1,
    contract_company_id: 1, // Default value, you might want to add this to your form
    remarks: formData.remarks || "",
    geofence_flag: formData.geo_fench
  };
};

// Create new employee
export const createEmployeeRequest = async (formData: EmployeeFormData) => {
  const transformedData = transformEmployeeData(formData);
  return apiRequest("/employee/add", "POST", transformedData);
};

// Edit existing employee
export const editEmployeeRequest = async (employeeId: number, formData: EmployeeFormData) => {
  const transformedData = transformEmployeeData(formData);
  return apiRequest(`/employee/edit/${employeeId}`, "PUT", transformedData);
};

// Get employee by ID
export const getEmployeeRequest = async (employeeId: number) => {
  return apiRequest(`/employee/${employeeId}`, "GET");
};

// Get all employees
export const getEmployeesRequest = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.search) queryParams.append("search", params.search);
  
  const queryString = queryParams.toString();
  return apiRequest(`/employee${queryString ? `?${queryString}` : ""}`, "GET");
};

// Delete employee
export const deleteEmployeeRequest = async (employeeId: number) => {
  return apiRequest(`/employee/delete/${employeeId}`, "DELETE");
};

// Alternative function if you want to use fetch directly instead of apiRequest
export const createEmployeeWithFetch = async (formData: EmployeeFormData) => {
  const transformedData = transformEmployeeData(formData);
  
  const response = await fetch("http://localhost:8000/employee/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transformedData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};