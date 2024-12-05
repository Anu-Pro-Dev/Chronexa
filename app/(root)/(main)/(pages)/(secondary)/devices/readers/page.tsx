"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";

import React, { useState } from "react";

import { useLanguage } from "@/providers/LanguageProvider";
export default function Page() {
  const { modules } = useLanguage();
  const [Columns, setColumns] = useState([
    { field: "code" },
    { field: "name" },
    { field: "buildings" },
    { field: "ip_address", headerName: "IP address" },
    { field: "port" },
    { field: "location" },
    { field: "active" },
  ]);
  const [Data, SetData] = useState<any>([]);
  const [CurrentPage, SetCurrentPage] = useState<number>(1);
  const [SortField, SetSortField] = useState<string>("");
  const [SortDirection, SetSortDirection] = useState<string>("asc");

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
  };

  return (
    <div className="flex flex-col gap-4 ">
      <PowerHeader
        props={props}
        items={modules?.devices?.items}
        isAddNewPagePath="/devices/readers/add"
      />
      <PowerTable props={props}  />
    </div>
  );
}
