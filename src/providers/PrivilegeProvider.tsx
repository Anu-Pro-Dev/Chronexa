"use client";
import React, { createContext, useContext, ReactNode } from "react";
import { useRBAC } from "@/src/hooks/useRBAC";

export interface TabPrivilege {
  tab_id: number;
  tab_name: string;
  allowed: boolean;
  privileges: {
    access: boolean;
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
}

export interface SubModulePrivilege {
  path: string;
  allowed: boolean;
  sub_module_name: string;
  privileges: {
    access: boolean;
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  tabs: TabPrivilege[];
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

const PrivilegeContext = createContext<PrivilegeContextType>({
  privilegeMap: {},
  isLoading: true,
});

export function PrivilegeProvider({ children }: { children: ReactNode }) {
  const { privilegeMap, isLoading } = useRBAC();

  return (
    <PrivilegeContext.Provider value={{ privilegeMap, isLoading }}>
      {children}
    </PrivilegeContext.Provider>
  );
}

export function usePrivileges() {
  return useContext(PrivilegeContext);
}
