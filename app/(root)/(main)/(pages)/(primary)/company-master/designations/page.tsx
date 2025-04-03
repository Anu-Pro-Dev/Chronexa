"use client";
import React, { useEffect, useState } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddCompanyMaster from "@/forms/company-master/AddCompanyMaster";
import { useLanguage } from "@/providers/LanguageProvider";

export default function Page() {
  const { modules, language } = useLanguage();

  const [Columns, setColumns] = useState([
    { field: "code", headerName: "Code" },
    { field: "descriptionEng", headerName: "Description (English)" },
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

  useEffect(() => {
    if (!open) {
      setSelectedRowData(null);
    }
  }, [open]);

    useEffect(() => {
      // Dynamically update columns based on selected language
      setColumns([
        { field: "code", headerName: language === "ar" ? "الرمز" : "Code" },
        {
          field: language === "ar" ? "descriptionArb" : "descriptionEng",
          headerName: language === "ar" ? "Description (العربية)" : "Description (English)",
        },
      ]);
    }, [language]);

  const handleEditClick = (data: any) => {
    setSelectedRowData(data);
    on_open_change(true);
  };

  const handleSave = (id: string | null, newData: any) => {
    if (id) {
      // Update existing row
      SetData((prevData: any) =>
        prevData.map((row: any) => (row.id === id ? { ...row, ...newData } : row))
      );
    } else {
      // Add new row
      SetData((prevData: any) => [...prevData, { id: Date.now().toString(), ...newData }]);
    }
    setSelectedRowData(null); // Clear selected row data
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        items={modules?.companyMaster.items}
        modal_title="Designations"
        modal_description="Select the designations of the employee"
        modal_component={
          <AddCompanyMaster 
            on_open_change={on_open_change}
            selectedRowData={selectedRowData}
            onSave={handleSave}
          />
        }
      />
      <PowerTable props={props} api={"/company-master/designations"} showEdit={true} onEditClick={handleEditClick}/>
    </div>
  );
}
