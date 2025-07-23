// "use client";
// import React, { useState } from "react";
// import PowerHeader from "@/components/custom/power-comps/power-header";
// import PowerTable from "@/components/custom/power-comps/power-table";
// import { useLanguage } from "@/providers/LanguageProvider";
// import PowerTabs from "@/components/custom/power-comps/power-tabs";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { CalendarIcon } from "@/icons/icons";
// import { Calendar } from "@/components/ui/calendar";
// import { format } from "date-fns";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";

// export default function Page() {
//   const { modules } = useLanguage();
//   const [Data, SetData] = useState<any>([]);
//   const [Columns, setColumns] = useState([
//     { field: "code" },
//     { field: "employee" },
//     { field: "date" },
//     { field: "from_date", headerName: "From Date" },
//     { field: "to_date", headerName: "To Date" },
//     { field: "attachment" },
//     { field: "comments", headerName: "Justification" },
//   ]);
//   const [open, on_open_change] = useState<boolean>(false)
//   const [filter_open, filter_on_open_change] = useState<boolean>(false)
//   const [CurrentPage, SetCurrentPage] = useState<number>(1)
//   const [SortField, SetSortField] = useState<string>("")
//   const [SortDirection, SetSortDirection] = useState<string>("asc")
//   const [SearchValue, SetSearchValue] = useState<string>("")
//   const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
//   const [toDate, setToDate] = useState<Date | undefined>(undefined);
//   const [selectedOption, setSelectedOption] = useState<string>("");

//   const options = [
//     { value: "option1", label: "All" },
//     { value: "option2", label: "Pending manger" },
//     { value: "option3", label: "Pending HR" },
//     { value: "option4", label: "Approved" },
//     { value: "option5", label: "Rejected" },
//     { value: "option6", label: "Cancelled" },
//   ];

//    const props = {
//     Data,
//     SetData,
//     Columns,
//     filter_open,
//     filter_on_open_change,
//     SortField,
//     CurrentPage,
//     SetCurrentPage,
//     SetSortField,
//     SortDirection,
//     SetSortDirection,
//     SearchValue,
//     SetSearchValue,
//     open,
//     on_open_change,
//   }

//   return (
//     <div className="flex flex-col gap-4">
//       <PowerHeader 
//         props={props} 
//         disableAdd
//         items={modules?.selfServices?.items}
//         isAddNewPagePath="/self-services/leaves/requests/add"
//       />
//       {/* Filters */}
//       {/* <div className="grid grid-cols-3 gap-4">
//         <div>
//           <Select onValueChange={setSelectedOption} value={selectedOption}>
//             <SelectTrigger className="bg-accent border-grey">
//               <Label className="font-normal text-secondary">
//                 Status :
//               </Label>
//               <SelectValue placeholder="Choose status"/>
//             </SelectTrigger>
//             <SelectContent>
//               {options.map((option) => (
//                 <SelectItem key={option.value} value={option.value}>
//                   {option.label}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//         <div>
//           <Popover>
//             <PopoverTrigger asChild>
//               <Button size={"lg"} variant={"outline"}
//                 className="w-full bg-accent px-4 flex justify-between border-grey"
//               >
//                 <p>
//                   <Label className="font-normal text-secondary">
//                     From Date :
//                   </Label>
//                   <span className="px-1 text-sm text-text-primary"> {fromDate ? format(fromDate, "dd/MM/yy") : "Choose date"}</span>
//                 </p>
//                 <CalendarIcon />
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-auto p-0" align="start">
//               <Calendar
//                 mode="single"
//                 selected={fromDate}
//                 onSelect={setFromDate}
//               />
//             </PopoverContent>
//           </Popover>
//         </div>
//         <div>
//           <Popover>
//           <PopoverTrigger asChild>
//               <Button size={"lg"} variant={"outline"}
//                 className="w-full bg-accent px-4 flex justify-between border-grey"
//               >
//                 <p>
//                   <Label className="font-normal text-secondary">
//                     To Date :
//                   </Label>
//                   <span className="px-1 text-sm text-text-primary"> {toDate ? format(toDate, "dd/MM/yy") : "Choose date"}</span>
//                 </p>
//                 <CalendarIcon />
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-auto p-0" align="start">
//               <Calendar mode="single" selected={toDate} onSelect={setToDate} />
//             </PopoverContent>
//           </Popover>
//         </div>
//       </div> */}
//       <div className="bg-accent rounded-2xl">
//         <div className="col-span-2 p-6">
//           <h1 className="font-bold text-xl text-primary">Leave Application</h1>
//           {/* <h1 className="font-semibold text-sm text-text-secondary">
//             Leave applications can be viewed in this tab
//           </h1> */}
//         </div>
//         <div className="px-6">
//           <PowerTabs items={modules?.selfServices?.leaves?.items} />
//         </div>
//         <PowerTable props={props} api={"/self-services/manage-leaves/application"} />
//       </div>
//     </div>
//   );
// }


