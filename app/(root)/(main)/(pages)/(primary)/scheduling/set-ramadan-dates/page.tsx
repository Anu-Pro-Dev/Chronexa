"use client";
import React, { useState } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddRamadanDateRange from "@/forms/scheduling/AddRamadanDateRange";
import { useLanguage } from "@/providers/LanguageProvider";

export default function Page() {
  const { modules } = useLanguage();
  const [Data, SetData] = useState<any>([]);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);

  const [Columns] = useState([
    { field: "descriptionEng", headerName: "Ramadan (English)" },
    { field: "descriptionArb", headerName: "Ramadan (العربية)" },
    { field: "from_date", headerName: "From date" },
    { field: "to_date", headerName: "To date" },
  ]);

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
        isLarge
        props={props}
        items={modules?.scheduling?.items}
        modal_title="Ramadan Dates"
       //modal_description="Ramadan Dates of the employee"
        modal_component={
          <AddRamadanDateRange on_open_change={on_open_change} />
        }
      />
      <PowerTable props={props} Data={Data} showEdit={true} onEditClick={handleEditClick}/>
    </div>
  );
}
