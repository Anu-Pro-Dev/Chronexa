"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddOrganization from "@/forms/organization/AddOrganization";
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
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const queryClient = useQueryClient();

  const { data: organizationsData } = useFetchAllEntity("organization");
  
  const orgMap = useMemo(() => {
    if (!Array.isArray(organizationsData?.data)) return {};
    return organizationsData.data.reduce((acc: any, org: any) => {
      acc[org.organization_id] = language === "ar" ? org.organization_arb : org.organization_eng;
      return acc;
    }, {});
  }, [organizationsData, language]);

  useEffect(() => {
    setColumns([
      { 
        field: "organization_code", 
        headerName: "Organization Code", 
        cellRenderer: (row: any) =>
         (row["organization_code"] || "").toUpperCase(),
      },
      {
        field: language === "ar" ? "organization_arb" : "organization_eng",
        headerName: language === "ar" ? "نوع المنظمة" : "Organization",
      },
      { 
        field: "parent_id", 
        headerName: "Parent",
        cellRenderer: (row: any) => orgMap[row.parent_id] || "", // <-- show name
      },
  ]);
}, [language, orgMap]);

  // Fetch data using the generic hook
  const { data: orgData, isLoading } = useFetchAllEntity("organization");

  // Map data for the table
  const data = useMemo(() => {
    if (Array.isArray(orgData?.data)) {
      return orgData.data.map((org: any) => ({
        ...org,
        id: org.organization_id,
      }));
    }
    return [];
  }, [orgData]);

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
    queryClient.invalidateQueries({ queryKey: ["organization"] });
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
        entityName="organization"
        modal_title="Organizations"
        modal_component={
          <AddOrganization
            on_open_change={setOpen}
            selectedRowData={selectedRowData}
            onSave={handleSave}
          />
        }
        isLarge
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