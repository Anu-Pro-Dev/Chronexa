"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";

import React, { useState } from "react";

import { useLanguage } from "@/providers/LanguageProvider";
import PowerTabs from "@/components/custom/power-comps/power-tabs";
export default function Page() {
  const { modules } = useLanguage();
  const [Data, SetData] = useState<any>([]);

  const [Columns, setColumns] = useState([
    { field: "number" },
    { field: "name" },
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
        props={props}
        items={modules?.selfServices?.items}
            disableAdd
        disableDelete
      />
      <div className="col-span-2 mt-4 mb-3">
            <h1 className="font-bold text-primary">Approve Missing Movements</h1>
            <h1 className="font-bold text-secondary">
              Enter the personal information for the process
            </h1>
      </div>
      <PowerTabs items={modules?.selfServices?.manage_movements?.items} />
      <PowerTable props={props} />
    </div>
  );
}
