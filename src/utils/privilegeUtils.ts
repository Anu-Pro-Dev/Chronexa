export function hasPrivilege(
  privileges: Record<string, any>,
  moduleName: string,
  subModuleName: string,
  action: "access" | "view" | "create" | "edit" | "delete"
): boolean {
  return !!privileges?.[moduleName]?.[subModuleName]?.[action];
}
