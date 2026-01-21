"use client";
import { useEffect, useRef } from "react";
import { useDashboardStore } from "@/src/store/useDashboardStore";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";

export function RoleInitializer() {
  const { userInfo } = useAuthGuard();
  const setRole = useDashboardStore((s) => s.setRole);
  const fetchPrivileges = useDashboardStore((s) => s.fetchPrivileges);
  const clearRoleAndPrivileges = useDashboardStore((s) => s.clearRoleAndPrivileges);
  const roleId = useDashboardStore((s) => s.roleId);
  const privileges = useDashboardStore((s) => s.privileges);
  const loadedPrivileges = useDashboardStore((s) => s.loadedPrivileges);
  
  const lastUserRoleIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!userInfo?.roleId) {
      lastUserRoleIdRef.current = null;
      return;
    }
    
    const currentUserRoleId = userInfo.roleId;
    
    const isDifferentUser = lastUserRoleIdRef.current !== null && 
                           lastUserRoleIdRef.current !== currentUserRoleId;
    
    const hasValidCacheForThisUser = 
      loadedPrivileges && 
      roleId === currentUserRoleId && 
      Array.isArray(privileges) && 
      privileges.length > 0;
    
    if (isDifferentUser) {
      clearRoleAndPrivileges();
    }
    
    if (!hasValidCacheForThisUser || isDifferentUser) {      
      lastUserRoleIdRef.current = currentUserRoleId;
      
      setRole(currentUserRoleId);
      
      setTimeout(() => {
        fetchPrivileges();
      }, 0);
    } else {
      lastUserRoleIdRef.current = currentUserRoleId;
    }
  }, [userInfo?.roleId, setRole, fetchPrivileges, clearRoleAndPrivileges, loadedPrivileges, roleId, privileges]);

  return null;
}