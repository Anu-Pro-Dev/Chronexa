"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";

import React, { useState } from "react";

import { useLanguage } from "@/providers/LanguageProvider";
export default function Page() {
  const { modules } = useLanguage();

  const [Columns, setColumns] = useState([
    { field: "code" },
    {
      field: "color",
      cellRenderer: (params: any) => {
        return (
          <div
            className={"h-4 w-4"}
            style={{
              backgroundColor: params.value,
            }}
          ></div>
        );
      },
    },
    { field: "organization" },
    { field: "in_time" },
    { field: "out_time" },
    { field: "inactive_date" },
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
        items={modules?.taMaster?.items}
        isAddNewPagePath="/TA-master/schedules/add"
      />
      <PowerTable props={props} api={"/ta-master/schedules"} />
    </div>
  );
}
