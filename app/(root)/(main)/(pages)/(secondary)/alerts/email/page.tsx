"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";

import React, { useState } from "react";

import { useLanguage } from "@/providers/LanguageProvider";
import FilterEmailForm from "@/forms/alerts/FilterEmailForm";
export default function Page() {
  const { modules } = useLanguage();

  const [Columns, setColumns] = useState([
    { field: "email" },
    { field: "subject" },
    { field: "email_body" },
    { field: "status" },
    { field: "cc_email" },
    { field: "bcc_email" },
    { field: "complete_violation" },
    { field: "created_date" },
    { field: "updatedAt" },
  ]);

  const [Data, SetData] = useState<any>([]);
  const [CurrentPage, SetCurrentPage] = useState<number>(1);
  const [SortField, SetSortField] = useState<string>("");
  const [SortDirection, SetSortDirection] = useState<string>("asc");
  const [open, on_open_change] = useState<boolean>(false);
  const props = {
    Data,
    SetData,
    open,
    on_open_change,
    Columns,
    SortField,
    CurrentPage,
    SetCurrentPage,
    SetSortField,
    SortDirection,
    SetSortDirection,
    EnableBorders: true,
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        items={modules?.alerts?.items}
        disableAdd
        disableDelete
      />
      <PowerTable props={props} api={"/alerts/email"} showCheckbox={false}/>
    </div>
  );
}
