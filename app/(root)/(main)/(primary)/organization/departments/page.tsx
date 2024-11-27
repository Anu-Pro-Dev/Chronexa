"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import { organization } from "@/lib/routes";
import React, { useState } from "react";

export default function Page() {
  const [Data, SetData] = useState<any>([]);

  const [Columns, setColumns] = useState([
    { field: "number" },
    { field: "name" },
    { field: "manager" },
    { field: "punch" },
    { field: "active" },
    { field: "description" },
    { field: "organization" },
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
        items={organization.items}
        isAddNewPagePath="/organization/departments/add"
      />
      <PowerTable props={props} />
    </div>
  );
}
