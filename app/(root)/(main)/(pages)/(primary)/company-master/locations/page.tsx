"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddLocations from "@/forms/company-master/AddLocations";
import { useLanguage } from "@/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/hooks/useFetchAllEntity";
import { useDebounce } from "@/hooks/useDebounce"; 

export default function Page() {
  const { modules, language, translations } = useLanguage();
  const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const queryClient = useQueryClient();
  const debouncedSearchValue = useDebounce(searchValue, 300);
  const t = translations?.modules?.companyMaster || {};

  const offset = useMemo(() => {
    return currentPage;
  }, [currentPage]);

  useEffect(() => {
    setColumns([
      {
        field: "location_code",
        headerName: t.location_code,
      },
      {
        field: language === "ar" ? "location_arb" : "location_eng",
        headerName: t.location_name,
      },
      {
        field: "geolocation",
        headerName: t.geo_cords,
      },
      {
        field: "radius",
        headerName: t.radius,
      },
    ]);
  }, [t]);

  const { data: locationsData, isLoading, refetch } = useFetchAllEntity("location", {
    searchParams: {
      limit: String(rowsPerPage),
      offset: String(offset),
      ...(debouncedSearchValue && {
        name: debouncedSearchValue,
        code: debouncedSearchValue,
      }),
    },
  });
  const data = useMemo(() => {
    if (Array.isArray(locationsData?.data)) {      
      return locationsData.data.map((loc: any) => {
        return {
          ...loc,
          id: loc.location_id,
          geolocation: loc.geolocation ? loc.geolocation.toString() : "",
        };
      });
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
  }, [currentPage, refetch]);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [rowsPerPage, refetch]);

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
    queryClient.invalidateQueries({ queryKey: ["location"] });
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
        items={modules?.companyMaster.items}
        entityName="location"
        modal_title="Locations"
        modal_component={
          <AddLocations
            on_open_change={setOpen}
            selectedRowData={selectedRowData}
            onSave={handleSave}
          />
        }
        isLarge
      />
      <PowerTable
        props={props}
        showEdit={true}
        onEditClick={handleEditClick}
        onRowSelection={handleRowSelection}
        isLoading={isLoading}
      />
    </div>
  );
}