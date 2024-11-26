"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import { organization } from "@/lib/routes";
import React, { useState } from "react";

export default function Page() {
  const [Data, SetData] = useState<any>([]);

  const [Columns, setColumns] = useState([{ field: "desription" }]);

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
      <PowerHeader props={props} items={organization.items} />
      <PowerTable props={props} />
    </div>
  );
}
