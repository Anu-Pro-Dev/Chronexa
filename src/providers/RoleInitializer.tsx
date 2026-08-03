"use client";
import { useEffect } from "react";
import { useDashboardStore } from "@/src/store/useDashboardStore";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";

export function RoleInitializer() {
  const { userInfo, isChecking, isAuthenticated } = useAuthGuard();

  const roleId = useDashboardStore((s) => s.roleId);
  const setRole = useDashboardStore((s) => s.setRole);
  const loadedPrivileges = useDashboardStore((s) => s.loadedPrivileges);
  const loadingPrivileges = useDashboardStore((s) => s.loadingPrivileges);
  const fetchPrivileges = useDashboardStore((s) => s.fetchPrivileges);
  const clearRoleAndPrivileges = useDashboardStore((s) => s.clearRoleAndPrivileges);

  // Sync roleId from auth → dashboard store.
  // IMPORTANT: Wait until auth store has finished checking (isChecking === false)
  // before deciding to clear. During the brief window after navigation but before
  // the auth store re-initializes, userInfo is null — clearing here would wipe
  // the privileges that usePostLoginRedirect just stored.
  //
  // Fallback: if profile rehydration (e.g. /auth/me) failed and userInfo.roleId
  // is missing, reuse the roleId already persisted in the dashboard store —
  // but ONLY while the user is genuinely authenticated, so a stale persisted
  // roleId can never leak onto the public login page.
  useEffect(() => {
    if (isChecking) return;                 // auth store not ready yet — wait

    const effectiveRoleId = userInfo?.roleId ?? (isAuthenticated ? roleId : null);

    if (!effectiveRoleId) {
      clearRoleAndPrivileges();
      return;
    }

    if (effectiveRoleId !== roleId) {
      setRole(effectiveRoleId);
    }
  }, [isChecking, isAuthenticated, userInfo?.roleId, roleId, setRole, clearRoleAndPrivileges]);

  // Fetch privileges only if the store doesn't already have them.
  // usePostLoginRedirect now pre-populates the store, so on the first
  // post-login navigation this effect will see loadedPrivileges === true
  // and exit immediately — no duplicate network call.
  useEffect(() => {
    if (roleId && !loadedPrivileges && !loadingPrivileges) {
      fetchPrivileges();
    }
  }, [roleId, loadedPrivileges, loadingPrivileges, fetchPrivileges]);

  return null;
}