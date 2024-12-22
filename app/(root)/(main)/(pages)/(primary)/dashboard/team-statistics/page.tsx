"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import React, { useState } from "react";

import { useLanguage } from "@/providers/LanguageProvider";
import TeamStatisticsPage from "@/components/custom/dashboard-comps/team-statistics/TSPage";
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
      <PowerHeader
        disableAdd
        disableDelete
        disableSearch
        items={modules?.dashboard.items}
      />
      <div>
        <TeamStatisticsPage />
      </div>
    </div>
  );
}
