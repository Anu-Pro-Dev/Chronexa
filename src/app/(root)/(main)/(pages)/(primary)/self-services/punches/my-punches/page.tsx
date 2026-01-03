"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import PowerTabs from "@/src/components/custom/power-comps/power-tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { CalendarIcon } from "@/src/icons/icons";
import { Calendar } from "@/src/components/ui/calendar";
import { format } from "date-fns";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { useDebounce } from "@/src/hooks/useDebounce"; 
import { InlineLoading } from "@/src/app/loading";

export default function Page() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { modules, language, translations } = useLanguage();
  const { isAuthenticated, isChecking, employeeId, userInfo } = useAuthGuard();
  
  const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>("transaction_id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [filter_open, filter_on_open_change] = useState<boolean>(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [popoverStates, setPopoverStates] = useState({
    fromDate: false,
    toDate: false,
  });
  
  const debouncedSearchValue = useDebounce(searchValue, 300);
  const t = translations?.modules?.selfServices || {};

  const offset = useMemo(() => currentPage, [currentPage]);

  const closePopover = useCallback((key: string) => {
    setPopoverStates(prev => ({ ...prev, [key]: false }));
  }, []);

  const formatDateForAPI = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const getEmployeeDisplayInfo = useCallback((transaction: any, lang: string = 'en') => {
    const employeeMaster = transaction.employee_master;
    
    if (!employeeMaster) {
      return {
        emp_no: `EMP${transaction.employee_id}`,
        employee_name: `Employee ${transaction.employee_id}`,
        firstName: '',
        lastName: '',
        fullName: `Employee ${transaction.employee_id}`
      };
    }

    const firstNameEn = employeeMaster.firstname_eng || '';
    const lastNameEn = employeeMaster.lastname_eng || '';
    const firstNameAr = employeeMaster.firstname_arb || '';
    const lastNameAr = employeeMaster.lastname_arb || '';

    const firstName = lang === 'ar' ? firstNameAr : firstNameEn;
    const lastName = lang === 'ar' ? lastNameAr : lastNameEn;
    
    const fullName = lang === 'ar' 
      ? `${firstNameAr} ${lastNameAr}`.trim()
      : `${firstNameEn} ${lastNameEn}`.trim();

    return {
      emp_no: employeeMaster.emp_no || `EMP${transaction.employee_id}`,
      employee_name: fullName || firstName || `Employee ${transaction.employee_id}`,
      firstName,
      lastName,
      fullName: fullName || firstName || `Employee ${transaction.employee_id}`,
      employee_id: transaction.employee_id
    };
  }, []);

  useEffect(() => {
    setColumns([
      { 
        field: "emp_no", 
        headerName: t.employee_no || "Employee No",
      },
      { 
        field: "employee_name", 
        headerName: t.employee_name || "Employee Name",
      },
      {
        field: "reason",
        headerName: t.trans_type || "Transaction Type",
      },
      { 
        field: "transaction_date", 
        headerName: t.trans_date || "Transaction Date",
      },
      { 
        field: "transaction_time", 
        headerName: t.trans_time || "Transaction Time"
      },
      {
        field: "remarks",
        headerName: t.remarks || "Remarks"
      }
    ]);
  }, [language, t]);

  const { data: punchesData, isLoading: isLoadingTransactions, error, refetch } = useFetchAllEntity(
    "employeeEventTransaction", 
    {
      searchParams: {
        limit: String(rowsPerPage),
        offset: String(offset),
        ...(debouncedSearchValue && { search: debouncedSearchValue }),
        ...(fromDate && { from_date: formatDateForAPI(fromDate) }),
        ...(toDate && { to_date: formatDateForAPI(toDate) }),
      },
      enabled: !!employeeId && isAuthenticated && !isChecking,
      endpoint: `/employeeEventTransaction/employee/${employeeId}`,
    }
  );

  const data = useMemo(() => {
    if (!Array.isArray(punchesData?.data)) {
      return [];
    }

    return punchesData.data.map((transaction: any) => {
      const employeeInfo = getEmployeeDisplayInfo(transaction, language);
      
      const transactionTimeStr = transaction.transaction_time || '';
      
      let formattedTime = '';
      let formattedDate = '';
      
      if (transactionTimeStr) {
        const date = new Date(transactionTimeStr);
        formattedTime = date.toISOString().substr(11, 8);
        formattedDate = date.toISOString().substr(0, 10);
      }
      
      return {
        ...transaction,
        id: transaction.transaction_id,
        emp_no: employeeInfo.emp_no,
        employee_name: employeeInfo.employee_name,
        firstName: employeeInfo.firstName,
        lastName: employeeInfo.lastName,
        fullName: employeeInfo.fullName,
        transaction_date: formattedDate,
        transaction_time: formattedTime,
        raw_employee_id: transaction.employee_id,
        employee_master: transaction.employee_master,
      };
    });
  }, [punchesData, language, getEmployeeDisplayInfo]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [refetch]);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [refetch]);

  const handleSearchChange = useCallback((newSearchValue: string) => {
    setSearchValue(newSearchValue);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback(() => {
    setCurrentPage(1);
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [refetch]);

  const handleFromDateChange = useCallback((date: Date | undefined) => {
    setFromDate(date);
    handleFilterChange();
  }, [handleFilterChange]);

  const handleToDateChange = useCallback((date: Date | undefined) => {
    setToDate(date);
    handleFilterChange();
  }, [handleFilterChange]);

  const handleEditClick = useCallback((rowData: any) => {
    try {
      const editData = {
        ...rowData,
        employeeInfo: {
          emp_no: rowData.emp_no,
          firstName: rowData.firstName,
          lastName: rowData.lastName,
          fullName: rowData.fullName,
          employee_master: rowData.employee_master
        }
      };
      
      sessionStorage.setItem('editTransactionsData', JSON.stringify(editData));
    } catch (error) {
      console.error("Error setting edit data:", error);
      toast.error("Failed to load transaction data for editing");
    }
  }, []);

  const handleRowSelection = useCallback((rows: any[]) => {
    setSelectedRows(rows);
  }, []);

  const props = useMemo(() => ({
    Data: data,
    Columns: columns,
    open,
    on_open_change: setOpen,
    selectedRows,
    setSelectedRows,
    isLoading: isLoadingTransactions || isChecking,
    SortField: sortField,
    CurrentPage: currentPage,
    SetCurrentPage: handlePageChange,
    SetSortField: setSortField,
    SortDirection: sortDirection,
    SetSortDirection: setSortDirection,
    SearchValue: searchValue,
    SetSearchValue: handleSearchChange,
    total: punchesData?.total || 0,
    hasNext: punchesData?.hasNext,
    rowsPerPage,
    setRowsPerPage: handleRowsPerPageChange,
    filter_open,
    filter_on_open_change,
  }), [
    data, 
    columns, 
    open, 
    selectedRows, 
    isLoadingTransactions, 
    isChecking, 
    sortField, 
    currentPage, 
    sortDirection, 
    searchValue, 
    punchesData, 
    rowsPerPage, 
    filter_open,
    handlePageChange,
    handleSearchChange,
    handleRowsPerPageChange
  ]);

  const renderPowerTable = () => {
    if (isChecking) {
      return (
        <div className="flex justify-center items-center p-8">
          <InlineLoading />
        </div>
      );
    }

    if (!isAuthenticated || !employeeId) {
      return (
        <div className="p-8">
          <div className="bg-backdrop rounded-md p-3">
            <div className="text-center">
              <p>Unable to load employee data. Please try logging in again.</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <PowerTable
        props={props}
        onEditClick={handleEditClick}
        onRowSelection={handleRowSelection}
        isLoading={isLoadingTransactions || isChecking}
      />
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        selectedRows={selectedRows}
        items={modules?.selfServices?.items}
        entityName="employeeEventTransaction"
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xl:max-w-[700px]">
        <div>
          <Popover 
            open={popoverStates.fromDate} 
            onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, fromDate: open }))}
          >
            <PopoverTrigger asChild>
              <Button 
                size="lg" 
                variant="outline"
                className="w-full bg-accent px-4 flex justify-between border-grey"
              >
                <p>
                  <Label className="font-normal text-secondary">
                    {t.from_date || "From Date"} :
                  </Label>
                  <span className="px-1 text-sm text-text-primary"> 
                    {fromDate ? format(fromDate, "dd/MM/yy") : (t.placeholder_date || "Choose date")}
                  </span>
                </p>
                <CalendarIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={fromDate}
                onSelect={(date) => {
                  handleFromDateChange(date);
                  closePopover('fromDate');
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Popover 
            open={popoverStates.toDate} 
            onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, toDate: open }))}
          >
            <PopoverTrigger asChild>
              <Button 
                size="lg" 
                variant="outline"
                className="w-full bg-accent px-4 flex justify-between border-grey"
              >
                <p>
                  <Label className="font-normal text-secondary">
                    {t.to_date || "To Date"} :
                  </Label>
                  <span className="px-1 text-sm text-text-primary"> 
                    {toDate ? format(toDate, "dd/MM/yy") : (t.placeholder_date || "Choose date")}
                  </span>
                </p>
                <CalendarIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar 
                mode="single" 
                selected={toDate} 
                onSelect={(date) => {
                  handleToDateChange(date);
                  closePopover('toDate');
                }} 
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="bg-accent rounded-2xl">
        <div className="col-span-2 p-6 pb-6">
          <h1 className="font-bold text-xl text-primary">
            {t.manage_my_punches || "Manage My Punches"}
          </h1>
        </div>
        <div className="px-6">
          <PowerTabs />
        </div>
        {renderPowerTable()}
      </div>
    </div>
  );
}