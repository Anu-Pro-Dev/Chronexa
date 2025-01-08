"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";

import React, { useState } from "react";

import { useLanguage } from "@/providers/LanguageProvider";
export default function Page() {
  const { modules } = useLanguage();

  const [SelectedKeys, SetSelectedKeys] = useState<any>([]);
  const [Columns, setColumns] = useState([
    { field: "number" },
    { field: "name" },
    { field: "manager" },
    { field: "punch" },
    { field: "active" },
    { field: "designation" },
    { field: "organization" },
  ]);

  const [Data, SetData] = useState<any>([]);
  const [CurrentPage, SetCurrentPage] = useState<number>(1);
  const [SortField, SetSortField] = useState<string>("");
  const [SortDirection, SetSortDirection] = useState<string>("asc");
  const [SearchValue, SetSearchValue] = useState<string>("");
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
    SearchValue,
    SetSearchValue,
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        items={modules?.employee_master.items}
        isAddNewPagePath="/employee-master/employees/add"
      />
      <PowerTable props={props} api={"/employee-master/employees"} />
    </div>
  );
}
