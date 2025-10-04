import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Employee {
  employee_id?: number;
  emp_no?: string;
  firstname_eng?: string;
  lastname_eng?: string;
  firstname_arb?: string;
  lastname_arb?: string;
  [key: string]: any;
}

interface EmployeeEditStore {
  selectedRowData: Employee | null;
  setSelectedRowData: (data: Employee) => void;
  clearSelectedRowData: () => void;
}

export const useEmployeeEditStore = create<EmployeeEditStore>()(
  persist(
    (set) => ({
      selectedRowData: null,
      setSelectedRowData: (data) => set({ selectedRowData: data }),
      clearSelectedRowData: () => set({ selectedRowData: null }),
    }),
    {
      name: "employee-edit-store",
    }
  )
);
