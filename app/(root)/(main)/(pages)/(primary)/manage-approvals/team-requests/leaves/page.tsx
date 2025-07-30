"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import PowerTabs from "@/components/custom/power-comps/power-tabs";
import { useLanguage } from "@/providers/LanguageProvider";
import { useFetchAllEntity } from "@/lib/useFetchAllEntity";
import { getPendingLeave, approveLeaveRequest } from "@/lib/apiHandler";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function Page() {
  const router = useRouter();
  const { modules, language } = useLanguage();
  const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Modal states for approval/rejection
  const [approveOpen, setApproveOpen] = useState<boolean>(false);
  const [rejectOpen, setRejectOpen] = useState<boolean>(false);

  useEffect(() => {
    setColumns([
      { field: "leave_type_name", headerName: language === "ar" ? "اسم الإذن" : "Leave Type" },
      { field: "employee_name", headerName: language === "ar" ? "الموظف" : "Employee" },
      { field: "number_of_leaves", headerName: language === "ar" ? "دقائق الإذن" : "Leave (days)" },
      { field: "from_date_formatted", headerName: language === "ar" ? "من الوقت" : "From Date" },
      { field: "to_date_formatted", headerName: language === "ar" ? "إلى الوقت" : "To Date" },
    ]);
  }, [language]);
  
  const { data: leaveTypesData } = useFetchAllEntity("leaveType");
  const { data: employeesData } = useFetchAllEntity("employee");

  const leaveTypeMap = useMemo(() => {
    const map: Record<number, string> = {};
    leaveTypesData?.data?.forEach((item: any) => {
      map[item.leave_type_id] = item.leave_type_eng; // or item.leave_type_arb if Arabic
    });
    return map;
  }, [leaveTypesData, language]);

  const employeeMap = useMemo(() => {
    const map: Record<number, string> = {};
    employeesData?.data?.forEach((emp: any) => {
      const fullName =
        language === "ar"
          ? `${emp.firstname_arb}`
          : `${emp.firstname_eng}`;
      map[emp.employee_id] = fullName;
    });
    return map;
  }, [employeesData, language]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric", });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await getPendingLeave();

        const formattedData = res?.data?.map((item: any) => ({
          ...item,
          id: item.employee_leave_id,
          leave_type_name: leaveTypeMap[item.leave_type_id] || item.leave_type_id,
          employee_name: employeeMap[item.employee_id] || item.employee_id,
          from_date_formatted: formatDate(item.from_date),
          to_date_formatted: formatDate(item.to_date),
        })) ?? [];

        setData(formattedData);
      } catch (error) {
        toast.error("Failed to fetch pending leaves");
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (leaveTypesData && employeesData) {
      fetchData();
    }
  }, [leaveTypeMap, employeeMap]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getPendingLeave();
      const formattedData = res?.data?.map((item: any) => ({
        ...item,
        id: item.employee_leave_id,
        leave_type_name: leaveTypeMap[item.leave_type_id] || item.leave_type_id,
        employee_name: employeeMap[item.employee_id] || item.employee_id,
        from_date_formatted: formatDate(item.from_date),
        to_date_formatted: formatDate(item.to_date),
      })) ?? [];
      setData(formattedData);
    } catch (error) {
      toast.error("Failed to fetch data");
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [leaveTypeMap, employeeMap]);

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
      await fetchData();
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
      await fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Rejection failed");
      console.error("Rejection error:", error);
    }
  };

  const handleRowSelection = useCallback((rows: any[]) => {
    setSelectedRows(rows);
  }, []);

  const props = {
    Data: data,
    Columns: columns,
    selectedRows,
    setSelectedRows,
    isLoading,
    SortField: sortField,
    CurrentPage: currentPage,
    SetCurrentPage: setCurrentPage,
    SetSortField: setSortField,
    SortDirection: sortDirection,
    SetSortDirection: setSortDirection,
    SearchValue: searchValue,
    SetSearchValue: setSearchValue,
    // Modal props for approve/reject
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
      <div className="bg-accent rounded-2xl">
        <div className="col-span-2 p-6">
          <h1 className="font-bold text-xl text-primary">Leave Approval</h1>
        </div>
        <div className="px-6">
          <PowerTabs items={modules?.manageApprovals?.teamrequests?.items} />
        </div>
        <PowerTable
          props={props}
          showEdit={false}
          onRowSelection={handleRowSelection}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}