"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddGradesCompanyMaster from "@/forms/AddGradesCompanyMaster";
import React, { useState } from "react";

import { useLanguage } from "@/providers/LanguageProvider";

export default function Page() {
  const { modules } = useLanguage();

  const [Columns, setColumns] = useState([
    { field: "code", headerName: "Code" },
    { field: "description", headerName: "Description" },
    {
      field: "overtime_eligible",
      headerName: "Overtime eligible ",
    },
    { field: "senior_employee", headerName: "Senior employee" },
    { field: "updatedAt", headerName: "Updated" },
  ]);

  const [open, on_open_change] = useState<boolean>(false);

  const [Data, SetData] = useState<any>([]);
  const [CurrentPage, SetCurrentPage] = useState<number>(1);
  const [SortField, SetSortField] = useState<string>("");
  const [SortDirection, SetSortDirection] = useState<string>("asc");
  const [SearchValue, SetSearchValue] = useState<string>("");

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
        items={modules?.companyMaster.items}
        modal_component={
          <AddGradesCompanyMaster on_open_change={on_open_change} />
        }
      />
      <PowerTable props={props} api={"/company-master/grades"} />
    </div>
  );
}
