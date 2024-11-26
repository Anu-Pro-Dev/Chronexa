"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import { organization } from "@/lib/routes";
import React, { useState } from "react";

export default function Page() {
  const [Data, SetData] = useState<any>([
    {
      number: 1,
      name: "page a",
    },
    {
      number: 2,
      name: "page b",
    },
  ]);

  const [Columns, setColumns] = useState([
    { field: "number", sort: "asc" },
    { field: "name", sort: "asc" },
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
