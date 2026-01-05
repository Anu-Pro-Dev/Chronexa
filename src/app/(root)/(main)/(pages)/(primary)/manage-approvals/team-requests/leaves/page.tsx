"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import PowerTabs from "@/src/components/custom/power-comps/power-tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { CalendarIcon } from "@/src/icons/icons";
import { Calendar } from "@/src/components/ui/calendar";
import { format } from "date-fns";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Download } from "lucide-react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useRouter } from "next/navigation";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { useDebounce } from "@/src/hooks/useDebounce";
import { approveLeaveRequest, downloadUploadedFile } from "@/src/lib/apiHandler";
import { InlineLoading } from "@/src/app/loading";
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
  const debouncedSearchValue = useDebounce(searchValue, 300);
  const debouncedEmployeeFilter = useDebounce(employeeFilter, 300);
  const debouncedLeaveTypeFilter = useDebounce(leaveTypeFilter, 300);
  const [approveOpen, setApproveOpen] = useState<boolean>(false);
  const [rejectOpen, setRejectOpen] = useState<boolean>(false);
  const t = translations?.modules?.manageApprovals || {};

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
  }, []);

  useEffect(() => {
    setColumns([
      { field: "leave_type_name", headerName: t.leave_type || "Leave Type" },
      { field: "firstName", headerName: t.employee_name || "Employee Name" },
      { field: "from_date", headerName: t.from_date || "From Date" },
      { field: "to_date", headerName: t.to_date || "To Date" },
      { field: "number_of_leaves", headerName: t.leave_days || "No of Days" },
      {
        field: "leave_doc_filename_path",
        headerName: t.attachment || "Attachment",
        cellRenderer: AttachmentCellRenderer
      },
    ]);
  }, [language, t, AttachmentCellRenderer]);

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
        pending: "true",
        limit: String(rowsPerPage),
        offset: String(offset),
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
        raw_employee_id: leave.employee_id,
        employee_master: leave.employee_master_employee_leaves_employee_idToemployee_master,
      };
    });

    return processedData;
  }, [leavesData, language, getEmployeeDisplayInfo, getLeaveTypeName]);

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

  const handleApprove = async () => {
    if (selectedRows.length === 0) {
      showToast("error", "no_row_selected");
      return;
    }

    try {
      const results = await Promise.all(
        selectedRows.map((row) =>
          approveLeaveRequest({
            employee_leave_id: row.id,
            approve_reject_flag: 1,
          })
        )
      );

      showToast("success", "approve_leave_success");
      setSelectedRows([]);
      setApproveOpen(false);
      await refetch();
    } catch (error: any) {
      showToast("error", "approve_leave_error");
      console.error("Approval error:", error);
    }
  };

  const handleReject = async () => {
    if (selectedRows.length === 0) {
      showToast("error", "no_row_selected");
      return;
    }

    try {
      const results = await Promise.all(
        selectedRows.map((row) =>
          approveLeaveRequest({
            employee_leave_id: row.id,
            approve_reject_flag: 2,
          })
        )
      );

      showToast("success", "reject_leave_success");
      setSelectedRows([]);
      setRejectOpen(false);
      await refetch();
    } catch (error: any) {
      showToast("error", "reject_leave_error");
      console.error("Rejection error:", error);
    }
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
    approve_open: approveOpen,
    approve_on_open_change: setApproveOpen,
    reject_open: rejectOpen,
    reject_on_open_change: setRejectOpen,
    onApprove: handleApprove,
    onReject: handleReject,
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
        overrideCheckbox={true}
      />
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        enableApprove
        enableReject
        selectedRows={selectedRows}
        items={modules?.manageApprovals.items}
        entityName="employeeLeave"
        approve_modal_title={t.approve_leave || "Approve Leave"}
        approve_modal_description={t.approve_leave_desc || "Are you sure you want to approve the selected leave request(s)?"}
        reject_modal_title={t.reject_leave || "Reject Leave"}
        reject_modal_description={t.reject_leave_desc || "Are you sure you want to reject the selected leave request(s)?"}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xl:max-w-[700px]">
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
                disabled={(date) => {
                  if (!fromDate) return false;

                  const from = new Date(fromDate);
                  from.setHours(0, 0, 0, 0);

                  const current = new Date(date);
                  current.setHours(0, 0, 0, 0);

                  return current < from;
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="bg-accent rounded-2xl">
        <div className="col-span-2 p-6 pb-6">
          <h1 className="font-bold text-xl text-primary">
            {t.leaves_approval || "Leave Approval"}
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