"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import PowerTabs from "@/components/custom/power-comps/power-tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "@/icons/icons";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/lib/useFetchAllEntity";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function Page() {
  const router = useRouter();
  const { modules, language } = useLanguage();
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
        { field: "leave_type_name", headerName: language === "ar" ? "نوع الإذن" : "Leave Type" },
        { field: "employee_name", headerName: language === "ar" ? "الموظف" : "Employee" },
        { field: "from_date", headerName: language === "ar" ? "من الوقت" : "From Date" },
        { field: "to_date", headerName: language === "ar" ? "إلى الوقت" : "To Date" },
        { field: "employee_remarks", headerName: language === "ar" ? "المبرر" : "Justification" },
      ]);
    }, [language]);

  // Fetch related data for displaying names
  const { data: employeeLeaveData, isLoading } = useFetchAllEntity("employeeLeave");
  const { data: leaveTypesData, isLoading: isLoadingLeaveTypes } = useFetchAllEntity("leaveType");
  const { data: employeesData, isLoading: isLoadingEmployees } = useFetchAllEntity("employee");

  // Helper function to get leave type name based on language
  const getLeaveTypeName = (leaveTypeId: number, leaveTypesData: any) => {
    const leaveType = leaveTypesData?.data?.find(
      (pt: any) => pt.leave_type_id === leaveTypeId
    );
    
    if (!leaveType) {
      return `ID: ${leaveTypeId}`;
    }
    
    // Return name based on selected language
    return language === "ar" 
      ? leaveType.leave_type_arb || leaveType.leave_type_eng || `ID: ${leaveTypeId}`
      : leaveType.leave_type_eng || leaveType.leave_type_arb || `ID: ${leaveTypeId}`;
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
    if (Array.isArray(employeeLeaveData?.data)) {
      return employeeLeaveData.data
        .filter((leaveReqs: any) => {
          // Filter by status if selected
          if (selectedOption && selectedOption !== "all") {
            return leaveReqs.approve_reject_flag?.toString() === selectedOption;
          }
          return true;
        })
        .filter((leaveReqs: any) => {
          // Filter by date range if selected
          if (fromDate || toDate) {
            const permDate = new Date(leaveReqs.from_time);
            if (fromDate && permDate < fromDate) return false;
            if (toDate && permDate > toDate) return false;
          }
          return true;
        })
        .map((leaveReqs: any) => {
          return {
            ...leaveReqs,
            id: leaveReqs.employee_leave_id,
            leave_type_name: getLeaveTypeName(leaveReqs.leave_type_id, leaveTypesData),
            employee_name: getEmployeeName(leaveReqs.employee_id, employeesData),
            from_date: new Date(leaveReqs.from_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            to_date: new Date(leaveReqs.to_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
          };
        });
    }
    return [];
  }, [employeeLeaveData, leaveTypesData, employeesData, selectedOption, fromDate, toDate, language]);

  const props = {
    Data: data,
    Columns: columns,
    selectedRows,
    setSelectedRows,
    isLoading: isLoading || isLoadingLeaveTypes || isLoadingEmployees,
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
    queryClient.invalidateQueries({ queryKey: ["employeeLeave"] });
    queryClient.invalidateQueries({ queryKey: ["leaveType"] });
    queryClient.invalidateQueries({ queryKey: ["employee"] });
  };
 
  const handleEditClick = (rowData: any) => {
    try {
      const editData = {
        ...rowData,
      };
      
      sessionStorage.setItem('editLeaveRequestData', JSON.stringify(editData));
      
      // Navigate to the add page (which will handle edit mode)
      router.push("/self-services/leaves/requests/add");
    } catch (error) {
      console.error("Error setting edit data:", error);
      toast.error("Failed to load leave data for editing");
    }
  };
 
  const handleRowSelection = useCallback((rows: any[]) => {
    setSelectedRows(rows);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        disableAdd
        selectedRows={selectedRows}
        items={modules?.selfServices.items}
        entityName="employeeLeave"
        isAddNewPagePath="/self-services/leaves/manage/add"
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
            {language === "ar" ? "إدارة الأذونات" : "Manage Leaves"}
          </h1>
        </div>
        <div className="px-6">
          <PowerTabs items={modules?.selfServices?.leaves?.items} />
        </div>
        <PowerTable
          props={props}
          showEdit={false}
          onEditClick={handleEditClick}
          onRowSelection={handleRowSelection}
          isLoading={isLoading || isLoadingLeaveTypes || isLoadingEmployees}
        />
      </div>
    </div>
  );
}