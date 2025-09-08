import { create } from "zustand";

interface ScheduleEditState {
  selectedRowData: any;
  setSelectedRowData: (data: any) => void;
  clearSelectedRowData: () => void;
}

export const useScheduleEditStore = create<ScheduleEditState>((set) => ({
  selectedRowData: null,
  setSelectedRowData: (data) => set({ selectedRowData: data }),
  clearSelectedRowData: () => set({ selectedRowData: null }),
}));

