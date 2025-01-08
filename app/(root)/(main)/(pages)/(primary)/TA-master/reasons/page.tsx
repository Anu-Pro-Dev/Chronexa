"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddReason from "@/forms/ta-master/AddReason";

import React, { useState } from "react";

import { useLanguage } from "@/providers/LanguageProvider";
export default function Page() {
  const { modules } = useLanguage();
  const [Data, SetData] = useState<any>([]);

  const [Columns, setColumns] = useState([
    { field: "code" },
    { field: "reason_mode", headerName: "Reason Mode" },
    { field: "description_en", headerName: "Description(English)" },
    { field: "description_ar", headerName: "Description(العربية)" },
    { field: "prompt_message", headerName: "Prompt message" },
    { field: "web_punch", headerName: "Web Punch" },
    { field: "geo_fence", headerName: "Geo Fence" },
  ]);

  const [open, on_open_change] = useState<boolean>(false);
  const props = {
    Data,
    SetData,
    Columns,
    open,
    on_open_change,
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        isLarge
        props={props}
        items={modules?.ta_master?.items}
        modal_component={<AddReason on_open_change={on_open_change} />}
      />
      <PowerTable props={props} api={"/ta-master/reasons"} />
    </div>
  );
}
