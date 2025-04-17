"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";

import React, { useState } from "react";

import { useLanguage } from "@/providers/LanguageProvider";
export default function Page() {
  const { modules } = useLanguage();

  const [Columns, setColumns] = useState([
    { field: "descriptionEng", headerName: "Description (English)" },
    { field: "descriptionArb", headerName: "Description (العربية)" },
    { field: "subject", headerName: "Subject" },
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
    row_selection: false,
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
    EnableBorders: true,
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        items={modules?.settings?.items}
        disableAdd
        disableDelete
      />
      <PowerTable props={props} Data={Data} api={"/settings/notifications"} showCheckbox={false}/>
    </div>
  );
}
