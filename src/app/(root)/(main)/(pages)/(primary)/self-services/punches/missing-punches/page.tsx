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
import { startOfDay, subDays } from "date-fns";
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
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandGroup,
  CommandItem,
} from "@/src/components/ui/command";
import { ChevronsUpDown } from "lucide-react";

export default function Page() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { modules, language, translations } = useLanguage();
  const { isAuthenticated, isChecking, employeeId, userInfo } = useAuthGuard();
  const orgId = userInfo?.organization_id ?? userInfo?.organization?.id;

  const today = new Date();
  const yesterday = subDays(today, 1);

  const allowedDays = orgId === 25 ? 4 : 7;

  const defaultFromDate = startOfDay(subDays(yesterday, allowedDays));

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
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [popoverStates, setPopoverStates] = useState({
    fromDate: false,
    toDate: false,
    employeeFilter: false,
    department: false,
  });

  const debouncedSearchValue = useDebounce(searchValue, 300);
  const debouncedEmployeeFilter = useDebounce(employeeFilter, 300);
  const t = translations?.modules?.selfServices || {};

  const minToDate = useMemo(() => {
    return fromDate ? startOfDay(fromDate) : undefined;
  }, [fromDate]);

  const offset = useMemo(() => currentPage, [currentPage]);

  const closePopover = useCallback((key: 'fromDate' | 'toDate' | 'employeeFilter' | 'department') => {
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

  const { data: employeesData } = useFetchAllEntity("employee", {
    searchParams: {
      limit: "1000",
    },
  });

  const { data: departmentsData, isLoading: isLoadingDepartments } = useFetchAllEntity(
    "department",
    {
      searchParams: {
        offset: "1",
        limit: "1000",
      },
    }
  );

  const getEmployeesData = useCallback(() => {
    if (!employeesData?.data) return [];
    return employeesData.data.filter((item: any) => item.employee_id);
  }, [employeesData]);

  const getDepartmentsData = useCallback(() => {
    if (!departmentsData?.data) return [];
    return departmentsData.data.filter((item: any) => item.department_id);
  }, [departmentsData]);


  useEffect(() => {
    if (!orgId || fromDate || toDate) return;

    setFromDate(defaultFromDate);
    setToDate(startOfDay(today));
  }, [orgId]);

  const { apiEndpoint, searchParams } = useMemo(() => {
    const userRole = userInfo?.role?.toLowerCase();

    const commonParams = {
      limit: String(rowsPerPage),
      offset: String(offset),
      ...(debouncedSearchValue && { search: debouncedSearchValue }),
      ...(fromDate && { from_date: formatDateForAPI(fromDate) }),
      ...(toDate && { to_date: formatDateForAPI(toDate) }),
      ...(selectedDepartment && { department_id: selectedDepartment }),
    };

    if (userRole === "admin") {
      return {
        apiEndpoint: "/missingMovement/all",
        searchParams: {
          ...commonParams,
          // ...(employeeId && { employee_id: String(employeeId) }),
          // ...(debouncedEmployeeFilter && { employeeId: debouncedEmployeeFilter }),
        },
      };
    } else if (userRole === "manager") {
      return {
        apiEndpoint: "/missingMovement/team/all",
        searchParams: {
          ...commonParams,
          // ...(employeeId && { employee_id: String(employeeId) }),
          // ...(debouncedEmployeeFilter && { employeeId: debouncedEmployeeFilter }),
        },
      };
    }
    else {
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
    selectedDepartment,
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
    const nextFromDate = date ? startOfDay(date) : undefined;

    setFromDate(nextFromDate);

    if (nextFromDate && toDate) {
      const currentToDate = startOfDay(toDate);
      if (currentToDate < nextFromDate) {
        setToDate(nextFromDate);
      }
    }

    handleFilterChange();
  }, [handleFilterChange, toDate]);

  const handleToDateChange = useCallback((date: Date | undefined) => {
    const nextToDate = date ? startOfDay(date) : undefined;

    if (minToDate && nextToDate && nextToDate < minToDate) {
      setToDate(minToDate);
      handleFilterChange();
      return;
    }

    setToDate(nextToDate);
    handleFilterChange();
  }, [handleFilterChange, minToDate]);

  const handleEmployeeFilterChange = useCallback((value: string) => {
    setEmployeeFilter(value);
    setCurrentPage(1);
    closePopover('employeeFilter');
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [refetch, closePopover]);

  const handleDepartmentChange = useCallback((value: string) => {
    setSelectedDepartment(value);
    setCurrentPage(1);
    closePopover('department');
    // Let useFetchAllEntity refetch on param change.
  }, [refetch, closePopover]);

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

  useEffect(() => {
    const handleFocus = () => {
      refetch && refetch();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refetch]);

  const handleModalClose = (open: boolean) => {
    setIsModalOpen(open);

    if (!open) {
      refetch && refetch(); // refresh after apply
    }
  };

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

  const isAdmin = userInfo?.role?.toLowerCase() === "admin";
  const isManager = userInfo?.role?.toLowerCase() === "manager";

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        selectedRows={selectedRows}
        items={modules?.selfServices?.items}
        entityName="employeeEventTransaction"
        customButtons={
          <>
            {isAdmin && (
              <Button
                variant="success"
                size="sm"
                className="flex items-center space-y-0.5"
                onClick={handleGroupApplyClick}
              >
                <span>{t.manaual_punches || "Manual Punches"}</span>
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1  md:grid-cols-4 gap-4 ">
        <div>
          <Popover
            open={popoverStates.fromDate}
            onOpenChange={(open) =>
              setPopoverStates((prev) => ({ ...prev, fromDate: open }))
            }
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
            onOpenChange={(open) =>
              setPopoverStates((prev) => ({ ...prev, toDate: open }))
            }
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
                disabled={minToDate ? { before: minToDate } : undefined}
                onSelect={(date) => {
                  handleToDateChange(date);
                  closePopover("toDate");
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        {/* </div> */}

        {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:max-w-[700px]"> */}
        <div>
          <Popover
            open={popoverStates.department}
            onOpenChange={(open) =>
              setPopoverStates((prev) => ({ ...prev, department: open }))
            }
          >
            <PopoverTrigger asChild>
              <Button
                size="lg"
                variant="outline"
                className="w-full bg-accent px-4 flex justify-between border-grey overflow-hidden"
                disabled={isLoadingDepartments}
              >
                <span className="flex items-center gap-1 min-w-0 overflow-hidden">
                  <Label className="font-normal text-secondary shrink-0">
                    {t.department || "Department"} :
                  </Label>
                  <span className="px-1 text-sm text-text-primary truncate">
                    {isLoadingDepartments
                      ? (t.loading || "Loading...")
                      : selectedDepartment
                        ? (() => {
                          const dept = getDepartmentsData().find(
                            (item: any) =>
                              String(item.department_id) === selectedDepartment
                          );
                          return (
                            (language === "ar"
                              ? dept?.department_name_arb
                              : dept?.department_name_eng) ||
                            dept?.department_code ||
                            selectedDepartment
                          );
                        })()
                        : (t.placeholder_department || "Choose department")}
                  </span>
                </span>
                <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0 ml-1" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-dropdown">
              <Command>
                <CommandInput
                  placeholder={t.search_department || "Search department..."}
                />
                <CommandEmpty>
                  {isLoadingDepartments
                    ? (t.loading || "Loading...")
                    : (t.no_department_found || "No department found")}
                </CommandEmpty>
                <CommandGroup className="max-h-64 overflow-auto">
                  <CommandItem onSelect={() => handleDepartmentChange("")}>
                    {t.all || "All"}
                  </CommandItem>
                  {getDepartmentsData().map((item: any) => {
                    const name =
                      language === "ar"
                        ? item.department_name_arb
                        : item.department_name_eng;

                    return (
                      <CommandItem
                        key={item.department_id}
                        onSelect={() =>
                          handleDepartmentChange(String(item.department_id))
                        }
                      >
                        {item.department_code}
                        {name ? ` - ${name}` : ""}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        {/* <div>
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
            <PopoverContent className="w-auto p-0 border-none shadow-dropdown">
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
            <PopoverContent className="w-auto p-0 border-none shadow-dropdown">
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
        </div> */}

        {/* {(isAdmin || isManager) && (
          <div>
            <Popover
              open={popoverStates.employeeFilter}
              onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, employeeFilter: open }))}
            >
              <PopoverTrigger asChild>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full bg-accent px-4 flex justify-between border-grey"
                >
                  <p>
                    <Label className="font-normal text-secondary">
                      {t.employee_no || "Employee No"} :
                    </Label>
                    <span className="px-1 text-sm text-text-primary">
                      {employeeFilter
                        ? getEmployeesData().find((item: any) =>
                          String(item.employee_id) === employeeFilter
                        )?.emp_no || (language === "ar"
                          ? `${getEmployeesData().find((item: any) => String(item.employee_id) === employeeFilter)?.firstname_arb || ""} ${getEmployeesData().find((item: any) => String(item.employee_id) === employeeFilter)?.lastname_arb || ""}`.trim()
                          : `${getEmployeesData().find((item: any) => String(item.employee_id) === employeeFilter)?.firstname_eng || ""} ${getEmployeesData().find((item: any) => String(item.employee_id) === employeeFilter)?.lastname_eng || ""}`.trim())
                        : (t.placeholder_employee_filter || "Choose employee")}
                    </span>
                  </p>
                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-dropdown">
                <Command>
                  <CommandInput placeholder={t.search_employee || "Search employee..."} />
                  <CommandGroup className="max-h-64 overflow-auto">
                    {getEmployeesData().map((item: any) => {
                      const displayName = language === "ar"
                        ? `${item.firstname_arb || ""} ${item.lastname_arb || ""}`.trim()
                        : `${item.firstname_eng || ""} ${item.lastname_eng || ""}`.trim();

                      return (
                        <CommandItem
                          key={item.employee_id}
                          onSelect={() => handleEmployeeFilterChange(String(item.employee_id))}
                        >
                          {item.emp_no} - {displayName}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        )} */}
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
          onOpenChange={handleModalClose}
          rowData={selectedRowData.rowData}
          punchType={selectedRowData.punchType}
          size="large"
        />
      )}
      {isGroupModalOpen && (
        <GroupPunchModal
          open={isGroupModalOpen}
          onOpenChange={(open) => {
            setIsGroupModalOpen(open);
            if (!open) refetch && refetch();
          }}
          size="large"
        />
      )}
    </div>
  );
}