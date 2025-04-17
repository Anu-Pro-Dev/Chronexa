"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddHoliday from "@/forms/ta-master/AddHoliday";

import React, { useState } from "react";

import { useLanguage } from "@/providers/LanguageProvider";
export default function Page() {
  const { modules } = useLanguage();
  const [Data, SetData] = useState<any>([]);

  const [Columns, setColumns] = useState([
    { field: "description", headerName: "Holiday Name" },
    { field: "from_date", headerName: "From Date" },
    { field: "to_date", headerName: "To Date" },
    { field: "public_holiday", headerName: "Public Holiday" },
  ]);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);

  const [open, on_open_change] = useState<boolean>(false);
  const props = {
    Data,
    SetData,
    Columns,
    open,
    on_open_change,
  };

  const handleEditClick = (data: any) => {
    setSelectedRowData(data);
    on_open_change(true);
  };
  
  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        items={modules?.taMaster?.items}
        modal_title="Holidays"
       //modal_description="Holidays of the employee"
        modal_component={<AddHoliday on_open_change={on_open_change} />}
        isLarge
      />
      <PowerTable props={props} api={"/ta-master/holidays"} showEdit={true} onEditClick={handleEditClick}/>
    </div>
  );
}
