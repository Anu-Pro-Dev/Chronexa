"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddOrganization from "@/forms/organization/AddOrganization";
import { useLanguage } from "@/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/lib/useFetchAllEntity";
import { useDebounce } from "@/hooks/useDebounce"; 

type Column = {
  field: string;
  headerName: string;
  cellRenderer?: (row: any) => React.ReactNode;
};

export default function Page() {
  const { modules, language } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const queryClient = useQueryClient();
  const debouncedSearchValue = useDebounce(searchValue, 300);

  // Fetch data once
  const { data: orgData, isLoading } = useFetchAllEntity("organization",{
    searchParams: {
      name: debouncedSearchValue,
      code: debouncedSearchValue,
    },
  });

  // Map organization ID to name
  const orgMap = useMemo(() => {
    if (!Array.isArray(orgData?.data)) return {};
    return orgData.data.reduce((acc: any, org: any) => {
      acc[org.organization_id] = language === "ar" ? org.organization_arb : org.organization_eng;
      return acc;
    }, {});
  }, [orgData, language]);

  // Prepare table columns
  const columns: Column[] = useMemo(() => [
    {
      field: "organization_code",
      headerName: "Organization Code",
      cellRenderer: (row: any) => (row["organization_code"] || "").toUpperCase(),
    },
    {
      field: language === "ar" ? "organization_arb" : "organization_eng",
      headerName: language === "ar" ? "نوع المنظمة" : "Organization",
    },
    {
      field: "parent_id",
      headerName: "Parent",
      cellRenderer: (row: any) => orgMap[row.parent_id] || "",
    },
  ], [language, orgMap]);

  // Table data
  const data = useMemo(() => {
    if (!Array.isArray(orgData?.data)) return [];
    return orgData.data.map((org: any) => ({
      ...org,
      id: org.organization_id,
    }));
  }, [orgData]);

  // Clear selected row on modal close
  useEffect(() => {
    if (!open) setSelectedRowData(null);
  }, [open]);

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

  // Table + Header shared props
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
    SetCurrentPage: setCurrentPage,
    SetSortField: setSortField,
    SortDirection: sortDirection,
    SetSortDirection: setSortDirection,
    SearchValue: searchValue,
    SetSearchValue: setSearchValue,
  }), [data, columns, open, selectedRows, isLoading, sortField, currentPage, sortDirection, searchValue]);

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
        showEdit
        onEditClick={handleEditClick}
        onRowSelection={handleRowSelection}
        isLoading={isLoading}
      />
    </div>
  );
}
