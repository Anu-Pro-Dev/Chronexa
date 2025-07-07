"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";

import React, { useState } from "react";

import { useLanguage } from "@/providers/LanguageProvider";
import PowerTabs from "@/components/custom/power-comps/power-tabs";
import FilterPendingApproval from "@/forms/self-services/FilterPendingApproval";
export default function Page() {
  const { modules } = useLanguage();
  const [Data, SetData] = useState<any>([]);

  const [Columns, setColumns] = useState([
    { field: "number" },
    { field: "employee" },
    // { field: "request_type" },
    { field: "type" },
    // { field: "from_date" },
    // { field: "to_date" },
    // { field: "from_time" },
    // { field: "to_time" },
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
        // enableFilters
        // filter_modal_title="none"
        // filter_modal_component={
        //   <FilterPendingApproval on_open_change={filter_on_open_change} />
        // }
        isLarge={true}
      />
      <div className="bg-accent rounded-2xl">
        <div className="col-span-2 p-6">
          <h1 className="font-bold text-xl text-primary">Permission Approval</h1>
          {/* <h1 className="font-semibold text-sm text-text-secondary">
            List of items pending for approvals
          </h1> */}
        </div>
        <div className="px-6">
          <PowerTabs items={modules?.manageApprovals?.teamrequests?.items} />
        </div>
        <PowerTable props={props} api={"/self-services/approvals/pending"} />
      </div>
    </div>
  );
}
