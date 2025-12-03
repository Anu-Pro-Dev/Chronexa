"use client";
import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { debounce } from "lodash";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Calendar } from "@/src/components/ui/calendar";
import { searchEmployees, apiRequest } from "@/src/lib/apiHandler";
import { toast } from "react-hot-toast";
import { PDFExporter } from './PDFExporter';
import { ExcelExporter } from './ExcelExporter';
import { CSVExporter } from './CSVExporter';
import { DeleteIcon, CalendarIcon, ExportExcelIcon, LoginIcon } from "@/src/icons/icons";
import { FileText, Trash2Icon, TrashIcon } from "lucide-react";

const formSchema = z.object({
  vertical: z.string().optional(),
  company: z.string().optional(),
  department: z.string().optional(),
  employee_type: z.string().optional(),
  manager_id: z.string().optional(),
  employee: z.string().optional(),
  from_date: z.date().optional(),
  to_date: z.date().optional(),
});

export default function EmployeeReports() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const [popoverStates, setPopoverStates] = useState({
    fromDate: false,
    toDate: false,
  });
  
  const [loading, setLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportType, setExportType] = useState<'excel' | 'pdf' | 'csv' | null>(null);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [managerSearchTerm, setManagerSearchTerm] = useState("");

  const closePopover = (key: string) => {
    setPopoverStates(prev => ({ ...prev, [key]: false }));
  };

  const { data: organizations } = useFetchAllEntity("organization", { 
    searchParams: { limit: "1000" }
  });
  
  const selectedVertical = form.watch("vertical");
  const selectedCompany = form.watch("company");
  const selectedDepartment = form.watch("department");
  const selectedEmployeeType = form.watch("employee_type");
  const selectedManagerId = form.watch("manager_id");
  
  const { data: departmentsByOrg, isLoading: isDepartmentsLoading } = useQuery({
    queryKey: ["departmentsByOrg", selectedCompany],
    queryFn: async () => {
      if (!selectedCompany) return null;
      const response = await apiRequest(`/dept-org-mapping/by-organization/${selectedCompany}`, "GET");
      return response;
    },
    enabled: !!selectedCompany,
  });
  
  const { data: managers } = useFetchAllEntity("employee", {
    searchParams: { 
      manager_flag: "true", 
      limit: "1000",
      offset: "1"
    }
  });

  const getEmployeeSearchParams = () => {
    const params: any = {
      limit: "1000",
      offset: "1"
    };
    if (selectedDepartment) {
      params.department_id = selectedDepartment;
    }
    if (selectedManagerId) {
      params.manager_id = selectedManagerId;
    }
    return { searchParams: params };
  };

  const { data: employees } = useFetchAllEntity(
    "employee",
    (selectedDepartment || selectedManagerId) ? getEmployeeSearchParams() : {
      searchParams: {
        limit: "1000",
        offset: "1"
      }
    }
  );

  const { data: employeeTypes } = useFetchAllEntity("employeeType", { removeAll: true });

  const debouncedEmployeeSearch = useCallback(
    debounce((searchTerm: string) => {
      setEmployeeSearchTerm(searchTerm);
    }, 300),
    []
  );

  const debouncedManagerSearch = useCallback(
    debounce((searchTerm: string) => {
      setManagerSearchTerm(searchTerm);
    }, 300),
    []
  );

  const { data: searchedEmployees, isLoading: isSearchingEmployees } = useQuery({
    queryKey: ["employeeSearch", employeeSearchTerm],
    queryFn: () => searchEmployees(employeeSearchTerm),
    enabled: employeeSearchTerm.length > 0,
  });

  const { data: searchedManagers, isLoading: isSearchingManagers } = useQuery({
    queryKey: ["managerSearch", managerSearchTerm],
    queryFn: async () => {
      const response = await apiRequest(
        `/employee/search?search=${encodeURIComponent(managerSearchTerm)}&manager_flag=true`,
        "GET"
      );
      return response;
    },
    enabled: managerSearchTerm.length > 0,
  });

  const getVerticalData = () => {
    if (!organizations?.data) return [];
    const parentMap = new Map();
    organizations.data.forEach((item: any) => {
      if (item.organizations) {
        parentMap.set(item.organizations.organization_id, {
          organization_id: item.organizations.organization_id,
          organization_eng: item.organizations.organization_eng,
          organization_arb: item.organizations.organization_arb,
        });
      }
    });
    return Array.from(parentMap.values());
  };

  const getCompanyData = () => {
    if (!organizations?.data || !selectedVertical) return [];
    return organizations.data.filter(
      (item: any) => String(item.parent_id) === selectedVertical
    );
  };

  const getDepartmentData = () => {
    if (!departmentsByOrg?.data || !selectedCompany) return [];
    
    const departmentsMap = new Map();
    const mappings = Array.isArray(departmentsByOrg.data) 
      ? departmentsByOrg.data 
      : [departmentsByOrg.data];
    
    mappings.forEach((mapping: any) => {
      if (mapping.departments && mapping.departments.department_id && mapping.is_active) {
        departmentsMap.set(mapping.departments.department_id, {
          department_id: mapping.departments.department_id,
          department_code: mapping.departments.department_code,
          department_name_eng: mapping.departments.department_name_eng,
          department_name_arb: mapping.departments.department_name_arb,
        });
      }
    });
    
    return Array.from(departmentsMap.values());
  };

  const getEmployeeTypesData = () => {
    if (!employeeTypes?.data) return [];
    return employeeTypes.data.filter((item: any) => item.employee_type_id);
  };

  const getManagerData = () => {
  // When searching, use search results directly
  if (managerSearchTerm.length > 0) {
    const searchData = searchedManagers?.data || [];
    return searchData.filter((item: any) => 
      item.employee_id && 
      item.employee_id.toString().trim() !== ''
    );
  }
  
  // When not searching, use the managers list with manager_flag filter
  const baseData = managers?.data || [];
  return baseData.filter((item: any) => 
    item.employee_id && 
    item.employee_id.toString().trim() !== '' &&
    item.manager_flag === true
  );
};


  const getFilteredEmployees = () => {
    const baseData = employeeSearchTerm.length > 0 
      ? searchedEmployees?.data || []
      : employees?.data || [];
    
    return baseData.filter((item: any) => 
      item.employee_id && item.employee_id.toString().trim() !== ''
    );
  };

  const headerMap: Record<string, string> = {
    employee_number: "EmpNo",
    firstname_eng: "EmployeeName",
    parent_org_eng: "ParentOrganization",
    organization_eng: "Organization",
    department_name_eng: "Department",
    employee_type: "EmployeeType",
    WorkDate: "WorkDate",
    WorkDay: "WorkDay",
    punch_in: "PunchIn",
    geolocation_in: "GeoLocationIn",
    punch_out: "PunchOut",
    geolocation_out: "GeoLocationOut",
    dailyworkhrs: "DailyWorkedHours",
    DailyMissedHrs: "DailyMissedHours",
    dailyextrawork: "DailyExtraWork",
    isabsent: "DayStatus",
    MissedPunch: "Missed Punch",
    EmployeeStatus: "EmployeeStatus"
  };

  const calculateSummaryTotals = (dataArray: any[]) => {
    const parseTimeToMinutes = (value: any) => {
      if (!value) return 0;
      
      const strValue = String(value).trim();
      
      if (strValue.includes(':')) {
        const parts = strValue.split(':').map(Number);
        const hours = parts[0] || 0;
        const minutes = parts[1] || 0;
        const seconds = parts[2] || 0;
        return hours * 60 + minutes + (seconds / 60);
      }
      
      const hours = parseFloat(strValue) || 0;
      return hours * 60;
    };

    const totals = {
      totalLateInMinutes: 0,
      totalWorkedMinutes: 0,
      totalEarlyOutMinutes: 0,
      totalMissedMinutes: 0,
      totalExtraMinutes: 0,
    };

    dataArray.forEach((row: any) => {
      totals.totalLateInMinutes += parseTimeToMinutes(row.late);
      totals.totalWorkedMinutes += parseTimeToMinutes(row.dailyworkhrs);
      totals.totalEarlyOutMinutes += parseTimeToMinutes(row.early);
      totals.totalMissedMinutes += parseTimeToMinutes(row.DailyMissedHrs);
      totals.totalExtraMinutes += parseTimeToMinutes(row.dailyextrawork);
    });

    const formatMinutesToHHMM = (totalMinutes: number) => {
      const hours = Math.floor(Math.abs(totalMinutes) / 60);
      const minutes = Math.round(Math.abs(totalMinutes) % 60);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    return {
      totalLateInHours: formatMinutesToHHMM(totals.totalLateInMinutes),
      totalWorkedHours: formatMinutesToHHMM(totals.totalWorkedMinutes),
      totalEarlyOutHours: formatMinutesToHHMM(totals.totalEarlyOutMinutes),
      totalMissedHours: formatMinutesToHHMM(totals.totalMissedMinutes),
      totalExtraHours: formatMinutesToHHMM(totals.totalExtraMinutes),
      totalAbsents: "00:00",
    };
  };

  const handleExportCSV = async () => {
    setLoading(true);
    setExportProgress(0);
    setExportType('csv');
    
    try {
      const exporter = new CSVExporter({
        formValues: form.getValues(),
        headerMap,
        calculateSummaryTotals,
        onProgress: setExportProgress,
      });
      
      await exporter.exportStreaming();
      
    } catch (error) {
      console.error("CSV export error:", error);
      toast.error("Error exporting CSV. Please try again.");
    } finally {
      setTimeout(() => {
        setLoading(false);
        setExportProgress(0);
        setExportType(null);
      }, 500);
    }
  };

  const handleExportExcel = async () => {
    setLoading(true);
    setExportProgress(0);
    setExportType('excel');
    
    try {
      const exporter = new ExcelExporter({
        formValues: form.getValues(),
        headerMap,
        calculateSummaryTotals,
        onProgress: setExportProgress,
      });
      
      await exporter.export();
      
    } catch (error) {
      console.error("Excel export error:", error);
      toast.error("Error exporting Excel. Please try again.");
    } finally {
      setTimeout(() => {
        setLoading(false);
        setExportProgress(0);
        setExportType(null);
      }, 500);
    }
  };

  const handleShowReport = async () => {
    setLoading(true);
    setExportProgress(0);
    setExportType('pdf');
    
    try {
      const exporter = new PDFExporter({
        formValues: form.getValues(),
        headerMap,
        calculateSummaryTotals,
        logoUrl: '/Logo.png',
        onProgress: setExportProgress,
      });
      
      await exporter.export();
      
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Error generating PDF. Please try again.");
    } finally {
      setTimeout(() => {
        setLoading(false);
        setExportProgress(0);
        setExportType(null);
      }, 500);
    }
  };

  useEffect(() => {
    return () => {
      debouncedEmployeeSearch.cancel();
      debouncedManagerSearch.cancel();
    };
  }, [debouncedEmployeeSearch, debouncedManagerSearch]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    return;
  }

  const getProgressMessage = () => {
    if (exportProgress < 45) return 'Fetching data from server...';
    if (exportType === 'csv') return 'Generating CSV file...';
    if (exportType === 'excel') return 'Generating Excel file...';
    if (exportType === 'pdf') return 'Generating PDF file...';
    return 'Processing...';
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="bg-accent p-6 rounded-2xl">
          <div className="flex flex-col gap-6">
            <div className="p-5 flex flex-col">
              <div className="grid grid-cols-2 gap-y-5 gap-10 px-8 pb-5">
                {/* VERTICAL */}
                <FormField
                  control={form.control}
                  name="vertical"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex gap-1">Vertical</FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          form.setValue("company", undefined);
                          form.setValue("department", undefined);
                          form.setValue("manager_id", undefined);
                          form.setValue("employee", undefined);
                        }}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full max-w-[350px]">
                            <SelectValue placeholder="Choose vertical" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="mt-5 w-full max-w-[350px]">
                          {getVerticalData().map((item: any) => (
                            <SelectItem key={item.organization_id} value={item.organization_id.toString()}>
                              {item.organization_eng}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* COMPANY */}
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex gap-1">Company</FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          form.setValue("department", undefined);
                          form.setValue("manager_id", undefined);
                          form.setValue("employee", undefined);
                        }}
                        value={field.value || ""}
                        disabled={!selectedVertical}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full max-w-[350px]">
                            <SelectValue placeholder="Choose company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="mt-5 w-full max-w-[350px]">
                          {getCompanyData().map((item: any) => (
                            <SelectItem key={item.organization_id} value={item.organization_id.toString()}>
                              {item.organization_eng}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* DEPARTMENT */}
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex gap-1">Department</FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          form.setValue("manager_id", undefined);
                          form.setValue("employee", undefined);
                        }}
                        value={field.value || ""}
                        disabled={!selectedCompany || isDepartmentsLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full max-w-[350px]">
                            <SelectValue placeholder={
                              isDepartmentsLoading 
                                ? "Loading departments..." 
                                : "Choose department"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="mt-5 w-full max-w-[350px]">
                          {getDepartmentData().map((item: any) => (
                            <SelectItem key={item.department_id} value={item.department_id.toString()}>
                              {item.department_name_eng || item.department_code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* EMPLOYEE TYPE */}
                <FormField
                  control={form.control}
                  name="employee_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex gap-1">Employee Type</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(val)}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full max-w-[350px]">
                            <SelectValue placeholder="Choose type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="mt-5 w-full max-w-[350px]">
                          {getEmployeeTypesData().map((item: any) => (
                            <SelectItem key={item.employee_type_id} value={item.employee_type_id.toString()}>
                              {item.employee_type_eng}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* MANAGER */}
                <FormField
                  control={form.control}
                  name="manager_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex gap-1">Manager</FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          form.setValue("employee", undefined);
                        }}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full max-w-[350px]">
                            <SelectValue placeholder="Choose manager" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent
                          showSearch={true}
                          searchPlaceholder="Search managers..."
                          onSearchChange={debouncedManagerSearch}
                          className="mt-5 w-full max-w-[350px]"
                        >
                          {isSearchingManagers && managerSearchTerm.length > 0 && (
                            <div className="p-3 text-sm text-text-secondary">
                              Searching...
                            </div>
                          )}
                          {getManagerData().length === 0 && managerSearchTerm.length > 0 && !isSearchingManagers && (
                            <div className="p-3 text-sm text-text-secondary">
                              No managers found
                            </div>
                          )}
                          {getManagerData().map((item: any) => (
                            <SelectItem key={item.employee_id} value={item.employee_id.toString()}>
                              {item.firstname_eng} {item.lastname_eng ? item.lastname_eng : ''} {item.emp_no ? `(${item.emp_no})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* EMPLOYEE */}
                <FormField
                  control={form.control}
                  name="employee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex gap-1">Employee</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(val)}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full max-w-[350px]">
                            <SelectValue placeholder="Choose employee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent
                          showSearch={true}
                          searchPlaceholder="Search employees..."
                          onSearchChange={debouncedEmployeeSearch}
                          className="mt-5 w-full max-w-[350px]"
                        >
                          {isSearchingEmployees && employeeSearchTerm.length > 0 && (
                            <div className="p-3 text-sm text-text-secondary">
                              Searching...
                            </div>
                          )}
                          {getFilteredEmployees().length === 0 && employeeSearchTerm.length > 0 && !isSearchingEmployees && (
                            <div className="p-3 text-sm text-text-secondary">
                              No employees found
                            </div>
                          )}
                          {getFilteredEmployees().map((item: any) => (
                            <SelectItem key={item.employee_id} value={item.employee_id.toString()}>
                              {item.firstname_eng} {item.emp_no ? `(${item.emp_no})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* FROM DATE */}
                <FormField
                  control={form.control}
                  name="from_date"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel>From Date</FormLabel>
                      <Popover open={popoverStates.fromDate} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, fromDate: open }))}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button size={"lg"} variant={"outline"}
                              className="w-full bg-accent px-3 flex justify-between text-text-primary max-w-[350px] text-sm font-normal"
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yy")
                              ) : (
                                <span className="font-normal text-sm text-text-secondary">Choose date</span>
                              )}
                              <CalendarIcon />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date)
                              closePopover('fromDate')
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* TO DATE */}
                <FormField
                  control={form.control}
                  name="to_date"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel>To Date</FormLabel>
                      <Popover open={popoverStates.toDate} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, toDate: open }))}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button size={"lg"} variant={"outline"}
                              className="w-full bg-accent px-3 flex justify-between text-text-primary max-w-[350px] text-sm font-normal"
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yy")
                              ) : (
                                <span className="font-normal text-sm text-text-secondary">Choose date</span>
                              )}
                              <CalendarIcon />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date)
                              closePopover('toDate')
                            }}
                            disabled={(date) => date > new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Progress Bar */}
            {loading && exportProgress > 0 && (
              <div className="px-8 pb-2">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">
                      {getProgressMessage()}
                    </span>
                    <span className="text-sm font-bold text-blue-900">
                      {exportProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${exportProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-blue-700 mt-2">
                    {exportType === 'csv' && 'CSV exports are fastest for large datasets'}
                    {exportType === 'excel' && 'Processing large dataset... Please wait'}
                    {exportType === 'pdf' && 'Generating PDF... This may take a moment'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-center gap-2 items-center pb-5">
              <div className="flex gap-4 px-5">
                <Button
                  type="button"
                  size={"sm"}
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => form.reset()}
                >
                  <Trash2Icon />
                  Clear Filters
                </Button>
                
                <Button
                  type="button"
                  size={"sm"}
                  className="flex items-center gap-2 bg-[#B11C20] hover:bg-[#e41c23]"
                  onClick={handleShowReport}
                  disabled={loading}
                >
                  <LoginIcon />
                  {loading && exportType === 'pdf' ? `${exportProgress}%` : "Show PDF"}
                </Button>
                
                <Button
                  type="button"
                  size={"sm"}
                  className="flex items-center gap-2 bg-[#0073C6]"
                  onClick={handleExportCSV}
                  disabled={loading}
                >
                  <FileText className="w-4 h-4" />
                  {loading && exportType === 'csv' ? `${exportProgress}%` : "Export CSV"}
                </Button>
                
                <Button
                  type="button"
                  variant={"success"}
                  size={"sm"}
                  className="flex items-center gap-2 bg-[#21A366]"
                  onClick={handleExportExcel}
                  disabled={loading}
                >
                  <ExportExcelIcon />
                  {loading && exportType === 'excel' ? `${exportProgress}%` : "Export Excel"}
                </Button>
              </div>
            </div>

            <div className="px-8 pb-2">
              <div className="border border-blue-200 rounded-md px-3 py-2 font-semibold bg-blue-400 bg-opacity-10">
                <p className="text-xs text-primary">
                  <strong>💡 Tip:</strong> For datasets over 5,000 records, use <strong>CSV export</strong> for best performance. 
                  Excel export works great for up to 20,000 records. PDF shows last 1,000 records for large datasets.
                </p>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}