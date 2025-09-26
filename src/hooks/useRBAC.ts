// "use client";
// import { useMemo } from "react";
// import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
// import { useAuthGuard } from "@/src/hooks/useAuthGuard";

// export function useRBAC() {
//   const { userRole } = useAuthGuard();

//   const { data: modulesData, isLoading: modulesLoading } = useFetchAllEntity("secModule", {
//     removeAll: true,
//   });

//   const { data: subModulesData, isLoading: subModulesLoading } = useFetchAllEntity("secSubModule", {
//     removeAll: true,
//   });

//   const { data: tabsData, isLoading: tabsLoading } = useFetchAllEntity("secTab", {
//     removeAll: true,
//   });

//   const { data: tabPrivilegesData, isLoading: tabPrivilegesLoading } = useFetchAllEntity("secRoleTabPrivilege", {
//     removeAll: true,
//   });

//   const { data: rolesData, isLoading: rolesLoading } = useFetchAllEntity("secRole", {
//     removeAll: true,
//   });

//   const roleId = useMemo(() => {
//     if (!rolesData?.data || !userRole) return null;
//     const role = rolesData.data.find(
//       (r: any) => r.role_name.toLowerCase() === userRole.toLowerCase().trim()
//     );
//     return role?.role_id ?? null;
//   }, [rolesData, userRole]);

//   const {
//     data: rolePrivilegesData,
//     isLoading: rolePrivilegesLoading,
//     error,
//     refetch,
//   } = useFetchAllEntity("secRolePrivilege", {
//     endpoint: roleId ? `/secRolePrivilege?roleId=${roleId}` : "/secRolePrivilege",
//     enabled: !!roleId,
//     removeAll: true,
//   });

//   console.log("roleId", roleId, "endpoint", roleId ? `/secRolePrivilege?roleId=${roleId}` : "/secRolePrivilege");

//   const isLoading =
//     modulesLoading ||
//     subModulesLoading ||
//     rolePrivilegesLoading ||
//     rolesLoading ||
//     tabsLoading ||
//     tabPrivilegesLoading ||
//     !userRole;

//   const userPrivileges = useMemo(() => {
//     if (!rolePrivilegesData?.data) return [];
//     return rolePrivilegesData.data;
//   }, [rolePrivilegesData]);

//   const userTabPrivileges = useMemo(() => {
//     if (!tabPrivilegesData?.data) return [];
//     return tabPrivilegesData.data;
//   }, [tabPrivilegesData]);

//   const allowedSubModules = useMemo(() => {
//     if (!subModulesData?.data || !userPrivileges.length) return [];
//     return subModulesData.data
//       .filter((sm: any) => userPrivileges.some((p: any) => p.sub_module_id === sm.sub_module_id))
//       .sort((a: any, b: any) => a.sub_module_id - b.sub_module_id);
//   }, [subModulesData, userPrivileges]);

//   const allowedModules = useMemo(() => {
//     if (!modulesData?.data || !allowedSubModules.length) return [];
//     return modulesData.data
//       .filter((mod: any) => allowedSubModules.some((sm: any) => sm.module_id === mod.module_id))
//       .sort((a: any, b: any) => a.module_id - b.module_id);
//   }, [modulesData, allowedSubModules]);

//   const allowedTabs = useMemo(() => {
//     if (!tabsData?.data || !userTabPrivileges.length) return [];
//     return tabsData.data
//       .filter((tab: any) =>
//         userTabPrivileges.some((tp: any) => tp.tab_id === tab.tab_id && tp.access_flag)
//       )
//       .sort((a: any, b: any) => a.tab_id - b.tab_id);
//   }, [tabsData, userTabPrivileges]);

//   return {
//     allowedModules,
//     allowedSubModules,
//     allowedTabs, 
//     userPrivileges,
//     userTabPrivileges,
//     isLoading,
//     error,
//     refetch,
//   };
// }
// "use client";
// import { useMemo } from "react";
// import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
// import { useAuthGuard } from "@/src/hooks/useAuthGuard";

// export function useRBAC() {
//   const { userRole } = useAuthGuard();

//   // Get roles so we can find logged-in user's roleId
//   const { data: rolesData, isLoading: rolesLoading } = useFetchAllEntity("secRole", {
//     removeAll: true,
//   });

//   const roleId = useMemo(() => {
//     if (!rolesData?.data || !userRole) return null;
//     const role = rolesData.data.find(
//       (r: any) => r.role_name.toLowerCase() === userRole.toLowerCase().trim()
//     );
//     return role?.role_id ?? null;
//   }, [rolesData, userRole]);

//   // Fetch privileges for this role (API already returns privilegeMap)
//   const {
//     data: rolePrivilegesData,
//     isLoading: rolePrivilegesLoading,
//     error,
//     refetch,
//   } = useFetchAllEntity("secRolePrivilege", {
//     endpoint: roleId ? `/secRolePrivilege?roleId=${roleId}` : "/secRolePrivilege",
//     enabled: !!roleId,
//     removeAll: true,
//   });

//   console.log("roleId", roleId, "endpoint", roleId ? `/secRolePrivilege?roleId=${roleId}` : "/secRolePrivilege");

//   const isLoading = rolesLoading || rolePrivilegesLoading || !userRole;

//   // privilegeMap is already structured from API
//   const privilegeMap = useMemo(() => {
//     if (!rolePrivilegesData?.data) return {};
//     return rolePrivilegesData.data;
//   }, [rolePrivilegesData]);

//   return {
//     roleId,
//     privilegeMap, // ✅ already modules → submodules → tabs
//     isLoading,
//     error,
//     refetch,
//   };
// }
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
    const privilegeMap: any = data; // Keep original structure

    // Process each module
    Object.keys(data).forEach((moduleKey, moduleIndex) => {
      const moduleData = data[moduleKey];
      
      // Add all modules (allowed or not) for reference
      const module = {
        module_id: moduleIndex + 1,
        module_name: moduleKey,
        module_type: moduleData.module_type || "primary",
        allowed: moduleData.allowed
      };
      modules.push(module);

      // Only process submodules if module is allowed
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

          // Only process tabs if submodule is allowed
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