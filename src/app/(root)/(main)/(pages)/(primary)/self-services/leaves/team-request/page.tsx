"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import PowerTabs from "@/src/components/custom/power-comps/power-tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { CalendarIcon } from "@/src/icons/icons";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/src/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { Calendar } from "@/src/components/ui/calendar";
import { format } from "date-fns";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useRouter } from "next/navigation";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { useDebounce } from "@/src/hooks/useDebounce"; 
import { InlineLoading } from "@/src/app/loading";

export default function Page() {
  const router = useRouter();
  const { modules, language, translations } = useLanguage();
  const { isAuthenticated, isChecking, employeeId, userInfo } = useAuthGuard();
  const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>("leave_id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [filter_open, filter_on_open_change] = useState<boolean>(false);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [selectedOption, setSelectedOption] = useState<string>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>("");
  const debouncedSearchValue = useDebounce(searchValue, 300);
  const debouncedEmployeeFilter = useDebounce(employeeFilter, 300);
  const debouncedLeaveTypeFilter = useDebounce(leaveTypeFilter, 300);
  const t = translations?.modules?.selfServices || {};
  
  const [selectedOrganization, setSelectedOrganization] = useState<string>("");
  const [selectedEmployeeType, setSelectedEmployeeType] = useState<string>("");
  const [selectedVertical, setSelectedVertical] = useState<string>("");
  const [popoverStates, setPopoverStates] = useState({
    fromDate: false,
    toDate: false,
    vertical: false,
    organization: false,
    employeeType: false,
  });
  
  const options = [
    { value: "all", label: "All" },
    { value: "0", label: t.pending || "Pending" },
    { value: "1", label: t.approved || "Approved" },
    { value: "2", label: t.rejected || "Rejected" },
  ];

  const closePopover = (key: 'fromDate'| 'toDate' |'organization' | 'employeeType' | 'vertical' ) => {
    setPopoverStates(prev => ({ ...prev, [key]: false }));
  };

  const handleOrganizationChange = (value: string) => {
    setSelectedOrganization(value);
    setCurrentPage(1);
    closePopover('organization');
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  };

  const handleEmployeeTypeChange = (value: string) => {
    setSelectedEmployeeType(value);
    setCurrentPage(1);
    closePopover('employeeType');
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  };

  const { data: organizationData } = useFetchAllEntity("organization", {
    searchParams: {
      limit: "1000",
    },
  });

  const { data: employeeTypeData } = useFetchAllEntity("employeeType", {
    removeAll: true,
  });

  const getVerticalData = () => {
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
  };

  const getOrganizationsData = () => {
    if (!organizationData?.data) return [];

    return organizationData.data.filter(
      (item: any) => String(item.parent_id) === selectedVertical
    );
  };

  const getEmployeeTypesData = () =>
    (employeeTypeData?.data || []).filter(
      (item: any) => item.employee_type_id
  );
  const offset = useMemo(() => {
    return currentPage;
  }, [currentPage]);

  const getEmployeeDisplayInfo = useCallback((leave: any, language: string = 'en') => {
    const employeeMaster = leave.employee_master_employee_leaves_employee_idToemployee_master;
    
    if (!employeeMaster) {
      return {
        emp_no: `EMP${leave.employee_id}`,
        employee_name: `Employee ${leave.employee_id}`,
        firstName: '',
        lastName: '',
        fullName: `Employee ${leave.employee_id}`
      };
    }

    const firstNameEn = employeeMaster.firstname_eng || '';
    const lastNameEn = employeeMaster.lastname_eng || '';
    const firstNameAr = employeeMaster.firstname_arb || '';
    const lastNameAr = employeeMaster.lastname_arb || '';

    const firstName = language === 'ar' ? firstNameAr : firstNameEn;
    const lastName = language === 'ar' ? lastNameAr : lastNameEn;
    
    const fullName = language === 'ar' 
      ? `${firstNameAr} ${lastNameAr}`.trim()
      : `${firstNameEn} ${lastNameEn}`.trim();

    return {
      emp_no: employeeMaster.emp_no || `EMP${leave.employee_id}`,
      employee_name: fullName || firstName || `Employee ${leave.employee_id}`,
      firstName: firstName,
      lastName: lastName,
      fullName: fullName || firstName || `Employee ${leave.employee_id}`,
      employee_id: leave.employee_id
    };
  }, [language]);

  const getLeaveTypeName = useCallback((leaveTypes: any) => {
    if (!leaveTypes) {
      return language === "ar" ? "غير معروف" : "Unknown";
    }
    
    return language === "ar" 
      ? leaveTypes.leave_type_arb || leaveTypes.leave_type_eng || "غير معروف"
      : leaveTypes.leave_type_eng || leaveTypes.leave_type_arb || "Unknown";
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
      { field: "leave_type_name", headerName: t.leave_type || "Leave Type" },
      { field: "firstName", headerName: t.employee_name || "Employee Name" },
      { field: "from_date", headerName: t.from_date || "From Date" },
      { field: "to_date", headerName: t.to_date || "To Date" },
      { field: "number_of_leaves", headerName: t.leave_days || "No of Days" },
      { field: "leave_status", headerName: t.status || "Status" },
    ]);
  }, [language, t]);

  const formatDateForAPI = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  const { data: leavesData, isLoading: isLoadingLeaves, error, refetch } = useFetchAllEntity(
    "employeeLeave", 
    {
      searchParams: {
        limit: String(rowsPerPage),
        offset: String(offset),
        ...(selectedOption && selectedOption !== "all" && { leave_status: selectedOption }),
        ...(fromDate && { from_date: formatDateForAPI(fromDate) }),
        ...(toDate && { to_date: formatDateForAPI(toDate) }),
        ...(debouncedSearchValue && { search: debouncedSearchValue }),
        ...(debouncedEmployeeFilter && { employee_id: debouncedEmployeeFilter }),
        ...(debouncedLeaveTypeFilter && { leave_type_id: debouncedLeaveTypeFilter }),
      },
      enabled: !!employeeId && isAuthenticated && !isChecking,
      endpoint: `/employeeLeave/team/all`,
    }
  );

  const data = useMemo(() => {
    if (!Array.isArray(leavesData?.data)) {
      return [];
    }

    const processedData = leavesData.data.map((leave: any) => {
      const employeeInfo = getEmployeeDisplayInfo(leave, language);
      
      const formattedFromDate = formatDateForDisplay(leave.from_date);
      const formattedToDate = formatDateForDisplay(leave.to_date);
            
      return {
        ...leave,
        id: leave.employee_leave_id,
        emp_no: employeeInfo.emp_no,
        employee_name: employeeInfo.employee_name,
        firstName: employeeInfo.firstName,
        lastName: employeeInfo.lastName,
        fullName: employeeInfo.fullName,
        leave_type_name: getLeaveTypeName(leave.leave_types),
        from_date: formattedFromDate,
        to_date: formattedToDate,
        from_time: leave.from_time ? leave.from_time.substring(11, 19) : leave.from_time,
        to_time: leave.to_time ? leave.to_time.substring(11, 19) : leave.to_time,
        leave_status: getStatusLabel(leave.approve_reject_flag),
        raw_employee_id: leave.employee_id,
        employee_master: leave.employee_master_employee_leaves_employee_idToemployee_master,
      };
    });

    return processedData;
  }, [leavesData, language, getEmployeeDisplayInfo, getLeaveTypeName, getStatusLabel]);

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

  const handleStatusChange = (value: string) => {
    setSelectedOption(value);
    handleFilterChange();
  };

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

  const handleLeaveTypeFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLeaveTypeFilter(event.target.value);
    setCurrentPage(1);
  };

  const props = {
    Data: data,
    Columns: columns,
    open,
    on_open_change: setOpen,
    selectedRows,
    setSelectedRows,
    isLoading: isLoadingLeaves || isChecking,
    SortField: sortField,
    CurrentPage: currentPage,
    SetCurrentPage: handlePageChange,
    SetSortField: setSortField,
    SortDirection: sortDirection,
    SetSortDirection: setSortDirection,
    SearchValue: searchValue,
    SetSearchValue: handleSearchChange,
    total: leavesData?.total || 0,
    hasNext: leavesData?.hasNext,
    rowsPerPage,
    setRowsPerPage: handleRowsPerPageChange,
    filter_open,
    filter_on_open_change,
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
        onRowSelection={handleRowSelection}
        isLoading={isLoadingLeaves || isChecking}
      />
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        selectedRows={selectedRows}
        items={modules?.selfServices?.items}
        entityName="employeeLeave"
      />
      {/* <div className="grid grid-cols-3 gap-4">
        <div>
          <Select onValueChange={handleStatusChange} value={selectedOption}>
            <SelectTrigger className="bg-accent border-grey">
              <Label className="font-normal text-secondary">
                {t.status || "Status"} :
              </Label>
              <SelectValue placeholder={t.placeholder_status || "Choose status"}/>
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
          <div className="bg-accent border border-grey rounded-full px-4 py-2 h-[40px] flex items-center">
            <Label className="font-normal text-secondary whitespace-nowrap mr-2">
              {t.leavetype_id || "Leave Type ID"} :
            </Label>
            <Input
              type="text"
              value={leaveTypeFilter}
              onChange={handleLeaveTypeFilterChange}
              placeholder={t.placeholder_leavetype_id || "Enter leave type ID"}
              className="bg-transparent border-0 p-0 h-auto font-semibold text-text-primary focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-sm placeholder:text-text-primary"
            />
          </div>
        </div>
      </div> */}
      <div className="grid grid-cols-3 gap-4">
        {/* Filter 1: VERTICAL ORGANIZATION */}
        <Popover
          open={popoverStates.vertical}
          onOpenChange={(open) =>
            setPopoverStates((prev) => ({ ...prev, vertical: open }))
          }
        >
          <PopoverTrigger asChild>
            <Button size="lg" variant="outline" className="w-full bg-accent px-4 flex justify-between border-grey">
              <p>
                <Label className="font-normal text-secondary">Vertical :</Label>
                <span className="px-1 text-sm text-text-primary">
                  {selectedVertical
                    ? getVerticalData().find((item: any) =>
                        String(item.organization_id) === selectedVertical
                      )?.[language === "ar" ? "organization_arb" : "organization_eng"]
                    : "Choose Vertical"}
                </span>
              </p>
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-dropdown">
            <Command>
              <CommandInput placeholder="Search vertical..." />
              <CommandGroup className="max-h-64 overflow-auto">
                {getVerticalData().map((item: any) => (
                  <CommandItem
                    key={item.organization_id}
                    onSelect={() => {
                      setSelectedVertical(String(item.organization_id));
                      setSelectedOrganization("");
                      closePopover("vertical");
                    }}
                  >
                    {language === "ar" ? item.organization_arb : item.organization_eng}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Filter 2: ORGANIZATION (Filtered by parent_id = selectedVertical) */}
        <Popover
          open={popoverStates.organization}
          onOpenChange={(open) =>
            setPopoverStates((prev) => ({ ...prev, organization: open }))
          }
        >
          <PopoverTrigger asChild>
            <Button size="lg" variant="outline" className="w-full bg-accent px-4 flex justify-between border-grey">
              <p className="truncate w-64">
                <Label className="font-normal text-secondary">Organization :</Label>
                <span className="px-1 text-sm text-text-primary">
                  {selectedOrganization
                    ? getOrganizationsData().find((item: any) =>
                        String(item.organization_id) === selectedOrganization
                      )?.[language === "ar" ? "organization_arb" : "organization_eng"]
                    : "Choose Organization"}
                </span>
              </p>
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-dropdown">
            <Command>
              <CommandInput placeholder="Search organization..." />
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

        {/* Filter 3: EMPLOYEE TYPE (Already existed - no change except position) */}
        <Popover 
          open={popoverStates.employeeType} 
          onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, employeeType: open }))}
        >
          <PopoverTrigger asChild>
            <Button 
              size={"lg"} 
              variant={"outline"}
              className="w-full bg-accent px-4 flex justify-between border-grey"
            >
              <p>
                <Label className="font-normal text-secondary">Employee Type :</Label>
                <span className="px-1 text-sm text-text-primary">
                  {selectedEmployeeType
                    ? getEmployeeTypesData().find((item: any) => 
                        String(item.employee_type_id) === selectedEmployeeType
                      )?.[language === "ar" ? "employee_type_arb" : "employee_type_eng"]
                    : "Choose type"}
                </span>
              </p>
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-dropdown">
            <Command>
              <CommandInput placeholder="Search employee type..." />
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
      <div className="bg-accent rounded-2xl">
        <div className="col-span-2 p-6 pb-6">
          <h1 className="font-bold text-xl text-primary">
            Team Leave Requests
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