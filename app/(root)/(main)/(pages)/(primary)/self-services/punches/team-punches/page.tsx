"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import PowerTabs from "@/components/custom/power-comps/power-tabs";
import { useLanguage } from "@/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/hooks/useFetchAllEntity";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function Page() {
  const router = useRouter();
  const { modules, language } = useLanguage();
  const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  // Set default sort field and direction for descending order
  const [sortField, setSortField] = useState<string>("transaction_id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState<boolean>(false);
  const [filter_open, filter_on_open_change] = useState<boolean>(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);

  useEffect(() => {
    setColumns([
      { field: "employee_name", headerName: language === "ar" ? "الموظف" : "Employee" },
      {
        field: "reason",
        headerName: language === "ar" ? "نوع المعاملة" : "Transcation Type",
      },
      { field: "transaction_date", headerName: language === "ar" ? "تاريخ التحويل" : "Transcation Date" },
      { field: "transaction_time", headerName: language === "ar" ? "وقت التحويل" : "Transcation Time" },
    ]);
  }, [language]);

  const { data: employeeEventTransactionsData, isLoading } = useFetchAllEntity("employeeEventTransaction");
  const { data: employeesData, isLoading: isLoadingEmployees } = useFetchAllEntity("employee");

  // Helper function to get employee name (following the same pattern as the first document)
  const getEmployeeName = (employeeId: number, employeesData: any) => {
    const employee = employeesData?.data?.find(
      (emp: any) => emp.employee_id === employeeId
    );
    
    if (!employee) {
      return `Emp ${employeeId}`;
    }
    
    // Use the same naming pattern as the first document
    const fullName = language === "ar"
      ? `${employee.firstname_arb || ""}`.trim()
      : `${employee.firstname_eng || ""}`.trim();
    
    return fullName || `Emp ${employeeId}`;
  };

  const data = useMemo(() => {
    if (Array.isArray(employeeEventTransactionsData?.data)) {
      const processedData = employeeEventTransactionsData.data.map((transaction: any) => {
        return {
          ...transaction,
          id: transaction.transaction_id,
          employee_name: getEmployeeName(transaction.employee_id, employeesData),
          transaction_date: new Date(transaction.transaction_time).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          transaction_time: new Date(transaction.transaction_time).toLocaleString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          // Keep the original timestamp for sorting
          transaction_timestamp: new Date(transaction.transaction_time).getTime(),
        };
      });

      // Sort the data based on current sort settings
      if (sortField) {
        processedData.sort((a: any, b: any) => {
          let aValue = a[sortField];
          let bValue = b[sortField];
          
          // Special handling for numeric sorting (like transaction_id)
          if (sortField === "transaction_id") {
            aValue = Number(aValue);
            bValue = Number(bValue);
          }
          // Special handling for date/time sorting
          else if (sortField === "transaction_time" || sortField === "transaction_date") {
            aValue = a.transaction_timestamp;
            bValue = b.transaction_timestamp;
          }
          
          if (aValue < bValue) {
            return sortDirection === "asc" ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortDirection === "asc" ? 1 : -1;
          }
          return 0;
        });
      }

      return processedData;
    }
    return [];
  }, [employeeEventTransactionsData, employeesData, language, sortField, sortDirection]);

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
    filter_open,
    filter_on_open_change,
  };

  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ["employeeEventTransaction"] });
  };
 
  const handleEditClick = (rowData: any) => {
    try {
      const editData = {
        ...rowData,
      };
      
      sessionStorage.setItem('editTransactionsData', JSON.stringify(editData));
      
      // Navigate to the add page (which will handle edit mode)
      // router.push("/self-services/permissions/manage/add");
    } catch (error) {
      console.error("Error setting edit data:", error);
      toast.error("Failed to load permission data for editing");
    }
  };
 
  const handleRowSelection = useCallback((rows: any[]) => {
    setSelectedRows(rows);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        disableAdd
        disableDelete
        selectedRows={selectedRows}
        items={modules?.selfServices.items}
        entityName="employeeEventTransaction"
        // modal_component={
        //   <AddManageMovements 
        //     on_open_change={setOpen}
        //     selectedRowData={selectedRowData}
        //     onSave={handleSave}
        //   />
        // }
        // isLarge2={true}
        // filter_modal_component={
        //   <FilterManualMovement on_open_change={filter_on_open_change} />
        // }
        // isLarge={true}
      />
      <div className="bg-accent rounded-2xl">
        <div className="col-span-2 p-6 pb-6">
          <h1 className="font-bold text-xl text-primary">Manage Team Punches</h1>
        </div>
        <div className="px-6">
          <PowerTabs items={modules?.selfServices?.punches?.items} />
        </div>
        <PowerTable
          props={props}
          showEdit={false}
          onEditClick={handleEditClick}
          onRowSelection={handleRowSelection}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}