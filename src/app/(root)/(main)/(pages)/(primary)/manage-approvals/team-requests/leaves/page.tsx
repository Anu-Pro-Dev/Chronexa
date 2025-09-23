// "use client";
// import React, { useEffect, useState, useCallback, useMemo } from "react";
// import PowerHeader from "@/src/components/custom/power-comps/power-header";
// import PowerTable from "@/src/components/custom/power-comps/power-table";
// import PowerTabs from "@/src/components/custom/power-comps/power-tabs";
// import { useLanguage } from "@/src/providers/LanguageProvider";
// import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
// import { getPendingLeave, approveLeaveRequest } from "@/src/lib/apiHandler";
// import { useRouter } from "next/navigation";
// import toast from "react-hot-toast";

// export default function Page() {
//   const router = useRouter();
//   const { modules, language, translations } = useLanguage();
//   const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [sortField, setSortField] = useState<string>("");
//   const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
//   const [searchValue, setSearchValue] = useState<string>("");
//   const [selectedRows, setSelectedRows] = useState<any[]>([]);
//   const [data, setData] = useState<any[]>([]);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
  
//   // Modal states for approval/rejection
//   const [approveOpen, setApproveOpen] = useState<boolean>(false);
//   const [rejectOpen, setRejectOpen] = useState<boolean>(false);

//   useEffect(() => {
//     setColumns([
//       { field: "leave_type_name", headerName: language === "ar" ? "اسم الإذن" : "Leave Type" },
//       { field: "employee_name", headerName: language === "ar" ? "الموظف" : "Employee" },
//       { field: "number_of_leaves", headerName: language === "ar" ? "دقائق الإذن" : "Leave (days)" },
//       { field: "from_date_formatted", headerName: language === "ar" ? "من الوقت" : "From Date" },
//       { field: "to_date_formatted", headerName: language === "ar" ? "إلى الوقت" : "To Date" },
//     ]);
//   }, [language]);
  
//   const { data: leaveTypesData } = useFetchAllEntity("leaveType");
//   const { data: employeesData } = useFetchAllEntity("employee");

//   const leaveTypeMap = useMemo(() => {
//     const map: Record<number, string> = {};
//     leaveTypesData?.data?.forEach((item: any) => {
//       map[item.leave_type_id] = item.leave_type_eng; // or item.leave_type_arb if Arabic
//     });
//     return map;
//   }, [leaveTypesData, language]);

//   const employeeMap = useMemo(() => {
//     const map: Record<number, string> = {};
//     employeesData?.data?.forEach((emp: any) => {
//       const fullName =
//         language === "ar"
//           ? `${emp.firstname_arb}`
//           : `${emp.firstname_eng}`;
//       map[emp.employee_id] = fullName;
//     });
//     return map;
//   }, [employeesData, language]);

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric", });
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setIsLoading(true);
//         const res = await getPendingLeave();

//         const formattedData = res?.data?.map((item: any) => ({
//           ...item,
//           id: item.employee_leave_id,
//           leave_type_name: leaveTypeMap[item.leave_type_id] || item.leave_type_id,
//           employee_name: employeeMap[item.employee_id] || item.employee_id,
//           from_date_formatted: formatDate(item.from_date),
//           to_date_formatted: formatDate(item.to_date),
//         })) ?? [];

//         setData(formattedData);
//       } catch (error) {
//         toast.error("Failed to fetch pending leaves");
//         console.error("Error:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     if (leaveTypesData && employeesData) {
//       fetchData();
//     }
//   }, [leaveTypeMap, employeeMap]);

//   const fetchData = useCallback(async () => {
//     try {
//       setIsLoading(true);
//       const res = await getPendingLeave();
//       const formattedData = res?.data?.map((item: any) => ({
//         ...item,
//         id: item.employee_leave_id,
//         leave_type_name: leaveTypeMap[item.leave_type_id] || item.leave_type_id,
//         employee_name: employeeMap[item.employee_id] || item.employee_id,
//         from_date_formatted: formatDate(item.from_date),
//         to_date_formatted: formatDate(item.to_date),
//       })) ?? [];
//       setData(formattedData);
//     } catch (error) {
//       toast.error("Failed to fetch data");
//       console.error("Fetch error:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [leaveTypeMap, employeeMap]);

//   const handleApprove = async () => {
//     if (selectedRows.length === 0) {
//       toast.error("No row selected");
//       return;
//     }

//     try {
//       const results = await Promise.all(
//         selectedRows.map((row) =>
//           approveLeaveRequest({
//             employee_leave_id: row.id,
//             approve_reject_flag: 1, // 1 for approve
//           })
//         )
//       );

//       results.forEach((res) => {
//         toast.success(res?.message || "Approved successfully");
//       });

//       setSelectedRows([]);
//       setApproveOpen(false); // Close modal after success
//       await fetchData();
//     } catch (error: any) {
//       toast.error(error?.response?.data?.message || "Approval failed");
//       console.error("Approval error:", error);
//     }
//   };

//   const handleReject = async () => {
//     if (selectedRows.length === 0) {
//       toast.error("No row selected");
//       return;
//     }

//     try {
//       const results = await Promise.all(
//         selectedRows.map((row) =>
//           approveLeaveRequest({
//             employee_leave_id: row.id,
//             approve_reject_flag: 2, // 2 for reject
//           })
//         )
//       );

