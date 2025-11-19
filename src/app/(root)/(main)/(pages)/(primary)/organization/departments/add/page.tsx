"use client";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import React, { useState } from "react";

import { useLanguage } from "@/src/providers/LanguageProvider";
import AddDepartment from "@/src/components/custom/modules/organization/AddDepartment";
export default function Page() {
  const { modules } = useLanguage();
  const [Data, SetData] = useState<any>([]);

  const [Columns, setColumns] = useState([
    { field: "number" },
    { field: "name" },
  ]);

  const props = {
    Data,
    SetData,
    Columns,
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader items={modules?.organization.items} disableFeatures />
      {/* <AddDepartment /> */}
    </div>
  );
}
