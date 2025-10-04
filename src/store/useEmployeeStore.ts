// import { create } from "zustand";
// import { persist } from "zustand/middleware";

// export interface Employee {
//   employee_id: number;
//   emp_no: string;
//   firstname_eng: string;
//   lastname_eng: string;
//   firstname_arb: string;
//   lastname_arb: string;
//   card_number: string;
//   pin: string;
//   organization_id: number;
//   grade_id: number | null;
//   designation_id: number | null;
//   citizenship_id: number | null;
//   employee_type_id: number | null;
//   join_date: string | null;
//   active_date: string | null;
//   inactive_date: string | null;
//   national_id: string | null;
//   national_id_expiry_date: string | null;
//   passport_number: string | null;
//   passport_expiry_date: string | null;
//   passport_issue_country_id: number | null;
//   mobile: string;
//   email: string;
//   active_flag: boolean;
//   gender: string;
//   local_flag: boolean;
//   punch_flag: boolean;
//   on_reports_flag: boolean;
//   email_notifications_flag: boolean;
//   include_email_flag: boolean;
//   open_shift_flag: boolean;
//   overtime_flag: boolean;
//   web_punch_flag: boolean;
//   shift_flag: boolean;
//   check_inout_selfie_flag: boolean;
//   calculate_monthly_missed_hrs_flag: boolean;
//   exclude_from_integration_flag: boolean;
//   photo_file_name: string | null;
//   manager_flag: boolean | null;
//   manager_id: number | null;
//   inpayroll_flag: boolean;
//   share_roster_flag: boolean;
//   location_id: number | null;
//   contract_company_id: number | null;
//   remarks: string | null;
//   geofence_flag: boolean;
//   created_id: number;
//   created_date: string;
//   last_updated_id: number;
//   last_updated_date: string;
//   local_user_flag: boolean;
//   SAP_user_flag: boolean;
// }

// interface EmployeeStore {
//   employees: Employee[];
//   selectedEmployee: Employee | null;
//   total: number;
//   hasNext: boolean;

//   setEmployees: (employees: Employee[], total: number, hasNext: boolean) => void;
//   setSelectedEmployee: (employee: Employee | null) => void;
//   addEmployee: (employee: Employee) => void;
//   updateEmployee: (employee: Employee) => void;
//   removeEmployee: (employee_id: number) => void;
// }

// export const useEmployeeStore = create<EmployeeStore>()(
//   persist(
//     (set, get) => ({
//       employees: [],
//       selectedEmployee: null,
//       total: 0,
//       hasNext: false,

//       setEmployees: (employees, total, hasNext) =>
//         set({ employees, total, hasNext }),

//       setSelectedEmployee: (employee) => set({ selectedEmployee: employee }),

//       addEmployee: (employee) =>
//         set((state) => ({ employees: [...state.employees, employee] })),

//       updateEmployee: (employee) =>
//         set((state) => ({
//           employees: state.employees.map((e) =>
//             e.employee_id === employee.employee_id ? employee : e
//           ),
//         })),

//       removeEmployee: (employee_id) =>
//         set((state) => ({
//           employees: state.employees.filter((e) => e.employee_id !== employee_id),
//         })),
//     }),
//     {
//       name: "employee-storage",
//       partialize: (state) => ({ selectedEmployee: state.selectedEmployee }),
//     }
//   )
// );
// src/stores/useEmployeeStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface EmployeeStore {
  selectedEmployee: any | null;
  setSelectedEmployee: (employee: any | null) => void;
  clearSelectedEmployee: () => void;

  personalFormData: any;
  setPersonalFormData: (data: any) => void;

  credentialsFormData: any;
  setCredentialsFormData: (data: any) => void;

  officialFormData: any;
  setOfficialFormData: (data: any) => void;

  flagsFormData: any;
  setFlagsFormData: (data: any) => void;
}

export const useEmployeeStore = create<EmployeeStore>()(
  persist(
    (set) => ({
      selectedEmployee: null,
      setSelectedEmployee: (employee) => set({ selectedEmployee: employee }),
      clearSelectedEmployee: () => set({ selectedEmployee: null }),

      personalFormData: {},
      setPersonalFormData: (data) => set({ personalFormData: data }),

      credentialsFormData: {},
      setCredentialsFormData: (data) => set({ credentialsFormData: data }),

      officialFormData: {},
      setOfficialFormData: (data) => set({ officialFormData: data }),

      flagsFormData: {},
      setFlagsFormData: (data) => set({ flagsFormData: data }),
    }),
    {
      name: "employee-onboarding-store",
      partialize: (state) => ({ selectedEmployee: state.selectedEmployee }),
    }
  )
);
