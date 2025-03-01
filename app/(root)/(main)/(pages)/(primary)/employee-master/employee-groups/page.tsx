"use client";
import React, { useState } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import { useLanguage } from "@/providers/LanguageProvider";
import { useRouter } from "next/navigation";

export default function Page() {
  const { modules } = useLanguage();
  const router = useRouter();
  const [Data, SetData] = useState<any>([]);
  const [CurrentPage, SetCurrentPage] = useState<number>(1);
  const [SortField, SetSortField] = useState<string>("");
  const [SortDirection, SetSortDirection] = useState<string>("asc");
  const [SearchValue, SetSearchValue] = useState<string>("");
  const [open, on_open_change] = useState<boolean>(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);

  const handleCellClickPath = (data: any) => {
    console.log("Navigating to:", `/employee-master/employee-groups/${data.code}`);
    router.push(`/employee-master/employee-groups/${data.code}-members`);
  };

  const handleEditClick = (data: any) => {
    setSelectedRowData(data);
    router.push("/employee-master/employee-groups/add");
  };

  const [Columns, setColumns] = useState([
    { field: "code" },
    { field: "description" },
    { field: "schedule" },
    { field: "from_date", headerName: "From date" },
    { field: "to_date", headerName: "To date" },
    { field: "reporting_group", headerName: "Reporting group" },
    { field: "members", headerName: "Members", clickable: true, onCellClick: handleCellClickPath },
    { field: "updated", headerName: "Updated" },
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

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        items={modules?.employeeMaster.items}
        isAddNewPagePath="/employee-master/employee-groups/add"
      />
      <PowerTable props={props} api={"/employee-master/employee-groups"} showEdit={true} onEditClick={handleEditClick}/>
    </div>
  );
}
