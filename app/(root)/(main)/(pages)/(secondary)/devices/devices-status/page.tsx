"use client";
import React, { useState } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import { useLanguage } from "@/providers/LanguageProvider";
import { useRouter } from "next/navigation";

export default function Page() {
  const { modules } = useLanguage();
  const router = useRouter();
  const [Columns, setColumns] = useState([
    // { field: "code" },
    { field: "name" },
    // { field: "buildings" },
    { field: "active" },
  ]);
  const [Data, SetData] = useState<any>([]);
  const [CurrentPage, SetCurrentPage] = useState<number>(1);
  const [SortField, SetSortField] = useState<string>("");
  const [SortDirection, SetSortDirection] = useState<string>("asc");
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
  };

  const handleEditClick = (data: any) => {
    setSelectedRowData(data);
    router.push("/devices/devices-status/add");
  };

  return (
    <div className="flex flex-col gap-4 ">
      <PowerHeader
        props={props}
        items={modules?.devices?.items}
        isAddNewPagePath="/devices/devices-status/add"
        // disableAdd
      />
      <PowerTable props={props} api={"/devices/devices-status"} showEdit={true} onEditClick={handleEditClick}/>
    </div>
  );
}
