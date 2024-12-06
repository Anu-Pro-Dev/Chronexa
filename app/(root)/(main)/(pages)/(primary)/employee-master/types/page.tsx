"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddEmployeeTypeEmployeeMaster from "@/forms/employee-master/AddEmployeeType";
import React, { useState } from "react";

import { useLanguage } from "@/providers/LanguageProvider";
export default function Page() {
  const { modules } = useLanguage();
  const [Data, SetData] = useState<any>([]);

  const [Columns, setColumns] = useState([
    { field: "code" },
    { field: "description" },
    { field: "updatedAt", headerName: "updatedAt" },
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
        items={modules?.employee_master.items}
        modal_component={
          <AddEmployeeTypeEmployeeMaster on_open_change={on_open_change} />
        }
      />
      <PowerTable props={props} />
    </div>
  );
}
