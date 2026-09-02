"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import AddUserMapping from "@/src/components/custom/modules/workload/AddUserMapping";
import FilterUserMapping from "@/src/components/custom/modules/workload/FilterUserMapping";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { usePrivileges } from "@/src/providers/PrivilegeProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useDebounce } from "@/src/hooks/useDebounce";
import { InlineLoading } from "@/src/app/loading";

export default function Page() {
  const router = useRouter();
  const { privilegeMap, isLoading: isPrivilegeLoading } = usePrivileges();
  const { modules, language, translations } = useLanguage();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  const queryClient = useQueryClient();
  const debouncedSearchValue = useDebounce(searchValue, 300);
  const t = translations?.modules?.workload || {};

  // Check view privilege and redirect to accessible submodule or /no-access if false
  useEffect(() => {
    if (isPrivilegeLoading) return;

    const workloadKey = Object.keys(privilegeMap || {}).find(
      (k) => k.toLowerCase() === "workload"
    );
    const workloadModule = workloadKey ? privilegeMap[workloadKey] : null;

    if (!workloadModule || workloadModule.allowed === false) {
      router.replace("/no-access");
      return;
    }

    const subModules = workloadModule.subModules || [];
    const isSubAllowed = (sm: any) =>
      sm.allowed !== false && sm.privileges?.view !== false && sm.hasView !== false;

    const currentSub = subModules.find(
      (sm: any) => sm.path === "user-mapping" || sm.sub_module_name?.toLowerCase().includes("mapping")
    );

    if (currentSub && isSubAllowed(currentSub)) {
      setHasPermission(true);
    } else {
      // Find nearest accessible submodule in workload
      const projLocSub = subModules.find(
        (sm: any) => sm.path === "project-location" || sm.sub_module_name?.toLowerCase().includes("location")
      );
      if (projLocSub && isSubAllowed(projLocSub)) {
        router.replace("/workload/project-location/");
      } else {
        const otherAllowed = subModules.find((sm: any) => sm.path !== "user-mapping" && isSubAllowed(sm));
        if (otherAllowed) {
          router.replace(`/workload/${otherAllowed.path}/`);
        } else {
          router.replace("/no-access");
        }
      }
    }
  }, [privilegeMap, isPrivilegeLoading, router]);

  const offset = useMemo(() => currentPage, [currentPage]);

  useEffect(() => {
    setColumns([
      {
        field: "employee_number",
        headerName: t.employee_number || "Employee Number",
      },
      {
        field: "employee_name",
        headerName: t.employee || "Employee Name",
      },
      {
        field: "project_name",
        headerName: t.project_name || "Project Name",
      },
      {
        field: "location_name",
        headerName: t.location_name || t.location || "Location Name",
      },
      {
        field: "active_status_text",
        headerName: t.active_flag || "Active Status",
      },
    ]);
  }, [t, language]);

  const locationIdsParam = useMemo(() => {
    return selectedLocations.length > 0 ? selectedLocations.join(",") : undefined;
  }, [selectedLocations]);

  const { data: mappingsData, isLoading, refetch } = useFetchAllEntity("ifm-employee-location-mapping", {
    enabled: hasPermission === true,
    searchParams: {
      limit: String(rowsPerPage),
      offset: String(offset),
      ...(debouncedSearchValue && { search: debouncedSearchValue }),
      ...(locationIdsParam && { location_ids: locationIdsParam }),
    },
  });

  const data = useMemo(() => {
    if (Array.isArray(mappingsData?.data)) {
      return mappingsData.data.map((row: any) => {
        const emp = row.employee;
        let empName = "-";
        if (emp) {
          empName = language === "ar"
            ? `${emp.firstname_arb || ""} ${emp.lastname_arb || ""}`.trim() || `${emp.firstname_eng || ""} ${emp.lastname_eng || ""}`.trim()
            : `${emp.firstname_eng || ""} ${emp.lastname_eng || ""}`.trim();
        }

        const loc = row.location;
        const projectName = loc?.project_name || "-";
        const locationName = loc?.location_name || loc?.location_code || (row.location_id ? `Location #${row.location_id}` : "-");

        return {
          ...row,
          id: row.mapping_id,
          employee_name: empName || "-",
          project_name: projectName,
          location_name: locationName,
          active_status_text: row.active_flag ? "Active" : "Inactive",
        };
      });
    }
    return [];
  }, [mappingsData, language]);

  useEffect(() => {
    if (!open) {
      setSelectedRowData(null);
    }
  }, [open]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [refetch]);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [refetch]);

  const handleSearchChange = useCallback((newSearchValue: string) => {
    setSearchValue(newSearchValue);
    setCurrentPage(1);
  }, []);

  const handleApplyFilter = useCallback((locationIds: string[]) => {
    setSelectedLocations(locationIds);
    setCurrentPage(1);
  }, []);

  const props = {
    Data: data,
    Columns: columns,
    open,
    on_open_change: setOpen,
    filter_open: filterOpen,
    filter_on_open_change: setFilterOpen,
    selectedRows,
    setSelectedRows,
    isLoading,
    SortField: sortField,
    CurrentPage: currentPage,
    SetCurrentPage: handlePageChange,
    SetSortField: setSortField,
    SortDirection: sortDirection,
    SetSortDirection: setSortDirection,
    SearchValue: searchValue,
    SetSearchValue: handleSearchChange,
    total: mappingsData?.total || 0,
    hasNext: mappingsData?.hasNext,
    rowsPerPage,
    setRowsPerPage: handleRowsPerPageChange,
  };

  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ["ifm-employee-location-mapping"] });
  };

  const handleEditClick = useCallback((row: any) => {
    setSelectedRowData(row);
    setOpen(true);
  }, []);

  const handleRowSelection = useCallback((rows: any[]) => {
    setSelectedRows(rows);
  }, []);

  if (isPrivilegeLoading || hasPermission === null) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <InlineLoading message="Loading..." />
      </div>
    );
  }

  if (!hasPermission) return null;

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        selectedRows={selectedRows}
        items={modules?.workload?.items}
        entityName="ifm-employee-location-mapping"
        enableFilters={true}
        filter_modal_title={t.filter_by_location || "Filter by Location"}
        filter_modal_component={
          <FilterUserMapping
            selectedLocations={selectedLocations}
            onApplyFilter={handleApplyFilter}
            modal_props={{
              open: filterOpen,
              on_open_change: setFilterOpen,
            }}
          />
        }
        modal_title={t.user_mapping || "User Mapping"}
        modal_component={
          <AddUserMapping
            on_open_change={setOpen}
            selectedRowData={selectedRowData}
            onSave={handleSave}
          />
        }
        size="large"
      />
      <PowerTable
        props={props}
        onEditClick={handleEditClick}
        onRowSelection={handleRowSelection}
        isLoading={isLoading}
      />
    </div>
  );
}
