"use client";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";

import React, { useState } from "react";

import { useLanguage } from "@/src/providers/LanguageProvider";
import PowerTabs from "@/src/components/custom/power-comps/power-tabs";
import FilterPendingApproval from "@/src/components/custom/modules/self-services/FilterPendingApproval";
export default function Page() {
  const { modules } = useLanguage();
  const [Data, SetData] = useState<any>([]);

  const [Columns, setColumns] = useState([
    { field: "number" },
    { field: "employee" },
    { field: "type" },
  ]);

  const [open, on_open_change] = useState<boolean>(false);

  const [filter_open, filter_on_open_change] = useState<boolean>(false);
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
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        items={modules?.manageApprovals?.items}
        disableAdd
        disableDelete
        enableApprove
        enableReject
        size="large"
      />
      <div className="bg-accent rounded-2xl">
        <div className="col-span-2 p-6">
          <h1 className="font-bold text-xl text-primary">Permission Approval</h1>
        </div>
        <div className="px-6">
          <PowerTabs />
        </div>
        <PowerTable props={props} api={"/self-services/approvals/pending"} />
      </div>
    </div>
  );
}
