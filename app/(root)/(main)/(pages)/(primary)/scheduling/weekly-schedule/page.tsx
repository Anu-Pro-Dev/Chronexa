"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";

import React, { useState } from "react";

import { useLanguage } from "@/providers/LanguageProvider";
import FilterWeeklyScheduling from "@/forms/scheduling/FilterWeeklyScheduling";
import AddWeeklySchedule from "@/forms/scheduling/AddWeeklySchedule";
export default function Page() {
  const { modules } = useLanguage();
  const [Data, SetData] = useState<any>([]);

  const [Columns, setColumns] = useState([
    { field: "number" },
    { field: "name" },
  ]);

  const [open, on_open_change] = useState<boolean>(false);
  const [filter_open, filter_on_open_change] = useState<boolean>(false);

  const props = {
    Data,
    SetData,
    Columns,
    open,
    on_open_change,
    filter_open,
    filter_on_open_change,
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        items={modules?.scheduling?.items}
        enableFilters
        isAddNewPagePath="/scheduling/weekly-schedule/add"
        filter_modal_title="Filters"
        filter_modal_description="Choose the filter you searching for"
        filter_modal_component={
          <FilterWeeklyScheduling on_open_change={filter_on_open_change} />
        }
      />
      <PowerTable props={props} />
    </div>
  );
}
