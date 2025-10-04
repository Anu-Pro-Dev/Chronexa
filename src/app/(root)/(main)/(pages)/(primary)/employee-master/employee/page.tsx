"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useEmployeeEditStore } from "@/src/stores/employeeEditStore";
import { useDebounce } from "@/src/hooks/useDebounce";

export default function Page() {
  const { modules, language, translations } = useLanguage();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const debouncedSearchValue = useDebounce(searchValue, 300);
  const t = translations?.modules?.employeeMaster || {};
  
  const offset = useMemo(() => {
    return currentPage;
  }, [currentPage]);

  const { data: employeeData, isLoading, refetch } = useFetchAllEntity("employee", {
    searchParams: {
      limit: String(rowsPerPage),
      offset: String(offset),
      ...(debouncedSearchValue && { search: debouncedSearchValue }),
    },
  });

  const { data: organizationData } = useFetchAllEntity("organization", {
    removeAll: true,
  });

  const { data: designationData } = useFetchAllEntity("designation", {
    removeAll: true,
  });

  const organizationMap = useMemo(() => {
    if (!organizationData?.data) return {};
    return organizationData.data.reduce((acc: any, org: any) => {
      acc[org.organization_id] = language === "ar" ? org.organization_arb : org.organization_eng;
      return acc;
    }, {});
  }, [organizationData, language]);

  const designationMap = useMemo(() => {
    if (!designationData?.data) return {};
    return designationData.data.reduce((acc: any, des: any) => {
      acc[des.designation_id] = language === "ar" ? des.designation_arb : des.designation_eng;
      return acc;
    }, {});
  }, [designationData, language]);

  const employeeMap = useMemo(() => {
    if (!employeeData?.data) return {};
    return employeeData.data.reduce((acc: any, emp: any) => {
      acc[emp.employee_id] = language === "ar" ? emp.firstname_arb : emp.firstname_eng;
      return acc;
    }, {});
  }, [employeeData, language]);

  useEffect(() => {
    setColumns([
      { field: "emp_no", headerName: "Emp No" },
      {
        field: language === "ar" ? "firstname_arb" : "firstname_eng",
        headerName: "Employee Name",
      },
      {
        field: "email",
        headerName: "Email ID",
      },
      {
        field: "join_date",
        headerName: t.join_date,
      },
      {
        field: "designation_name",
        headerName: "Designation",
      },
      {
        field: "organization_name",
        headerName: "Organization",
      },
      { field: "manager_flag", headerName: "Manager" },
    ]);
  }, [language]);

  const data = useMemo(() => {
    if (Array.isArray(employeeData?.data)) {
      return employeeData.data.map((emp: any) => ({
        ...emp,
        id: emp.employee_id,
        designation_name: designationMap[emp.designation_id] || "-",
        organization_name: organizationMap[emp.organization_id] || "-",
        join_date: emp.join_date ? new Date(emp.join_date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) : "-",
      }));
    }
    return [];
  }, [employeeData, designationMap, organizationMap, employeeMap]);

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
      router.push(`/employee-master/employee/edit?id=${row.employee_id}`);
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
        disableDelete
        selectedRows={selectedRows}
        items={modules?.employeeMaster.items}
        entityName="employee"
        isAddNewPagePath="/employee-master/employee/add"
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