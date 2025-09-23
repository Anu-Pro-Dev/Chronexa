'use client'
import React, { createContext, useContext, ReactNode, useMemo } from "react";
import { useRBAC } from "@/src/hooks/useRBAC";

export interface SubModulePrivilege {
  path: string;
  allowed: boolean;
  sub_module_name: string;
}

export interface ModulePrivilege {
  allowed: boolean;
  subModules: SubModulePrivilege[];
  module_type?: "primary" | "secondary";
}

export type PrivilegeMap = Record<string, ModulePrivilege>;

export interface PrivilegeContextType {
  privilegeMap: PrivilegeMap;
  isLoading: boolean;
}

const defaultContext: PrivilegeContextType = { privilegeMap: {}, isLoading: true };
const PrivilegeContext = createContext<PrivilegeContextType>(defaultContext);

export function PrivilegeProvider({ children }: { children: ReactNode }) {
  const { allowedModules, allowedSubModules, isLoading } = useRBAC(); // ✅ include isLoading

  const privilegeMap: PrivilegeMap = useMemo(() => {
    const map: PrivilegeMap = {};

    allowedModules.forEach((mod: any) => {
      const subModules = allowedSubModules
        .filter((sm: any) => sm.module_id === mod.module_id)
        .map((sm: any) => ({
          path: sm.sub_module_name.replace(/\s+/g, "-").toLowerCase(),
          allowed: true,
          sub_module_name: sm.sub_module_name,
        }));

      map[mod.module_name] = {
        allowed: subModules.length > 0,
        subModules,
      };
    });

    return map;
  }, [allowedModules, allowedSubModules]);

  return (
    <PrivilegeContext.Provider value={{ privilegeMap, isLoading }}>
      {children}
    </PrivilegeContext.Provider>
  );
}

export function usePrivileges() {
  return useContext(PrivilegeContext);
}

