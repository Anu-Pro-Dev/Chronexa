"use client";

import * as React from "react";
import { useAuthStore } from "@/src/store/useAuthStore";

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

  const organizationId = React.useMemo(() => {
    if (userInfo?.organization?.id) {
      return Number(userInfo.organization.id);
    }

    return readOrganizationIdFromStorage();
  }, [userInfo]);

  return {
    organizationId,
    isCheckingOrganization: isChecking && organizationId === null,
  };
}
