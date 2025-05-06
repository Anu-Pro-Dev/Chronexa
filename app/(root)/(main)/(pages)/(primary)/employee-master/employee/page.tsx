"use client";
import React, { useState, useEffect } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import { useLanguage } from "@/providers/LanguageProvider";
import { useRouter } from "next/navigation";

export default function Page() {
  const { modules, language } = useLanguage();
  const router = useRouter();
  const [Columns, setColumns] = useState<{ field: string; headerName: string;}[]>([]);
  const [SelectedKeys, SetSelectedKeys] = useState<any>([]);
  const [Data, SetData] = useState<any>([]);
  const [CurrentPage, SetCurrentPage] = useState<number>(1);
  const [SortField, SetSortField] = useState<string>("");
  const [SortDirection, SetSortDirection] = useState<string>("asc");
  const [SearchValue, SetSearchValue] = useState<string>("");
  const [open, on_open_change] = useState<boolean>(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  
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

  useEffect(() => {
    setColumns([
      {field: "employeeId", headerName: "Emp No"},
      {field: "firstname", headerName: "Name"},
      {field: "hireDate", headerName: "Join Date"},
      {field: "position", headerName: "Designation"},
    ]);
  }, [language]);

  const handleEditClick = (data: any) => {
    setSelectedRowData(data);
    router.push("/employee-master/employee/add");
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        items={modules?.employeeMaster.items}
        isAddNewPagePath="/employee-master/employee/add"
      />
      <PowerTable props={props} Data={Data} showEdit={true} onEditClick={handleEditClick}/>
    </div>
  );
}
