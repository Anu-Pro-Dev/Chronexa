"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddEmployeeType from "@/forms/employee-master/AddEmployeeType";
import { useLanguage } from "@/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/lib/useFetchAllEntity";

export default function Page() {
  const { modules, language } = useLanguage();
  const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
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
      { field: "employee_type_code", headerName: language === "ar" ? "كود الموظف" : "Employee Code" },
      {
        field: language === "ar" ? "employee_type_arb" : "employee_type_eng",
        headerName: language === "ar" ? "نوع الموظف" : "Employee Type",
      },
    ]);
  }, [language]);

  const { data: employeeTypeData, isLoading } = useFetchAllEntity("employeeType");

  const data = useMemo(() => {
    if (Array.isArray(employeeTypeData?.data)) {
      return employeeTypeData.data.map((empType: any) => {
        return {
          ...empType,
          id: empType.employee_type_id,
        };
      });
    }
    return [];
  }, [employeeTypeData]);

  useEffect(() => {
    if (!open) {
      setSelectedRowData(null);
    }
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
    queryClient.invalidateQueries({ queryKey: ["employeeType"] });
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
        items={modules?.employeeMaster.items}
        entityName="employeeType"
        modal_title="Employee Type"
        modal_component={
          <AddEmployeeType
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
