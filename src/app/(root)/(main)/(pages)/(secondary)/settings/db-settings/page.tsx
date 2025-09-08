"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import AddDBSettings from "@/src/components/custom/modules/settings/AddDBSettings";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";

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
  const queryClient = useQueryClient();

  useEffect(() => {
    setColumns([
      { field: "db_databasetype", headerName: "Database" },
      { field: "db_databasename", headerName: "Database Name" },
      { field: "db_host_name", headerName: "Host" },
      { field: "db_port_no", headerName: "Port" },
      { field: "connect_db_flag", headerName: "Connection"},
    ]);
  }, [language]);

  const { data: dbSettingData, isLoading } = useFetchAllEntity("dbSetting");

  const data = useMemo(() => {
    if (Array.isArray(dbSettingData?.data)) {
      return dbSettingData.data.map((dbSet: any) => {
        return {
          ...dbSet,
          id: dbSet.db_settings_id,
        };
      });
    }
    return [];
  }, [dbSettingData]);

  useEffect(() => {
    if (!open) {
      setSelectedRowData(null);
    }
  }, [open]);

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
    SetCurrentPage: setCurrentPage,
    SetSortField: setSortField,
    SortDirection: sortDirection,
    SetSortDirection: setSortDirection,
    SearchValue: searchValue,
    SetSearchValue: setSearchValue,
  };
 
  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ["chron-db-setting"] });
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
        disableAdd
        selectedRows={selectedRows}
        items={modules?.settings.items}
        entityName="dbSetting"
        modal_title="DB Settings"
        modal_component={
          <AddDBSettings
            on_open_change={setOpen}
            selectedRowData={selectedRowData}
            onSave={handleSave}
          />
        }
        isLarge
      />
      <PowerTable
        props={props}
        showEdit={false}
        onEditClick={handleEditClick}
        onRowSelection={handleRowSelection}
        isLoading={isLoading}
      />
    </div>
  );
}
