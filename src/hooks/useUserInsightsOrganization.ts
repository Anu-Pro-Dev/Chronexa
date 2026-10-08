"use client";

import * as React from "react";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useSelectedOrganization } from "@/src/store/useSelectedOrganization";

const STORAGE_KEYS = [
  "loginResponse",
  "userData",
  "user",
  "currentUser",
  "authUser",
  "employee",
  "userProfile",
];

function readOrganizationIdFromStorage(): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  for (const key of STORAGE_KEYS) {
    const raw = localStorage.getItem(key) || sessionStorage.getItem(key);

    if (!raw) {
      continue;
    }

    try {
      const parsed = JSON.parse(raw);
      const userData = parsed?.user && typeof parsed.user === "object" ? parsed.user : parsed;
      const organizationId = userData?.organization?.id;

      if (organizationId) {
        return Number(organizationId);
      }
    } catch {
      // Ignore malformed storage entries and keep checking the remaining keys.
    }
  }

  return null;
}

export function useUserInsightsOrganization() {
  const userInfo = useAuthStore((state) => state.userInfo);
  const isChecking = useAuthStore((state) => state.isChecking);
  const selectedOrganizationId = useSelectedOrganization((s) => s.selectedOrganizationId);
  const selectedCompanyOrgIds = useSelectedOrganization((s) => s.selectedCompanyOrgIds);
  const selectedVerticalIds = useSelectedOrganization((s) => s.selectedVerticalIds);
  const selectedDepartmentIds = useSelectedOrganization((s) => s.selectedDepartmentIds);

  const defaultOrganizationId = React.useMemo(() => {
    if (userInfo?.organization?.id) {
      return Number(userInfo.organization.id);
    }
    return readOrganizationIdFromStorage();
  }, [userInfo]);

  const organizationId = selectedOrganizationId;

  // Effective company IDs (multi or single)
  const activeCompanyIds = React.useMemo(() => {
    if (selectedCompanyOrgIds && selectedCompanyOrgIds.length > 0) {
      return selectedCompanyOrgIds;
    }
    if (selectedOrganizationId) {
      return [selectedOrganizationId];
    }
    return [];
  }, [selectedCompanyOrgIds, selectedOrganizationId]);

  // Build cache / request key representation of current scope
  const scopeKey = React.useMemo(() => {
    const parts: string[] = [];
    if (activeCompanyIds.length > 0) {
      parts.push(`org_${[...activeCompanyIds].sort((a, b) => a - b).join(",")}`);
    } else if (selectedVerticalIds && selectedVerticalIds.length > 0) {
      parts.push(`v_${[...selectedVerticalIds].sort((a, b) => a - b).join(",")}`);
    }
    if (selectedDepartmentIds && selectedDepartmentIds.length > 0) {
      parts.push(`dept_${[...selectedDepartmentIds].sort((a, b) => a - b).join(",")}`);
    }
    return parts.length > 0 ? parts.join("::") : "default";
  }, [activeCompanyIds, selectedVerticalIds, selectedDepartmentIds]);

  const scopeParams = React.useMemo(() => {
    const params: Record<string, any> = {};
    if (activeCompanyIds.length > 0) {
      params.orgIds = activeCompanyIds.length === 1 ? activeCompanyIds[0] : activeCompanyIds;
    } else if (selectedVerticalIds && selectedVerticalIds.length > 0) {
      params.verticalIds = selectedVerticalIds;
    }
    if (selectedDepartmentIds && selectedDepartmentIds.length > 0) {
      params.deptIds = selectedDepartmentIds;
      params.department_ids = selectedDepartmentIds.join(",");
    }
    return params;
  }, [activeCompanyIds, selectedVerticalIds, selectedDepartmentIds]);

  return {
    organizationId,
    defaultOrganizationId,
    selectedVerticalIds,
    selectedDepartmentIds,
    scopeKey,
    scopeParams,
    isCheckingOrganization: isChecking,
  };
}

