"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import PowerTabs from "@/src/components/custom/power-comps/power-tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { CalendarIcon } from "@/src/icons/icons";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/src/components/ui/command";
import { Check, ChevronsUpDown, Download } from "lucide-react";
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
import { downloadUploadedFile } from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";

export default function Page() {
  const router = useRouter();
  const { modules, language, translations } = useLanguage();
  const { isAuthenticated, isChecking, employeeId, userInfo } = useAuthGuard();
  const showToast = useShowToast();

  const [columns, setColumns] = useState<{ field: string; headerName: string; cellRenderer?: (data: any) => any }[]>([]);
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

  const debouncedSearchValue = useDebounce(searchValue, 300);
  const debouncedEmployeeFilter = useDebounce(employeeFilter, 300);
  const debouncedLeaveTypeFilter = useDebounce(leaveTypeFilter, 300);
  const t = translations?.modules?.selfServices || {};

  const offset = useMemo(() => currentPage, [currentPage]);

  const options = useMemo(() => [
    { value: "all", label: "All" },
    { value: "0", label: t.pending || "Pending" },
    { value: "1", label: t.approved || "Approved" },
    { value: "2", label: t.rejected || "Rejected" },
  ], [t]);

  const closePopover = useCallback((key: 'fromDate' | 'toDate' | 'organization' | 'employeeType' | 'vertical') => {
    setPopoverStates(prev => ({ ...prev, [key]: false }));
  }, []);

  const formatDateForAPI = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const formatDateForDisplay = useCallback((dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  }, []);

  const getEmployeeDisplayInfo = useCallback((leave: any, lang: string = 'en') => {
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

    const firstName = lang === 'ar' ? firstNameAr : firstNameEn;
    const lastName = lang === 'ar' ? lastNameAr : lastNameEn;

    const fullName = lang === 'ar'
      ? `${firstNameAr} ${lastNameAr}`.trim()
      : `${firstNameEn} ${lastNameEn}`.trim();

    return {
      emp_no: employeeMaster.emp_no || `EMP${leave.employee_id}`,
      employee_name: fullName || firstName || `Employee ${leave.employee_id}`,
      firstName,
      lastName,
      fullName: fullName || firstName || `Employee ${leave.employee_id}`,
      employee_id: leave.employee_id
    };
  }, []);

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

  const AttachmentCellRenderer = useCallback((data: any) => {
    const filePath = data.leave_doc_filename_path;

    if (!filePath || filePath === '-') {
      return <span className="text-gray-400">-</span>;
    }

    const handleDownload = async () => {
      try {
        await downloadUploadedFile(filePath);
        showToast("success", "file_download_success");
      } catch (error) {
        console.error('Download error:', error);
        showToast("error", "file_download_error");
      }
    };

    return (
      <button
        onClick={handleDownload}
        className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"
        title="Download attachment"
      >
        <Download className="w-4 h-4" />
        <span>Download</span>
      </button>
    );
  }, [showToast]);


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
      { field: "leave_type_name", headerName: t.leave_type || "Leave Type" },
      { field: "firstName", headerName: t.employee_name || "Employee Name" },
      { field: "from_date", headerName: t.from_date || "From Date" },
      { field: "to_date", headerName: t.to_date || "To Date" },
      { field: "number_of_leaves", headerName: t.no_of_days || "No of Days" },
      {
        field: "leave_doc_filename_path",
        headerName: t.attachment || "Attachment",
        cellRenderer: AttachmentCellRenderer
      },
      { field: "leave_status", headerName: t.status || "Status" },
    ]);
  }, [language, t, AttachmentCellRenderer]);


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

    return leavesData.data.map((leave: any) => {
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
  }, [leavesData, language, getEmployeeDisplayInfo, getLeaveTypeName, getStatusLabel, formatDateForDisplay]);


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

  const handleEmployeeFilterChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setEmployeeFilter(event.target.value);
    setCurrentPage(1);
  }, []);

  const handleLeaveTypeFilterChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setLeaveTypeFilter(event.target.value);
    setCurrentPage(1);
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
  }), [
    data,
    columns,
    open,
    selectedRows,
    isLoadingLeaves,
    isChecking,
    sortField,
    currentPage,
    sortDirection,
    searchValue,
    leavesData,
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
        disableAdd
      />

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 xl:max-w-[1050px]">
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
      </div>
      
      <div className="bg-accent rounded-2xl">
        <div className="col-span-2 p-6 pb-6">
          <h1 className="font-bold text-xl text-primary">
            {t.team_request || "Team Leave Requests"}
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