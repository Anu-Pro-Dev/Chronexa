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
import { Input } from "@/src/components/ui/input";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { useDebounce } from "@/src/hooks/useDebounce"; 
import { InlineLoading } from "@/src/app/loading";

export default function Page() {
  const { modules, language, translations } = useLanguage();
  const { isAuthenticated, isChecking, employeeId, userInfo } = useAuthGuard();
  const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>("transaction_id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState<boolean>(false);
  const [filter_open, filter_on_open_change] = useState<boolean>(false);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [employeeFilter, setEmployeeFilter] = useState<string>("");
  const debouncedSearchValue = useDebounce(searchValue, 300);
  const debouncedEmployeeFilter = useDebounce(employeeFilter, 300);
  const t = translations?.modules?.selfServices || {};
  const [popoverStates, setPopoverStates] = useState({
    fromDate: false,
    toDate: false,
  });

  const closePopover = (key: string) => {
    setPopoverStates(prev => ({ ...prev, [key]: false }));
  };
  const offset = useMemo(() => {
    return currentPage;
  }, [currentPage]);

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
        headerName: t.trans_date || "Transaction Date"
      },
      { 
        field: "transaction_time", 
        headerName: t.trans_time || "Transaction Time"
      },
      {
        field: "remarks",
        headerName: "Remarks"
      }
    ]);
  }, [language, t]);

  const formatDateForAPI = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const { data: punchesData, isLoading: isLoadingTransactions, error, refetch } = useFetchAllEntity(
    "employeeEventTransaction", 
    {
      searchParams: {
        limit: String(rowsPerPage),
        offset: String(offset),
        ...(debouncedSearchValue && { search: debouncedSearchValue }),
        ...(fromDate && { startDate: formatDateForAPI(fromDate) }),
        ...(toDate && { endDate: formatDateForAPI(toDate) }),
        ...(debouncedEmployeeFilter && { employeeId: debouncedEmployeeFilter }),
      },
      enabled: !!employeeId && isAuthenticated && !isChecking,
      endpoint: `/employeeEventTransaction/all`,
    }
  );

  const getEmployeeName = (transaction: any) => {
    if (userInfo && transaction.employee_id === employeeId) {
      const name = language === "ar" 
        ? `${userInfo.employeename?.firstarb || ""}`.trim()
        : `${userInfo.employeename?.firsteng || ""}`.trim();
      
      if (name) return name;
    }
    
    const employee = transaction.employee_master;
    
    if (!employee) {
      return `Emp ${transaction.employee_id}`;
    }
    
    const fullName = language === "ar"
      ? `${employee.firstname_arb || ""} ${employee.lastname_arb || ""}`.trim()
      : `${employee.firstname_eng || ""} ${employee.lastname_eng || ""}`.trim();
    
    return fullName || `Emp ${transaction.employee_id}`;
  };

  const data = useMemo(() => {
    if (Array.isArray(punchesData?.data)) {
      const filteredData = punchesData.data.filter((transaction: any) => 
        transaction.employee_id !== employeeId
      );

      const processedData = filteredData.map((transaction: any) => {
        const transactionTimeStr = transaction.transaction_time;
        
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
          emp_no: transaction.employee_master?.emp_no || `EMP${transaction.employee_id}`,
          employee_name: getEmployeeName(transaction),
          transaction_date: formattedDate,
          transaction_time: formattedTime,
        };
      });

      return processedData;
    }
    return [];
  }, [punchesData, language, userInfo, employeeId, error]);

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

  const handleFromDateChange = (date: Date | undefined) => {
    setFromDate(date);
    handleFilterChange();
  };

  const handleToDateChange = (date: Date | undefined) => {
    setToDate(date);
    handleFilterChange();
  };

  const handleEmployeeFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmployeeFilter(event.target.value);
    setCurrentPage(1);
  };
  
  const props = {
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
  };

  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ["employeeEventTransaction", employeeId] });
  };
 
  const handleEditClick = (rowData: any) => {
    try {
      const editData = {
        ...rowData,
      };
      
      sessionStorage.setItem('editTransactionsData', JSON.stringify(editData));
    } catch (error) {
      console.error("Error setting edit data:", error);
      toast.error("Failed to load transaction data for editing");
    }
  };
 
  const handleRowSelection = useCallback((rows: any[]) => {
    setSelectedRows(rows);
  }, []);

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
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="bg-accent border border-grey rounded-full px-4 py-2 h-[40px] flex items-center">
            <Label className="font-normal text-secondary whitespace-nowrap mr-2">
              {t.employee_id || "Employee ID"} :
            </Label>
            <Input
              type="text"
              value={employeeFilter}
              onChange={handleEmployeeFilterChange}
              placeholder={t.placeholder_employee_id || "Enter Employee ID"}
              className="bg-transparent border-0 p-0 h-auto font-semibold text-text-primary focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-sm placeholder:text-text-primary"
            />
          </div>
        </div>
        <div>
          <Popover open={popoverStates.fromDate} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, fromDate: open }))}>
            <PopoverTrigger asChild>
              <Button size={"lg"} variant={"outline"}
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
          <Popover open={popoverStates.toDate} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, toDate: open }))}>
            <PopoverTrigger asChild>
              <Button size={"lg"} variant={"outline"}
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
          <h1 className="font-bold text-xl text-primary">Manage Team Punches</h1>
        </div>
        <div className="px-6">
          <PowerTabs />
        </div>
        {renderPowerTable()}
      </div>
    </div>
  );
}