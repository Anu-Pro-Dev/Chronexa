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
import { Button } from "@/src/components/ui/button";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { approvePermissionRequest } from "@/src/lib/apiHandler";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { useDebounce } from "@/src/hooks/useDebounce"; 
import Lottie from "lottie-react";
import loadingAnimation from "@/src/animations/hourglass-blue.json";

export default function Page() {
  const router = useRouter();
  const { modules, language, translations } = useLanguage();
  const { isAuthenticated, isChecking, employeeId, userInfo } = useAuthGuard();
  const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>("single_permissions_id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState<boolean>(false);
  const [filter_open, filter_on_open_change] = useState<boolean>(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [selectedOption, setSelectedOption] = useState<string>("all");
  const debouncedSearchValue = useDebounce(searchValue, 300);
  const [approveOpen, setApproveOpen] = useState<boolean>(false);
  const [rejectOpen, setRejectOpen] = useState<boolean>(false);
  const t = translations?.modules?.selfServices || {};
  const [popoverStates, setPopoverStates] = useState({
    fromDate: false,
    toDate: false,
  });
  const offset = useMemo(() => {
    return currentPage;
  }, [currentPage]);

  const getEmployeeDisplayInfo = useCallback((permission: any, language: string = 'en') => {
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

    const firstName = language === 'ar' ? firstNameAr : firstNameEn;
    const lastName = language === 'ar' ? lastNameAr : lastNameEn;
    
    const fullName = language === 'ar' 
      ? `${firstNameAr} ${lastNameAr}`.trim()
      : `${firstNameEn} ${lastNameEn}`.trim();

    return {
      emp_no: employeeMaster.emp_no || `EMP${permission.employee_id}`,
      employee_name: fullName || firstName || `Employee ${permission.employee_id}`,
      firstName: firstName,
      lastName: lastName,
      fullName: fullName || firstName || `Employee ${permission.employee_id}`,
      employee_id: permission.employee_id
    };
  }, [language]);

  const getPermissionTypeName = useCallback((permissionTypes: any) => {
    if (!permissionTypes) {
      return language === "ar" ? "غير معروف" : "Unknown";
    }
    
    return language === "ar" 
      ? permissionTypes.permission_type_arb || permissionTypes.permission_type_eng || "غير معروف"
      : permissionTypes.permission_type_eng || permissionTypes.permission_type_arb || "Unknown";
  }, [language]);

  useEffect(() => {
    setColumns([
      { field: "permission_type_name", headerName: t.perm_type || "Permission Type" },
      { field: "firstName", headerName: t.employee_name || "Employee Name" },
      { field: "permission_date", headerName: t.date || "Date" },
      { field: "from_time", headerName: t.from_time || "From Time" },
      { field: "to_time", headerName: t.to_time || "To Time" },
      { field: "perm_minutes", headerName: t.perm_mins || "Permission Minutes" },
    ]);
  }, [language, t]);

  const formatDateForAPI = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const { data: permissionsData, isLoading: isLoadingPermissions, error, refetch } = useFetchAllEntity(
    "employeeShortPermission", 
    {
      searchParams: {
        limit: String(rowsPerPage),
        offset: String(offset),
        ...(selectedOption && selectedOption !== "all" && { status: selectedOption }),
        ...(fromDate && { from_date: formatDateForAPI(fromDate) }),
        ...(toDate && { to_date: formatDateForAPI(toDate) }),
        ...(debouncedSearchValue && { search: debouncedSearchValue }),
      },
      enabled: !!employeeId && isAuthenticated && !isChecking,
      endpoint: `/employeeShortPermission/pending`,
    }
  );

  const data = useMemo(() => {
    if (!Array.isArray(permissionsData?.data)) {
      return [];
    }

    const filteredData = permissionsData.data.filter((permission: any) => 
      permission.employee_id !== employeeId
    );

    const processedData = filteredData.map((permission: any) => {
      const employeeInfo = getEmployeeDisplayInfo(permission, language);
      const permissionDate = permission.from_date 
        ? new Date(permission.from_date).toISOString().split('T')[0]
        : '';
      
      return {
        ...permission,
        id: permission.single_permissions_id,
        emp_no: employeeInfo.emp_no,
        employee_name: employeeInfo.employee_name,
        firstName: employeeInfo.firstName,
        lastName: employeeInfo.lastName,
        fullName: employeeInfo.fullName,
        permission_type_name: getPermissionTypeName(permission.permission_types),
        permission_date: permissionDate,
        from_time: permission.from_time ? permission.from_time.substring(11, 19) : permission.from_time,
        to_time: permission.to_time ? permission.to_time.substring(11, 19) : permission.to_time,
        raw_employee_id: permission.employee_id,
        employee_master: permission.employee_master,
      };
    });

    return processedData;
  }, [permissionsData, language, employeeId, getEmployeeDisplayInfo, getPermissionTypeName]);

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

  const handleApprove = async () => {
    if (selectedRows.length === 0) {
      toast.error("No row selected");
      return;
    }

    try {
      const results = await Promise.all(
        selectedRows.map((row) =>
          approvePermissionRequest({
            single_permissions_id: row.id,
            approve_reject_flag: 1, // 1 for approve
          })
        )
      );

      results.forEach((res) => {
        toast.success(res?.message || "Approved successfully");
      });

      setSelectedRows([]);
      setApproveOpen(false); // Close modal after success
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
          approvePermissionRequest({
            single_permissions_id: row.id,
            approve_reject_flag: 2, // 2 for reject
          })
        )
      );

      results.forEach((res) => {
        toast.success(res?.message || "Rejected successfully");
      });

      setSelectedRows([]);
      setRejectOpen(false); // Close modal after success
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
          <div style={{ width: 50}}>
            <Lottie animationData={loadingAnimation} loop={true} />
          </div>
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
        disableAdd
        disableDelete
        enableApprove
        enableReject
        selectedRows={selectedRows}
        items={modules?.manageApprovals.items}
        entityName="employeeShortPermission"
        approve_modal_title="Approve Permission"
        approve_modal_description="Are you sure you want to approve the selected permission request(s)?"
        reject_modal_title="Reject Permission"
        reject_modal_description="Are you sure you want to reject the selected permission request(s)?"
      />
      <div className="grid grid-cols-3 gap-4">
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
                onSelect={handleFromDateChange}
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
              <Calendar mode="single" selected={toDate} onSelect={handleToDateChange} />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="bg-accent rounded-2xl">
        <div className="col-span-2 p-6 pb-6">
          <h1 className="font-bold text-xl text-primary">
            Permission Approval
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