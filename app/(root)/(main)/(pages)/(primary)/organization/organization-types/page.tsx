"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddOrganizationType from "@/forms/organization/AddOrganizationType";
import { useLanguage } from "@/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/lib/useFetchAllEntity";

type Column = {
  field: string;
  headerName: string;
  cellRenderer?: (row: any) => React.ReactNode;
};

export default function Page() {
  const { modules, language } = useLanguage();
  const [columns, setColumns] = useState<Column[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    setColumns([
      { field: "org_type_level", headerName: "Hierarchy" },
      {
        field: language === "ar" ? "organization_type_arb" : "organization_type_eng",
        headerName: language === "ar" ? "نوع المنظمة" : "Organization Type",
        cellRenderer: (row: any) =>
        (row[language === "ar" ? "organization_type_arb" : "organization_type_eng"] || "").toUpperCase(),
      },
    ]);
  }, [language]);

  // Fetch data using the generic hook
  const { data: orgTypeData, isLoading } = useFetchAllEntity("organizationType");

  // Map data for the table
  const data = useMemo(() => {
    if (Array.isArray(orgTypeData?.data)) {
      return orgTypeData.data.map((orgType: any) => ({
        ...orgType,
        id: orgType.organization_type_id,
      }));
    }
    return [];
  }, [orgTypeData]);

  useEffect(() => {
    if (!open) setSelectedRowData(null);
  }, [open]);

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
    SetCurrentPage: setCurrentPage,
    SetSortField: setSortField,
    SortDirection: sortDirection,
    SetSortDirection: setSortDirection,
    SearchValue: searchValue,
    SetSearchValue: setSearchValue,
  };

  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ["organizationType"] });
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
        items={modules?.organization.items}
        entityName="organizationType"
        modal_title="Organization Types"
        modal_component={
          <AddOrganizationType
            on_open_change={setOpen}
            selectedRowData={selectedRowData}
            onSave={handleSave}
          />
        }
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