"use client";
import * as React from "react";
import UserInsightsPage from "@/src/components/custom/modules/dashboard/user-insights/UserInsightsPage";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import { PunchButton } from "@/src/components/custom/common/punch-button";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import CurrentDate from "@/src/components/ui/currentdate";
import { fetchVerticalsList, VerticalItem, VerticalOrganization } from "@/src/lib/userInsightsApiHandler";
import { useSelectedOrganization } from "@/src/store/useSelectedOrganization";
import { useUserInsightsStore } from "@/src/store/useUserInsightsStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { Checkbox } from "@/src/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/src/lib/apiHandler";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { debounce } from "lodash";
import { Briefcase, Building2, Layers } from "lucide-react";

function InsightsFilters() {
  const [verticalSearchTerm, setVerticalSearchTerm] = React.useState("");
  const [companySearchTerm, setCompanySearchTerm] = React.useState("");
  const [departmentSearchTerm, setDepartmentSearchTerm] = React.useState("");

  const {
    selectedVerticalIds,
    setSelectedVerticalIds,
    selectedOrganizationId,
    setSelectedOrganizationId,
    selectedCompanyOrgIds,
    setSelectedCompanyOrgIds,
    selectedDepartmentIds,
    setSelectedDepartmentIds,
  } = useSelectedOrganization();

  const clearData = useUserInsightsStore((s) => s.clearData);
  const { language, translations } = useLanguage();
  const t = translations?.modules?.reports || {};

  // Fetch organizations using useFetchAllEntity("organization") exactly like EmployeeReports.tsx
  const { data: organizationsData, isLoading: loading } = useFetchAllEntity("organization", {
    searchParams: { limit: "1000" },
  });

  const debouncedVerticalSearch = React.useCallback(
    debounce((v: string) => setVerticalSearchTerm(v), 300),
    []
  );
  const debouncedCompanySearch = React.useCallback(
    debounce((v: string) => setCompanySearchTerm(v), 300),
    []
  );
  const debouncedDepartmentSearch = React.useCallback(
    debounce((v: string) => setDepartmentSearchTerm(v), 300),
    []
  );

  React.useEffect(() => {
    return () => {
      debouncedVerticalSearch.cancel();
      debouncedCompanySearch.cancel();
      debouncedDepartmentSearch.cancel();
    };
  }, [debouncedVerticalSearch, debouncedCompanySearch, debouncedDepartmentSearch]);

  // Extract vertical items from organizations hierarchy
  const getVerticalData = React.useCallback(() => {
    if (!organizationsData?.data) return [];
    const parentMap = new Map();
    organizationsData.data.forEach((item: any) => {
      if (item.organizations) {
        const v = item.organizations;
        parentMap.set(v.organization_id, {
          organization_id: v.organization_id,
          organization_eng: v.organization_eng,
          organization_arb: v.organization_arb,
          entity_name: v.entity_name || v.display_name || v.organization_eng,
        });
      }
    });

    const verticals = Array.from(parentMap.values()).filter(
      (item: any) => item.organization_id !== 1
    );

    if (verticalSearchTerm) {
      const q = verticalSearchTerm.toLowerCase();
      return verticals.filter((item: any) =>
        (item.entity_name && item.entity_name.toLowerCase().includes(q)) ||
        (item.organization_eng && item.organization_eng.toLowerCase().includes(q)) ||
        (item.organization_arb && item.organization_arb.toLowerCase().includes(q))
      );
    }

    return verticals;
  }, [organizationsData, verticalSearchTerm]);

  // Extract company items belonging to selected verticals and group them by entity_name
  const getCompanyData = React.useCallback(() => {
    if (!organizationsData?.data || selectedVerticalIds.length === 0) return [];

    // Filter organizations whose parent_id matches any of the selected vertical IDs
    // and exclude any parent/vertical itself
    const childOrgs = organizationsData.data.filter((item: any) => {
      const parentId = Number(item.parent_id);
      const orgId = Number(item.organization_id);
      return (
        selectedVerticalIds.includes(parentId) &&
        !selectedVerticalIds.includes(orgId) &&
        orgId !== 1
      );
    });

    // Group organizations by entity_name (fallback to organization_eng or display_name)
    const entityGroupsMap = new Map<string, {
      key: string;
      entity_name: string;
      orgIds: number[];
      organizations: any[];
    }>();

    childOrgs.forEach((org: any) => {
      // Prioritize entity_name if non-empty; fallback to organization_eng or display_name
      const entityName = (org.entity_name || org.organization_eng || org.display_name || `Company ${org.organization_id}`).trim();
      const groupKey = (org.entity_name ? org.entity_name.trim().toLowerCase() : `org_${org.organization_id}`);

      if (!entityGroupsMap.has(groupKey)) {
        entityGroupsMap.set(groupKey, {
          key: groupKey,
          entity_name: entityName,
          orgIds: [],
          organizations: [],
        });
      }

      const group = entityGroupsMap.get(groupKey)!;
      group.orgIds.push(Number(org.organization_id));
      group.organizations.push(org);
    });

    const groupedCompanies = Array.from(entityGroupsMap.values());

    if (!companySearchTerm) return groupedCompanies;
    const q = companySearchTerm.toLowerCase();
    return groupedCompanies.filter((group) =>
      group.entity_name.toLowerCase().includes(q) ||
      group.organizations.some(
        (o) =>
          (o.organization_eng && o.organization_eng.toLowerCase().includes(q)) ||
          (o.organization_arb && o.organization_arb.toLowerCase().includes(q)) ||
          (o.display_name && o.display_name.toLowerCase().includes(q))
      )
    );
  }, [organizationsData, selectedVerticalIds, companySearchTerm]);

  const verticalList = getVerticalData();
  const companyList = getCompanyData();

  // If selected company group is not valid under currently selected verticals, clear it
  React.useEffect(() => {
    if (selectedCompanyOrgIds.length > 0 && companyList.length > 0) {
      const exists = companyList.some((g) =>
        g.orgIds.some((id) => selectedCompanyOrgIds.includes(id))
      );
      if (!exists) {
        setSelectedCompanyOrgIds([]);
        setSelectedDepartmentIds([]);
      }
    }
  }, [companyList, selectedCompanyOrgIds, setSelectedCompanyOrgIds, setSelectedDepartmentIds]);

  // Determine active company IDs for querying departments (divisions):
  // 1. If a company group is selected, query for those company IDs
  // 2. Otherwise if vertical(s) are selected, query departments for all companies under those verticals
  const activeCompanyIdsForDept = React.useMemo(() => {
    if (selectedCompanyOrgIds && selectedCompanyOrgIds.length > 0) {
      return selectedCompanyOrgIds;
    }
    if (selectedOrganizationId) {
      return [selectedOrganizationId];
    }
    if (selectedVerticalIds.length > 0) {
      return companyList.flatMap((g) => g.orgIds);
    }
    return [];
  }, [selectedCompanyOrgIds, selectedOrganizationId, selectedVerticalIds, companyList]);

  // Fetch departments (divisions) for selected company/verticals (matching EmployeeReports)
  const { data: departmentsByOrg, isLoading: isDepartmentsLoading } = useQuery({
    queryKey: ["insightsDepartmentsByOrg", activeCompanyIdsForDept],
    queryFn: async () => {
      if (activeCompanyIdsForDept.length === 0) return null;
      const allDepartments = await Promise.all(
        activeCompanyIdsForDept.map((companyId: string | number) =>
          apiRequest(`/dept-org-mapping/by-organization/${companyId}`, "GET")
        )
      );
      return { data: allDepartments.flatMap((r: any) => r?.data || []) };
    },
    enabled: activeCompanyIdsForDept.length > 0,
  });

  const getDepartmentData = React.useCallback(() => {
    if (!departmentsByOrg?.data || activeCompanyIdsForDept.length === 0) return [];
    const departmentsMap = new Map();
    const mappings = Array.isArray(departmentsByOrg.data) ? departmentsByOrg.data : [departmentsByOrg.data];
    mappings.forEach((mapping: any) => {
      if (mapping.departments && mapping.departments.department_id && mapping.is_active) {
        departmentsMap.set(mapping.departments.department_id, {
          department_id: mapping.departments.department_id,
          department_code: mapping.departments.department_code,
          department_name_eng: mapping.departments.department_name_eng,
          department_name_arb: mapping.departments.department_name_arb,
        });
      }
    });
    const departments = Array.from(departmentsMap.values());
    if (!departmentSearchTerm) return departments;
    const q = departmentSearchTerm.toLowerCase();
    return departments.filter((item: any) =>
      item.department_name_eng?.toLowerCase().includes(q) ||
      item.department_name_arb?.toLowerCase().includes(q) ||
      item.department_code?.toLowerCase().includes(q)
    );
  }, [departmentsByOrg, activeCompanyIdsForDept, departmentSearchTerm]);

  const departmentList = getDepartmentData();

  const handleToggleVertical = (verticalId: number) => {
    clearData();
    const isSelected = selectedVerticalIds.includes(verticalId);
    let nextIds: number[];
    if (isSelected) {
      nextIds = selectedVerticalIds.filter((id) => id !== verticalId);
    } else {
      nextIds = [...selectedVerticalIds, verticalId];
    }
    setSelectedVerticalIds(nextIds);
    setSelectedCompanyOrgIds([]);
    setSelectedDepartmentIds([]);
  };

  const handleToggleCompanyGroup = (group: { entity_name: string; orgIds: number[] }) => {
    clearData();
    // Check if current group is already selected
    const isSelected =
      selectedCompanyOrgIds.length > 0 &&
      group.orgIds.every((id) => selectedCompanyOrgIds.includes(id));

    if (isSelected) {
      setSelectedCompanyOrgIds([]);
    } else {
      setSelectedCompanyOrgIds(group.orgIds);
    }
    setSelectedDepartmentIds([]);
  };

  const handleToggleDepartment = (departmentId: number) => {
    clearData();
    const isSelected = selectedDepartmentIds.includes(departmentId);
    let nextIds: number[];
    if (isSelected) {
      nextIds = selectedDepartmentIds.filter((id) => id !== departmentId);
    } else {
      nextIds = [...selectedDepartmentIds, departmentId];
    }
    setSelectedDepartmentIds(nextIds);
  };

  const verticalPlaceholderText = React.useMemo(() => {
    if (selectedVerticalIds.length === 0) return t.placeholder_vertical || "Choose vertical";
    if (selectedVerticalIds.length === 1) {
      const match = verticalList.find((v: any) => Number(v.organization_id) === selectedVerticalIds[0]);
      if (match?.entity_name) return match.entity_name;
    }
    return `${selectedVerticalIds.length} ${t.vertical || "vertical"}${
      selectedVerticalIds.length > 1 ? "s" : ""
    } ${t.selected || "selected"}`;
  }, [selectedVerticalIds, verticalList, t]);

  const companyPlaceholderText = React.useMemo(() => {
    if (selectedCompanyOrgIds.length === 0) return t.placeholder_company || "Choose company";
    const match = companyList.find((g) =>
      g.orgIds.some((id) => selectedCompanyOrgIds.includes(id))
    );
    if (match) {
      return match.entity_name;
    }
    return "1 company selected";
  }, [selectedCompanyOrgIds, companyList, t]);

  const departmentPlaceholderText = React.useMemo(() => {
    if (activeCompanyIdsForDept.length === 0) return t.select_company_first || "Select company first";
    if (isDepartmentsLoading) return t.loading_divisions || "Loading divisions...";
    if (selectedDepartmentIds.length === 0) return t.placeholder_division || "Choose division";
    if (selectedDepartmentIds.length === 1) {
      const match = departmentList.find((d: any) => Number(d.department_id) === selectedDepartmentIds[0]);
      if (match?.department_name_eng) return match.department_name_eng;
    }
    return `${selectedDepartmentIds.length} ${t.division || "division"}${
      selectedDepartmentIds.length > 1 ? "s" : ""
    } ${t.selected || "selected"}`;
  }, [activeCompanyIdsForDept, isDepartmentsLoading, selectedDepartmentIds, departmentList, t]);

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-9 w-40 bg-accent animate-pulse rounded-md" />
        <div className="h-9 w-44 bg-accent animate-pulse rounded-md" />
        <div className="h-9 w-44 bg-accent animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* ── VERTICAL MULTI-SELECT DROPDOWN ── */}
      <Select>
        <SelectTrigger
          iconSize={16}
          className="h-9 w-40 rounded-md border-0 bg-accent px-2 shadow-none ring-0 focus:ring-0 gap-2 [&>span]:truncate [&>span]:max-w-[105px] [&>span]:text-sm [&>span]:font-semibold [&>span]:text-text-primary"
        >
          <div className="w-7 h-7 bg-backdrop rounded-full flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4 text-primary" />
          </div>
          <SelectValue placeholder={verticalPlaceholderText} />
        </SelectTrigger>
        <SelectContent
          showSearch={true}
          searchPlaceholder={t.search_verticals || "Search verticals..."}
          onSearchChange={debouncedVerticalSearch}
          className="mt-1 w-60 max-h-72"
        >
          {verticalList.length === 0 && verticalSearchTerm && (
            <div className="p-3 text-sm text-text-secondary">
              {t.no_verticals_found || "No verticals found"}
            </div>
          )}
          {verticalList.map((item: any) => {
            const vId = Number(item.organization_id);
            const isChecked = selectedVerticalIds.includes(vId);
            const label = item.entity_name || item.organization_eng;
            return (
              <div
                key={vId}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-background hover:text-accent-foreground"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleToggleVertical(vId);
                }}
              >
                <Checkbox checked={isChecked} className="mr-2" />
                <span className="truncate">{label}</span>
              </div>
            );
          })}
        </SelectContent>
      </Select>

      {/* ── COMPANY DROPDOWN (Showing organization name in English) ── */}
      <Select>
        <SelectTrigger
          iconSize={16}
          disabled={selectedVerticalIds.length === 0}
          className="h-9 w-48 rounded-md border-0 bg-accent px-2 shadow-none ring-0 focus:ring-0 gap-2 [&>span]:truncate [&>span]:max-w-[125px] [&>span]:text-sm [&>span]:font-semibold [&>span]:text-text-primary disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <div className="w-7 h-7 bg-backdrop rounded-full flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <SelectValue placeholder={companyPlaceholderText} />
        </SelectTrigger>
        <SelectContent
          showSearch={selectedVerticalIds.length > 0}
          searchPlaceholder={t.search_companies || "Search companies..."}
          onSearchChange={debouncedCompanySearch}
          className="mt-1 w-64 max-h-72"
        >
          {selectedVerticalIds.length === 0 ? (
            <div className="p-3 text-sm text-text-secondary">
              {t.select_vertical_first || "Select a vertical first"}
            </div>
          ) : companyList.length === 0 ? (
            <div className="p-3 text-sm text-text-secondary">
              {companySearchTerm
                ? (t.no_companies_found || "No companies found")
                : (t.no_companies_for_vertical || "No companies under selected vertical")}
            </div>
          ) : (
            companyList.map((group) => {
              const isChecked =
                selectedCompanyOrgIds.length > 0 &&
                group.orgIds.every((id) => selectedCompanyOrgIds.includes(id));
              const label = group.entity_name;
              return (
                <div
                  key={group.key}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-background hover:text-accent-foreground"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleToggleCompanyGroup(group);
                  }}
                >
                  <Checkbox checked={isChecked} className="mr-2" />
                  <span className="truncate">{label}</span>
                </div>
              );
            })
          )}
        </SelectContent>
      </Select>

      {/* ── DIVISION / DEPARTMENT DROPDOWN (Displayed only when vertical or company is selected) ── */}
      {(selectedVerticalIds.length > 0 || selectedCompanyOrgIds.length > 0 || selectedOrganizationId != null) && (
        <Select>
          <SelectTrigger
            iconSize={16}
            className="h-9 w-44 rounded-md border-0 bg-accent px-2 shadow-none ring-0 focus:ring-0 gap-2 [&>span]:truncate [&>span]:max-w-[110px] [&>span]:text-sm [&>span]:font-semibold [&>span]:text-text-primary"
          >
            <div className="w-7 h-7 bg-backdrop rounded-full flex items-center justify-center shrink-0">
              <Briefcase className="w-4 h-4 text-primary" />
            </div>
            <SelectValue placeholder={departmentPlaceholderText} />
          </SelectTrigger>
          <SelectContent
            showSearch={true}
            searchPlaceholder={t.search_divisions || "Search divisions..."}
            onSearchChange={debouncedDepartmentSearch}
            className="mt-1 w-64 max-h-72"
          >
            {departmentList.length === 0 ? (
              <div className="p-3 text-sm text-text-secondary">
                {departmentSearchTerm
                  ? (t.no_results || "No divisions found")
                  : (t.no_divisions_found || "No divisions found")}
              </div>
            ) : (
              departmentList.map((item: any) => {
                const dId = Number(item.department_id);
                const isChecked = selectedDepartmentIds.includes(dId);
                const label = item.department_name_eng || item.department_code;
                return (
                  <div
                    key={dId}
                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-background hover:text-accent-foreground"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleToggleDepartment(dId);
                    }}
                  >
                    <Checkbox checked={isChecked} className="mr-2" />
                    <span className="truncate">{label}</span>
                  </div>
                );
              })
            )}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { modules } = useLanguage();
  const { userInfo } = useAuthGuard();

  const shouldShowPunchButton = userInfo?.isWebPunch === true;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <PowerHeader
          disableAdd
          disableDelete
          disableSearch
          items={modules?.dashboard.items}
        />
        <div className="flex gap-3 items-center">
          <InsightsFilters />
          <CurrentDate interactive />
          <div className="h-9">
            {shouldShowPunchButton && <PunchButton />}
          </div>
        </div>
      </div>

      <UserInsightsPage />
    </div>
  );
}