"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import AddSparkLocation from "@/src/components/custom/modules/workload/AddSparkLocation";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { usePrivileges } from "@/src/providers/PrivilegeProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useDebounce } from "@/src/hooks/useDebounce";
import { InlineLoading } from "@/src/app/loading";

const parseGeolocation = (value: unknown) => {
  const geo = value === undefined || value === null ? "" : String(value).trim();
  if (!geo) return { latitude: "", longitude: "" };
  const parts = geo.split(",");
  if (parts.length !== 2) return { latitude: "", longitude: "" };
  return { latitude: parts[0].trim(), longitude: parts[1].trim() };
};

const formatDate = (value: unknown) => {
  if (!value) return "-";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString();
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
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
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

    const isSparkSub = (subModule: any) =>
      subModule.path === "spark-location" ||
      subModule.path === "spark-employee-location" ||
      subModule.sub_module_name?.toLowerCase().includes("spark");

    const currentSub = subModules.find(isSparkSub);

    if (currentSub && isSubAllowed(currentSub)) {
      setHasPermission(true);
      return;
    }

    if (currentSub && !isSubAllowed(currentSub)) {
      const otherAllowed = subModules.find(
        (subModule: any) => !isSparkSub(subModule) && isSubAllowed(subModule)
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
        field: "EmployeeNumber",
        headerName: t.employee_number || "Employee Number",
      },
      {
        field: "NameEng",
        headerName: t.name || "Name",
      },
      {
        field: "LocationCode",
        headerName: t.location_code || "Location Code",
      },
      {
        field: "LocationEng",
        headerName: t.location_name || "Location Name",
      },
      {
        field: "Radius",
        headerName: t.radius || "Radius",
      },
      {
        field: "geolocation_display",
        headerName: t.geolocation || "Geolocation",
      },
      {
        field: "City",
        headerName: t.city || "City",
      },
      {
        field: "CountryCode",
        headerName: t.country_code || "Country Code",
      },
      {
        field: "from_date_display",
        headerName: t.from_date || "From Date",
      },
      {
        field: "to_date_display",
        headerName: t.to_date || "To Date",
      },
    ]);
  }, [t, language]);

  const { data: locationsData, isLoading, refetch } = useFetchAllEntity(
    "spark-employee-location",
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
    if (!Array.isArray(locationsData?.data)) return [];

    return locationsData.data.map((row: any) => {
      const parsed = parseGeolocation(row.Geolocation ?? row.geolocation);
      return {
        ...row,
        id: row.location_id,
        latitude: parsed.latitude,
        longitude: parsed.longitude,
        geolocation_display: parsed.latitude && parsed.longitude
          ? `${parsed.latitude},${parsed.longitude}`
          : row.Geolocation ?? row.geolocation ?? "",
        from_date_display: formatDate(row.FromDate),
        to_date_display: formatDate(row.ToDate),
      };
    });
  }, [locationsData]);

  useEffect(() => {
    if (!open) {
      setSelectedRowData(null);
    }
  }, [open]);

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
    total: locationsData?.total || 0,
    hasNext: locationsData?.hasNext,
    rowsPerPage,
    setRowsPerPage: handleRowsPerPageChange,
  };

  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ["spark-employee-location"] });
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
        entityName="spark-employee-location"
        modal_title={t.spark_location || "Spark Location"}
        modal_component={
          <AddSparkLocation
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
