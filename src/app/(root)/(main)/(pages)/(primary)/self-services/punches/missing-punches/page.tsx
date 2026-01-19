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
import MissingPunchModal from "@/src/components/custom/modules/self-services/MissingPunchModal";
import GroupPunchModal from "@/src/components/custom/modules/self-services/GroupPunchModal";
import { InlineLoading } from "@/src/app/loading";

export default function Page() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { modules, language, translations } = useLanguage();
  const { isAuthenticated, isChecking, employeeId, userInfo } = useAuthGuard();
  
  type Columns = {
    field: string;
    headerName?: string;
    clickable?: boolean;
    onCellClick?: (data: any) => void;
    cellRenderer?: (data: any) => any;
  };

  const [columns, setColumns] = useState<Columns[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>("transaction_id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [filter_open, filter_on_open_change] = useState<boolean>(false);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [employeeFilter, setEmployeeFilter] = useState<string>("");
  const [popoverStates, setPopoverStates] = useState({
    fromDate: false,
    toDate: false,
  });
  
  const debouncedSearchValue = useDebounce(searchValue, 300);
  const debouncedEmployeeFilter = useDebounce(employeeFilter, 300);
  const t = translations?.modules?.selfServices || {};

  const offset = useMemo(() => currentPage, [currentPage]);

  const closePopover = useCallback((key: string) => {
    setPopoverStates(prev => ({ ...prev, [key]: false }));
  }, []);

  const formatDateForAPI = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const formatTime = useCallback((timeString: string | null) => {
    if (!timeString) return null;

    if (/^\d{2}:\d{2}:\d{2}$/.test(timeString)) {
      return timeString;
    }

    try {
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
      }
      return timeString;
    } catch {
      return timeString;
    }
  }, []);

  const formatDateDisplay = useCallback((dateString: string | null) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
      return dateString;
    } catch {
      return dateString;
    }
  }, []);

  const getEmployeeName = useCallback((transaction: any) => {
    const txEmployeeId = transaction.Employee_Id;

    if (userInfo && txEmployeeId === employeeId) {
      const name = language === "ar"
        ? `${userInfo.employeename?.firstarb || ""}`.trim()
        : `${userInfo.employeename?.firsteng || ""}`.trim();

      if (name) return name;
    }

    const employee = transaction.employee_master;

    if (employee) {
      const fullName = language === "ar"
        ? `${employee.firstname_arb || ""}`.trim()
        : `${employee.firstname_eng || ""}`.trim();

      if (fullName) return fullName;
    }

    return `Emp ${txEmployeeId ?? "-"}`;
  }, [language, userInfo, employeeId]);

  const { apiEndpoint, searchParams } = useMemo(() => {
    const userRole = userInfo?.role?.toLowerCase();
    
    const commonParams = {
      limit: String(rowsPerPage),
      offset: String(offset),
      ...(debouncedSearchValue && { search: debouncedSearchValue }),
      ...(fromDate && { from_date: formatDateForAPI(fromDate) }),
      ...(toDate && { to_date: formatDateForAPI(toDate) }),
    };

    if (userRole === "admin") {
      return {
        apiEndpoint: "/missingMovement/all",
        searchParams: {
          ...commonParams,
          ...(debouncedEmployeeFilter && { employeeId: debouncedEmployeeFilter }),
        },
      };
    } else if (userRole === "manager") {
      return {
        apiEndpoint: "/missingMovement/team",
        searchParams: {
          ...commonParams,
          ...(debouncedEmployeeFilter && { employeeId: debouncedEmployeeFilter }),
        },
      };
    } else {
      return {
        apiEndpoint: "/missingMovement/all",
        searchParams: {
          ...commonParams,
          ...(employeeId && { employee_id: String(employeeId) }),
        },
      };
    }
  }, [
    userInfo?.role,
    employeeId,
    rowsPerPage,
    offset,
    debouncedSearchValue,
    fromDate,
    toDate,
    debouncedEmployeeFilter,
    formatDateForAPI,
  ]);

  const handleCellClick = useCallback((data: any, field: string) => {
    const completeData = {
      rowData: data,
      punchType: field,
    };

    setSelectedRowData(completeData);
    setIsModalOpen(true);
  }, []);

  const handleGroupApplyClick = useCallback(() => {
    setIsGroupModalOpen(true);
  }, []);

  const TimeInCellRenderer = useCallback((data: any) => {
    const value = data.Trans_IN;
    const status = data.Status_IN;

    const isPending = status && (status.toUpperCase() === 'PENDING' || status.toUpperCase() === 'APPLIED');
    const isRejected = status && status.toUpperCase() === 'REJECTED';

    if (value === "Apply") {
      if (isPending || isRejected) {
        return (
          <span className="text-gray-400 cursor-not-allowed">
            {t.applied || "Applied"}
          </span>
        );
      }
      return (
        <button
          onClick={() => handleCellClick(data, "IN")}
          className="text-primary hover:underline cursor-pointer"
        >
          Apply
        </button>
      );
    }
    return <span>{value}</span>;
  }, [handleCellClick, t]);

  const TimeOutCellRenderer = useCallback((data: any) => {
    const value = data.Trans_OUT;
    const status = data.Status_OUT;

    const isPending = status && (status.toUpperCase() === 'PENDING' || status.toUpperCase() === 'APPLIED');
    const isRejected = status && status.toUpperCase() === 'REJECTED';

    if (value === "Apply") {
      if (isPending || isRejected) {
        return (
          <span className="text-gray-400 cursor-not-allowed">
            Applied
          </span>
        );
      }
      return (
        <button
          onClick={() => handleCellClick(data, "OUT")}
          className="text-primary hover:underline cursor-pointer"
        >
          Apply
        </button>
      );
    }
    return <span>{value}</span>;
  }, [handleCellClick, t]);

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
        field: "TransDate",
        headerName: t.date || "Date",
      },
      {
        field: "Trans_IN",
        headerName: t.time_in || "Time In",
        cellRenderer: TimeInCellRenderer,
      },
      {
        field: "Trans_OUT",
        headerName: t.time_out || "Time Out",
        cellRenderer: TimeOutCellRenderer,
      },
      {
        field: "Status",
        headerName: t.status || "Status",
      },
    ]);
  }, [language, t, TimeInCellRenderer, TimeOutCellRenderer]);

  const {
    data: punchesData,
    isLoading: isLoadingTransactions,
    error,
    refetch,
  } = useFetchAllEntity("missingMovement", {
    searchParams,
    enabled: !!employeeId && isAuthenticated && !isChecking && !!userInfo?.role,
    endpoint: apiEndpoint,
  });

  const data = useMemo(() => {
    if (!Array.isArray(punchesData?.data)) return [];

    return punchesData.data.map((transaction: any) => {
      const empNo = transaction.employee_master?.emp_no || `EMP${transaction.Employee_Id}`;
      const timeIn = formatTime(transaction.Trans_IN);
      const timeOut = formatTime(transaction.Trans_OUT);

      let status = "-";
      if (transaction.Status_IN && transaction.Status_OUT) {
        status = `${transaction.Status_IN} / ${transaction.Status_OUT}`;
      } else if (transaction.Status_IN) {
        status = transaction.Status_IN;
      } else if (transaction.Status_OUT) {
        status = transaction.Status_OUT;
      }

      return {
        ...transaction,
        id: transaction.Emp_Missing_Movements_Id,
        emp_no: empNo,
        employee_name: getEmployeeName(transaction),
        TransDate: formatDateDisplay(transaction.TransDate),
        Trans_IN: timeIn || "Apply",
        Trans_OUT: timeOut || "Apply",
        Status: status,
      };
    });
  }, [punchesData, getEmployeeName, formatTime, formatDateDisplay]);

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

  const handleEmployeeFilterChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setEmployeeFilter(event.target.value);
    setCurrentPage(1);
  }, []);

  const handleSave = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["employeeEventTransaction", employeeId],
    });
  }, [queryClient, employeeId]);

  const handleEditClick = useCallback((rowData: any) => {
    try {
      const editData = {
        ...rowData,
      };

      sessionStorage.setItem("editTransactionsData", JSON.stringify(editData));
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
        customButtons={
          <>
            {userInfo?.role?.toLowerCase() === "admin" && (
              <Button
                variant="success"
                size="sm"
                className="flex items-center space-y-0.5"
                onClick={handleGroupApplyClick}
              >
                <span>{t.group_apply || "Group Apply"}</span>
              </Button>
            )}
          </>
        }
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
                    {fromDate
                      ? format(fromDate, "dd/MM/yy")
                      : (t.placeholder_date || "Choose date")}
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
                  closePopover("fromDate");
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
                    {toDate
                      ? format(toDate, "dd/MM/yy")
                      : (t.placeholder_date || "Choose date")}
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
                  closePopover("toDate");
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="bg-accent rounded-2xl">
        <div className="col-span-2 p-6 pb-6">
          <h1 className="font-bold text-xl text-primary">
            {t.missing_punches_tab || "Manage Missing Punches"}
          </h1>
        </div>
        <div className="px-6">
          <PowerTabs />
        </div>
        {renderPowerTable()}
      </div>

      {isModalOpen && selectedRowData && (
        <MissingPunchModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          rowData={selectedRowData.rowData}
          punchType={selectedRowData.punchType}
          size="large"
        />
      )}
      {isGroupModalOpen && (
        <GroupPunchModal
          open={isGroupModalOpen}
          onOpenChange={setIsGroupModalOpen}
          size="large"
        />
      )}
    </div>
  );
}