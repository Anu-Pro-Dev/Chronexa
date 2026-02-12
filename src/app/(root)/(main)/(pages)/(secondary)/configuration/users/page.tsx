"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import UpdateUser from "@/src/components/custom/modules/configuration/UpdateUser";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useDebounce } from "@/src/hooks/useDebounce";

export default function Page() {
  const { modules, language, translations } = useLanguage();
  const queryClient = useQueryClient();

  type Columns = {
    field: string;
    headerName?: string;
  };

  const [columns, setColumns] = useState<Columns[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState("");
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const debouncedSearchValue = useDebounce(searchValue, 300);
  const t = translations?.modules?.configurations || {};

  const { data: userData, isLoading, refetch } = useFetchAllEntity("secuser", {
    searchParams: {
      limit: String(rowsPerPage),
      offset: String(currentPage),
      ...(debouncedSearchValue && { search: debouncedSearchValue }),
    },
  });

  const data = useMemo(() => {
    if (Array.isArray(userData?.data)) {
      return userData.data.map((user: any) => {
        return {
          ...user,
          id: user.user_id,
          password: "********",
        };
      });
    }
    return [];
  }, [userData]);

  useEffect(() => {
    if (!open) setSelectedRowData(null);
  }, [open]);

  useEffect(() => {
    setColumns([
      { field: "user_id", headerName: t.user_id || "User ID" },
      { field: "login", headerName: t.user_name || "User Name" },
      { field: "password", headerName: t.password || "Password" },
      { field: "employee_id", headerName: t.employee_id || "Employee ID" },
    ]);
  }, [t, language]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setCurrentPage(newPage);
      refetch && setTimeout(() => refetch(), 100);
    },
    [refetch]
  );

  const handleRowsPerPageChange = useCallback(
    (newRowsPerPage: number) => {
      setRowsPerPage(newRowsPerPage);
      setCurrentPage(1);
      refetch && setTimeout(() => refetch(), 100);
    },
    [refetch]
  );

  const handleSearchChange = useCallback((val: string) => {
    setSearchValue(val);
    setCurrentPage(1);
  }, []);

  const handleEditClick = useCallback((row: any) => {
    setSelectedRowData(row);
    setOpen(true);
  }, []);

  const handleRowSelection = useCallback((rows: any[]) => {
    setSelectedRows(rows);
  }, []);

  const handleSave = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["secuser"] });
  }, [queryClient]);

  const props = useMemo(() => ({
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
    total: userData?.total || 0,
    hasNext: userData?.hasNext,
    rowsPerPage,
    setRowsPerPage: handleRowsPerPageChange,
  }), [
    data,
    columns,
    open,
    selectedRows,
    isLoading,
    sortField,
    currentPage,
    handlePageChange,
    sortDirection,
    searchValue,
    handleSearchChange,
    userData?.total,
    userData?.hasNext,
    rowsPerPage,
    handleRowsPerPageChange,
  ]);

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        disableDelete
        selectedRows={selectedRows}
        items={modules?.configuration?.items}
        entityName="secuser"
        modal_title="User Management"
        modal_component={
          <UpdateUser
            on_open_change={setOpen}
            selectedRowData={selectedRowData}
            onSave={handleSave}
          />
        }
      />

      <PowerTable
        props={props}
        onEditClick={handleEditClick}
        onRowSelection={handleRowSelection}
        isLoading={isLoading}
      />
    </div>
  );
}