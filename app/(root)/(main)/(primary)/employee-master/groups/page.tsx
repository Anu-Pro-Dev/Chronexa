"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import { employee_master } from "@/lib/routes";
import React, { useState } from "react";

export default function Page() {
  const [Data, SetData] = useState<any>([]);

  const [Columns, setColumns] = useState([
    { field: "code" },
    { field: "description" },
    { field: "schedule" },
    { field: "from_date", headerName: "From date" },
    { field: "to_date", headerName: "To date" },
    { field: "reporting_group", headerName: "Reporting group" },
    { field: "members", headerName: "Members" },
    { field: "updatedAt", headerName: "Updated" },
  ]);

  const props = {
    Data,
    SetData,
    Columns,
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        items={employee_master.items}
        isAddNewPagePath="/employee-master/groups/add"
      />
      <PowerTable props={props} />
    </div>
  );
}
