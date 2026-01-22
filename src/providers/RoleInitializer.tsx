"use client";
import { useEffect } from "react";
import { useDashboardStore } from "@/src/store/useDashboardStore";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";

export function RoleInitializer() {
  const { userInfo } = useAuthGuard();

  const roleId = useDashboardStore((s) => s.roleId);
  const setRole = useDashboardStore((s) => s.setRole);
  const fetchPrivileges = useDashboardStore((s) => s.fetchPrivileges);
  const clearRoleAndPrivileges = useDashboardStore((s) => s.clearRoleAndPrivileges);

  useEffect(() => {
    if (!userInfo?.roleId) {
      clearRoleAndPrivileges();
      return;
    }

    if (userInfo.roleId !== roleId) {
      setRole(userInfo.roleId);
    }
  }, [userInfo?.roleId, roleId, setRole, clearRoleAndPrivileges]);

  useEffect(() => {
    if (roleId) {
      fetchPrivileges();
    }
  }, [roleId, fetchPrivileges]);

  return null;
}
