import { create } from "zustand";

interface SelectedOrganizationState {
  selectedOrganizationId: number | null;
  setSelectedOrganizationId: (id: number | null) => void;
}

export const useSelectedOrganization = create<SelectedOrganizationState>((set) => ({
  selectedOrganizationId: null,
  setSelectedOrganizationId: (id) => set({ selectedOrganizationId: id }),
}));