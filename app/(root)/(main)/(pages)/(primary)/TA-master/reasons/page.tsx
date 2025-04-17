"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddReason from "@/forms/ta-master/AddReason";

import React, { useState } from "react";

import { useLanguage } from "@/providers/LanguageProvider";
export default function Page() {
  const { modules } = useLanguage();
  const [Data, SetData] = useState<any>([]);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);

  const [Columns, setColumns] = useState([
    { field: "code" },
    { field: "descriptionEng", headerName: "Description (English)" },
    { field: "descriptionArb", headerName: "Description (العربية)" },
    // { field: "reason_mode", headerName: "Reason Mode" },
    // { field: "prompt_message", headerName: "Prompt Message" },
    // { field: "deleteable" },
    // { field: "normal_in", headerName: "Normal In" },
    // { field: "normal_out", headerName: "Normal Out" },
    { field: "web_punch", headerName: "Web Punch" },
    { field: "geo_fence_required", headerName: "Geo Fence Required" },
  ]);

  const [open, on_open_change] = useState<boolean>(false);
  const props = {
    Data,
    SetData,
    Columns,
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
        isLarge
        props={props}
        items={modules?.taMaster?.items}
        modal_title="Reasons"
       //modal_description="Reasons of the employee permission"
        modal_component={<AddReason on_open_change={on_open_change} />}
      />
      <PowerTable props={props} api={"/ta-master/reasons"} showEdit={true} onEditClick={handleEditClick}/>
    </div>
  );
}
