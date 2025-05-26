"use client";
import React, { useEffect, useState } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddCitizenship from "@/forms/company-master/AddCitizenship";
import { useLanguage } from "@/providers/LanguageProvider";
import { getAllCitizenship } from "@/lib/apiHandler";

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
      { field: "citizenship_code", headerName: language === "ar" ? "قانون الجنسية" : "Citizenship Code" },
      {
        field: language === "ar" ? "citizenship_arb" : "citizenship_eng",
        headerName: language === "ar" ? "المواطنة" : "Citizenship",
      },
    ]);
  }, [language]);

  useEffect(() => {
    const fetchCitizenship = async () => {
      try {
        const response = await getAllCitizenship();        
        if (response?.success && Array.isArray(response?.data)) {
          const mapped = response.data.map((citi: any) => ({
            ...citi,
            id: citi.citizenship_id,
          }));
    
          SetData(mapped);
        } else {
          console.error("Unexpected response structure:", response);
        }
      } catch (error) {
        console.error("Error fetching citizenship:", error);
      }
    };
    fetchCitizenship();
  }, []);

  const handleSave = (id: string | null, newData: any) => {
    if (id) {
      SetData((prevData: any[]) =>
        prevData.map(row => (row.id === id ? { ...row, ...newData } : row))
      );
    } else {
      SetData((prevData: any[]) => [...prevData, newData]);
    }
    setSelectedRowData(null);
  };


  const handleRowSelection = (rows: any[]) => {
    setSelectedRows(rows);
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        selectedRows={selectedRows}
        items={modules?.companyMaster.items}
        entityName="citizenship"
        modal_title="Citizenship"
        modal_component={
          <AddCitizenship           
            on_open_change={on_open_change}
            selectedRowData={selectedRowData}
            onSave={handleSave}
          />
        }
      />
      <PowerTable props={props} Data={Data} onRowSelection={handleRowSelection}/>
    </div>
  );
}
