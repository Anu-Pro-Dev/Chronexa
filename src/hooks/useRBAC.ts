"use client";
import { useMemo } from "react";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";

export function useRBAC() {
  const { userRole } = useAuthGuard();

  const { data: modulesData, isLoading: modulesLoading } = useFetchAllEntity("secModule", {
    removeAll: true,
  });
  
  const { data: subModulesData, isLoading: subModulesLoading } = useFetchAllEntity("secSubModule", {
    removeAll: true,
  });
  
  const { data: rolesData, isLoading: rolesLoading } = useFetchAllEntity("secRole", {
    removeAll: true,
  });

  const roleId = useMemo(() => {
    if (!rolesData?.data || !userRole) return null;

    const role = rolesData.data.find(
      (r: any) => r.role_name.toLowerCase() === userRole.toLowerCase().trim()
    );

    return role?.role_id ?? null;
  }, [rolesData, userRole]);

  const {
    data: rolePrivilegesData,
    isLoading: rolePrivilegesLoading,
    error,
    refetch,
  } = useFetchAllEntity("secRolePrivilege", {
    endpoint: roleId ? `/secRolePrivilege?roleId=${roleId}` : "/secRolePrivilege",
    enabled: !!roleId,
    removeAll: true,
  });

  console.log("roleId", roleId, "endpoint", roleId ? `/secRolePrivilege?roleId=${roleId}` : "/secRolePrivilege");

  const isLoading = modulesLoading || subModulesLoading || rolePrivilegesLoading || rolesLoading || !userRole;

  const userPrivileges = useMemo(() => {
    if (!rolePrivilegesData?.data) return [];
    return rolePrivilegesData.data;
  }, [rolePrivilegesData]);

  const allowedSubModules = useMemo(() => {
    if (!subModulesData?.data || !userPrivileges.length) return [];
    return subModulesData.data
      .filter((sm: any) => userPrivileges.some((p: any) => p.sub_module_id === sm.sub_module_id))
      .sort((a: any, b: any) => a.sub_module_id - b.sub_module_id);
  }, [subModulesData, userPrivileges]);

  const allowedModules = useMemo(() => {
    if (!modulesData?.data || !allowedSubModules.length) return [];
    return modulesData.data
      .filter((mod: any) => allowedSubModules.some((sm: any) => sm.module_id === mod.module_id))
      .sort((a: any, b: any) => a.module_id - b.module_id);
  }, [modulesData, allowedSubModules]);

  return { 
    allowedModules, 
    allowedSubModules, 
    userPrivileges, 
    isLoading,
    error,
    refetch
  };
}