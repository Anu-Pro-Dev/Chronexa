"use client";
import { useCallback } from "react";
import { apiRequest } from "@/src/lib/apiHandler";
import { getFirstAccessibleRoute } from "@/src/lib/getFirstAccessibleRoute";
import { useDashboardStore } from "@/src/store/useDashboardStore";

export function usePostLoginRedirect() {
  const setRole = useDashboardStore((s) => s.setRole);

  const redirectAfterLogin = useCallback(
    async (roleId: number | string | null | undefined) => {
      const FALLBACK = "/dashboard";

      if (!roleId) {
        window.location.href = FALLBACK;
        return;
      }

      const numericRoleId = Number(roleId);
      setRole(numericRoleId);

      try {
        const res = await apiRequest(
          `/secRolePrivilege?roleId=${numericRoleId}`,
          "GET"
        );

        const raw = res?.data;
        if (!raw || (Array.isArray(raw) && raw.length === 0)) {
          window.location.href = FALLBACK;
          return;
        }

        const data = Array.isArray(raw) ? raw[0] : raw;

        const privilegeMap: Record<string, any> = {};

        Object.keys(data).forEach((moduleKey) => {
          const moduleData = data[moduleKey];
          if (typeof moduleData !== "object" || moduleData === null) return;

          const enhancedSubModules = (moduleData.subModules || []).map(
            (sub: any) => ({
              ...sub,
              hasView: sub.privileges?.view === true,
              tabs: (sub.tabs || []).map((tab: any) => ({
                ...tab,
                hasView: tab.privileges?.view === true,
              })),
            })
          );

          privilegeMap[moduleKey] = {
            ...moduleData,
            hasView: moduleData.allowed === true,
            subModules: enhancedSubModules,
          };
        });

        const destination = getFirstAccessibleRoute(privilegeMap);
        window.location.href = destination;
      } catch (err) {
        console.error("Failed to fetch privileges for redirect:", err);
        window.location.href = FALLBACK;
      }
    },
    [setRole]
  );

  return { redirectAfterLogin };
}