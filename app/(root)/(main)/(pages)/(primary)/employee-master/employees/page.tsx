"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";

import React, { useState } from "react";

import { useLanguage } from "@/providers/LanguageProvider";
export default function Page() {
  const { modules } = useLanguage();
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
      <PowerHeader
        props={props}
        items={modules?.employee_master.items}
        isAddNewPagePath="/employee-master/employees/add"
      />
      <PowerTable props={props} />
    </div>
  );
}
