"use client";
import React, { useEffect, useState } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddGradesCompanyMaster from "@/forms/company-master/AddGradesCompanyMaster";
import { useLanguage } from "@/providers/LanguageProvider";

export default function Page() {
  const { modules, language } = useLanguage();

  const [Columns, setColumns] = useState([
    { field: "code", headerName: "Code" },
    { field: "description_en", headerName: "Description (English)" },
    // { field: "overtime_eligible", headerName: "Overtime eligible" },
    // { field: "senior_employee", headerName: "Senior employee" },
    // { field: "updated", headerName: "Updated" },
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
        field: language === "ar" ? "description_ar" : "description_en",
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
        modal_title="Grades"
        modal_description="Select the grades of the employee"
        modal_component={
          <AddGradesCompanyMaster on_open_change={on_open_change} />
        }
      />
      <PowerTable props={props} api={"/company-master/grades"} showEdit={true} onEditClick={handleEditClick}/>
    </div>
  );
}
