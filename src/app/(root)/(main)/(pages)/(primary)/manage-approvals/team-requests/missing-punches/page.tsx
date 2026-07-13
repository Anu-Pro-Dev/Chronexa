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
import { Download } from "lucide-react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useRouter } from "next/navigation";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { useDebounce } from "@/src/hooks/useDebounce";
import { approveManualTransaction, rejectManualTransaction, downloadUploadedFile } from "@/src/lib/apiHandler";
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
  const t = useMemo(() => translations?.modules?.manageApprovals || {}, [translations]);

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

  const isAdmin = useMemo(() => {
    const role = (userInfo?.role ?? "").toUpperCase();
    if (role) {
      return role === "ADMIN" || role === "admin" || role === "Admin";
    }
    return userInfo?.roleId === 1;
  }, [userInfo]);

  const endpoint = useMemo(() => {
    return isAdmin
      ? `/employeeManualTransaction/all`
      : `/employeeManualTransaction/team/all`;
  }, [isAdmin]);

  const getEmployeeDisplayInfo = useCallback((transaction: any) => {
    const employeeMaster =
      transaction.employee ||
      transaction.employee_master ||
      transaction.employee_master_employee_manual_transactions_employee_idToemployee_master;

    if (!employeeMaster) {
      return {
        emp_no: `${transaction.employee_id}`,
        employee_name: `Employee ${transaction.employee_id}`,
        firstName: '',
        lastName: '',
        fullName: `Employee ${transaction.employee_id}`,
        employee_id: transaction.employee_id,
      };
    }

    const firstNameEn = employeeMaster.firstname_eng || '';
    const lastNameEn = employeeMaster.lastname_eng || '';
    const firstNameAr = employeeMaster.firstname_arb || '';
    const lastNameAr = employeeMaster.lastname_arb || '';

    const firstName = language === 'ar' ? firstNameAr : firstNameEn;
    const lastName = language === 'ar' ? lastNameAr : lastNameEn;

    const fullName =
      language === 'ar'
        ? `${firstNameAr} ${lastNameAr}`.trim()
        : `${firstNameEn} ${lastNameEn}`.trim();

    return {
      emp_no: employeeMaster.emp_no || `EMP${transaction.employee_id}`,
      employee_name: fullName || firstName || `Employee ${transaction.employee_id}`,
      firstName,
      lastName,
      fullName: fullName || firstName || `Employee ${transaction.employee_id}`,
      employee_id: transaction.employee_id,
    };
  }, [language]);

  const AttachmentCellRenderer = useCallback((data: any) => {
    const filePath = data.attachment_path;

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

  useEffect(() => {
    setColumns([
      { field: "emp_no", headerName: t.employee_no || "Employee No" },
      { field: "firstName", headerName: t.employee_name || "Employee Name" },
      { field: "transaction_date", headerName: t.date || "Date" },
      { field: "transaction_time", headerName: t.time || "Time" },
      { field: "remarks", headerName: t.remarks || "Remarks" },
      {
        field: "attachment_path",
        headerName: t.attachment || "Attachment",
        cellRenderer: AttachmentCellRenderer,
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

  const { data: manualTransactionsData, isLoading: isLoadingManualTransactions, error, refetch } = useFetchAllEntity(
    "employeeManualTransaction",
    {
      searchParams: {
        status: "pending",
        limit: String(rowsPerPage),
        offset: String(offset),
        ...(fromDate && { from_date: formatDateForAPI(fromDate) }),
        ...(toDate && { to_date: formatDateForAPI(toDate) }),
        ...(debouncedSearchValue && { search: debouncedSearchValue }),
        ...(debouncedEmployeeFilter && { employee_id: debouncedEmployeeFilter }),
      },
      enabled: !!employeeId && isAuthenticated && !isChecking,
      endpoint,
    }
  );

  const data = useMemo(() => {
    if (!Array.isArray(manualTransactionsData?.data)) {
      return [];
    }

    const processedData = manualTransactionsData.data.map((transaction: any) => {
      const employeeMaster = transaction.employee ||
        transaction.employee_master ||
        transaction.employee_master_employee_manual_transactions_employee_idToemployee_master;
      const firstNameEn = employeeMaster?.firstname_eng || '';
      const lastNameEn = employeeMaster?.lastname_eng || '';
      const firstNameAr = employeeMaster?.firstname_arb || '';
      const lastNameAr = employeeMaster?.lastname_arb || '';

      const firstName = language === 'ar' ? firstNameAr : firstNameEn;
      const lastName = language === 'ar' ? lastNameAr : lastNameEn;
      const fullName = `${firstName} ${lastName}`.trim();

      const transaction_date = transaction.transaction_time?.substring(0, 10) || '';
      const transaction_time = transaction.transaction_time?.substring(11, 19) || '';

      return {
        ...transaction,
        id: transaction.employee_manual_transaction_id,
        emp_no: employeeMaster?.emp_no || `${transaction.employee_id}`,
        employee_name: fullName || `Employee ${transaction.employee_id}`,
        firstName,
        lastName,
        fullName,
        transaction_date,
        transaction_time,
        employee_master: employeeMaster,
      };
    });

    return processedData;
  }, [manualTransactionsData, language]);

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

  const handleRowSelection = useCallback((rows: any[]) => {
    setSelectedRows(rows);
  }, []);

  const handleApprove = async () => {
    if (selectedRows.length === 0) {
      showToast("error", "no_row_selected");
      return;
    }
    try {
      await Promise.all(
        selectedRows.map((row) => approveManualTransaction(row.id))
      );
      showToast("success", "approve_transaction_success");
      setSelectedRows([]);
      setApproveOpen(false);
      await refetch();
    } catch (error) {
      showToast("error", "approve_transaction_error");
      console.error("Approval error:", error);
    }
  };

  const handleReject = async () => {
    if (selectedRows.length === 0) {
      showToast("error", "no_row_selected");
      return;
    }
    try {
      await Promise.all(
        selectedRows.map((row) => rejectManualTransaction(row.id))
      );
      showToast("success", "reject_transaction_success");
      setSelectedRows([]);
      setRejectOpen(false);
      await refetch();
    } catch (error) {
      showToast("error", "reject_transaction_error");
      console.error("Rejection error:", error);
    }
  };

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
        isLoading={isLoadingManualTransactions || isChecking}
        overrideCheckbox={true}
      />
    );
  };

  const props = {
    Data: data,
    Columns: columns,
    open,
    on_open_change: setOpen,
    selectedRows,
    setSelectedRows,
    isLoading: isLoadingManualTransactions || isChecking,
    SortField: sortField,
    CurrentPage: currentPage,
    SetCurrentPage: handlePageChange,
    SetSortField: setSortField,
    SortDirection: sortDirection,
    SetSortDirection: setSortDirection,
    SearchValue: searchValue,
    SetSearchValue: handleSearchChange,
    total: manualTransactionsData?.total || 0,
    hasNext: manualTransactionsData?.hasNext,
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

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        enableApprove
        enableReject
        selectedRows={selectedRows}
        items={modules?.manageApprovals.items}
        entityName="employeeManualTransaction"
        approve_modal_title={t.approve_manual_transaction || "Approve Manual Transaction"}
        approve_modal_description={t.approve_leave_desc || "Are you sure you want to approve the selected manual transaction(s)?"}
        reject_modal_title={t.reject_leave || "Reject Manual Transaction"}
        reject_modal_description={t.reject_leave_desc || "Are you sure you want to reject the selected manual transaction(s)?"}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:max-w-[700px]">
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
          <h1 className="font-medium text-xl text-primary">
            {t.missing_punches_approval || "Missing Punches Approval"}
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