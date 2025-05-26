"use client";
import React, { useEffect, useState } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddGrades from "@/forms/company-master/AddGrades";
import { useLanguage } from "@/providers/LanguageProvider";
import { getAllGrades } from "@/lib/apiHandler";

export default function Page() {
  const { modules, language } = useLanguage();
  const [Columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [Data, SetData] = useState<any>([]);
  const [CurrentPage, SetCurrentPage] = useState<number>(1);
  const [SortField, SetSortField] = useState<string>("");
  const [SortDirection, SetSortDirection] = useState<string>("asc");
  const [SearchValue, SetSearchValue] = useState<string>("");
  const [open, on_open_change] = useState<boolean>(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

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
        field: language === "ar" ? "gradeNameArb" : "gradeNameEng",
        headerName: language === "ar" ? "الموقع" : "Grade",
      },
    ]);
  }, [language]);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await getAllGrades();
        if (response?.success && Array.isArray(response?.data)) {
          const mapped = response.data.map((loc: any) => ({
            ...loc,
            id: loc.gradeId,
          }));
    
          SetData(mapped);
        } else {
          console.error("Unexpected response structure:", response);
        }
      } catch (error) {
        console.error("Error fetching grades:", error);
      }
    };
    
    fetchGrades();
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

  const handleRowSelection = (rows: any[]) => {
    setSelectedRows(rows); // Update selected rows
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        selectedRows={selectedRows}
        items={modules?.companyMaster.items}
        entityName="grade"
        modal_title="Grades"
        modal_component={
          <AddGrades
            on_open_change={on_open_change}
            selectedRowData={selectedRowData}
            onSave={handleSave}
          />
        }
      />
      <PowerTable props={props} Data={Data} showEdit={true} onEditClick={handleEditClick} onRowSelection={handleRowSelection}/>
    </div>
  );
}
