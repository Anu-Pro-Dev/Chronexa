"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddCitizenship from "@/forms/company-master/AddCitizenship";
import { useLanguage } from "@/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/hooks/useFetchAllEntity";
import { useDebounce } from "@/hooks/useDebounce"; 

export default function Page() {
  const { modules, language, translations } = useLanguage();
  const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const queryClient = useQueryClient();
  const debouncedSearchValue = useDebounce(searchValue, 300);
  const t = translations?.modules?.companyMaster || {};
  // Calculate offset for pagination
    const offset = useMemo(() => {
      return currentPage;
    }, [currentPage]);
  
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

  // Add pagination parameters to the API call
    const { data: citizenshipData, isLoading, refetch } = useFetchAllEntity("citizenship", {
      searchParams: {
        limit: String(rowsPerPage),
        offset: String(offset),
        ...(debouncedSearchValue && {
          name: debouncedSearchValue,
          code: debouncedSearchValue,
        }),
      },
    });

  const data = useMemo(() => {
    if (Array.isArray(citizenshipData?.data)) {
      return citizenshipData.data.map((citi: any) => ({
        ...citi,
        id: citi.citizenship_id,
      }));
    }
    return [];
  }, [citizenshipData]);

  useEffect(() => {
    if (!open) {
      setSelectedRowData(null);
    }
  }, [open]);

  // Add pagination handlers like in employee page
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    
    // Force refetch if available
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [currentPage, refetch]);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Reset to first page when changing page size
    
    // Force refetch if available
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [rowsPerPage, refetch]);

  // Update search handler to reset page like employee page
  const handleSearchChange = useCallback((newSearchValue: string) => {
    setSearchValue(newSearchValue);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const props = {
    Data: data,
    Columns: columns,
    open,
    on_open_change: setOpen,
    selectedRows,
    setSelectedRows,
    isLoading,
    SortField: sortField,
    CurrentPage: currentPage,
    SetCurrentPage: handlePageChange, // Use pagination handler
    SetSortField: setSortField,
    SortDirection: sortDirection,
    SetSortDirection: setSortDirection,
    SearchValue: searchValue,
    SetSearchValue: handleSearchChange, // Use search handler that resets page
    total: citizenshipData?.total || 0, // Add pagination props
    hasNext: citizenshipData?.hasNext,
    rowsPerPage,
    setRowsPerPage: handleRowsPerPageChange,
  };

  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ["citizenship"] });
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
      <PowerTable
        props={props}
        onRowSelection={handleRowSelection}
        isLoading={isLoading}
      />
    </div>
  );
}