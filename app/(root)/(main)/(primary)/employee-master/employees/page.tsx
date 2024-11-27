"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import { employee_master } from "@/lib/routes";
import React, { useState } from "react";

export default function Page() {
  const [Data, SetData] = useState<any>([]);
  const [SelectedKeys, SetSelectedKeys] = useState<any>([]);
  const [Columns, setColumns] = useState([
    { field: "number" },
    { field: "name" },
    { field: "manager" },
    { field: "punch" },
    { field: "active" },
    { field: "designation" },
    { field: "organization" },
  ]);

  const props = {
    Data,
    SetData,
    Columns,
    SelectedKeys,
    SetSelectedKeys,
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader props={props} items={employee_master.items} />
      <PowerTable props={props} />
    </div>
  );
}
