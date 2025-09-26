// utils/privilegeUtils.ts
export function hasPrivilege(
  privileges: Record<string, any>, // like your existingPrivileges
  moduleName: string,
  subModuleName: string,
  action: "access" | "view" | "create" | "edit" | "delete"
): boolean {
  return !!privileges?.[moduleName]?.[subModuleName]?.[action];
}
