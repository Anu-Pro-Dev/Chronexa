"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";

import React, { useState } from "react";

import { useLanguage } from "@/providers/LanguageProvider";
import AddApplicationSettings from "@/forms/settings/AddApplicationSettings";
import PowerTabs from "@/components/custom/power-comps/power-tabs";
export default function Page() {
  const { modules } = useLanguage();

  const [Columns, setColumns] = useState([
    { field: "name" },
    { field: "value" },
    { field: "deletable" },
    { field: "description" },
    { field: "updated_by" },
    { field: "updatedAt" },
  ]);

  const [Data, SetData] = useState<any>([]);
  const [CurrentPage, SetCurrentPage] = useState<number>(1);
  const [SortField, SetSortField] = useState<string>("");
  const [SortDirection, SetSortDirection] = useState<string>("asc");
  const [SearchValue, SetSearchValue] = useState<string>("");
  const [open, on_open_change] = useState<boolean>(false);
  const props = {
    Data,
    SetData,
    Columns,
    SortField,
    CurrentPage,
    SetCurrentPage,
    SetSortField,
    SortDirection,
    SetSortDirection,
    open,
    on_open_change,
    SearchValue,
    SetSearchValue,
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        items={modules?.settings?.items}
        modal_title="Application Settings"
        modal_description="Choose the data to add new application settings"
        modal_component={
          <AddApplicationSettings on_open_change={on_open_change} />
        }
      />
      <div className="col-span-2 mt-4 mb-3">
            <h1 className="font-bold text-primary">Verification</h1>  
            <h1 className="font-bold text-secondary">
              Select the region of the employee
            </h1>
      </div>
      <PowerTabs items={modules?.settings?.manage_movements?.items} />
      <PowerTable props={props} api={"/settings/application-settings"} />
    </div>
  );
}
