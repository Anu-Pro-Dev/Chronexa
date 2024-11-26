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
  ]);
  const items = [
    {
      label: "Departments",
      path: "/organization/departments",
      value: "departments",
    },
    {
      label: "Structures",
      path: "/organization/structures",
      value: "types",
    },
    {
      label: "Types",
      path: "/organization/types",
      value: "types",
      addAttributeForm: "/organization/departments/add",
    },
  ];
  const context = {
    data_fetch_route: "/regions",
    data_add_route: "/regions/add",
    data_delete_route: "/regions/delete",
  };

  const props = {
    Data,
    SetData,
    Columns,
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        items={organization.items}
        disableAdd
        disableDelete
        disableSearch
      />
      <div>
        <h1>Structures</h1>
      </div>
    </div>
  );
}
