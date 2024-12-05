"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";

import React, { useState } from "react";

import { useLanguage } from "@/providers/LanguageProvider";
export default function Page() {
  const { modules } = useLanguage();
  const [Data, SetData] = useState<any>([]);

  const [Columns, setColumns] = useState([
    { field: "email" },
    { field: "subject" },
    { field: "request_type", headerName: "Request Type" },
    { field: "request_status", headerName: "Request Status" },
    { field: "cc_maio", headerName: "CC mail" },
    { field: "bcc_mail", headerName: "BCC mail" },
  ]);

  const props = {
    Data,
    SetData,
    Columns,
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader props={props} items={modules?.alerts?.items} />
      <PowerTable props={props} />
    </div>
  );
}
