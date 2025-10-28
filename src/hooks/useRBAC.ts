"use client";
import { useMemo } from "react";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";

export function useRBAC() {
  const { userRole } = useAuthGuard();

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
    endpoint: roleId ? `/secRolePrivilege?roleId=${roleId}` : undefined,
    enabled: !!roleId,
    removeAll: true,
  });

  const isLoading = rolesLoading || rolePrivilegesLoading || !userRole;

  const { privilegeMap, allowedModules, allowedSubModules, allowedTabs } = useMemo(() => {
    if (!rolePrivilegesData?.data) {
      return {
        privilegeMap: {},
        allowedModules: [],
        allowedSubModules: [],
        allowedTabs: []
      };
    }

    const data = rolePrivilegesData.data;
    
    const modules: any[] = [];
    const subModules: any[] = [];
    const tabs: any[] = [];
    const privilegeMap: any = data; 

    Object.keys(data).forEach((moduleKey, moduleIndex) => {
      const moduleData = data[moduleKey];
      
      const module = {
        module_id: moduleIndex + 1,
        module_name: moduleKey,
        module_type: moduleData.module_type || "primary",
        allowed: moduleData.allowed
      };
      modules.push(module);

      if (moduleData.allowed && moduleData.subModules) {
        moduleData.subModules.forEach((subModule: any, subIndex: number) => {
          const subModuleItem = {
            sub_module_id: `${moduleIndex + 1}-${subIndex + 1}`,
            sub_module_name: subModule.sub_module_name,
            module_id: moduleIndex + 1,
            module_name: moduleKey,
            path: subModule.path,
            allowed: subModule.allowed,
            privileges: subModule.privileges
          };
          subModules.push(subModuleItem);

          if (subModule.allowed && subModule.tabs && subModule.tabs.length > 0) {
            subModule.tabs.forEach((tab: any) => {
              const tabItem = {
                tab_id: tab.tab_id,
                tab_name: tab.tab_name,
                sub_module_id: `${moduleIndex + 1}-${subIndex + 1}`,
                module_id: moduleIndex + 1,
                module_name: moduleKey,
                sub_module_name: subModule.sub_module_name,
                sub_module_path: subModule.path,
                allowed: tab.allowed,
                privileges: tab.privileges
              };
              tabs.push(tabItem);
            });
          }
        });
      }
    });

    return {
      privilegeMap,
      allowedModules: modules.filter(m => m.allowed),
      allowedSubModules: subModules.filter(sm => sm.allowed),
      allowedTabs: tabs.filter(t => t.allowed)
    };
  }, [rolePrivilegesData]);

  return {
    roleId,
    privilegeMap,
    allowedModules,
    allowedSubModules,
    allowedTabs,
    isLoading,
    error,
    refetch,
  };
}