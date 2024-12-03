"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddRamadanDateRange from "@/forms/ta-master/AddRamadanDateRange";
import { devices, self_services, ta_master } from "@/lib/routes";

import React, { useState } from "react";

export default function Page() {
  const [Data, SetData] = useState<any>([]);

  const [Columns] = useState([
    { field: "remarks" },
    { field: "description_en", headerName: "Description(English)" },
    { field: "description_ar", headerName: "Description(العربية)" },
    { field: "from_date", headerName: "From date" },
    { field: "to_date", headerName: "To date" },
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
        items={ta_master?.items}
        modal_component={
          <AddRamadanDateRange on_open_change={on_open_change} />
        }
      />
      <PowerTable props={props} />
    </div>
  );
}
