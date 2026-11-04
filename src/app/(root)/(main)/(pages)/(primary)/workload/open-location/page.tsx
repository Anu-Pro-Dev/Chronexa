"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import AddOpenLocation from "@/src/components/custom/modules/workload/AddOpenLocation";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { usePrivileges } from "@/src/providers/PrivilegeProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useDebounce } from "@/src/hooks/useDebounce";
import { InlineLoading } from "@/src/app/loading";

const formatDateTime = (value: unknown) => {
  if (!value) return "-";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
};

export default function Page() {
  const router = useRouter();
  const { privilegeMap, isLoading: isPrivilegeLoading } = usePrivileges();
  const { modules, language, translations } = useLanguage();
  const t = useMemo(() => translations?.modules?.workload || {}, [translations]);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const queryClient = useQueryClient();
  const debouncedSearchValue = useDebounce(searchValue, 300);

  useEffect(() => {
    if (isPrivilegeLoading) return;

    const workloadKey = Object.keys(privilegeMap || {}).find(
      (key) => key.toLowerCase() === "workload"
    );
    const workloadModule = workloadKey ? privilegeMap[workloadKey] : null;

    if (!workloadModule || workloadModule.allowed === false) {
      router.replace("/no-access");
      return;
    }

    const subModules = workloadModule.subModules || [];
    const isSubAllowed = (subModule: any) =>
      subModule.allowed !== false &&
      subModule.privileges?.view !== false &&
      subModule.hasView !== false;

    const isOpenLocationSub = (subModule: any) =>
      subModule.path === "open-location" ||
      subModule.sub_module_name?.toLowerCase().includes("open location");

    const currentSub = subModules.find(isOpenLocationSub);

    if (currentSub && isSubAllowed(currentSub)) {
      setHasPermission(true);
      return;
    }

    if (currentSub && !isSubAllowed(currentSub)) {
      const otherAllowed = subModules.find(
        (subModule: any) => !isOpenLocationSub(subModule) && isSubAllowed(subModule)
      );
      if (otherAllowed) {
        router.replace(`/workload/${otherAllowed.path}/`);
      } else {
        router.replace("/no-access");
      }
      return;
    }

    setHasPermission(true);
  }, [privilegeMap, isPrivilegeLoading, router]);

  useEffect(() => {
    setColumns([
      {
        field: "open_location_id",
        headerName: t.id || "ID",
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
        field: "is_active",
        headerName: t.active_flag || "Active Status",
      },
      {
        field: "created_at_display",
        headerName: t.created_at || "Created At",
      },
    ]);
  }, [t, language]);

  const { data: openLocationsData, isLoading, refetch } = useFetchAllEntity(
    "open-location",
    {
      enabled: hasPermission === true,
      searchParams: {
        limit: String(rowsPerPage),
        offset: String(currentPage),
        ...(debouncedSearchValue && { search: debouncedSearchValue }),
      },
    }
  );

  const data = useMemo(() => {
    if (!Array.isArray(openLocationsData?.data)) return [];

    return openLocationsData.data.map((row: any) => ({
      ...row,
      id: row.open_location_id,
      created_at_display: formatDateTime(row.created_at),
    }));
  }, [openLocationsData]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setCurrentPage(newPage);
      if (refetch) {
        setTimeout(() => refetch(), 100);
      }
    },
    [refetch]
  );

  const handleRowsPerPageChange = useCallback(
    (newRowsPerPage: number) => {
      setRowsPerPage(newRowsPerPage);
      setCurrentPage(1);
      if (refetch) {
        setTimeout(() => refetch(), 100);
      }
    },
    [refetch]
  );

  const handleSearchChange = useCallback((newSearchValue: string) => {
    setSearchValue(newSearchValue);
    setCurrentPage(1);
  }, []);

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
    total: openLocationsData?.total || 0,
    hasNext: openLocationsData?.hasNext,
    rowsPerPage,
    setRowsPerPage: handleRowsPerPageChange,
  };

  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ["open-location"] });
  };

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
        entityName="open-location"
        modal_title={t.open_location || "Open Location"}
        modal_component={<AddOpenLocation on_open_change={setOpen} onSave={handleSave} />}
        size="medium"
      />
      <PowerTable
        props={props}
        onRowSelection={handleRowSelection}
        isLoading={isLoading}
        overrideEditIcon={false}
      />
    </div>
  );
}
