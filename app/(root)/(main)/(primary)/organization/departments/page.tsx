"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
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
      isAddPage: true,
      addPagePath: "/organization/departments/add",
    },
    {
      label: "Structures",
      path: "/organization/structures",
      value: "types",
      isAdd: false,
      isCustomPage: <div></div>,
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
      <PowerHeader props={props} items={items} />
      <PowerTable props={props} />
    </div>
  );
}
