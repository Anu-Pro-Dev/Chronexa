"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddHoliday from "@/forms/ta-master/AddHoliday";
import { devices, self_services, ta_master } from "@/lib/routes";

import React, { useState } from "react";

export default function Page() {
  const [Data, SetData] = useState<any>([]);

  const [Columns, setColumns] = useState([
    { field: "code" },
    { field: "reason_mode", headerName: "Reason Mode" },
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
        items={ta_master?.items}
        modal_component={<AddHoliday on_open_change={on_open_change} />}
        isLarge
      />
      <PowerTable props={props} />
    </div>
  );
}
