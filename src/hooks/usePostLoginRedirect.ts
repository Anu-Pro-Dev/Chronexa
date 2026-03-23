"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/src/lib/apiHandler";
import { getFirstAccessibleRoute } from "@/src/lib/getFirstAccessibleRoute";
import { useDashboardStore } from "@/src/store/useDashboardStore";

/**
 * Returns a `redirectAfterLogin(roleId)` function.
 *
 * Call it right after the token is stored.  It fetches the role's privilege
 * map, derives the first accessible route, and pushes the router there.
 *
 * Falls back to "/dashboard" if the fetch fails or no viewable route exists.
 */
export function usePostLoginRedirect() {
  const router = useRouter();
  const setRole = useDashboardStore((s) => s.setRole);

  const redirectAfterLogin = useCallback(
    async (roleId: number | string | null | undefined) => {
      const FALLBACK = "/dashboard";

      if (!roleId) {
        router.push(FALLBACK);
        return;
      }

      const numericRoleId = Number(roleId);

      // Persist the role in the store so the rest of the app picks it up
      setRole(numericRoleId);

      try {
        const res = await apiRequest(
          `/secRolePrivilege?roleId=${numericRoleId}`,
          "GET"
        );

        const raw = res?.data;
        if (!raw || (Array.isArray(raw) && raw.length === 0)) {
          router.push(FALLBACK);
          return;
        }

        // The store normalises privileges as an array; the actual map is [0]
        const data = Array.isArray(raw) ? raw[0] : raw;

        // Build a lightweight privilegeMap (hasView only — we don't need full RBAC here)
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
        router.push(destination);
      } catch (err) {
        console.error("Failed to fetch privileges for redirect:", err);
        router.push(FALLBACK);
      }
    },
    [router, setRole]
  );

  return { redirectAfterLogin };
}