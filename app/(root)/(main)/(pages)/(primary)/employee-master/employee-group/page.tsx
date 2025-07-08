"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddEmployeeGroup from "@/forms/employee-master/AddEmployeeGroup";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/lib/useFetchAllEntity";
import { FaUsers } from "react-icons/fa";

export default function Page() {
  const { modules, language } = useLanguage();
  const [columns, setColumns] = useState<{ field: string; headerName: string; clickable?: boolean; onCellClick?: (data: any) => void }[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const queryClient = useQueryClient();
  const router = useRouter();

  // const FaUsersRenderer: React.FC = () => <FaUsers size={22} />;

  useEffect(() => {
    setColumns([
      { field: "group_code", headerName: language === "ar" ? "رمز المجموعة" : "Group Code" },
      {
        field: language === "ar" ? "group_name_arb" : "group_name_eng",
        headerName: language === "ar" ? "اسم المجموعة" : "Group Name",
      },
      { 
        field: "employee_group_members", 
        headerName: language === "ar" ? "التجميع" : "Grouping",
        clickable: true, 
        onCellClick: handleCellClickPath,
      },
      { field: "group_start_date", headerName: "Group Start Date" },
      { field: "group_end_date", headerName: "Group End Date" },
      {
        field: "reporting_group_flag",
        headerName: "Reporting"
      },
    ]);
  }, [language]);

  const { data: employeeGroupData, isLoading } = useFetchAllEntity("employeeGroup");

  const data = useMemo(() => {
    if (Array.isArray(employeeGroupData?.data)) {
      return employeeGroupData.data.map((empGroup: any) => ({
        ...empGroup,
        id: empGroup.employee_group_id,
        employee_group_members: "Members",
        group_start_date: new Date(empGroup.group_start_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        group_end_date: new Date(empGroup.group_end_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      }));
    }
    return [];
  }, [employeeGroupData, language]);

  useEffect(() => {
    if (!open) {
      setSelectedRowData(null);
    }
  }, [open]);

   const handleCellClickPath = useCallback((data: any) => {
    if (data?.group_code) {
      router.push(`/employee-master/employee-group/group-members?group=${data.group_code}`);
    } else {
      console.error("Error: No code found for this row", data);
    }
  }, [router]);

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
    queryClient.invalidateQueries({ queryKey: ["employeeGroup"] });
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
        entityName="employeeGroup"
        modal_title="Employee Group"
        modal_component={
          <AddEmployeeGroup
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
