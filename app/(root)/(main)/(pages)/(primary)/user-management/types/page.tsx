"use client";
import React, { useState, useEffect } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddUserTypes from "@/forms/user-management/AddUserTypes";
import { getAllUserGroups } from "@/lib/apiHandler";
import { useLanguage } from "@/providers/LanguageProvider";
import { useRouter } from "next/navigation";

export default function Page() {
  const { modules, language } = useLanguage();
  const router = useRouter();
  const [Columns, setColumns] = useState<{ field: string; headerName: string;}[]>([]);
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
  
  useEffect(() => {
    if (!open) {
      setSelectedRowData(null);
    }
  }, [open]);
  
  useEffect(() => {
    setColumns([
      {
        field: language === "ar" ? "descriptionArb" : "descriptionEng",
        headerName: language === "ar" ? "نوع الموظف" : "Type of Employee",
      },
    ]);
  }, [language]);
  
  useEffect(() => {
    const fetchUserGroups = async () => {
      try {
        const response = await getAllUserGroups();
        console.log(response);
        SetData(response);
      } catch (error) {
        console.error("Error fetching user groups:", error);
      }
    };
    fetchUserGroups();
  }, []);

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
        items={modules?.userManagement.items}
        modal_title="User Types"
        modal_component={
          <AddUserTypes 
            on_open_change={on_open_change}
            selectedRowData={selectedRowData}
            onSave={handleSave}
         />
        }
      />
      <PowerTable props={props} Data={Data} showEdit={true} onEditClick={handleEditClick}/>
    </div>
  );
}
