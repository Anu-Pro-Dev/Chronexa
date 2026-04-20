/**
 * Derives the first accessible route for a user based on their privilege map.
 *
 * This mirrors exactly the path-building logic in app-sidebar.tsx so that
 * the post-login redirect lands on the same page the sidebar would navigate to.
 *
 * Priority:
 *   1. First module whose `hasView === true` and has at least one viewable sub-module
 *   2. First viewable sub-module within that module
 *   3. First viewable tab within that sub-module (if tabs exist)
 *
 * Falls back to "/dashboard" if privileges are empty or none are viewable.
 */

export type PrivilegeMap = Record<
  string,
  {
    allowed: boolean;
    hasView: boolean;
    subModules: Array<{
      path: string;
      allowed: boolean;
      hasView: boolean;
      sub_module_name: string;
      tabs?: Array<{
        tab_id: number;
        tab_name: string;
        allowed: boolean;
        hasView: boolean;
      }>;
    }>;
  }
>;

const normalizeSegment = (name: string) =>
  name.trim().replace(/\s+/g, "-").toLowerCase();

export function getFirstAccessibleRoute(privilegeMap: PrivilegeMap): string {
  const FALLBACK = "/dashboard";

  if (!privilegeMap || Object.keys(privilegeMap).length === 0) {
    return FALLBACK;
  }

  for (const moduleKey of Object.keys(privilegeMap)) {
    const module = privilegeMap[moduleKey];

    if (!module.hasView) continue;

    const firstSub = module.subModules?.find((s) => s.hasView);
    if (!firstSub?.sub_module_name) continue;

    let path = `/${normalizeSegment(moduleKey)}/${firstSub.path}`;

    // If the sub-module has tabs, append the first viewable tab
    if (firstSub.tabs && firstSub.tabs.length > 0) {
      const firstAllowedTab = firstSub.tabs.find((tab) => tab.hasView);
      if (firstAllowedTab) {
        path += `/${normalizeSegment(firstAllowedTab.tab_name)}`;
      }
    }

    return path;
  }

  return FALLBACK;
}