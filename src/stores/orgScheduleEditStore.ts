import { create } from 'zustand';

interface OrgScheduleEditStore {
  selectedRowData: any | null;
  setSelectedRowData: (data: any) => void;
  clearSelectedRowData: () => void;
}

export const useOrgScheduleEditStore = create<OrgScheduleEditStore>((set) => ({
  selectedRowData: null,
  setSelectedRowData: (data) => set({ selectedRowData: data }),
  clearSelectedRowData: () => set({ selectedRowData: null }),
}));