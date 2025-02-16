"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddTypeOrganization from "@/forms/AddTypeOrganization";
import React, { useState } from "react";

import { useLanguage } from "@/providers/LanguageProvider";
export default function Page() {
  const { modules } = useLanguage();

  const [Columns, setColumns] = useState([
    { field: "description" },
    { field: "updatedAt" },
  ]);

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

  const handleEditClick = (data: any) => {
    setSelectedRowData(data);
    on_open_change(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        items={modules?.organization.items}
        modal_title="Organization Types"
        modal_description="Organization Types of the employee"
        modal_component={
          <AddTypeOrganization on_open_change={on_open_change} />
        }
      />
      <PowerTable props={props} api={"/organization/types"} showEdit={true} onEditClick={handleEditClick}/>
    </div>
  );
}
