"use client";
import React, { useState, useEffect } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddEmployeeGroup from "@/forms/employee-master/AddEmployeeGroup";
import { getAllEmployeeGroup } from "@/lib/apiHandler";
import { useLanguage } from "@/providers/LanguageProvider";
import { useRouter } from "next/navigation";

export default function Page() {
  const { modules, language } = useLanguage();
  const router = useRouter();
  const [Columns, setColumns] = useState<{ field: string; headerName: string; clickable?: boolean; onCellClick?: (data: any) => void }[]>([]);
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

  const handleCellClickPath = (data: any) => {
    console.log("Clicked Data:", data);
    if (data?.code) {
      router.push(`/employee-master/groups/group-members?group=${data.code}`);    } else {
      console.error("Error: No code found for this row", data);
    }
  }

  useEffect(() => {
    if (!open) {
      setSelectedRowData(null);
    }
  }, [open]);

  useEffect(() => {
    setColumns([
      {
        field: language === "ar" ? "descriptionArb" : "descriptionEng",
        headerName: "Group Name",
      },
      { field: "groupName", headerName: "Grouping", clickable: true, onCellClick: handleCellClickPath },
      { field: "createdDate", headerName: "From date" },
      { field: "createdDate", headerName: "To date" },
    ]);
  }, [language]);

  useEffect(() => {
    const fetchEmployeeGroup = async () => {
      try {
        const response = await getAllEmployeeGroup();
        console.log(response);
        SetData(response.data);
      } catch (error) {
        console.error("Error fetching employee group:", error);
      }
    };
    fetchEmployeeGroup();
  }, []);

  // const handleEditClick = (data: any) => {
  //   setSelectedRowData(data);
  //   router.push("/employee-master/groups/add");
  // };

  const handleEditClick = (data: any) => {
    setSelectedRowData(data);
    on_open_change(true);
  };

  const handleSave = (id: string | null, newData: any) => {
    if (id) {
      SetData((prevData: any) =>
        prevData.map((row: any) => (row.id === id ? { ...row, ...newData } : row))
      );
    } else {
      SetData((prevData: any) => [...prevData, { id: Date.now().toString(), ...newData }]);
    }
    setSelectedRowData(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        items={modules?.employeeMaster.items}
        modal_title="Employee Group"
        modal_component={
          <AddEmployeeGroup
            on_open_change={on_open_change}
            selectedRowData={selectedRowData}
            onSave={handleSave}
          />
        }
        isLarge
        // isAddNewPagePath="/employee-master/groups/add"
      />
      <PowerTable props={props} Data={Data} showEdit={true} onEditClick={handleEditClick}/>
    </div>
  );
}