//       results.forEach((res) => {
//         toast.success(res?.message || "Rejected successfully");
//       });

//       setSelectedRows([]);
//       setRejectOpen(false); // Close modal after success
//       await fetchData();
//     } catch (error: any) {
//       toast.error(error?.response?.data?.message || "Rejection failed");
//       console.error("Rejection error:", error);
//     }
//   };

//   const handleRowSelection = useCallback((rows: any[]) => {
//     setSelectedRows(rows);
//   }, []);

//   const props = {
//     Data: data,
//     Columns: columns,
//     selectedRows,
//     setSelectedRows,
//     isLoading,
//     SortField: sortField,
//     CurrentPage: currentPage,
//     SetCurrentPage: setCurrentPage,
//     SetSortField: setSortField,
//     SortDirection: sortDirection,
//     SetSortDirection: setSortDirection,
//     SearchValue: searchValue,
//     SetSearchValue: setSearchValue,
//     // Modal props for approve/reject
//     approve_open: approveOpen,
//     approve_on_open_change: setApproveOpen,
//     reject_open: rejectOpen,
//     reject_on_open_change: setRejectOpen,
//     onApprove: handleApprove,
//     onReject: handleReject,
//   };

//   return (
//     <div className="flex flex-col gap-4">
//       <PowerHeader
//         props={props}
//         disableAdd
//         disableDelete
//         enableApprove
//         enableReject
//         selectedRows={selectedRows}
//         items={modules?.manageApprovals.items}
//         entityName="employeeLeave"
//         approve_modal_title="Approve Leave"
//         approve_modal_description="Are you sure you want to approve the selected leave request(s)?"
//         reject_modal_title="Reject Leave"
//         reject_modal_description="Are you sure you want to reject the selected leave request(s)?"
//       />
//       <div className="bg-accent rounded-2xl">
//         <div className="col-span-2 p-6">
//           <h1 className="font-bold text-xl text-primary">Leave Approval</h1>
//         </div>
//         <div className="px-6">
//           <PowerTabs items={modules?.manageApprovals?.teamrequests?.items} />
//         </div>
//         <PowerTable
//           props={props}
//           showEdit={false}
//           onRowSelection={handleRowSelection}
//           isLoading={isLoading}
//         />
//       </div>
//     </div>
//   );
// }
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
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useRouter } from "next/navigation";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { useDebounce } from "@/src/hooks/useDebounce"; 
import { approveLeaveRequest } from "@/src/lib/apiHandler";
import Lottie from "lottie-react";
import loadingAnimation from "@/src/animations/hourglass-blue.json";
import toast from "react-hot-toast";

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
  const [approveOpen, setApproveOpen] = useState<boolean>(false);
  const [rejectOpen, setRejectOpen] = useState<boolean>(false);
  const t = translations?.modules?.manageApprovals || {};

  const offset = useMemo(() => {
    return currentPage;
  }, [currentPage]);

  const getEmployeeDisplayInfo = useCallback((leave: any, language: string = 'en') => {
    const employeeMaster = leave.employee_master;
    
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

  useEffect(() => {
    setColumns([
      { field: "leave_type_name", headerName: t.leave_type || "Leave Type" },
      { field: "firstName", headerName: t.employee_name || "Employee Name" },
      { field: "from_date", headerName: t.from_date || "From Date" },
      { field: "to_date", headerName: t.to_date || "To Date" },
      { field: "number_of_leaves", headerName: t.leave_days || "No of Days" },
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
        ...(fromDate && { from_date: formatDateForAPI(fromDate) }),
        ...(toDate && { to_date: formatDateForAPI(toDate) }),
        ...(debouncedSearchValue && { search: debouncedSearchValue }),
        ...(debouncedEmployeeFilter && { employee_id: debouncedEmployeeFilter }),
        ...(debouncedLeaveTypeFilter && { leave_type_id: debouncedLeaveTypeFilter }),
      },
      enabled: !!employeeId && isAuthenticated && !isChecking,
      endpoint: `/employeeLeave/pending`,
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
        employee_master: leave.employee_master,
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
      toast.error("No row selected");
      return;
    }

    try {
      const results = await Promise.all(
        selectedRows.map((row) =>
          approveLeaveRequest({
            employee_leave_id: row.id,
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
          approveLeaveRequest({
            employee_leave_id: row.id,
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
        isLoading={isLoadingLeaves || isChecking}
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
        entityName="employeeLeave"
        approve_modal_title="Approve Leave"
        approve_modal_description="Are you sure you want to approve the selected leave request(s)?"
        reject_modal_title="Reject Leave"
        reject_modal_description="Are you sure you want to reject the selected leave request(s)?"
      />
      <div className="grid grid-cols-3 gap-4">
        {/* <div>
          <Popover>
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
          <Popover>
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
        </div> */}
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
      </div>
      <div className="bg-accent rounded-2xl">
        <div className="col-span-2 p-6 pb-6">
          <h1 className="font-bold text-xl text-primary">
            Leave Approval
          </h1>
        </div>
        <div className="px-6">
          <PowerTabs items={modules?.manageApprovals?.leaves?.items} />
        </div>
        {renderPowerTable()}
      </div>
    </div>
  );
}