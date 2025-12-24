import { create } from 'zustand';

interface EmpScheduleEditStore {
  selectedRowData: any | null;
  setSelectedRowData: (data: any) => void;
  clearSelectedRowData: () => void;
}

export const useEmpScheduleEditStore = create<EmpScheduleEditStore>((set) => ({
  selectedRowData: null,
  setSelectedRowData: (data) => set({ selectedRowData: data }),
  clearSelectedRowData: () => set({ selectedRowData: null }),
}));