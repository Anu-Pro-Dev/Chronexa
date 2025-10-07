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
