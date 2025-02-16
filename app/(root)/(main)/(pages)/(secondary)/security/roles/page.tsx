"use client";
import React, { useState } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import { useLanguage } from "@/providers/LanguageProvider";
import AddRole from "@/forms/security/AddRole";

export default function Page() {
  const { modules } = useLanguage();
  const [Columns, setColumns] = useState([
    { field: "code" },
    { field: "privileges" },
    { field: "assignRole", headerName: "Assign Role" },
    { field: "users" },
  ]);
  const [Data, SetData] = useState<any>([]);
  const [CurrentPage, SetCurrentPage] = useState<number>(1);
  const [SortField, SetSortField] = useState<string>("");
  const [SortDirection, SetSortDirection] = useState<string>("asc");
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [open, on_open_change] = useState<boolean>(false);

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
  };

  const handleEditClick = (data: any) => {
    setSelectedRowData(data);
    on_open_change(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        items={modules?.security?.items}
        modal_title="Roles"
        modal_description="Select the Roles of user"
        modal_component={<AddRole on_open_change={on_open_change} />}
      />
      <PowerTable props={props} api={"/security/roles"} showEdit={true} onEditClick={handleEditClick}/>
    </div>
  );
}
