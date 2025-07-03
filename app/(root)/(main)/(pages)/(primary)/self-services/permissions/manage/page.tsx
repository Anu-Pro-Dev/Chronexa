"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";

import React, { useState } from "react";

import { useLanguage } from "@/providers/LanguageProvider";
import PowerTabs from "@/components/custom/power-comps/power-tabs";
export default function Page() {
  const { modules } = useLanguage();
  const [Data, SetData] = useState<any>([]);

  const [Columns, setColumns] = useState([
    { field: "description", headerName: "Description" },
    { field: "reason", headerName: "Reason" },
    { field: "min_per_day", headerName: "Min Per Day" },
  ]);

  const [open, on_open_change] = useState<boolean>(false)
  const [filter_open, filter_on_open_change] = useState<boolean>(false)
  const [CurrentPage, SetCurrentPage] = useState<number>(1)
  const [SortField, SetSortField] = useState<string>("")
  const [SortDirection, SetSortDirection] = useState<string>("asc")
  const [SearchValue, SetSearchValue] = useState<string>("")

   const props = {
    Data,
    SetData,
    Columns,
    filter_open,
    filter_on_open_change,
    SortField,
    CurrentPage,
    SetCurrentPage,
    SetSortField,
    SortDirection,
    SetSortDirection,
    SearchValue,
    SetSearchValue,
    open,
    on_open_change,
  }

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader 
      props={props} 
      items={modules?.selfServices?.items} 
      isAddNewPagePath="/self-services/permissions/manage/add"
      />
      <div className="bg-accent rounded-2xl">
        <div className="col-span-2 p-6">
          <h1 className="font-bold text-xl text-primary">Manage Permissions</h1>
        </div>
        <div className="px-6">
          <PowerTabs items={modules?.selfServices?.permissions?.items} />
        </div>
        <PowerTable props={props} api={"/self-services/manage-permissions/types"} />
      </div>
    </div>
  );
}
