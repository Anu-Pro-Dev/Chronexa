"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import { useLanguage } from "@/providers/LanguageProvider";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/lib/useFetchAllEntity";
import { useEmployeeEditStore } from "@/stores/employeeEditStore";

export default function Page() {
  const { modules, language } = useLanguage();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  // Fetch data using generic hook
  const { data: employeeData, isLoading } = useFetchAllEntity("employee");

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
      return employeeData.data.map((emp: any) => ({
        ...emp,
        id: emp.employee_id,
      }));
    }
    return [];
  }, [employeeData]);

  const props = {
    Data: data,
    Columns: columns,
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
