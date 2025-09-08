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
      // { field: "remarks", headerName: language === "ar" ? "المبرر" : "Justification" },
      { field: "perm_minutes", headerName: language === "ar" ? "دقائق الإذن" : "Permission Minutes" },
    ]);
  }, [language]);

  // Fetch related data for displaying names
  const { data: employeeShortPermissionData, isLoading } = useFetchAllEntity("employeeShortPermission");
  const { data: permissionTypesData, isLoading: isLoadingPermissionTypes } = useFetchAllEntity("permissionType");
  const { data: employeesData, isLoading: isLoadingEmployees } = useFetchAllEntity("employee");

  // Helper function to get permission type name based on language
  const getPermissionTypeName = (permissionTypeId: number, permissionTypesData: any) => {
    const permissionType = permissionTypesData?.data?.find(
      (pt: any) => pt.permission_type_id === permissionTypeId
    );
    
    if (!permissionType) {
      return `ID: ${permissionTypeId}`;
    }
    
    // Return name based on selected language
    return language === "ar" 
      ? permissionType.permission_type_arb || permissionType.permission_type_eng || `ID: ${permissionTypeId}`
      : permissionType.permission_type_eng || permissionType.permission_type_arb || `ID: ${permissionTypeId}`;
  };

  // Helper function to get employee name (following ScheduleGrid pattern)
  const getEmployeeName = (employeeId: number, employeesData: any) => {
    const employee = employeesData?.data?.find(
      (emp: any) => emp.employee_id === employeeId
    );
    
    if (!employee) {
      return `Emp ${employeeId}`;
    }
    
    // Use the same naming pattern as ScheduleGrid
    const fullName = language === "ar"
      ? `${employee.firstname_arb || ""}`.trim()
      : `${employee.firstname_eng || ""}`.trim();
    
    return fullName || `Emp ${employeeId}`;
  };

  const data = useMemo(() => {
    if (Array.isArray(employeeShortPermissionData?.data)) {
      return employeeShortPermissionData.data
        .filter((permReqs: any) => {
          // Filter by status if selected
          if (selectedOption && selectedOption !== "all") {
            return permReqs.approve_reject_flag?.toString() === selectedOption;
          }
          return true;
        })
        .filter((permReqs: any) => {
          // Filter by date range if selected
          if (fromDate || toDate) {
            const permDate = new Date(permReqs.from_time);
            if (fromDate && permDate < fromDate) return false;
            if (toDate && permDate > toDate) return false;
          }
          return true;
        })
        .map((permReqs: any) => {
          return {
            ...permReqs,
            id: permReqs.single_permissions_id,
            permission_type_name: getPermissionTypeName(permReqs.permission_type_id, permissionTypesData),
            employee_name: getEmployeeName(permReqs.employee_id, employeesData),
            from_time: new Date(permReqs.from_time).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            to_time: new Date(permReqs.to_time).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
          };
        });
    }
    return [];
  }, [employeeShortPermissionData, permissionTypesData, employeesData, selectedOption, fromDate, toDate, language]);

  const props = {
    Data: data,
    Columns: columns,
    selectedRows,
    setSelectedRows,
    isLoading: isLoading || isLoadingPermissionTypes || isLoadingEmployees,
    SortField: sortField,
    CurrentPage: currentPage,
    SetCurrentPage: setCurrentPage,
    SetSortField: setSortField,
    SortDirection: sortDirection,
    SetSortDirection: setSortDirection,
    SearchValue: searchValue,
    SetSearchValue: setSearchValue,
  };
 
  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ["employeeShortPermission"] });
    queryClient.invalidateQueries({ queryKey: ["permissionType"] });
    queryClient.invalidateQueries({ queryKey: ["employee"] });
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
        props={props}
        selectedRows={selectedRows}
        items={modules?.selfServices.items}
        entityName="employeeShortPermission"
        isAddNewPagePath="/self-services/permissions/my-requests/add"
      />
      {/* Fillters */}
      {/* <div className="grid grid-cols-3 gap-4">
        <div>
          <Select onValueChange={setSelectedOption} value={selectedOption}>
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
                onSelect={setFromDate}
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
              <Calendar mode="single" selected={toDate} onSelect={setToDate} />
            </PopoverContent>
          </Popover>
        </div>
      </div> */}
      <div className="bg-accent rounded-2xl">
        <div className="col-span-2 p-6">
          <h1 className="font-bold text-xl text-primary">
            {language === "ar" ? "إدارة الأذونات" : "Manage Permissions"}
          </h1>
        </div>
        <div className="px-6">
          <PowerTabs items={modules?.selfServices?.permissions?.items} />
        </div>
        <PowerTable
          props={props}
          showEdit={false}
          onEditClick={handleEditClick}
          onRowSelection={handleRowSelection}
          isLoading={isLoading || isLoadingPermissionTypes || isLoadingEmployees}
        />
      </div>
    </div>
  );
}