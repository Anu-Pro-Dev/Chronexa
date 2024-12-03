"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddEmployeeGroup from "@/forms/employee-master/AddEmployeeGroup";
import { employee_master, organization } from "@/lib/routes";
import React, { useState } from "react";

export default function Page() {
  const [Data, SetData] = useState<any>([]);

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader items={employee_master.items} disableFeatures />
      <AddEmployeeGroup />
    </div>
  );
}
