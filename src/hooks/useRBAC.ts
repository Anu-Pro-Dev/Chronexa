"use client";
import { useMemo } from "react";
import { useDashboardStore } from "@/src/store/useDashboardStore";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";

export function useRBAC() {
  const { userRole } = useAuthGuard();
  
  const roleId = useDashboardStore((s) => s.roleId);
  const privileges = useDashboardStore((s) => s.privileges);
  const loadedPrivileges = useDashboardStore((s) => s.loadedPrivileges);

  const isLoading = !loadedPrivileges || !userRole;

  const { privilegeMap, allowedModules, allowedSubModules, allowedTabs } = useMemo(() => {
    if (!privileges || privileges.length === 0) {
      return {
        privilegeMap: {},
        allowedModules: [],
        allowedSubModules: [],
        allowedTabs: []
      };
    }

    const data = Array.isArray(privileges) ? privileges[0] : privileges;
    
    const modules: any[] = [];
    const subModules: any[] = [];
    const tabs: any[] = [];
    
    const privilegeMap: any = {};

    Object.keys(data).forEach((moduleKey, moduleIndex) => {
      const moduleData = data[moduleKey];
      
      if (typeof moduleData !== 'object' || moduleData === null) return;
      
      const moduleHasView = moduleData.allowed === true;
      
      const module = {
        module_id: moduleIndex + 1,
        module_name: moduleKey,
        module_type: moduleData.module_type || "primary",
        allowed: moduleData.allowed,
        hasView: moduleHasView
      };
      modules.push(module);

      const enhancedSubModules: any[] = [];
      
      if (moduleData.subModules && Array.isArray(moduleData.subModules)) {
        moduleData.subModules.forEach((subModule: any, subIndex: number) => {
          const subModuleHasView = subModule.privileges?.view === true;
          
          const enhancedSubModule = {
            ...subModule,
            hasView: subModuleHasView,
            tabs: []
          };

          const subModuleItem = {
            sub_module_id: `${moduleIndex + 1}-${subIndex + 1}`,
            sub_module_name: subModule.sub_module_name,
            module_id: moduleIndex + 1,
            module_name: moduleKey,
            path: subModule.path,
            allowed: subModule.allowed,
            hasView: subModuleHasView,
            privileges: subModule.privileges
          };
          subModules.push(subModuleItem);

          if (subModule.tabs && Array.isArray(subModule.tabs)) {
            const enhancedTabs: any[] = [];
            
            subModule.tabs.forEach((tab: any) => {
              const tabHasView = tab.privileges?.view === true;
              
              const enhancedTab = {
                ...tab,
                hasView: tabHasView
              };

              const tabItem = {
                tab_id: tab.tab_id,
                tab_name: tab.tab_name,
                sub_module_id: `${moduleIndex + 1}-${subIndex + 1}`,
                module_id: moduleIndex + 1,
                module_name: moduleKey,
                sub_module_name: subModule.sub_module_name,
                sub_module_path: subModule.path,
                allowed: tab.allowed,
                hasView: tabHasView,
                privileges: tab.privileges
              };
              tabs.push(tabItem);
              enhancedTabs.push(enhancedTab);
            });
            
            enhancedSubModule.tabs = enhancedTabs;
          }
          
          enhancedSubModules.push(enhancedSubModule);
        });
      }

      privilegeMap[moduleKey] = {
        ...moduleData,
        hasView: moduleHasView,
        subModules: enhancedSubModules
      };
    });

    return {
      privilegeMap,
      allowedModules: modules.filter(m => m.hasView),
      allowedSubModules: subModules.filter(sm => sm.hasView),
      allowedTabs: tabs.filter(t => t.hasView)
    };
  }, [privileges]);

  return {
    roleId,
    privilegeMap,
    allowedModules,
    allowedSubModules,
    allowedTabs,
    isLoading,
    error: null,
    refetch: () => {},
  };
}