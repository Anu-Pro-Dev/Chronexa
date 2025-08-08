// "use client";
// import React, { useState, useEffect, useMemo, useCallback } from "react";
// import PowerHeader from "@/components/custom/power-comps/power-header";
// import PowerTable from "@/components/custom/power-comps/power-table";
// import { useLanguage } from "@/providers/LanguageProvider";
// import { useRouter } from "next/navigation";
// import { useQueryClient } from "@tanstack/react-query";
// import { useFetchAllEntity } from "@/hooks/useFetchAllEntity";
// import { useEmployeeEditStore } from "@/stores/employeeEditStore";
// import { sortTableData } from "@/utils/sort";

// export default function Page() {
//   const { modules, language } = useLanguage();
//   const router = useRouter();
//   const queryClient = useQueryClient();

//   const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
//   const [sortField, setSortField] = useState<string>("");
//   const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
//   const [searchValue, setSearchValue] = useState<string>("");
//   const [selectedRows, setSelectedRows] = useState<any[]>([]);
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [rowsPerPage, setRowsPerPage] = useState<number>(10);
//   // Fetch data using generic hook
//   // const { data: employeeData, isLoading } = useFetchAllEntity("employee");
//   const { data: employeeData, isLoading } = useFetchAllEntity("employee", {
//     searchParams: {
//       limit: String(rowsPerPage),
//       offset: String(currentPage),
//       // ...add searchValue or other params if needed
//     },
//   });
//   useEffect(() => {
//     setColumns([
//       { field: "emp_no", headerName: "Emp No" },
//       {
//         field: language === "ar" ? "firstname_arb" : "firstname_eng",
//         headerName: language === "ar" ? "اسم الموظف" : "Employee Name",
//       },
//       { field: "manager_flag", headerName: "Manager" },
//     ]);
//   }, [language]);

//   const data = useMemo(() => {
//     if (Array.isArray(employeeData?.data)) {
//       // Add id field for table usage
//       const mapped = employeeData.data.map((emp: any) => ({
//         ...emp,
//         id: emp.employee_id,
//       }));
//       // Sort using your utility
//       return sortTableData(
//         mapped,
//         sortField,
//         sortDirection,
//         "employee_id", // id field
//         ["created_date"] // timestamp fields
//       );
//     }
//     return [];
//   }, [employeeData, sortField, sortDirection]);

//   const props = {
//     Data: data,
//     Columns: columns,
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
//     total: employeeData?.total || 0,
//     hasNext: employeeData?.hasNext,
//   };

//   const handleSave = useCallback(() => {
//     queryClient.invalidateQueries({ queryKey: ["employee"] });
//   }, [queryClient]);

//   const setSelectedRowData = useEmployeeEditStore((state) => state.setSelectedRowData);

//   const handleEditClick = useCallback(
//     (row: any) => {
//       setSelectedRowData(row);
//       router.push("/employee-master/employee/add");
//     },
//     [router, setSelectedRowData]
//   );

//   const handleRowSelection = useCallback((rows: any[]) => {
//     setSelectedRows(rows);
//   }, []);

//   return (
//     <div className="flex flex-col gap-4">
      
//       <PowerHeader
//         props={props}
//         selectedRows={selectedRows}
//         items={modules?.employeeMaster.items}
//         entityName="employee"
//         isAddNewPagePath="/employee-master/employee/add"
//       />
//       <PowerTable
//         props={{
//           ...props,
//           rowsPerPage,
//           setRowsPerPage,
//         }}
//         showEdit={true}
//         onEditClick={handleEditClick}
//         onRowSelection={handleRowSelection}
//         isLoading={isLoading}
//       />
//     </div>
//   );
// }
"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import { useLanguage } from "@/providers/LanguageProvider";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/hooks/useFetchAllEntity";
import { useEmployeeEditStore } from "@/stores/employeeEditStore";
import { sortTableData } from "@/utils/sort";

export default function Page() {
  const { modules, language } = useLanguage();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Calculate offset based on currentPage and rowsPerPage
  const offset = useMemo(() => {
    return ((currentPage - 1) * rowsPerPage) + 1;
  }, [currentPage, rowsPerPage]);

  // Fetch data using generic hook with properly calculated offset
  const { data: employeeData, isLoading, refetch } = useFetchAllEntity("employee", {
    searchParams: {
      limit: String(rowsPerPage),
      offset: String(offset),
      // Add search and sort params if your API supports them
      ...(searchValue && { search: searchValue }),
      ...(sortField && { sortField }),
      ...(sortDirection && { sortDirection }),
    },
  });

  // Debug logging to track parameter changes
  useEffect(() => {
    console.log('API Parameters changed:', {
      limit: rowsPerPage,
      offset: offset,
      currentPage: currentPage,
      searchValue,
      sortField,
      sortDirection
    });
  }, [rowsPerPage, offset, currentPage, searchValue, sortField, sortDirection]);

  useEffect(() => {
    setColumns([
      { field: "emp_no", headerName: "Emp No" },
      {
        field: language === "ar" ? "firstname_arb" : "firstname_eng",
        headerName: language === "ar" ? "اسم الموظف" : "Employee Name",
      },
      { field: "manager_flag", headerName: "Manager" },
    ]);
  }, [language]);

  const data = useMemo(() => {
    if (Array.isArray(employeeData?.data)) {
      // Add id field for table usage
      return employeeData.data.map((emp: any) => ({
        ...emp,
        id: emp.employee_id,
      }));
    }
    return [];
  }, [employeeData]);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    console.log('Page changing from', currentPage, 'to', newPage);
    setCurrentPage(newPage);
    
    // Force refetch if available
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [currentPage, refetch]);

  // Handle rows per page change
  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    console.log('Rows per page changing from', rowsPerPage, 'to', newRowsPerPage);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Reset to first page when changing page size
    
    // Force refetch if available
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [rowsPerPage, refetch]);

  // Handle search change
  const handleSearchChange = useCallback((newSearchValue: string) => {
    setSearchValue(newSearchValue);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((field: string, direction: "asc" | "desc") => {
    setSortField(field);
    setSortDirection(direction);
    setCurrentPage(1); // Reset to first page when sorting
  }, []);

  const props = {
    Data: data,
    Columns: columns,
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
    total: employeeData?.total || 0,
    hasNext: employeeData?.hasNext,
    rowsPerPage,
    setRowsPerPage: handleRowsPerPageChange,
  };

  const handleSave = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["employee"] });
  }, [queryClient]);

  const setSelectedRowData = useEmployeeEditStore((state) => state.setSelectedRowData);

  const handleEditClick = useCallback(
    (row: any) => {
      setSelectedRowData(row);
      router.push("/employee-master/employee/add");
    },
    [router, setSelectedRowData]
  );

  const handleRowSelection = useCallback((rows: any[]) => {
    setSelectedRows(rows);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        selectedRows={selectedRows}
        items={modules?.employeeMaster.items}
        entityName="employee"
        isAddNewPagePath="/employee-master/employee/add"
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