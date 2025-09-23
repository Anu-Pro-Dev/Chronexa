export function hasPermission(
  privilegeMap: any[],
  subModuleId: number,
  action: "view" | "create" | "edit" | "delete" = "view"
) {
  const priv = privilegeMap.find(p => p.subModuleId === subModuleId);
  return priv ? priv[action] : false;
}
