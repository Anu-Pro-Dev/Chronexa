"use client";
import React, { useEffect, useState } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddDBSettings from "@/forms/settings/AddDBSettings";
import { useLanguage } from "@/providers/LanguageProvider";

export default function Page() {
  const { modules, language } = useLanguage();
  const [Data, SetData] = useState<any>([]);
  const [CurrentPage, SetCurrentPage] = useState<number>(1);
  const [SortField, SetSortField] = useState<string>("");
  const [SortDirection, SetSortDirection] = useState<string>("asc");
  const [SearchValue, SetSearchValue] = useState<string>("");
  const [open, on_open_change] = useState<boolean>(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  
  const [Columns, setColumns] = useState([
    { field: "databaseType", headerName: "Database" },
    { field: "databaseName", headerName: "Database Name" },
    { field: "host", headerName: "Host" },
    { field: "port", headerName: "Port" },
    { field: "isConnected", headerName: "Connection"},
  ]);

  const props = {
    Data,
    SetData,
    Columns,
    SortField,
    CurrentPage,
    SetCurrentPage,
    SetSortField,
    SortDirection,
    SetSortDirection,
    open,
    on_open_change,
    SearchValue,
    SetSearchValue,
  };

  useEffect(() => {
    if (!open) {
      setSelectedRowData(null);
    }
  }, [open]);

  const handleEditClick = (data: any) => {
    setSelectedRowData(data);
    on_open_change(true);
  };

  const handleSave = (id: string | null, newData: any) => {
    if (id) {
      SetData((prevData: any) =>
        prevData.map((row: any) => (row.id === id ? { ...row, ...newData } : row))
      );
    } else {
      SetData((prevData: any) => [...prevData, { id: Date.now().toString(), ...newData }]);
    }
    setSelectedRowData(null);
  };

  const handleRowSelection = (rows: any[]) => {
    console.log("Selected rows:", selectedRows);
    setSelectedRows(rows);
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        selectedRows={selectedRows}
        items={modules?.settings?.items}
        entityName="dbsettings"
        modal_title="DB Settings"
        modal_component={
          <AddDBSettings 
            on_open_change={on_open_change} 
            selectedRowData={selectedRowData}
            onSave={handleSave}
          />
        }
        isLarge
      />
      <PowerTable props={props} Data={Data} showEdit={true} onEditClick={handleEditClick} onRowSelection={handleRowSelection} api={"/settings/db-settings"}/>
    </div>
  );
}
