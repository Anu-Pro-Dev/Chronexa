"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import AddEmailSettings from "@/src/components/custom/modules/settings/AddEmailSettings";
import TestEmailModal from "@/src/components/custom/modules/settings/TestEmailModal"; // ✅ import your modal
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useDebounce } from "@/src/hooks/useDebounce";

export default function Page() {
  const { modules, language, translations } = useLanguage();
  type Columns = {
    field: string;
    headerName?: string;
    clickable?: boolean;
    onCellClick?: (data: any) => void;
  };

  const [columns, setColumns] = useState<Columns[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // ✅ for Test Email modal
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const queryClient = useQueryClient();
  const debouncedSearchValue = useDebounce(searchValue, 300);
  const t = translations?.modules?.settings || {};

  const offset = useMemo(() => {
    return currentPage;
  }, [currentPage]);

  // ✅ Clicking on "Test" cell
  const handleCellClick = useCallback((data: any) => {
    setSelectedRowData(data);
    setIsModalOpen(true);
  }, []);

  useEffect(() => {
    setColumns([
      { field: "em_smtp_name", headerName: t.name || "Name" },
      { field: "em_from_email", headerName: "From Email" },
      { field: "em_active_smtp_flag", headerName: t.active || "Active" },
      { field: "test", headerName: "Test Email", clickable: true, onCellClick: handleCellClick },
    ]);
  }, [t, language, handleCellClick]);

  const { data: emailSettingData, isLoading, refetch } = useFetchAllEntity("emailSetting", {
    searchParams: {
      limit: String(rowsPerPage),
      offset: String(offset),
      ...(debouncedSearchValue && { search: debouncedSearchValue }),
    },
  });

  const data = useMemo(() => {
    if (Array.isArray(emailSettingData?.data)) {
      return emailSettingData.data.map((emailSet: any) => {
        return {
          ...emailSet,
          id: emailSet.em_id,
          test: "Send", // ✅ clickable column label
        };
      });
    }
    return [];
  }, [emailSettingData]);

  useEffect(() => {
    if (!open) {
      setSelectedRowData(null);
    }
  }, [open]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setCurrentPage(newPage);
      if (refetch) {
        setTimeout(() => refetch(), 100);
      }
    },
    [refetch]
  );

  const handleRowsPerPageChange = useCallback(
    (newRowsPerPage: number) => {
      setRowsPerPage(newRowsPerPage);
      setCurrentPage(1);
      if (refetch) {
        setTimeout(() => refetch(), 100);
      }
    },
    [refetch]
  );

  const handleSearchChange = useCallback((newSearchValue: string) => {
    setSearchValue(newSearchValue);
    setCurrentPage(1);
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
    SetCurrentPage: handlePageChange,
    SetSortField: setSortField,
    SortDirection: sortDirection,
    SetSortDirection: setSortDirection,
    SearchValue: searchValue,
    SetSearchValue: handleSearchChange,
    total: emailSettingData?.total || 0,
    hasNext: emailSettingData?.hasNext,
    rowsPerPage,
    setRowsPerPage: handleRowsPerPageChange,
  };

  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ["emailSetting"] });
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
        items={modules?.settings.items}
        entityName="emailSetting"
        modal_title={t.email_settings || "Email Settings"}
        modal_component={
          <AddEmailSettings
            on_open_change={setOpen}
            selectedRowData={selectedRowData}
            onSave={handleSave}
          />
        }
        size="large"
      />
      <PowerTable
        props={props}
        onEditClick={handleEditClick}
        onRowSelection={handleRowSelection}
        isLoading={isLoading}
      />

      {/* ✅ Test Email Modal */}
      {isModalOpen && selectedRowData && (
        <TestEmailModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          emailSettingId={selectedRowData?.em_id}
        />
      )}
    </div>
  );
}
