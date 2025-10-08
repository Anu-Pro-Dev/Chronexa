"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import AddAppSettings from "@/src/components/custom/modules/settings/AddAppSettings";
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
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const queryClient = useQueryClient();
  const debouncedSearchValue = useDebounce(searchValue, 300);
  const t = translations?.modules?.settings || {};

  const offset = useMemo(() => {
    return currentPage;
  }, [currentPage]);

  useEffect(() => {
    setColumns([
      { field: "version_name", headerName: t.version || "Version" },
      { field: "tab_no", headerName: t.tab || "Tab" },
      { field: "value", headerName: t.value || "Value" },
      { field: "descr", headerName: t.description || "Description" },
    ]);
  }, [t, language]);

  const { data: appSettingData, isLoading, refetch } = useFetchAllEntity("appSetting", {
    searchParams: {
      limit: String(rowsPerPage),
      offset: String(offset),
      ...(debouncedSearchValue && { search: debouncedSearchValue }),
    },
  });

  const data = useMemo(() => {
    if (Array.isArray(appSettingData?.data)) {
      return appSettingData.data.map((appSet: any) => {
        return {
          ...appSet,
          id: appSet.app_settings_id || appSet.id,
        };
      });
    }
    return [];
  }, [appSettingData]);

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
    total: appSettingData?.total || 0,
    hasNext: appSettingData?.hasNext,
    rowsPerPage,
    setRowsPerPage: handleRowsPerPageChange,
  };
 
  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ["appSetting"] });
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
        items={modules?.settings.items}
        entityName="appSetting"
        modal_title={t.app_settings || "App Settings"}
        modal_component={
          <AddAppSettings
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
        overrideEditIcon={false}
        overrideCheckbox={false}
      />
    </div>
  );
}