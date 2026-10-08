import { create } from "zustand";

interface SelectedOrganizationState {
  selectedOrganizationId: number | null;
  setSelectedOrganizationId: (id: number | null) => void;
  selectedCompanyOrgIds: number[];
  setSelectedCompanyOrgIds: (ids: number[]) => void;
  selectedVerticalIds: number[];
  setSelectedVerticalIds: (ids: number[]) => void;
  selectedDepartmentIds: number[];
  setSelectedDepartmentIds: (ids: number[]) => void;
  resetFilterSelection: () => void;
}

export const useSelectedOrganization = create<SelectedOrganizationState>((set) => ({
  selectedOrganizationId: null,
  setSelectedOrganizationId: (id) =>
    set({
      selectedOrganizationId: id,
      selectedCompanyOrgIds: id ? [id] : [],
    }),
  selectedCompanyOrgIds: [],
  setSelectedCompanyOrgIds: (ids) =>
    set({
      selectedCompanyOrgIds: ids,
      selectedOrganizationId: ids.length === 1 ? ids[0] : (ids[0] ?? null),
    }),
  selectedVerticalIds: [],
  setSelectedVerticalIds: (ids) => set({ selectedVerticalIds: ids }),
  selectedDepartmentIds: [],
  setSelectedDepartmentIds: (ids) => set({ selectedDepartmentIds: ids }),
  resetFilterSelection: () =>
    set({
      selectedOrganizationId: null,
      selectedCompanyOrgIds: [],
      selectedVerticalIds: [],
      selectedDepartmentIds: [],
    }),
}));