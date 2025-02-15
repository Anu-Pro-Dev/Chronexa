"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";

import React, { useState } from "react";

import { useLanguage } from "@/providers/LanguageProvider";
import FilterEmailForm from "@/forms/alerts/FilterEmailForm";
import { FileX } from "lucide-react";
export default function Page() {
  const { modules } = useLanguage();

  const [Columns, setColumns] = useState([
    { field: "email" },
    { field: "subject" },
    { field: "email_body", headerName: "Email Body" },
    { field: "status" },
    { field: "cc_email", headerName: "CC Email" },
    { field: "bcc_email", headerName: "BCC Email" },
    { field: "complete_violation", headerName: "Complete Violation" },
    { field: "created_date", headerName: "Created Date" },
    { field: "updatedAt", headerName: "Updated Date" },
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
        isExport
      />
      <PowerTable 
        props={props} 
        api={"/alerts/email"} 
        showCheckbox={false}
        customColDef={{
          flex: 0,
        }}
      />
    </div>
  );
}
