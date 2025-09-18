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
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Page() {
  const router = useRouter();
  const { modules, language, translations } = useLanguage();
  const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const queryClient = useQueryClient();
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [selectedOption, setSelectedOption] = useState<string>("all");

  // Updated status options to match approve_reject_flag values
  const options = [
    { value: "all", label: "All" },
    { value: "0", label: "Pending" },
    { value: "1", label: "Approved" },
    { value: "2", label: "Rejected" },
  ];

  useEffect(() => {
    setColumns([
      { field: "permission_type_name", headerName: language === "ar" ? "نوع الإذن" : "Permission Type" },
      { field: "employee_name", headerName: language === "ar" ? "الموظف" : "Employee" },
      { field: "from_time", headerName: language === "ar" ? "من الوقت" : "From Time" },
      { field: "to_time", headerName: language === "ar" ? "إلى الوقت" : "To Time" },
      { field: "perm_minutes", headerName: language === "ar" ? "دقائق الإذن" : "Permission Minutes" },
      { field: "status", headerName: language === "ar" ? "المبرر" : "Status" },
    ]);
  }, [language]);

  const offset = useMemo(() => {
    return currentPage;
  }, [currentPage]);

  // Single API call with filters and pagination applied on the backend
  const { data: employeeShortPermissionData, isLoading, refetch } = useFetchAllEntity(
    "employeeShortPermission", 
    {
      searchParams: {
        limit: String(rowsPerPage),
        offset: String(offset),
        ...(selectedOption && selectedOption !== "all" && { status: selectedOption }),
        ...(fromDate && { from_date: fromDate.toISOString() }),
        ...(toDate && { to_date: toDate.toISOString() }),
        ...(searchValue && { search: searchValue }),
      },
    }
  );

  // Helper function to get permission type name based on language
  const getPermissionTypeName = (permissionTypes: any) => {
    if (!permissionTypes) {
      return language === "ar" ? "غير معروف" : "Unknown";
    }
    
    // Return name based on selected language
    return language === "ar" 
      ? permissionTypes.permission_type_arb || permissionTypes.permission_type_eng || "غير معروف"
      : permissionTypes.permission_type_eng || permissionTypes.permission_type_arb || "Unknown";
  };

  // Helper function to get employee name
  const getEmployeeName = (employeeMaster: any) => {
    if (!employeeMaster) {
      return language === "ar" ? "غير معروف" : "Unknown";
    }
    
    // Use the same naming pattern as ScheduleGrid
    const fullName = language === "ar"
      ? `${employeeMaster.firstname_arb || ""} ${employeeMaster.lastname_arb || ""}`.trim()
      : `${employeeMaster.firstname_eng || ""} ${employeeMaster.lastname_eng || ""}`.trim();
    
    return fullName || (language === "ar" ? "غير معروف" : "Unknown");
  };

  const data = useMemo(() => {
    if (Array.isArray(employeeShortPermissionData?.data)) {
      return employeeShortPermissionData.data.map((permReqs: any) => {
        const getStatusLabel = (flag: number) => {
          switch (flag) {
            case 0: return language === "ar" ? "في الانتظار" : "Pending";
            case 1: return language === "ar" ? "معتمد" : "Approved";
            case 2: return language === "ar" ? "مرفوض" : "Rejected";
            default: return language === "ar" ? "غير معروف" : "Unknown";
          }
        };

        return {
          ...permReqs,
          id: permReqs.single_permissions_id,
          permission_type_name: getPermissionTypeName(permReqs.permission_types),
          employee_name: getEmployeeName(
            permReqs.employee_master
          ),
          // Extract time portion from the datetime
          from_time: permReqs.from_time ? permReqs.from_time.substring(11, 19) : permReqs.from_time,
          to_time: permReqs.to_time ? permReqs.to_time.substring(11, 19) : permReqs.to_time,
          status: getStatusLabel(permReqs.approve_reject_flag),
        };
      });
    }
    return [];
  }, [employeeShortPermissionData, language]);

   const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [currentPage, refetch]);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [rowsPerPage, refetch]);

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

  // Update filter handlers
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

  const props = {
    Data: data,
    Columns: columns,
    selectedRows,
    setSelectedRows,
    isLoading: isLoading,
    SortField: sortField,
    CurrentPage: currentPage,
    SetCurrentPage: handlePageChange,
    SetSortField: setSortField,
    SortDirection: sortDirection,
    SetSortDirection: setSortDirection,
    SearchValue: searchValue,
    SetSearchValue: handleSearchChange,
    total: employeeShortPermissionData?.total || 0,
    hasNext: employeeShortPermissionData?.hasNext,
    rowsPerPage,
    setRowsPerPage: handleRowsPerPageChange,
  };
 
  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ["employeeShortPermission"] });
  };
 
  const handleEditClick = (rowData: any) => {
    try {
      const editData = {
        ...rowData,
      };
      
      sessionStorage.setItem('editPermissionRequestData', JSON.stringify(editData));
      
      // Navigate to the add page (which will handle edit mode)
      router.push("/self-services/permissions/my-requests/add");
    } catch (error) {
      console.error("Error setting edit data:", error);
      toast.error("Failed to load permission data for editing");
    }
  };
 
  const handleRowSelection = useCallback((rows: any[]) => {
    setSelectedRows(rows);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        disableAdd
        disableDelete
        props={props}
        selectedRows={selectedRows}
        items={modules?.selfServices.items}
        entityName="employeeShortPermission"
      />
      {/* Filters */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Select onValueChange={handleStatusChange} value={selectedOption}>
            <SelectTrigger className="bg-accent border-grey">
              <Label className="font-normal text-secondary">
                {language === "ar" ? "الحالة :" : "Status :"}
              </Label>
              <SelectValue placeholder={language === "ar" ? "اختر الحالة" : "Choose status"}/>
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
          <Popover>
            <PopoverTrigger asChild>
              <Button size={"lg"} variant={"outline"}
                className="w-full bg-accent px-4 flex justify-between border-grey"
              >
                <p>
                  <Label className="font-normal text-secondary">
                    {language === "ar" ? "من تاريخ :" : "From Date :"}
                  </Label>
                  <span className="px-1 text-sm text-text-primary"> 
                    {fromDate ? format(fromDate, "dd/MM/yy") : (language === "ar" ? "اختر التاريخ" : "Choose date")}
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
                    {language === "ar" ? "إلى تاريخ :" : "To Date :"}
                  </Label>
                  <span className="px-1 text-sm text-text-primary"> 
                    {toDate ? format(toDate, "dd/MM/yy") : (language === "ar" ? "اختر التاريخ" : "Choose date")}
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
        <div className="col-span-2 p-6">
          <h1 className="font-bold text-xl text-primary">
            Permission Requests
          </h1>
        </div>
        <div className="px-6">
          <PowerTabs items={modules?.selfServices?.permissions?.items} />
        </div>
        <PowerTable
          props={props}
          showCheckbox={false}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}