"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import { security } from "@/lib/routes";
import React, { useState } from "react";

export default function Page() {
  const [Data, SetData] = useState<any>([]);

  const [Columns, setColumns] = useState([
    { field: "code" },
    { field: "privileges" },
    { field: "users" },
  ]);

  const props = {
    Data,
    SetData,
    Columns,
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader props={props} items={security?.items} />
      <PowerTable props={props} />
    </div>
  );
}
