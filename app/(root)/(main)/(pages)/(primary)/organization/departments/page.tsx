"use client";
import React, { useState } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/providers/LanguageProvider";

export default function Page() {
  const { modules } = useLanguage();
  const router = useRouter();

  const [Columns, setColumns] = useState([
    { field: "number" },
    { field: "name" },
    { field: "organization" },
    { field: "from_date" },
    { field: "to_date" },
    { field: "active" },
    { field: "created_by" },
    { field: "updatedAt" },
  ]);

  const [Data, SetData] = useState<any>([]);
  const [CurrentPage, SetCurrentPage] = useState<number>(1);
  const [SortField, SetSortField] = useState<string>("");
  const [SortDirection, SetSortDirection] = useState<string>("asc");
  const [SearchValue, SetSearchValue] = useState<string>("");
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
    SearchValue,
    SetSearchValue,
  };
  
  const handleEditClick = (data: any) => {
    setSelectedRowData(data);
    router.push("/organization/departments/add");
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        items={modules?.organization.items}
        isAddNewPagePath="/organization/departments/add"
      />
      <PowerTable props={props} api={"/organization/departments"} showEdit={true} onEditClick={handleEditClick}/>
    </div>
  );
}
