"use client";
import React, { useEffect, useState, useCallback } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddGrades from "@/forms/company-master/AddGrades";
import { useLanguage } from "@/providers/LanguageProvider";
import { getAllGrades } from "@/lib/apiHandler";

export default function Page() {
  const { modules, language } = useLanguage();

  const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

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
    if (!open) {
      setSelectedRowData(null);
    }
  }, [open]);

  useEffect(() => {
    setColumns([
      { field: "code", headerName: language === "ar" ? "تعيين الموقع" : "Grade Code" },
      {
        field: language === "ar" ? "grade_arb" : "grade_eng",
        headerName: language === "ar" ? "تعيين" : "Grade",
      },
    ]);
  }, [language]);

  useEffect(() => {
    const fetchGrade = async () => {
      try {
        const response = await getAllGrades();
        if (response?.success && Array.isArray(response.data)) {
          const mapped = response.data.map((grd: any) => ({
            ...grd,
            id: grd.grade_id,
          }));
          setData(mapped);
        } else {
          console.error("Unexpected response:", response);
        }
      } catch (error) {
        console.error("Error fetching grade data:", error);
      }
    };

    fetchGrade();
  }, []);  

 const handleEditClick = useCallback((row: any) => {
    setSelectedRowData(row);
    setOpen(true);
  }, []);

  const handleSave = (id: string | null, newData: any) => {
    const dataWithId = {
      ...newData,
      id: newData.grade_id,
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
        entityName="grade"
        modal_title="Grade"
        modal_component={
          <AddGrades
            on_open_change={setOpen}
            selectedRowData={selectedRowData}
            onSave={handleSave}
          />
        }
      />
      <PowerTable props={props} Data={data} showEdit={true} onEditClick={handleEditClick} onRowSelection={handleRowSelection} />
    </div>
  );
}
