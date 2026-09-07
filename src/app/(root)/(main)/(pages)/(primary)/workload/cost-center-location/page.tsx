"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import AddCostCenterLocation from "@/src/components/custom/modules/workload/AddCostCenterLocation";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { usePrivileges } from "@/src/providers/PrivilegeProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useDeleteEntityMutation } from "@/src/hooks/useDeleteEntityMutation";
import { deleteBulkCostCodeMasterRequest } from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import { useDebounce } from "@/src/hooks/useDebounce";
import { InlineLoading } from "@/src/app/loading";

export default function Page() {
  const router = useRouter();
  const { privilegeMap, isLoading: isPrivilegeLoading } = usePrivileges();
  const { modules, language, translations } = useLanguage();
  const showToast = useShowToast();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const queryClient = useQueryClient();
  const debouncedSearchValue = useDebounce(searchValue, 300);
  const t = translations?.modules?.workload || {};

  const deleteMutation = useDeleteEntityMutation({
    onSelectionClear: () => setSelectedRows([]),
  });

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
      (sm: any) =>
        sm.path === "cost-center-location" ||
        sm.path === "cost-code-master" ||
        sm.sub_module_name?.toLowerCase().includes("cost center") ||
        sm.sub_module_name?.toLowerCase().includes("cost code")
    );

    if (currentSub && isSubAllowed(currentSub)) {
      setHasPermission(true);
    } else {
      // Find nearest accessible submodule in workload
      const projLocSub = subModules.find(
        (sm: any) => sm.path === "project-location" || sm.sub_module_name?.toLowerCase().includes("location")
      );
      const userMapSub = subModules.find(
        (sm: any) => sm.path === "user-mapping" || sm.sub_module_name?.toLowerCase().includes("mapping")
      );

      if (projLocSub && isSubAllowed(projLocSub)) {
        router.replace("/workload/project-location/");
      } else if (userMapSub && isSubAllowed(userMapSub)) {
        router.replace("/workload/user-mapping/");
      } else {
        const otherAllowed = subModules.find(
          (sm: any) =>
            sm.path !== "cost-center-location" &&
            sm.path !== "cost-code-master" &&
            isSubAllowed(sm)
        );
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
        field: "cost_code",
        headerName: t.cost_code || "Cost Code",
      },
      {
        field: "cost_center",
        headerName: t.cost_center || "Cost Center",
      },
      {
        field: "geocoordinates",
        headerName: t.geocoordinates || "Geocoordinates",
      },
      {
        field: "permit_extra_hours_text",
        headerName: t.permit_extra_hours_flag || "Permit Extra Hours",
      },
      {
        field: "extra_hours",
        headerName: t.extra_hours || "Extra Hours",
      },
      {
        field: "week_off",
        headerName: t.week_off || "Week Off",
      },
    ]);
  }, [t, language]);

  const { data: costCodesData, isLoading, refetch } = useFetchAllEntity("cost-code-master", {
    enabled: hasPermission === true,
    searchParams: {
      limit: String(rowsPerPage),
      offset: String(offset),
      ...(debouncedSearchValue && { search: debouncedSearchValue }),
    },
  });

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const parseTimeString = (timeStr: string | null | undefined): Date | undefined => {
    if (!timeStr) return undefined;
    try {
      const str = String(timeStr).trim();
      if (!str || str === "-") return undefined;

      if (str.includes("T") || str.includes("Z")) {
        const d = new Date(str);
        return isNaN(d.getTime()) ? undefined : d;
      }

      const today = new Date();
      const [hours, minutes, seconds] = str.split(":").map(Number);
      if (isNaN(hours) || isNaN(minutes)) return undefined;
      today.setHours(hours, minutes, seconds || 0, 0);
      return today;
    } catch {
      return undefined;
    }
  };

  const formatTimeDisplay = (timeStr: string | null | undefined): string => {
    const d = parseTimeString(timeStr);
    if (!d) return "-";
    try {
      const hours = d.getHours().toString().padStart(2, "0");
      const minutes = d.getMinutes().toString().padStart(2, "0");
      const seconds = d.getSeconds().toString().padStart(2, "0");
      return `${hours}:${minutes}:${seconds}`;
    } catch {
      return timeStr ? String(timeStr) : "-";
    }
  };

  const data = useMemo(() => {
    if (Array.isArray(costCodesData?.data)) {
      return costCodesData.data.map((row: any) => ({
        ...row,
        id: row.id || row.cost_code_id,
        formatted_start_time: formatTimeDisplay(row.start_time),
        formatted_end_time: formatTimeDisplay(row.end_time),
        formatted_break_start: formatTimeDisplay(row.break_start),
        formatted_break_end: formatTimeDisplay(row.break_end),
        permit_extra_hours_text: row.permit_extra_hours_flag ? "Yes" : "No",
        formatted_effective_from: formatDate(row.effective_from),
        formatted_effective_to: formatDate(row.effective_to),
      }));
    }
    return [];
  }, [costCodesData]);

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

  const handleCustomDelete = useCallback(async () => {
    const validIds = selectedRows
      .map((r) => r.id || r.cost_code_id)
      .filter((id) => id !== undefined && id !== null);

    if (validIds.length === 0) {
      showToast("error", "delete_error");
      return;
    }

    if (validIds.length === 1) {
      deleteMutation.mutate({ entityName: "cost-code-master", ids: validIds });
    } else {
      try {
        await deleteBulkCostCodeMasterRequest(validIds.map(Number));
        showToast("success", "delete_multiple_success", {
          displayText: t.cost_center_location || "Cost Center Location",
          count: validIds.length,
        });
        queryClient.invalidateQueries({ queryKey: ["cost-code-master"] });
        setSelectedRows([]);
      } catch (error: any) {
        showToast("error", error?.response?.data?.message || "delete_error");
      }
    }
  }, [selectedRows, deleteMutation, queryClient, showToast, t]);

  const props = {
    Data: data,
    Columns: columns,
    open,
    on_open_change: setOpen,
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
    total: costCodesData?.total || 0,
    hasNext: costCodesData?.hasNext,
    rowsPerPage,
    setRowsPerPage: handleRowsPerPageChange,
  };

  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ["cost-code-master"] });
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
        entityName="cost-code-master"
        customDeleteHandler={handleCustomDelete}
        modal_title={t.cost_center_location || "Cost Center Location"}
        modal_component={
          <AddCostCenterLocation
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
