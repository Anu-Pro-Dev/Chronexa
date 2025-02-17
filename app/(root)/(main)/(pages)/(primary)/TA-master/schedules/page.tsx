"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import React, { useState } from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import { useRouter } from "next/navigation";

export default function Page() {
  const { modules } = useLanguage();
  const router = useRouter();
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
    { field: "updatedAt", headerName: "Updated" },
  ]);

  const [Data, SetData] = useState<any>([]);
  const [CurrentPage, SetCurrentPage] = useState<number>(1);
  const [SortField, SetSortField] = useState<string>("");
  const [SortDirection, SetSortDirection] = useState<string>("asc");
  const [SearchValue, SetSearchValue] = useState<string>("");
  const [open, on_open_change] = useState<boolean>(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  
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
    router.push("/TA-master/schedules/add");
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        items={modules?.taMaster?.items}
        isAddNewPagePath="/TA-master/schedules/add"
      />
      <PowerTable props={props} api={"/ta-master/schedules"} showEdit={true} onEditClick={handleEditClick}/>
    </div>
  );
}
