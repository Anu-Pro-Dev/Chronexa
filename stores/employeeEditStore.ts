// stores/employeeEditStore.ts
import { create } from "zustand";

interface EmployeeEditState {
  selectedRowData: any;
  setSelectedRowData: (data: any) => void;
  clearSelectedRowData: () => void;
}

export const useEmployeeEditStore = create<EmployeeEditState>((set) => ({
  selectedRowData: null,
  setSelectedRowData: (data) => set({ selectedRowData: data }),
  clearSelectedRowData: () => set({ selectedRowData: null }),
}));

// // stores/employeeEditStore.ts
// import { create } from "zustand";
// import { persist } from "zustand/middleware";

// interface EmployeeEditState {
//   selectedRowData: any;
//   setSelectedRowData: (data: any) => void;
//   clearSelectedRowData: () => void;
// }

// export const useEmployeeEditStore = create<EmployeeEditState>()(
//   persist(
//     (set) => ({
//       selectedRowData: null,
//       setSelectedRowData: (data) => set({ selectedRowData: data }),
//       clearSelectedRowData: () => set({ selectedRowData: null }),
//     }),
//     {
//       name: "employee-edit-store", // LocalStorage key
//     }
//   )
// );
