"use client";
import React, { useEffect, useState, useCallback } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddCitizenship from "@/forms/company-master/AddCitizenship";
import { useLanguage } from "@/providers/LanguageProvider";
import { getAllCitizenships } from "@/lib/apiHandler";

export default function Page() {
  const { modules, language } = useLanguage();

  const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  // Props to pass to child components
  const props = {
    Data: data,
    SetData: setData,
    Columns: columns,
    SortField: sortField,
    CurrentPage: currentPage,
    SetCurrentPage: setCurrentPage,
    SetSortField: setSortField,
    SortDirection: sortDirection,
    SetSortDirection: setSortDirection,
    open,
    on_open_change: setOpen,
    SearchValue: searchValue,
    SetSearchValue: setSearchValue,
  };

  useEffect(() => {
    if (!open) setSelectedRowData(null);
  }, [open]);

  useEffect(() => {
    setColumns([
      {
        field: "citizenship_code",
        headerName: language === "ar" ? "قانون الجنسية" : "Citizenship Code",
      },
      {
        field: language === "ar" ? "citizenship_arb" : "citizenship_eng",
        headerName: language === "ar" ? "المواطنة" : "Citizenship",
      },
    ]);
  }, [language]);

  useEffect(() => {
    const fetchCitizenship = async () => {
      try {
        const response = await getAllCitizenships();
        if (response?.success && Array.isArray(response.data)) {
          const mapped = response.data.map((citi: any) => ({
            ...citi,
            id: citi.citizenship_id,
          }));
          setData(mapped);
        } else {
          console.error("Unexpected response:", response);
        }
      } catch (error) {
        console.error("Error fetching citizenship data:", error);
      }
    };

    fetchCitizenship();
  }, []);

  const handleSave = (id: string | null, newData: any) => {
    const dataWithId = {
      ...newData,
      id: newData.citizenship_id,
    };

    setData((prev) =>
      id
        ? prev.map((row) => (row.id === id ? { ...row, ...dataWithId } : row))
        : [...prev, dataWithId]
    );
    setSelectedRowData(null);
  };

  const handleRowSelection = useCallback((rows: any[]) => {
    setSelectedRows(rows);
  }, []);
  
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
            on_open_change={setOpen}
            selectedRowData={selectedRowData}
            onSave={handleSave}
          />
        }
      />
      <PowerTable props={props} Data={data} onRowSelection={handleRowSelection} />
    </div>
  );
}
