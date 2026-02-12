"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/src/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import PowerTabs from "@/src/components/custom/power-comps/power-tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { CalendarIcon } from "@/src/icons/icons";
import { Calendar } from "@/src/components/ui/calendar";
import { format } from "date-fns";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
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
  const [sortField, setSortField] = useState<string>("short_permission_id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [filter_open, filter_on_open_change] = useState<boolean>(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [selectedOption, setSelectedOption] = useState<string>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("");
  const [popoverStates, setPopoverStates] = useState({
    fromDate: false,
    toDate: false,
    employeeFilter: false,
  });

  const debouncedSearchValue = useDebounce(searchValue, 300);
  const debouncedEmployeeFilter = useDebounce(employeeFilter, 300);
  const t = translations?.modules?.selfServices || {};

  const offset = useMemo(() => currentPage, [currentPage]);

  const isAdmin = userInfo?.role?.toLowerCase() === "admin";
  const isManager = userInfo?.role?.toLowerCase() === "manager";

  const options = useMemo(() => [
    { value: "all", label: "All" },
    { value: "0", label: t.pending || "Pending" },
    { value: "1", label: t.approved || "Approved" },
    { value: "2", label: t.rejected || "Rejected" },
  ], [t]);

  const closePopover = useCallback((key: 'fromDate' | 'toDate' | 'employeeFilter') => {
    setPopoverStates(prev => ({ ...prev, [key]: false }));
  }, []);

  const formatDateForAPI = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const { data: employeesData, isLoading: isLoadingEmployees } = useFetchAllEntity(
    "employee",
    isManager && !isAdmin && employeeId
      ? { endpoint: `/employee/all?manager_id=${employeeId}` }
      : {
        searchParams: { limit: "1000" },
        enabled: !!userInfo && isAdmin,
      }
  );

  const getEmployeesData = useCallback(() => {
    if (!employeesData?.data) return [];
    return employeesData.data.filter((item: any) => item.employee_id);
  }, [employeesData]);

  const getEmployeeDisplayInfo = useCallback((permission: any, lang: string = 'en') => {
    const employeeMaster = permission.employee_master;

    if (!employeeMaster) {
      return {
        emp_no: `EMP${permission.employee_id}`,
        employee_name: `Employee ${permission.employee_id}`,
        firstName: '',
        lastName: '',
        fullName: `Employee ${permission.employee_id}`
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
      emp_no: employeeMaster.emp_no || `EMP${permission.employee_id}`,
      employee_name: fullName || firstName || `Employee ${permission.employee_id}`,
      firstName,
      lastName,
      fullName: fullName || firstName || `Employee ${permission.employee_id}`,
      employee_id: permission.employee_id
    };
  }, []);

  const getPermissionTypeName = useCallback((permissionTypes: any) => {
    if (!permissionTypes) {
      return language === "ar" ? "غير معروف" : "Unknown";
    }

    return language === "ar"
      ? permissionTypes.permission_type_arb || permissionTypes.permission_type_eng || "غير معروف"
      : permissionTypes.permission_type_eng || permissionTypes.permission_type_arb || "Unknown";
  }, [language]);

  const getStatusLabel = useCallback((flag: number) => {
    switch (flag) {
      case 0: return t.pending || "Pending";
      case 1: return t.approved || "Approved";
      case 2: return t.rejected || "Rejected";
      default: return "Unknown";
    }
  }, [t]);

  useEffect(() => {
    setColumns([
      { field: "emp_no", headerName: t.employee_no || "Employee No" },
      { field: "permission_type_name", headerName: t.perm_type || "Permission Type" },
      { field: "firstName", headerName: t.employee_name || "Employee Name" },
      { field: "permission_date", headerName: t.date || "Date" },
      { field: "from_time", headerName: t.from_time || "From Time" },
      { field: "to_time", headerName: t.to_time || "To Time" },
      { field: "perm_minutes", headerName: t.perm_mins || "Permission Minutes" },
      { field: "status", headerName: t.status || "Status" },
    ]);
  }, [language, t]);

  const apiConfig = useMemo(() => {
    const userRole = userInfo?.role?.toLowerCase();

    const commonParams = {
      limit: String(rowsPerPage),
      offset: String(offset),
      ...(selectedOption && selectedOption !== "all" && { status: selectedOption }),
      ...(fromDate && { from_date: formatDateForAPI(fromDate) }),
      ...(toDate && { to_date: formatDateForAPI(toDate) }),
      ...(debouncedSearchValue && { search: debouncedSearchValue }),
      ...(debouncedEmployeeFilter && { employeeId: debouncedEmployeeFilter }),
    };

    if (userRole === "admin") {
      return {
        endpoint: "/employeeShortPermission/all",
        searchParams: commonParams,
      };
    } else if (userRole === "manager") {
      return {
        endpoint: "/employeeShortPermission/team/all",
        searchParams: commonParams,
      };
    } else {
      return {
        endpoint: "/employeeShortPermission/all",
        searchParams: {
          ...commonParams,
          ...(employeeId && { employeeId: String(employeeId) }),
        },
      };
    }
  }, [
    userInfo?.role,
    rowsPerPage,
    offset,
    selectedOption,
    fromDate,
    toDate,
    debouncedSearchValue,
    debouncedEmployeeFilter,
    employeeId,
    formatDateForAPI,
  ]);

  const { data: permissionsData, isLoading: isLoadingPermissions, error, refetch } = useFetchAllEntity(
    "employeeShortPermission",
    {
      searchParams: apiConfig.searchParams,
      enabled: !!employeeId && isAuthenticated && !isChecking && !!userInfo?.role,
      endpoint: apiConfig.endpoint,
    }
  );

  const data = useMemo(() => {
    if (!Array.isArray(permissionsData?.data)) {
      return [];
    }

    const filteredData = isAdmin
      ? permissionsData.data
      : permissionsData.data.filter((permission: any) => permission.employee_id !== employeeId);

    return filteredData.map((permission: any) => {
      const employeeInfo = getEmployeeDisplayInfo(permission, language);
      const permissionDate = permission.from_date
        ? new Date(permission.from_date).toISOString().split('T')[0]
        : '';

      return {
        ...permission,
        id: permission.short_permission_id,
        emp_no: employeeInfo.emp_no,
        employee_name: employeeInfo.employee_name,
        firstName: employeeInfo.firstName,
        lastName: employeeInfo.lastName,
        fullName: employeeInfo.fullName,
        permission_type_name: getPermissionTypeName(permission.permission_types),
        permission_date: permissionDate,
        from_time: permission.from_time ? permission.from_time.substring(11, 19) : permission.from_time,
        to_time: permission.to_time ? permission.to_time.substring(11, 19) : permission.to_time,
        status: getStatusLabel(permission.approve_reject_flag),
        raw_employee_id: permission.employee_id,
        employee_master: permission.employee_master,
      };
    });
  }, [permissionsData, language, employeeId, isAdmin, getEmployeeDisplayInfo, getPermissionTypeName, getStatusLabel]);

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

  const handleStatusChange = useCallback((value: string) => {
    setSelectedOption(value);
    handleFilterChange();
  }, [handleFilterChange]);

  const handleFromDateChange = useCallback((date: Date | undefined) => {
    setFromDate(date);
    handleFilterChange();
  }, [handleFilterChange]);

  const handleToDateChange = useCallback((date: Date | undefined) => {
    setToDate(date);
    handleFilterChange();
  }, [handleFilterChange]);

  const handleEmployeeFilterChange = useCallback((value: string) => {
    setEmployeeFilter(value);
    setCurrentPage(1);
    closePopover('employeeFilter');
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [refetch, closePopover]);

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
    isLoading: isLoadingPermissions || isChecking,
    SortField: sortField,
    CurrentPage: currentPage,
    SetCurrentPage: handlePageChange,
    SetSortField: setSortField,
    SortDirection: sortDirection,
    SetSortDirection: setSortDirection,
    SearchValue: searchValue,
    SetSearchValue: handleSearchChange,
    total: permissionsData?.total || 0,
    hasNext: permissionsData?.hasNext,
    rowsPerPage,
    setRowsPerPage: handleRowsPerPageChange,
    filter_open,
    filter_on_open_change,
  }), [
    data,
    columns,
    open,
    selectedRows,
    isLoadingPermissions,
    isChecking,
    sortField,
    currentPage,
    sortDirection,
    searchValue,
    permissionsData,
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
        onRowSelection={handleRowSelection}
        isLoading={isLoadingPermissions || isChecking}
      />
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        selectedRows={selectedRows}
        items={modules?.selfServices?.items}
        entityName="employeeShortPermission"
        disableAdd
        disableDelete
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-3 sm:gap-4 xl:max-w-[1400px]">
        <div>
          <Select onValueChange={handleStatusChange} value={selectedOption}>
            <SelectTrigger className="bg-accent border-grey flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Label className="font-normal text-secondary shrink-0">
                  {t.status || "Status"} :
                </Label>

                <SelectValue
                  className="truncate text-left"
                  placeholder={t.placeholder_status || "Choose status"}
                />
              </div>
            </SelectTrigger>

            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
                <p className="truncate">
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
                <p className="truncate">
                  <Label className="font-normal text-secondary">
                    {t.to_date || "To Date"} :
                  </Label>
                  <span className="truncate px-1 text-sm text-text-primary">
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

        {(isAdmin || isManager) && (
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
                  disabled={isLoadingEmployees}
                >
                  <p className="truncate">
                    <Label className="font-normal text-secondary">
                      {t.employee_no || "Employee No"} :
                    </Label>
                    <span className="truncate px-1 text-sm text-text-primary">
                      {isLoadingEmployees
                        ? (t.loading || "Loading...")
                        : employeeFilter
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
                  <CommandEmpty>
                    {isLoadingEmployees
                      ? (t.loading || "Loading...")
                      : (t.no_employee_found || "No employee found")}
                  </CommandEmpty>
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
        )}
      </div>

      <div className="bg-accent rounded-2xl">
        <div className="col-span-2 p-6 pb-6">
          <h1 className="font-bold text-xl text-primary">
            {t.perm_team_requests || "Team Permission Requests"}
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