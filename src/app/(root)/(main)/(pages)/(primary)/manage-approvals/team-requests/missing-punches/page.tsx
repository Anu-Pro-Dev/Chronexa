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
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { useDebounce } from "@/src/hooks/useDebounce";
import { approveManualPunchRequest, rejectManualPunchRequest } from "@/src/lib/apiHandler";
import toast from "react-hot-toast";
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
  const [open, setOpen] = useState<boolean>(false);
  const [filter_open, filter_on_open_change] = useState<boolean>(false);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [employeeFilter, setEmployeeFilter] = useState<string>("");
  const debouncedSearchValue = useDebounce(searchValue, 300);
  const debouncedEmployeeFilter = useDebounce(employeeFilter, 300);
  const [approveOpen, setApproveOpen] = useState<boolean>(false);
  const [rejectOpen, setRejectOpen] = useState<boolean>(false);
  const t = translations?.modules?.manageApprovals || {};

  const [popoverStates, setPopoverStates] = useState({
    fromDate: false,
    toDate: false,
  });

  const closePopover = (key: string) => {
    setPopoverStates((prev) => ({ ...prev, [key]: false }));
  };

  const offset = useMemo(() => {
    return currentPage;
  }, [currentPage]);

  const getEmployeeName = useCallback((transaction: any) => {
    const employee = transaction.employee_master;

    if (!employee) {
      return `Employee ${transaction.employee_id || "-"}`;
    }

    const fullName =
      language === "ar"
        ? `${employee.firstname_arb || ""} ${employee.lastname_arb || ""}`.trim()
        : `${employee.firstname_eng || ""} ${employee.lastname_eng || ""}`.trim();

    return fullName || `Employee ${transaction.employee_id}`;
  }, [language]);

  useEffect(() => {
    setColumns([
      { field: "emp_no", headerName: t.employee_no || "Employee No" },
      { field: "employee_name", headerName: t.employee_name || "Employee Name" },
      { field: "transaction_date", headerName: "Date" },
      { field: "transaction_time", headerName: "Time" },
      { field: "reason", headerName: "Reason" },
      { field: "remarks", headerName: "Remarks" },
      { field: "transaction_status", headerName: "Status" },
    ]);
  }, [language, t]);

  const formatDateForAPI = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      const datePart = dateString.split('T')[0];
      if (datePart) {
        const [year, month, day] = datePart.split('-');
        return `${day}/${month}/${year}`;
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "-";
    try {
      const timePart = timeString.split('T')[1];
      if (timePart) {
        return timePart.substring(0, 8);
      }
      return timeString;
    } catch {
      return timeString;
    }
  };

  const {
    data: punchesData,
    isLoading: isLoadingPunches,
    error,
    refetch,
  } = useFetchAllEntity("employeeManualTransaction", {
    searchParams: {
      status: "Pending",
      limit: String(rowsPerPage),
      offset: String(offset),
      ...(debouncedSearchValue && { search: debouncedSearchValue }),
      ...(fromDate && { from_date: formatDateForAPI(fromDate) }),
      ...(toDate && { to_date: formatDateForAPI(toDate) }),
      ...(debouncedEmployeeFilter && { employee_id: debouncedEmployeeFilter }),
    },
    enabled: !!employeeId && isAuthenticated && !isChecking,
    endpoint: `/employeeManualTransaction/team/all`,
  });

  const data = useMemo(() => {
    if (!Array.isArray(punchesData?.data)) return [];

    return punchesData.data.map((transaction: any) => {
      const empNo = transaction.employee_master?.emp_no || `EMP${transaction.employee_id}`;

      return {
        ...transaction,
        id: transaction.employee_manual_transaction_id,
        emp_no: empNo,
        employee_name: getEmployeeName(transaction),
        transaction_date: formatDateDisplay(transaction.transaction_time),
        transaction_time: formatTime(transaction.transaction_time),
        reason: transaction.reason || "-",
        transaction_status: transaction.transaction_status || "Pending",
        raw_transaction_time: transaction.transaction_time,
      };
    });
  }, [punchesData, language, getEmployeeName]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setCurrentPage(newPage);
      if (refetch) {
        setTimeout(() => refetch(), 100);
      }
    },
    [refetch]
  );

  const handleRowsPerPageChange = useCallback(
    (newRowsPerPage: number) => {
      setRowsPerPage(newRowsPerPage);
      setCurrentPage(1);
      if (refetch) {
        setTimeout(() => refetch(), 100);
      }
    },
    [refetch]
  );

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

  const handleApprove = async () => {
    if (selectedRows.length === 0) {
      toast.error("No row selected");
      return;
    }

    try {
      const results = await Promise.all(
        selectedRows.map((row) =>
          approveManualPunchRequest({
            employee_manual_transaction_id: row.id,
            employee_id: row.employee_id,
            transaction_time: row.raw_transaction_time,
            reason: row.reason,
            remarks: row.remarks || "",
          })
        )
      );

      results.forEach((res) => {
        toast.success(res?.data?.message || "Approved successfully");
      });

      setSelectedRows([]);
      setApproveOpen(false);
      await refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Approval failed");
      console.error("Approval error:", error);
    }
  };

  const handleReject = async () => {
    if (selectedRows.length === 0) {
      toast.error("No row selected");
      return;
    }

    try {
      const results = await Promise.all(
        selectedRows.map((row) =>
          rejectManualPunchRequest({
            employee_manual_transaction_id: row.id,
            employee_id: row.employee_id,
            transaction_time: row.raw_transaction_time,
            reason: row.reason,
            remarks: row.remarks || "",
          })
        )
      );

      results.forEach((res) => {
        toast.success(res?.data?.message || "Rejected successfully");
      });

      setSelectedRows([]);
      setRejectOpen(false);
      await refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Rejection failed");
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
    isLoading: isLoadingPunches || isChecking,
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
        isLoading={isLoadingPunches || isChecking}
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
        items={modules?.manageApprovals?.items}
        entityName="employeeManualTransaction"
        approve_modal_title="Approve Missing Punch"
        approve_modal_description="Are you sure you want to approve the selected missing punch request(s)?"
        reject_modal_title="Reject Missing Punch"
        reject_modal_description="Are you sure you want to reject the selected missing punch request(s)?"
      />
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Popover
            open={popoverStates.fromDate}
            onOpenChange={(open) =>
              setPopoverStates((prev) => ({ ...prev, fromDate: open }))
            }
          >
            <PopoverTrigger asChild>
              <Button
                size={"lg"}
                variant={"outline"}
                className="w-full bg-accent px-4 flex justify-between border-grey"
              >
                <p>
                  <Label className="font-normal text-secondary">
                    {t.from_date || "From Date"} :
                  </Label>
                  <span className="px-1 text-sm text-text-primary">
                    {fromDate
                      ? format(fromDate, "dd/MM/yy")
                      : t.placeholder_date || "Choose date"}
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
                size={"lg"}
                variant={"outline"}
                className="w-full bg-accent px-4 flex justify-between border-grey"
              >
                <p>
                  <Label className="font-normal text-secondary">
                    {t.to_date || "To Date"} :
                  </Label>
                  <span className="px-1 text-sm text-text-primary">
                    {toDate
                      ? format(toDate, "dd/MM/yy")
                      : t.placeholder_date || "Choose date"}
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
            Missing Punches Approval
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