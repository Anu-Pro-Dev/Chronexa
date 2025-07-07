"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddEmployeeGroup from "@/forms/employee-master/AddEmployeeGroup";

import React, { useState } from "react";

import { useLanguage } from "@/providers/LanguageProvider";
import AddWeeklySchedule from "@/forms/scheduling/AddWeeklySchedule";
export default function Page() {
  const { modules } = useLanguage();
  const [Data, SetData] = useState<any>([]);

  return (
    <div>
      <PowerHeader
        items={modules?.scheduling.items}
        disableFeatures
      />
      {/* <div className="bg-accent p-4">
        <h1 className="text-primary text-lg font-bold">Schedule add section</h1>
        <p className="text-secondary pb-6">
          Choose the schedule for further process
        </p> */}
      <div className="pt-4">
        <AddWeeklySchedule />
      </div>
      {/* </div> */}
    </div>
  );
}
