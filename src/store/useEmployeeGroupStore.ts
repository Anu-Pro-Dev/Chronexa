import { create } from "zustand";

interface EmployeeGroupState {
  groupId: number | null;
  groupCode: string | null;
  setGroup: (id: number, code: string) => void;
  clearGroup: () => void;
}

export const useEmployeeGroupStore = create<EmployeeGroupState>((set) => ({
  groupId: null,
  groupCode: null,
  setGroup: (id, code) => set({ groupId: id, groupCode: code }),
  clearGroup: () => set({ groupId: null, groupCode: null }),
}));
