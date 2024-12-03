"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddReaderDevices from "@/forms/devices/AddReaderDevices";
import { devices } from "@/lib/routes";

import React, { useState } from "react";

export default function Page() {
  const [Data, SetData] = useState<any>([]);

  const [Columns, setColumns] = useState([
    { field: "code" },
    { field: "name" },
    { field: "building" },
    { field: "ip_address", headerName: "IP address" },
    { field: "port" },
    { field: "location" },
    { field: "enabled" },
  ]);

  const props = {
    Data,
    SetData,
    Columns,
  };

  return (
    <div className="flex flex-col gap-4 ">
      <PowerHeader
        props={props}
        items={devices?.items}
        isAddNewPagePath="/devices/readers/add"
      />
      <PowerTable props={props} />
    </div>
  );
}
