"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddManageMovements from "@/forms/self-services/AddManageMovements";

import React, { useState } from "react";

import { useLanguage } from "@/providers/LanguageProvider";
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
        items={modules?.self_services?.items}
        isLarge
        modal_component={<AddManageMovements on_open_change={on_open_change} />}
      />
      <PowerTable props={props} />
    </div>
  );
}
