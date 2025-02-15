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
    { field: "code" },
    { field: "description" },
    { field: "reason" },
    { field: "max_no_of_permissions_per_day" },
    { field: "min_per_day" },
    { field: "max_no_of_permissions_per_month" },
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
      isAddNewPagePath="/self-services/manage-permissions/permission-types/add"
      />
      <div className="col-span-2 mt-4 mb-3">
            <h1 className="font-bold text-primary">Permission Types</h1>
            <h1 className="font-bold text-secondary">
              Permission types can be viewed in this tab
            </h1>
      </div>
      <PowerTabs items={modules?.selfServices?.manage_permissions?.items} />
      <PowerTable props={props} api={"/self-services/manage-permissions/types"} />
    </div>
  );
}
