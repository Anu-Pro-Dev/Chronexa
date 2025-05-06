"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import React, { useState } from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const { modules } = useLanguage();
  const [Data, SetData] = useState<any>([]);
  const [CurrentPage, SetCurrentPage] = useState<number>(1);
  const [SortField, SetSortField] = useState<string>("");
  const [SortDirection, SetSortDirection] = useState<string>("asc");
  const [SearchValue, SetSearchValue] = useState<string>("");
  const [open, on_open_change] = useState<boolean>(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
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
    { field: "in_time", headerName: "In Time" },
    { field: "out_time", headerName: "Out Time" },
    { field: "inactive_date", headerName: "Inactive Date" },
  ]);
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

  const handleEditClick = (data: any) => {
    setSelectedRowData(data);
    router.push("/scheduling/schedules/add");
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        items={modules?.scheduling?.items}
        isAddNewPagePath="/scheduling/schedules/add"
      />
      <PowerTable props={props} Data={Data} showEdit={true} onEditClick={handleEditClick}/>
    </div>
  );
}
