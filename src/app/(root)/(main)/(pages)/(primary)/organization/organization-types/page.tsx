"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import AddOrganizationType from "@/src/components/custom/modules/organization/AddOrganizationType";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useDebounce } from "@/src/hooks/useDebounce"; 

type Column = {
  field: string;
  headerName: string;
  cellRenderer?: (row: any) => React.ReactNode;
};

export default function Page() {
  const { modules, language, translations } = useLanguage();
  const [columns, setColumns] = useState<Column[]>([]);
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
  const t = translations?.modules?.organization || {};

  const offset = useMemo(() => {
    return currentPage;
  }, [currentPage]);

  useEffect(() => {
    setColumns([
      { field: "org_type_level", headerName: t.hierarchy },
      {
        field: language === "ar" ? "organization_type_arb" : "organization_type_eng",
        headerName: t.organization_types,
        cellRenderer: (row: any) =>
        (row[language === "ar" ? "organization_type_arb" : "organization_type_eng"] || "").toUpperCase(),
      },
    ]);
  }, [language]);

  const { data: orgTypeData, isLoading, refetch } = useFetchAllEntity("organizationType",{
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

  const props = {
    Data: data,
    Columns: columns,
    open,
    on_open_change: setOpen,
    selectedRows,
    setSelectedRows,
    isLoading,
    SortField: sortField,
    SetCurrentPage: handlePageChange,
    SetSortField: setSortField,
    SortDirection: sortDirection,
    SetSortDirection: setSortDirection,
    SearchValue: searchValue,
    SetSearchValue: handleSearchChange,
    total: orgTypeData?.total || 0,
    hasNext: orgTypeData?.hasNext,
    rowsPerPage,
    setRowsPerPage: handleRowsPerPageChange,  
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
        modal_title={t.organization_types}
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
// "use client";
// import { useEffect, useState, useCallback, useMemo } from "react";
// import PowerHeader from "@/src/components/custom/power-comps/power-header";
// import PowerTable from "@/src/components/custom/power-comps/power-table";
// import AddOrganization from "@/src/components/custom/modules/organization/AddOrganization";
// import { useLanguage } from "@/src/providers/LanguageProvider";
// import { useQueryClient } from "@tanstack/react-query";
// import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
// import { useQuery } from "@tanstack/react-query";
// import { useDebounce } from "@/src/hooks/useDebounce"; 

// // Custom hook for organization endpoint
// const useOrganizations = (searchParams: { name?: string; code?: string }) => {
//   return useQuery({
//     queryKey: ["organization", searchParams],
//     queryFn: async () => {
//       const params = new URLSearchParams();
//       if (searchParams.name) {
//         params.append('name', searchParams.name);
//       }
//       if (searchParams.code) {
//         params.append('code', searchParams.code);
//       }
      
//       const response = await fetch(`/api/organization/?${params}`);
//       if (!response.ok) {
//         throw new Error('Failed to fetch organizations');
//       }
//       return response.json();
//     },
//     enabled: true, // Always fetch
//   });
// }; 

// type Column = {
//   field: string;
//   headerName: string;
//   cellRenderer?: (row: any) => React.ReactNode;
// };

// export default function Page() {
//   const { modules, language, translations } = useLanguage();
//   const [currentPage, setCurrentPage] = useState(1);
//   const [sortField, setSortField] = useState("");
//   const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
//   const [searchValue, setSearchValue] = useState("");
//   const [open, setOpen] = useState(false);
//   const [selectedRowData, setSelectedRowData] = useState<any>(null);
//   const [selectedRows, setSelectedRows] = useState<any[]>([]);
//   const queryClient = useQueryClient();
//   const debouncedSearchValue = useDebounce(searchValue, 300);
//   const t = translations?.modules?.organization || {};

//   // Remove '/all' from default pattern to use /organization/ instead of /organization/all
//   const { data: orgData, isLoading } = useFetchAllEntity("organization", {
//     removeAll: true, // This will call /organization/ instead of /organization/all
//     searchParams: {
//       name: debouncedSearchValue,
//       code: debouncedSearchValue,
//     },
//   });

//   // Create organization map for parent lookup
//   const orgMap = useMemo(() => {
//     if (!Array.isArray(orgData?.data)) return {};
    
//     const map: Record<string, string> = {};
//     orgData.data.forEach((org: any) => {
//       if (org.organization_id) {
//         map[org.organization_id] = language === "ar" 
//           ? (org.organization_arb || org.organization_eng || "") 
//           : (org.organization_eng || org.organization_arb || "");
//       }
//     });
    
//     // Debug logging
//     console.log("Organization Map:", map);
//     console.log("Sample organization data:", orgData.data[0]);
    
//     return map;
//   }, [orgData, language]);

//   const columns: Column[] = useMemo(() => [
//     {
//       field: "organization_code",
//       headerName: t.org_code || "Organization Code",
//       cellRenderer: (row: any) => (row["organization_code"] || "").toUpperCase(),
//     },
//     {
//       field: language === "ar" ? "organization_arb" : "organization_eng",
//       headerName: t.org_name || "Organization Name",
//     },
//     {
//       field: "parent_id",
//       headerName: t.parent || "Parent Organization",
//       cellRenderer: (row: any) => {
//         // Debug logging
//         console.log("Processing row:", row);
//         console.log("Parent ID:", row.parent_id);
//         console.log("OrgMap for parent:", orgMap[row.parent_id]);
        
//         // Handle the case where parent_id might be null, undefined, or empty
//         if (!row.parent_id) {
//           return <span className="text-gray-500 italic">No Parent</span>;
//         }
        
//         // Get parent organization name from the map
//         const parentName = orgMap[row.parent_id];
        
//         if (!parentName) {
//           return <span className="text-red-500 italic">Unknown Parent (ID: {row.parent_id})</span>;
//         }
        
//         return <span>{parentName}</span>;
//       },
//     },
//   ], [language, orgMap, t]);

//   const data = useMemo(() => {
//     if (!Array.isArray(orgData?.data)) return [];
//     return orgData.data.map((org: any) => ({
//       ...org,
//       id: org.organization_id,
//     }));
//   }, [orgData]);

//   useEffect(() => {
//     if (!open) setSelectedRowData(null);
//   }, [open]);

//   const handleSave = () => {
//     queryClient.invalidateQueries({ queryKey: ["organization"] });
//   };

//   const handleEditClick = useCallback((row: any) => {
//     setSelectedRowData(row);
//     setOpen(true);
//   }, []);

//   const handleRowSelection = useCallback((rows: any[]) => {
//     setSelectedRows(rows);
//   }, []);

//   const props = useMemo(() => ({
//     Data: data,
//     Columns: columns,
//     open,
//     on_open_change: setOpen,
//     selectedRows,
//     setSelectedRows,
//     isLoading,
//     SortField: sortField,
//     CurrentPage: currentPage,
//     SetCurrentPage: setCurrentPage,
//     SetSortField: setSortField,
//     SortDirection: sortDirection,
//     SetSortDirection: setSortDirection,
//     SearchValue: searchValue,
//     SetSearchValue: setSearchValue,
//   }), [data, columns, open, selectedRows, isLoading, sortField, currentPage, sortDirection, searchValue]);

//   return (
//     <div className="flex flex-col gap-4">
//       <PowerHeader
//         props={props}
//         selectedRows={selectedRows}
//         items={modules?.organization.items}
//         entityName="organization"
//         modal_title={t.organizations}
//         modal_component={
//           <AddOrganization
//             on_open_change={setOpen}
//             selectedRowData={selectedRowData}
//             onSave={handleSave}
//           />
//         }
//         isLarge
//       />
//       <PowerTable
//         props={props}
//         showEdit
//         onEditClick={handleEditClick}
//         onRowSelection={handleRowSelection}
//         isLoading={isLoading}
//       />
//     </div>
//   );
// }