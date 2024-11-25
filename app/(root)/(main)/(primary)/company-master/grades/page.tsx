"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import React, { useState } from "react";

export default function Page() {
  const [Data, SetData] = useState<any>([]);
  const props = {
    Data,
    SetData,
  };
  return (
    <div>
      <PowerHeader
        props={props}
        items={[
          {
            label: "Regions",
            path: "/company-master/regions",
            value: "regions",
          },
          { label: "Grades", path: "/company-master/grades", value: "grades" },
        ]}
      />
      <PowerTable props={props}/>
    </div>
  );
}
