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
 * IMPORTANT: After fetching privileges we write them directly into the
 * dashboard store so the destination layout (PrivilegeProvider → useRBAC)
 * sees `loadedPrivileges: true` immediately and doesn't re-fetch or flash
 * a loading screen.
 *
 * Falls back to "/dashboard" if the fetch fails or no viewable route exists.
 */
export function usePostLoginRedirect() {
  const router = useRouter();

  const redirectAfterLogin = useCallback(
    async (roleId: number | string | null | undefined) => {
      const FALLBACK = "/dashboard";

      if (!roleId) {
        router.push(FALLBACK);
        return;
      }

      const numericRoleId = Number(roleId);

      try {
        const res = await apiRequest(
          `/secRolePrivilege?roleId=${numericRoleId}`,
          "GET"
        );

        const raw = res?.data;
        if (!raw || (Array.isArray(raw) && raw.length === 0)) {
          // Store the role even on empty privileges so the layout doesn't
          // try to re-fetch indefinitely.
          useDashboardStore.setState({
            roleId: numericRoleId,
            privileges: [],
            loadedPrivileges: true,
            loadingPrivileges: false,
          });
          router.push(FALLBACK);
          return;
        }

        // ── Persist privileges in the store BEFORE navigating ────────────
        // This is the key fix: the destination page's PrivilegeProvider
        // (via useRBAC) checks `loadedPrivileges` — if it's already true
        // and `privileges` is populated, it skips the fetch entirely.
        //
        // We store the raw API response exactly as fetchPrivileges() would.
        const rawPrivileges = Array.isArray(raw) ? raw : [raw];

        useDashboardStore.setState({
          roleId: numericRoleId,
          privileges: rawPrivileges,
          loadedPrivileges: true,
          loadingPrivileges: false,
        });

        // ── Derive the first accessible route (same logic as before) ─────
        const data = rawPrivileges[0];
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
        // Even on error, mark as loaded so the layout doesn't spin forever
        useDashboardStore.setState({
          roleId: numericRoleId,
          privileges: [],
          loadedPrivileges: true,
          loadingPrivileges: false,
        });
        router.push(FALLBACK);
      }
    },
    [router]
  );

  return { redirectAfterLogin };
}