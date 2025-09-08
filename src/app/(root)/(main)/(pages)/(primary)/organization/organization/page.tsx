"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import AddOrganization from "@/src/components/custom/modules/organization/AddOrganization";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/src/hooks/useDebounce"; 

const useOrganizations = (searchParams: { name?: string; code?: string }) => {
  return useQuery({
    queryKey: ["organization", searchParams],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchParams.name) {
        params.append('name', searchParams.name);
      }
      if (searchParams.code) {
        params.append('code', searchParams.code);
      }
      
      const response = await fetch(`/api/organization/?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch organizations');
      }
      return response.json();
    },
    enabled: true,
  });
}; 

type Column = {
  field: string;
  headerName: string;
  cellRenderer?: (row: any) => React.ReactNode;
};

export default function Page() {
  const { modules, language, translations } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const queryClient = useQueryClient();
  const debouncedSearchValue = useDebounce(searchValue, 300);
  const t = translations?.modules?.organization || {};
  
  const offset = useMemo(() => {
    return currentPage;
  }, [currentPage]);

  // Fetch paginated organization data for display
  const { data: orgData, isLoading, refetch } = useFetchAllEntity("organization", {
    searchParams: {
      limit: String(rowsPerPage),
      offset: String(offset),
      ...(debouncedSearchValue && {
        name: debouncedSearchValue,
        code: debouncedSearchValue,
      }),
    },
  });

  // Fetch ALL organizations for parent mapping
  const { data: allOrgData } = useFetchAllEntity("organization", {
    searchParams: {
      limit: "1000",
    },
  });

  const orgMap = useMemo(() => {
    if (!Array.isArray(allOrgData?.data)) return {};
    
    const map: Record<string, string> = {};
    allOrgData.data.forEach((org: any) => {
      if (org.organization_id) {
        map[org.organization_id] = language === "ar" 
          ? (org.organization_arb || org.organization_eng || "") 
          : (org.organization_eng || org.organization_arb || "");
      }
    });
    
    return map;
  }, [allOrgData, language]);

  const columns: Column[] = useMemo(() => [
    {
      field: "organization_code",
      headerName: t.org_code,
      cellRenderer: (row: any) => (row["organization_code"] || "").toUpperCase(),
    },
    {
      field: language === "ar" ? "organization_arb" : "organization_eng",
      headerName: t.org_name,
    },
    {
      field: "parent_id",
      headerName: t.parent,
      cellRenderer: (row: any) => {
        if (!row.parent_id) {
          return <span className="text-gray-500 italic">No Parent</span>;
        }
        
        const parentName = orgMap[row.parent_id];
        
        return <span>{parentName || "Loading..."}</span>;
      },
    },
  ], [language, orgMap, t]);

  const data = useMemo(() => {
    if (!Array.isArray(orgData?.data)) return [];
    return orgData.data.map((org: any) => ({
      ...org,
      id: org.organization_id,
    }));
  }, [orgData]);

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
    total: orgData?.total || 0,
    hasNext: orgData?.hasNext,
    rowsPerPage,
    setRowsPerPage: handleRowsPerPageChange,
  }), [data, columns, open, selectedRows, isLoading, sortField, currentPage, sortDirection, searchValue]);

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        selectedRows={selectedRows}
        items={modules?.organization.items}
        entityName="organization"
        modal_title={t.organization}
        modal_component={
          <AddOrganization
            on_open_change={setOpen}
            selectedRowData={selectedRowData}
            onSave={handleSave}
          />
        }
        size="large"
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