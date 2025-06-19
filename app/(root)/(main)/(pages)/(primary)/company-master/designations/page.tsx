"use client";
import React, { useEffect, useState, useCallback } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddDesignations from "@/forms/company-master/AddDesignations";
import { useLanguage } from "@/providers/LanguageProvider";
import { getAllDesignations } from "@/lib/apiHandler";

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
      { field: "code", headerName: language === "ar" ? "تعيين الموقع" : "Designation Code" },
      {
        field: language === "ar" ? "designation_arb" : "designation_eng",
        headerName: language === "ar" ? "تعيين" : "Designation",
      },
    ]);
  }, [language]);

  useEffect(() => {
    const fetchDesignation = async () => {
      try {
        const response = await getAllDesignations();
        if (response?.success && Array.isArray(response.data)) {
          const mapped = response.data.map((desi: any) => ({
            ...desi,
            id: desi.designation_id,
          }));
          setData(mapped);
        } else {
          console.error("Unexpected response:", response);
        }
      } catch (error) {
        console.error("Error fetching designation data:", error);
      }
    };

    fetchDesignation();
  }, []);  

 const handleEditClick = useCallback((row: any) => {
    setSelectedRowData(row);
    setOpen(true);
  }, []);

  const handleSave = (id: string | null, newData: any) => {
    const dataWithId = {
      ...newData,
      id: newData.designation_id,
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
        entityName="designation"
        modal_title="Designation"
        modal_component={
          <AddDesignations
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
