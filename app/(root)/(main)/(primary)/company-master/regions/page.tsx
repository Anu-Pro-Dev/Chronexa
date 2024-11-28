"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddRegionsCompanyMaster from "@/forms/AddRegionsCompanyMaster";
import { company_master } from "@/lib/routes";
import React, { useState } from "react";

export default function Page() {
  const [Data, SetData] = useState<any>([]);

  const [Columns, setColumns] = useState([
    { field: "code", headerName: "Code" },
    { field: "description", headerName: "Description" },
    { field: "updatedAt", headerName: "Updated" },
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
        items={company_master.items}
        modal_component={
          <AddRegionsCompanyMaster on_open_change={on_open_change} />
        }
      />
      <PowerTable props={props} />
    </div>
  );
}
