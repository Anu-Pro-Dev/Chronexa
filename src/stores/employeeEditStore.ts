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

