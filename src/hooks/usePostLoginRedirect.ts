"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/src/lib/apiHandler";
import { getFirstAccessibleRoute } from "@/src/lib/getFirstAccessibleRoute";
import { useDashboardStore } from "@/src/store/useDashboardStore";
import { useAuthStore } from "@/src/store/useAuthStore";

/**
 * Returns a `redirectAfterLogin(roleId)` function.
 *
 * Call it right after the token is stored.  It fetches the role's privilege
 * map, derives the first accessible route, and pushes the router there.
 *
 * Key behaviors:
 *  1. Directly marks the auth store as authenticated so useAuthGuard on the
 *     destination page doesn't see a brief unauthenticated state and redirect
 *     back to "/".
 *  2. Stores fetched privileges in the dashboard store BEFORE navigating so
 *     PrivilegeProvider/useRBAC don't re-fetch or show a loading screen.
 *  3. Uses a small delay before router.replace() to let Zustand state propagate.
 *
 * Falls back to "/dashboard" if the fetch fails or no viewable route exists.
 */
export function usePostLoginRedirect() {
  const router = useRouter();

  const redirectAfterLogin = useCallback(
    async (roleId: number | string | null | undefined, loginResponse?: any) => {
      const FALLBACK = "/dashboard";

      // ── Mark auth store as authenticated immediately ──────────────────
      // loginRequest() already stored the token + user in storage. But the
      // auth store was initialized on the login page when there was no token,
      // so it has isAuthenticated=false. We update it directly here rather
      // than resetting _initialized (which causes a brief unauthenticated
      // state that triggers useAuthGuard's redirect-to-"/" loop).
      //
      // We read from storage the same way initialize() does, but we also
      // accept the login response directly for faster access.
      const user = loginResponse?.user ?? (() => {
        try {
          const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
          return raw ? JSON.parse(raw) : null;
        } catch { return null; }
      })();

      if (user) {
        useAuthStore.setState({
          isAuthenticated: true,
          isChecking: false,
          employeeId: user.employeenumber ? Number(user.employeenumber) : (user.id ? Number(user.id) : null),
          userInfo: user,
          userRole: user.role ? String(user.role) : (user.roleId ? String(user.roleId) : ''),
          isGeofenceEnabled: Boolean(user.isGeofence),
          _initialized: true,
        });
      }

      if (!roleId) {
        useDashboardStore.setState({
          roleId: null,
          privileges: [],
          loadedPrivileges: true,
          loadingPrivileges: false,
        });
        router.replace(FALLBACK);
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
          useDashboardStore.setState({
            roleId: numericRoleId,
            privileges: [],
            loadedPrivileges: true,
            loadingPrivileges: false,
          });
          router.replace(FALLBACK);
          return;
        }

        // ── Persist privileges in the store BEFORE navigating ────────────
        const rawPrivileges = Array.isArray(raw) ? raw : [raw];

        useDashboardStore.setState({
          roleId: numericRoleId,
          privileges: rawPrivileges,
          loadedPrivileges: true,
          loadingPrivileges: false,
        });

        // ── Derive the first accessible route ────────────────────────────
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

        // Return a promise that resolves only after navigation starts.
        // This keeps the caller (LoginForm) in its loading state until
        // the page actually transitions — no flicker.
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            router.replace(destination);
            // Don't resolve — let the component unmount naturally
            // when the route changes. This prevents the login button
            // from flickering back to "Login" before the page transitions.
          }, 100);
        });
      } catch (err) {
        console.error("Failed to fetch privileges for redirect:", err);
        useDashboardStore.setState({
          roleId: numericRoleId,
          privileges: [],
          loadedPrivileges: true,
          loadingPrivileges: false,
        });
        router.replace(FALLBACK);
      }
    },
    [router]
  );

  return { redirectAfterLogin };
}