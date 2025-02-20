"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";

import React, { useState } from "react";

import { useLanguage } from "@/providers/LanguageProvider";
import PowerTabs from "@/components/custom/power-comps/power-tabs";
import FilterDataOnVerification from "@/forms/self-services/FilterDataOnVerification";
export default function Page() {
  const { modules } = useLanguage();
  const [Data, SetData] = useState<any>([]);

  const [Columns, setColumns] = useState([
    { field: "number" },
    { field: "name" },
    { field: "type" },
    { field: "date" },
    { field: "time" },
    { field: "approved_by", headerName: "Approved by" },
    { field: "remarks"},
  ]);
  const [open, on_open_change] = useState<boolean>(false)
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
  const [current_tab, set_current_tab] = useState("verification");

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        enableTakeAction
        props={props}
        items={modules?.selfServices?.items}
        disableAdd
        disableDelete
        enableFilters
        isLarge={true}
        filter_modal_component={
          <FilterDataOnVerification on_open_change={filter_on_open_change} />
        }
      />
      <div className="bg-white rounded-2xl">
        <div className="col-span-2 p-6">
          <h1 className="font-bold text-xl text-primary">Verification Approval</h1>
          <h1 className="font-semibold text-sm text-text-secondary">
            List of items waiting for verifications
          </h1>
        </div>
        <div className="px-6">
          <PowerTabs
            items={[
              {
                url: "/self-services/approvals/verification/",
                label: "Verification",
              },
              {
                url: "/self-services/approvals/pending/",
                label: "Pending",
              },
            ]}
          />
        </div>
        <PowerTable props={props} api={"/self-services/approvals/verification"} />
      </div>
    </div>
  );
}
