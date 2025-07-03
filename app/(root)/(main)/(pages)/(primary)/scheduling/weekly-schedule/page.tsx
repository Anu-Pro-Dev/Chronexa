"use client";
import React, { useState } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/providers/LanguageProvider";
import FilterWeeklyScheduling from "@/forms/scheduling/FilterWeeklyScheduling";

export default function Page() {
  const { modules } = useLanguage();
  const [Data, SetData] = useState<any>([]);
  const router = useRouter();
  const [Columns, setColumns] = useState([
    // { field: "from_date", headerName: "From date" },
    // { field: "to_date", headerName: "To date" },
    // { field:"sunday" },
    { field: "monday" },
    { field: "tuesday" },
    { field: "wednesday" },
    { field: "thursday" },
    { field: "friday" },
    // { field:"saturday" },
    { field: "attachment" },
  ])

  const [open, on_open_change] = useState<boolean>(false);
  const [filter_open, filter_on_open_change] = useState<boolean>(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);

  const props = {
    Data,
    SetData,
    Columns,
    open,
    on_open_change,
    filter_open,
    filter_on_open_change,
  };

  const handleEditClick = (data: any) => {
    setSelectedRowData(data);
    router.push("/scheduling/weekly-schedule/add");
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        items={modules?.scheduling?.items}
        // enableFilters
        isAddNewPagePath="/scheduling/weekly-schedule/add"
        // filter_modal_title="Filters"
        // filter_modal_description="Choose the filter you searching for"
        // filter_modal_component={
        //   <FilterWeeklyScheduling on_open_change={filter_on_open_change} />
        // }
      />
      <div className="">
        <FilterWeeklyScheduling/>
        <PowerTable props={props} api={"/scheduling/weekly-schedule"} showEdit={true} onEditClick={handleEditClick}/>
      </div>
    </div>
  );
}
