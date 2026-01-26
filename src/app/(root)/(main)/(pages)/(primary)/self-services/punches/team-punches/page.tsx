"use client";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/src/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
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
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [employeeFilter, setEmployeeFilter] = useState<string>("");
  const [selectedOrganization, setSelectedOrganization] = useState<string>("");
  const [selectedEmployeeType, setSelectedEmployeeType] = useState<string>("");
  const [selectedVertical, setSelectedVertical] = useState<string>("");
  const [popoverStates, setPopoverStates] = useState({
    fromDate: false,
    toDate: false,
    employeeFilter: false,
    vertical: false,
    organization: false,
    employeeType: false,
  });
  
  const debouncedSearchValue = useDebounce(searchValue, 300);
  const debouncedEmployeeFilter = useDebounce(employeeFilter, 300);
  const t = translations?.modules?.selfServices || {};

  const offset = useMemo(() => currentPage, [currentPage]);

  const closePopover = useCallback((key: 'fromDate' | 'toDate' | 'employeeFilter' | 'organization' | 'employeeType' | 'vertical') => {
    setPopoverStates(prev => ({ ...prev, [key]: false }));
  }, []);

  const formatDateForAPI = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const getEmployeeName = useCallback((transaction: any) => {
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
      ? `${employee.firstname_arb || ""}`.trim()
      : `${employee.firstname_eng || ""}`.trim();
    
    return fullName || `Emp ${transaction.employee_id}`;
  }, [language, userInfo, employeeId]);

  
  const { data: organizationData } = useFetchAllEntity("organization", {
    searchParams: {
      limit: "1000",
    },
  });

  const { data: employeeTypeData } = useFetchAllEntity("employeeType", {
    removeAll: true,
  });

  const getVerticalData = useCallback(() => {
    if (!organizationData?.data) return [];

    const parentMap = new Map();

    organizationData.data.forEach((item: any) => {
      if (item.organizations) {
        parentMap.set(item.organizations.organization_id, {
          organization_id: item.organizations.organization_id,
          organization_eng: item.organizations.organization_eng,
          organization_arb: item.organizations.organization_arb,
        });
      }
    });

    return Array.from(parentMap.values());
  }, [organizationData]);

  const getOrganizationsData = useCallback(() => {
    if (!organizationData?.data) return [];

    return organizationData.data.filter(
      (item: any) => String(item.parent_id) === selectedVertical
    );
  }, [organizationData, selectedVertical]);

  const getEmployeeTypesData = useCallback(() => 
    (employeeTypeData?.data || []).filter(
      (item: any) => item.employee_type_id
    ), [employeeTypeData]);

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
        ...(debouncedEmployeeFilter && { employeeId: debouncedEmployeeFilter }),
      },
      enabled: !!employeeId && isAuthenticated && !isChecking,
      endpoint: `/employeeEventTransaction/team/all`,
    }
  );

  const { data: allPunchesData } = useFetchAllEntity(
    "employeeEventTransactionExport", 
    {
      searchParams: {
        ...(debouncedSearchValue && { search: debouncedSearchValue }),
        ...(fromDate && { from_date: formatDateForAPI(fromDate) }),
        ...(toDate && { to_date: formatDateForAPI(toDate) }),
        ...(debouncedEmployeeFilter && { employeeId: debouncedEmployeeFilter }),
      },
      enabled: !!employeeId && isAuthenticated && !isChecking,
      endpoint: `/employeeEventTransaction/team`,
    }
  );

  const data = useMemo(() => {
    if (!Array.isArray(punchesData?.data)) {
      return [];
    }

    return punchesData.data.map((transaction: any) => {
      const transactionTimeStr = transaction.transaction_time;
      
      let formattedTime = '';
      let formattedDate = '';
      
      if (transactionTimeStr) {
        const date = new Date(transactionTimeStr);
        formattedTime = date.toISOString().substr(11, 8);
        formattedDate = date.toISOString().substr(0, 10);
      }

      let geolocationDisplay = '';
      if (transaction.latitude && transaction.longitude) {
        geolocationDisplay = `${transaction.latitude}, ${transaction.longitude}`;
      } else if (transaction.geolocation) {
        geolocationDisplay = transaction.geolocation;
      }

      return {
        ...transaction,
        id: transaction.transaction_id,
        emp_no: transaction.employee_master?.emp_no || `EMP${transaction.employee_id}`,
        employee_name: getEmployeeName(transaction),
        transaction_date: formattedDate,
        transaction_time: formattedTime,
        geolocation: geolocationDisplay,
        latitude: transaction.latitude,
        longitude: transaction.longitude,
      };
    });
  }, [punchesData, getEmployeeName]);

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

  const handleEmployeeFilterChange = useCallback((value: string) => {
    setEmployeeFilter(value);
    setCurrentPage(1);
    closePopover('employeeFilter');
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [refetch, closePopover]);

  const handleOrganizationChange = useCallback((value: string) => {
    setSelectedOrganization(value);
    setCurrentPage(1);
    closePopover('organization');
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [refetch, closePopover]);

  const handleEmployeeTypeChange = useCallback((value: string) => {
    setSelectedEmployeeType(value);
    setCurrentPage(1);
    closePopover('employeeType');
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [refetch, closePopover]);

  const handleVerticalChange = useCallback((value: string) => {
    setSelectedVertical(value);
    setSelectedOrganization("");
    closePopover('vertical');
  }, [closePopover]);

  const { data: employeesData } = useFetchAllEntity("employee", {
    searchParams: {
      limit: "1000",
    },
  });

  const getEmployeesData = useCallback(() => {
    if (!employeesData?.data) return [];
    return employeesData.data.filter((item: any) => item.employee_id);
  }, [employeesData]);

  const handleSave = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["employeeEventTransaction", employeeId] });
  }, [queryClient, employeeId]);

  const handleEditClick = useCallback((rowData: any) => {
    try {
      const editData = {
        ...rowData,
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

  const propsForExport = useMemo(() => {
    if (selectedRows.length > 0) {
      const selectedRowsForExport = selectedRows.map((item: any) => ({
        emp_no: item.emp_no,
        employee_name: item.employee_name,
        reason: item.reason,
        transaction_date: item.transaction_date,
        transaction_time: item.transaction_time,
        geolocation: item.geolocation,
        remarks: item.remarks,
      }));

      return {
        ...props,
        Data: selectedRowsForExport,
        selectedRows: selectedRowsForExport,
      };
    }

    const allData = Array.isArray(allPunchesData?.data) 
      ? allPunchesData.data.map((transaction: any) => {
          const transactionTimeStr = transaction.transaction_time;
          
          let formattedTime = '';
          let formattedDate = '';
          
          if (transactionTimeStr) {
            const date = new Date(transactionTimeStr);
            formattedTime = date.toISOString().substr(11, 8);
            formattedDate = date.toISOString().substr(0, 10);
          }

          let geolocationDisplay = '';
          if (transaction.latitude && transaction.longitude) {
            geolocationDisplay = `${transaction.latitude}, ${transaction.longitude}`;
          } else if (transaction.geolocation) {
            geolocationDisplay = transaction.geolocation;
          }

          const employee = transaction.employee_master;
          const employeeName = employee 
            ? (language === "ar"
                ? `${employee.firstname_arb || ""} ${employee.lastname_arb || ""}`.trim()
                : `${employee.firstname_eng || ""} ${employee.lastname_eng || ""}`.trim())
            : `Emp ${transaction.employee_id}`;

          return {
            emp_no: employee?.emp_no || `EMP${transaction.employee_id}`,
            employee_name: employeeName || `Emp ${transaction.employee_id}`,
            reason: transaction.reason,
            transaction_date: formattedDate,
            transaction_time: formattedTime,
            geolocation: geolocationDisplay,
            remarks: transaction.remarks,
          };
        })
      : [];

    return {
      ...props,
      Data: allData,
      selectedRows: [],
    };
  }, [props, allPunchesData, selectedRows, language]);

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
        overrideCheckbox={true}
      />
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={propsForExport}
        selectedRows={propsForExport.selectedRows}
        items={modules?.selfServices?.items}
        entityName="employeeEventTransaction"
        isExport
        enableExcel
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 xl:max-w-[1050px]">
        {/* bg-accent rounded-[15px] items-center px-5 py-6 */}
        <div>
          <Popover
            open={popoverStates.vertical}
            onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, vertical: open }))}
          >
            <PopoverTrigger asChild>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full bg-accent px-4 flex justify-between border-grey"
              >
                <p>
                  <Label className="font-normal text-secondary">
                    {t.vertical || "Vertical"} :
                  </Label>
                  <span className="px-1 text-sm text-text-primary">
                    {selectedVertical
                      ? getVerticalData().find((item: any) =>
                          String(item.organization_id) === selectedVertical
                        )?.[language === "ar" ? "organization_arb" : "organization_eng"]
                      : (t.placeholder_vertical || "Choose Vertical")}
                  </span>
                </p>
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-dropdown">
              <Command>
                <CommandInput placeholder={t.search_vertical || "Search vertical..."} />
                <CommandGroup className="max-h-64 overflow-auto">
                  {getVerticalData().map((item: any) => (
                    <CommandItem
                      key={item.organization_id}
                      onSelect={() => handleVerticalChange(String(item.organization_id))}
                    >
                      {language === "ar" ? item.organization_arb : item.organization_eng}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Popover
            open={popoverStates.organization}
            onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, organization: open }))}
          >
            <PopoverTrigger asChild>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full bg-accent px-4 flex justify-between border-grey"
              >
                <p>
                  <Label className="font-normal text-secondary">
                    {t.organization || "Organization"} :
                  </Label>
                  <span className="px-1 text-sm text-text-primary">
                    {selectedOrganization
                      ? getOrganizationsData().find((item: any) =>
                          String(item.organization_id) === selectedOrganization
                        )?.[language === "ar" ? "organization_arb" : "organization_eng"]
                      : (t.placeholder_org || "Choose Organization")}
                  </span>
                </p>
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-dropdown">
              <Command>
                <CommandInput placeholder={t.search_organization || "Search organization..."} />
                <CommandGroup className="max-h-64 overflow-auto">
                  {getOrganizationsData().map((item: any) => (
                    <CommandItem
                      key={item.organization_id}
                      onSelect={() => handleOrganizationChange(String(item.organization_id))}
                    >
                      {language === "ar" ? item.organization_arb : item.organization_eng}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Popover 
            open={popoverStates.employeeType} 
            onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, employeeType: open }))}
          >
            <PopoverTrigger asChild>
              <Button 
                size="lg" 
                variant="outline"
                className="w-full bg-accent px-4 flex justify-between border-grey"
              >
                <p>
                  <Label className="font-normal text-secondary">
                    {t.employee_type || "Employee Type"} :
                  </Label>
                  <span className="px-1 text-sm text-text-primary">
                    {selectedEmployeeType
                      ? getEmployeeTypesData().find((item: any) => 
                          String(item.employee_type_id) === selectedEmployeeType
                        )?.[language === "ar" ? "employee_type_arb" : "employee_type_eng"]
                      : (t.placeholder_employee_type || "Choose type")}
                  </span>
                </p>
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-dropdown">
              <Command>
                <CommandInput placeholder={t.search_employee_type || "Search employee type..."} />
                <CommandGroup className="max-h-64 overflow-auto">
                  {getEmployeeTypesData().map((item: any) => (
                    <CommandItem
                      key={item.employee_type_id}
                      onSelect={() => handleEmployeeTypeChange(String(item.employee_type_id))}
                    >
                      {language === "ar" ? item.employee_type_arb : item.employee_type_eng}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
{/* 
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
                <CalendarIcon/>
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0 border-none shadow-dropdown">
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

            <PopoverContent className="w-auto p-0 border-none shadow-dropdown">
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
        </div> */}
      </div>

      <div className="bg-accent rounded-2xl">
        <div className="col-span-2 p-6 pb-6">
          <h1 className="font-bold text-xl text-primary">
            {t.team_punches_header || "Manage Team Punches"}
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