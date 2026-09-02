"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import AddUserMapping from "@/src/components/custom/modules/workload/AddUserMapping";
import FilterUserMapping from "@/src/components/custom/modules/workload/FilterUserMapping";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useDebounce } from "@/src/hooks/useDebounce";

export default function Page() {
  const { modules, language, translations } = useLanguage();
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

  const offset = useMemo(() => currentPage, [currentPage]);

  useEffect(() => {
    setColumns([
      {
        field: "mapping_id",
        headerName: t.mapping_id || "Mapping ID",
      },
      {
        field: "employee_number",
        headerName: t.employee_number || "Employee Number",
      },
      {
        field: "employee_name",
        headerName: t.employee || "Employee Name",
      },
      {
        field: "organization_name",
        headerName: t.organization || "Organization",
      },
      {
        field: "department_name",
        headerName: t.department || "Department",
      },
      {
        field: "location_name",
        headerName: t.location || "Location",
      },
      {
        field: "formatted_from_date",
        headerName: t.from_date || "From Date",
      },
      {
        field: "formatted_to_date",
        headerName: t.to_date || "To Date",
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
    searchParams: {
      limit: String(rowsPerPage),
      offset: String(offset),
      ...(debouncedSearchValue && { search: debouncedSearchValue }),
      ...(locationIdsParam && { location_ids: locationIdsParam }),
    },
  });

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "-";
      return d.toLocaleDateString();
    } catch {
      return "-";
    }
  };

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

        const org = row.organization;
        let orgName = "-";
        if (org) {
          orgName = language === "ar"
            ? org.organization_arb || org.organization_eng || "-"
            : org.organization_eng || org.organization_arb || "-";
        }

        const dept = row.department;
        let deptName = "-";
        if (dept) {
          deptName = language === "ar"
            ? dept.department_name_arb || dept.department_name_eng || "-"
            : dept.department_name_eng || dept.department_name_arb || "-";
        }

        const loc = row.location;
        let locName = "-";
        if (loc) {
          const locDetails = loc.location_name || loc.location_code || "";
          locName = loc.project_name && locDetails
            ? `${locDetails}`
            : loc.location_name || loc.project_name || loc.location_code || `Location #${loc.location_id}`;
        } else if (row.location_id) {
          locName = `Location #${row.location_id}`;
        }

        return {
          ...row,
          id: row.mapping_id,
          employee_name: empName || "-",
          organization_name: orgName || "-",
          department_name: deptName || "-",
          location_name: locName,
          formatted_from_date: formatDate(row.from_date),
          formatted_to_date: formatDate(row.to_date),
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
