"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import AddPcpLocation from "@/src/components/custom/modules/workload/AddPcpLocation";
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
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

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
      (sm: any) =>
        sm.path === "pcp-location-master" ||
        sm.path === "pcp_location_master" ||
        sm.sub_module_name?.toLowerCase().includes("pcp location")
    );

    // If sub-module is registered in DB privileges, respect its permission;
    // Otherwise allow access if user has overall workload permission
    if (currentSub) {
      if (isSubAllowed(currentSub)) {
        setHasPermission(true);
      } else {
        const otherAllowed = subModules.find(
          (sm: any) => sm.path !== "pcp-location-master" && isSubAllowed(sm)
        );
        if (otherAllowed) {
          router.replace(`/workload/${otherAllowed.path}/`);
        } else {
          router.replace("/no-access");
        }
      }
    } else {
      setHasPermission(true);
    }
  }, [privilegeMap, isPrivilegeLoading, router]);

  const offset = useMemo(() => currentPage, [currentPage]);

  useEffect(() => {
    setColumns([
      {
        field: "project_name",
        headerName: t.project_name || "Project Name",
      },
      {
        field: "location_name",
        headerName: t.location_name || "Location Name",
      },
      {
        field: "latitude",
        headerName: t.latitude || "Latitude",
      },
      {
        field: "longitude",
        headerName: t.longitude || "Longitude",
      },
      {
        field: "radius",
        headerName: t.radius || "Radius",
      },
      {
        field: "city",
        headerName: t.city || "City",
      },
      {
        field: "country_code",
        headerName: t.country_code || "Country Code",
      },
    ]);
  }, [t, language]);

  const { data: locationsData, isLoading, refetch } = useFetchAllEntity("pcp-location-master", {
    enabled: hasPermission === true,
    searchParams: {
      limit: String(rowsPerPage),
      offset: String(offset),
      ...(debouncedSearchValue && { search: debouncedSearchValue }),
    },
  });

  const data = useMemo(() => {
    if (Array.isArray(locationsData?.data)) {
      return locationsData.data.map((loc: any) => ({
        ...loc,
        id: loc.location_id,
        geolocation: loc.geolocation
          ? loc.geolocation.toString()
          : loc.latitude && loc.longitude
          ? `${loc.latitude},${loc.longitude}`
          : "",
        active_status_text: loc.active_flag ? "Active" : "Inactive",
      }));
    }
    return [];
  }, [locationsData]);

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
    total: locationsData?.total || 0,
    hasNext: locationsData?.hasNext,
    rowsPerPage,
    setRowsPerPage: handleRowsPerPageChange,
  };

  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ["pcp-location-master"] });
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
        entityName="pcp-location-master"
        modal_title={t.pcp_location_master || "PCP Location Master"}
        modal_component={
          <AddPcpLocation
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
        overrideEditIcon={true}
        onRowSelection={handleRowSelection}
        isLoading={isLoading}
      />
    </div>
  );
}
