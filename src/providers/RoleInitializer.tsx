"use client";
import { useEffect } from "react";
import { useDashboardStore } from "@/src/store/useDashboardStore";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";

export function RoleInitializer() {
  const { userInfo, isChecking } = useAuthGuard();

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
  useEffect(() => {
    if (isChecking) return;                 // auth store not ready yet — wait

    if (!userInfo?.roleId) {
      clearRoleAndPrivileges();
      return;
    }

    if (userInfo.roleId !== roleId) {
      setRole(userInfo.roleId);
    }
  }, [isChecking, userInfo?.roleId, roleId, setRole, clearRoleAndPrivileges]);

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