"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import AddEmployeeGroup from "@/src/components/custom/modules/employee-master/AddEmployeeGroup";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useDebounce } from "@/src/hooks/useDebounce"; 

export default function Page() {
  const router = useRouter();
  const { modules, language, translations } = useLanguage();
  const [columns, setColumns] = useState<{ field: string; headerName: string; clickable?: boolean; onCellClick?: (data: any) => void }[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const queryClient = useQueryClient();
  const debouncedSearchValue = useDebounce(searchValue, 300);
  const t = translations?.modules?.employeeMaster || {};

  const offset = useMemo(() => {
    return currentPage;
  }, [currentPage]);

  useEffect(() => {
    setColumns([
      { field: "group_code", headerName: t.group_code },
      {
        field: language === "ar" ? "group_name_arb" : "group_name_eng",
        headerName: t.group_name,
      },
      { 
        field: "employee_group_members", 
        headerName: t.grouping,
        clickable: true, 
        onCellClick: handleCellClickPath,
      },
      { field: "group_start_date", headerName: t.group_start_date },
      { field: "group_end_date", headerName: t.group_end_date },
      {
        field: "reporting_group_flag",
        headerName: t.reporting
      },
    ]);
  }, [language]);

  const { data: employeeGroupData, isLoading, refetch } = useFetchAllEntity("employeeGroup", {
    searchParams: {
      limit: String(rowsPerPage),
      offset: String(offset),
      ...(debouncedSearchValue && { search: debouncedSearchValue }),
    },
  });

  const data = useMemo(() => {
    if (Array.isArray(employeeGroupData?.data)) {
      return employeeGroupData.data.map((empGroup: any) => ({
        ...empGroup,
        id: empGroup.employee_group_id,
        employee_group_members: "Members",
        // Keep original dates for editing
        original_group_start_date: empGroup.group_start_date,
        original_group_end_date: empGroup.group_end_date,
        // Format dates for display only
        group_start_date: new Date(empGroup.group_start_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        group_end_date: new Date(empGroup.group_end_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      }));
    }
    return [];
  }, [employeeGroupData, language]);
  
  useEffect(() => {
    if (!open) {
      setSelectedRowData(null);
    }
  }, [open]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [currentPage, refetch]);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [rowsPerPage, refetch]);

  const handleSearchChange = useCallback((newSearchValue: string) => {
    setSearchValue(newSearchValue);
    setCurrentPage(1);
  }, []);

  const handleCellClickPath = useCallback((data: any) => {
    if (data?.group_code) {
      router.push(`/employee-master/employee-group/group-members?group=${data.group_code}`);
    } else {
      console.error("Error: No code found for this row", data);
    }
  }, [router]);

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
    SetCurrentPage: handlePageChange,
    SetSortField: setSortField,
    SortDirection: sortDirection,
    SetSortDirection: setSortDirection,
    SearchValue: searchValue,
    SetSearchValue: handleSearchChange,
    total: employeeGroupData?.total || 0,
    hasNext: employeeGroupData?.hasNext,
    rowsPerPage,
    setRowsPerPage: handleRowsPerPageChange,
  };
 
  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ["employeeGroup"] });
  };
 
  const handleEditClick = useCallback((row: any) => {
    setSelectedRowData(row);
    setOpen(true);
  }, []);
 
  const handleRowSelection = useCallback((rows: any[]) => {
    setSelectedRows(rows);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        selectedRows={selectedRows}
        items={modules?.employeeMaster.items}
        entityName="employeeGroup"
        modal_title={t.employee_group}
        modal_component={
          <AddEmployeeGroup
            on_open_change={setOpen}
            selectedRowData={selectedRowData}
            onSave={handleSave}
          />
        }
        size="large"
      />
      <PowerTable
        props={props}
        showEdit={true}
        onEditClick={handleEditClick}
        onRowSelection={handleRowSelection}
        isLoading={isLoading}
      />
    </div>
  );
}
