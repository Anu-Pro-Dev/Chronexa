"use client";
import React, { useState } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTabs from "@/components/custom/power-comps/power-tabs";
import PowerTable from "@/components/custom/power-comps/power-table";
import { useLanguage } from "@/providers/LanguageProvider";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const { modules } = useLanguage();
  const [Data, SetData] = useState<any>([]);
  const [open, on_open_change] = useState<boolean>(false)
  const [filter_open, filter_on_open_change] = useState<boolean>(false)
  const [CurrentPage, SetCurrentPage] = useState<number>(1)
  const [SortField, SetSortField] = useState<string>("")
  const [SortDirection, SetSortDirection] = useState<string>("asc")
  const [SearchValue, SetSearchValue] = useState<string>("")
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [Columns, setColumns] = useState([
    { field: "code" },
    { field: "description" },
    { field: "need_approval", headerName: "Need approval" },
    { field: "offical", headerName: "Official ( For NON DOF employees )" },
    { field: "attachment", headerName: "Allow attachment" },
    { field: "comments", headerName: "Justification" },
    { field: "workflows" },
  ]);
  
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
  }
  
  const handleEditClick = (data: any) => {
    setSelectedRowData(data);
    router.push("/self-services/leaves/manage/add");
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader 
      props={props} 
      items={modules?.selfServices?.items} 
      isAddNewPagePath="/self-services/leaves/manage/add"
      />
      <div className="bg-accent rounded-2xl">
        <div className="col-span-2 p-6">
          <h1 className="font-bold text-xl text-primary">Manage Leaves</h1>
        </div>
        <div className="px-6">
          <PowerTabs items={modules?.selfServices?.leaves?.items} />
        </div>
        <PowerTable props={props} Data={Data} api={"/self-services/manage-leaves/leave-types"} showEdit={true} onEditClick={handleEditClick}/>
      </div>
    </div>
  );
}
