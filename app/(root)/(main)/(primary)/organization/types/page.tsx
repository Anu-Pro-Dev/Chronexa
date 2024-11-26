"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import React, { useState } from "react";

export default function Page() {
  const [Data, SetData] = useState<any>([]);

  const [Columns, setColumns] = useState([{ field: "desription" }]);
  const items = [
    {
      label: "Departments",
      path: "/organization/departments",
      value: "departments",
    },
    {
      label: "Types",
      path: "/organization/types",
      value: "types",
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
      <PowerHeader props={props} items={items} />
      <PowerTable props={props} />
    </div>
  );
}
