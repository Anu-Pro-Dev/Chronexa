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
import { CSVExporterFGIC } from './CSVExporterFGIC';
import { CalendarIcon, LoginIcon } from "@/src/icons/icons";
import { FileText, Trash2Icon } from "lucide-react";
import Required from "@/src/components/ui/required";

const formSchema = z.object({
  company: z.string().optional(),
  division: z.string().optional(),
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
  
  // Search terms for all dropdowns
  const [companySearchTerm, setCompanySearchTerm] = useState("");
  const [divisionSearchTerm, setDivisionSearchTerm] = useState("");
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState("");
  const [employeeTypeSearchTerm, setEmployeeTypeSearchTerm] = useState("");
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [managerSearchTerm, setManagerSearchTerm] = useState("");
  
  const [progressDetails, setProgressDetails] = useState({
    current: 0,
    total: 0,
    phase: 'initializing' as 'initializing' | 'fetching' | 'processing' | 'generating' | 'complete'
  });

  const closePopover = (key: string) => {
    setPopoverStates(prev => ({ ...prev, [key]: false }));
  };

  // Fetch all organizations
  const { data: allOrganizations } = useFetchAllEntity("organization", { 
    searchParams: { limit: "1000" }
  });
  
  const selectedCompany = form.watch("company");
  const selectedDivision = form.watch("division");
  const selectedDepartment = form.watch("department");
  const selectedEmployeeType = form.watch("employee_type");
  const selectedManagerId = form.watch("manager_id");
  
  // Fetch divisions/business groups (children of selected company)
  const { data: divisions } = useQuery({
    queryKey: ["divisions", selectedCompany],
    queryFn: async () => {
      if (!selectedCompany) return null;
      return allOrganizations?.data?.filter((org: any) => 
        org.parent_id === parseInt(selectedCompany)
      );
    },
    enabled: !!selectedCompany && !!allOrganizations?.data,
  });

  // Fetch departments for selected division
  const { data: departmentsByOrg, isLoading: isDepartmentsLoading } = useQuery({
    queryKey: ["departmentsByOrg", selectedDivision],
    queryFn: async () => {
      if (!selectedDivision) return null;
      const response = await apiRequest(`/dept-org-mapping/by-organization/${selectedDivision}`, "GET");
      return response;
    },
    enabled: !!selectedDivision,
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

  // Debounced search functions
  const debouncedCompanySearch = useCallback(
    debounce((searchTerm: string) => {
      setCompanySearchTerm(searchTerm);
    }, 300),
    []
  );

  const debouncedDivisionSearch = useCallback(
    debounce((searchTerm: string) => {
      setDivisionSearchTerm(searchTerm);
    }, 300),
    []
  );

  const debouncedDepartmentSearch = useCallback(
    debounce((searchTerm: string) => {
      setDepartmentSearchTerm(searchTerm);
    }, 300),
    []
  );

  const debouncedEmployeeTypeSearch = useCallback(
    debounce((searchTerm: string) => {
      setEmployeeTypeSearchTerm(searchTerm);
    }, 300),
    []
  );

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

  const getCompanyData = () => {
    if (!allOrganizations?.data || !Array.isArray(allOrganizations.data)) return [];
    const companies = allOrganizations.data.filter((item: any) => 
      item?.parent_id === 1 && 
      item?.organization_id && 
      item.organization_id.toString().trim() !== ''
    );
    
    // Apply search filter
    if (companySearchTerm) {
      return companies.filter((item: any) => 
        item?.organization_eng?.toLowerCase().includes(companySearchTerm.toLowerCase())
      );
    }
    return companies;
  };

  const getDivisionData = () => {
    if (!allOrganizations?.data || !Array.isArray(allOrganizations.data) || !selectedCompany) return [];
    const companyId = parseInt(selectedCompany);
    const divisions = allOrganizations.data.filter((item: any) => 
      item?.parent_id === companyId && 
      item?.organization_id && 
      item.organization_id.toString().trim() !== ''
    );
    
    // Apply search filter
    if (divisionSearchTerm) {
      return divisions.filter((item: any) => 
        item?.organization_eng?.toLowerCase().includes(divisionSearchTerm.toLowerCase())
      );
    }
    return divisions;
  };

  const getDepartmentData = () => {
    if (!allOrganizations?.data || !Array.isArray(allOrganizations.data) || !selectedDivision) return [];
    const divisionId = parseInt(selectedDivision);
    const departments = allOrganizations.data.filter((item: any) => 
      item?.parent_id === divisionId && 
      item?.organization_id && 
      item.organization_id.toString().trim() !== ''
    );
    
    // Apply search filter
    if (departmentSearchTerm) {
      return departments.filter((item: any) => 
        item?.organization_eng?.toLowerCase().includes(departmentSearchTerm.toLowerCase())
      );
    }
    return departments;
  };

  const getEmployeeTypesData = () => {
    if (!employeeTypes?.data) return [];
    const types = employeeTypes.data.filter((item: any) => item.employee_type_id);
    
    // Apply search filter
    if (employeeTypeSearchTerm) {
      return types.filter((item: any) => 
        item?.employee_type_eng?.toLowerCase().includes(employeeTypeSearchTerm.toLowerCase())
      );
    }
    return types;
  };

  const getManagerData = () => {
    if (managerSearchTerm.length > 0) {
      const searchData = searchedManagers?.data || [];
      return searchData.filter((item: any) => 
        item?.employee_id && 
        item.employee_id.toString().trim() !== ''
      );
    }
    
    const baseData = managers?.data || [];
    return baseData.filter((item: any) => 
      item?.employee_id && 
      item.employee_id.toString().trim() !== '' &&
      item?.manager_flag === true
    );
  };

  const getFilteredEmployees = () => {
    let baseData = [];
    
    if (employeeSearchTerm.length > 0) {
      baseData = searchedEmployees?.data || [];
    } else if (selectedManagerId) {
      baseData = employees?.data || [];
    } else if (selectedDepartment) {
      baseData = employees?.data || [];
    } else {
      baseData = employees?.data || [];
    }
    
    return baseData.filter((item: any) => 
      item?.employee_id && item.employee_id.toString().trim() !== ''
    );
  };

  const headerMap: Record<string, string> = {
    employee_number: "EmpNo",
    firstname_eng: "EmployeeName",
    parent_org_eng: "Company",
    organization_eng: "Division",
    department_name_eng: "Department",
    employee_type: "EmployeeType",
    transdate: "transdate",
    punch_in: "PunchIn",
    GeoLocation_In: "GeoLocationIn",
    punch_out: "PunchOut",
    GeoLocation_Out: "GeoLocationOut",
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

  const handleProgressUpdate = (current: number, total: number, phase: string) => {
    setProgressDetails({ 
      current, 
      total, 
      phase: phase as 'initializing' | 'fetching' | 'processing' | 'generating' | 'complete'
    });
    
    let percentage = 0;
    
    if (phase === 'initializing') {
      percentage = 0;
    } else if (phase === 'fetching') {
      if (total > 0) {
        percentage = Math.min(Math.round((current / total) * 70), 70);
      }
    } else if (phase === 'processing') {
      percentage = 85;
    } else if (phase === 'generating') {
      percentage = 95;
    } else if (phase === 'complete') {
      percentage = 100;
    }
    
    setExportProgress(percentage);
  };

  const handleExportCSV = async () => {
    setLoading(true);
    setExportProgress(0);
    setExportType('csv');
    setProgressDetails({ current: 0, total: 0, phase: 'initializing' });
    
    try {
      const exporter = new CSVExporterFGIC({
        formValues: form.getValues(),
        headerMap,
        calculateSummaryTotals,
        onProgress: handleProgressUpdate,
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
        setProgressDetails({ current: 0, total: 0, phase: 'initializing' });
      }, 500);
    }
  };

  const handleExportExcel = async () => {
    setLoading(true);
    setExportProgress(0);
    setExportType('excel');
    setProgressDetails({ current: 0, total: 0, phase: 'initializing' });
    
    try {
      const exporter = new ExcelExporter({
        formValues: form.getValues(),
        headerMap,
        calculateSummaryTotals,
        onProgress: handleProgressUpdate,
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
        setProgressDetails({ current: 0, total: 0, phase: 'initializing' });
      }, 500);
    }
  };

  const handleShowReport = async () => {
    setLoading(true);
    setExportProgress(0);
    setExportType('pdf');
    setProgressDetails({ current: 0, total: 0, phase: 'initializing' });
    
    try {
      const exporter = new PDFExporter({
        formValues: form.getValues(),
        headerMap,
        calculateSummaryTotals,
        logoUrl: '/Logo.png',
        onProgress: handleProgressUpdate,
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
        setProgressDetails({ current: 0, total: 0, phase: 'initializing' });
      }, 500);
    }
  };

  useEffect(() => {
    return () => {
      debouncedCompanySearch.cancel();
      debouncedDivisionSearch.cancel();
      debouncedDepartmentSearch.cancel();
      debouncedEmployeeTypeSearch.cancel();
      debouncedEmployeeSearch.cancel();
      debouncedManagerSearch.cancel();
    };
  }, [debouncedCompanySearch, debouncedDivisionSearch, debouncedDepartmentSearch, debouncedEmployeeTypeSearch, debouncedEmployeeSearch, debouncedManagerSearch]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    return;
  }

  const getProgressMessage = () => {
    const { current, total, phase } = progressDetails;
    
    switch (phase) {
      case 'initializing':
        return 'Initializing export...';
      case 'fetching':
        if (total > 0) {
          return `Fetching data from server... (${current.toLocaleString()} of ${total.toLocaleString()} records)`;
        }
        return 'Fetching data from server...';
      case 'processing':
        return `Processing ${total.toLocaleString()} records...`;
      case 'generating':
        if (exportType === 'csv') return 'Generating CSV file...';
        if (exportType === 'excel') return 'Generating Excel file...';
        if (exportType === 'pdf') return 'Generating PDF file...';
        return 'Generating file...';
      case 'complete':
        return 'Export complete!';
      default:
        return 'Processing...';
    }
  };

  const getProgressTip = () => {
    const { total } = progressDetails;
    
    if (exportType === 'csv') {
      return 'CSV exports are fastest for large datasets';
    }
    if (exportType === 'excel') {
      if (total > 10000) {
        return `Processing ${total.toLocaleString()} records... This may take a moment`;
      }
      return 'Excel export includes formatting and formulas';
    }
    if (exportType === 'pdf') {
      if (total > 1000) {
        return `Large dataset detected. Showing last 1,000 records in PDF`;
      }
      return 'PDF includes charts and summary statistics';
    }
    return '';
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="bg-accent p-6 rounded-2xl">
          <div className="flex flex-col gap-6">
            <div className="p-5 flex flex-col">
              <div className="grid grid-cols-2 gap-y-5 gap-10 px-8 pb-5">
                {/* COMPANY */}
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex gap-1">Company <Required/></FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          form.setValue("division", undefined);
                          form.setValue("department", undefined);
                          form.setValue("manager_id", undefined);
                          form.setValue("employee", undefined);
                        }}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full max-w-[350px] 3xl:max-w-[450px]">
                            <SelectValue placeholder="Choose company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent 
                          showSearch={true}
                          searchPlaceholder="Search companies..."
                          onSearchChange={debouncedCompanySearch}
                          className="mt-5 w-full max-w-[350px] 3xl:max-w-[450px]"
                        >
                          {getCompanyData().length === 0 ? (
                            <div className="p-3 text-sm text-text-secondary">
                              {companySearchTerm ? "No companies found" : "No companies available"}
                            </div>
                          ) : (
                            getCompanyData().map((item: any) => (
                              <SelectItem key={item?.organization_id} value={item?.organization_id?.toString()}>
                                {item?.organization_eng || "Unnamed"}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* DIVISION / BUSINESS GROUP */}
                <FormField
                  control={form.control}
                  name="division"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex gap-1">Division / Business Group</FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          form.setValue("department", undefined);
                          form.setValue("manager_id", undefined);
                          form.setValue("employee", undefined);
                        }}
                        value={field.value || ""}
                        disabled={!selectedCompany}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full max-w-[350px] 3xl:max-w-[450px]">
                            <SelectValue placeholder="Choose division" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent 
                          showSearch={true}
                          searchPlaceholder="Search divisions..."
                          onSearchChange={debouncedDivisionSearch}
                          className="mt-5 w-full max-w-[350px] 3xl:max-w-[450px]"
                        >
                          {getDivisionData().length === 0 ? (
                            <div className="p-3 text-sm text-text-secondary">
                              {divisionSearchTerm ? "No divisions found" : "No divisions available"}
                            </div>
                          ) : (
                            getDivisionData().map((item: any) => (
                              <SelectItem key={item?.organization_id} value={item?.organization_id?.toString()}>
                                {item?.organization_eng || "Unnamed"}
                              </SelectItem>
                            ))
                          )}
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
                        disabled={!selectedDivision || isDepartmentsLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full max-w-[350px] 3xl:max-w-[450px]">
                            <SelectValue placeholder={
                              isDepartmentsLoading 
                                ? "Loading departments..." 
                                : "Choose department"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent 
                          showSearch={true}
                          searchPlaceholder="Search departments..."
                          onSearchChange={debouncedDepartmentSearch}
                          className="mt-5 w-full max-w-[350px] 3xl:max-w-[450px]"
                        >
                          {isDepartmentsLoading && (
                            <div className="p-3 text-sm text-text-secondary">Loading departments...</div>
                          )}
                          {!isDepartmentsLoading && getDepartmentData().length === 0 && (
                            <div className="p-3 text-sm text-text-secondary">
                              {departmentSearchTerm ? "No departments found" : "No departments available"}
                            </div>
                          )}
                          {!isDepartmentsLoading && getDepartmentData().map((item: any) => (
                            <SelectItem key={item?.organization_id} value={item?.organization_id?.toString()}>
                              {item?.organization_eng || "Unnamed"}
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
                          <SelectTrigger className="w-full max-w-[350px] 3xl:max-w-[450px]">
                            <SelectValue placeholder="Choose type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent 
                          showSearch={true}
                          searchPlaceholder="Search employee types..."
                          onSearchChange={debouncedEmployeeTypeSearch}
                          className="mt-5 w-full max-w-[350px] 3xl:max-w-[450px]"
                        >
                          {getEmployeeTypesData().length === 0 ? (
                            <div className="p-3 text-sm text-text-secondary">
                              {employeeTypeSearchTerm ? "No employee types found" : "No employee types available"}
                            </div>
                          ) : (
                            getEmployeeTypesData().map((item: any) => (
                              <SelectItem key={item?.employee_type_id} value={item?.employee_type_eng || item?.employee_type_id?.toString()}>
                                {item?.employee_type_eng || "Unnamed"}
                              </SelectItem>
                            ))
                          )}
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
                          <SelectTrigger className="w-full max-w-[350px] 3xl:max-w-[450px]">
                            <SelectValue placeholder="Choose manager" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent
                          showSearch={true}
                          searchPlaceholder="Search managers..."
                          onSearchChange={debouncedManagerSearch}
                          className="mt-5 w-full max-w-[350px] 3xl:max-w-[450px]"
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
                            <SelectItem key={item?.employee_id} value={item?.employee_id?.toString()}>
                              {item?.firstname_eng} {item?.lastname_eng ? item.lastname_eng : ''} {item?.emp_no ? `(${item.emp_no})` : ''}
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
                          <SelectTrigger className="w-full max-w-[350px] 3xl:max-w-[450px]">
                            <SelectValue placeholder="Choose employee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent
                          showSearch={true}
                          searchPlaceholder="Search employees..."
                          onSearchChange={debouncedEmployeeSearch}
                          className="mt-5 w-full max-w-[350px] 3xl:max-w-[450px]"
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
                            <SelectItem key={item?.employee_id} value={item?.employee_id?.toString()}>
                              {item?.firstname_eng} {item?.emp_no ? `(${item.emp_no})` : ''}
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
                              className="w-full bg-accent px-3 flex justify-between text-text-primary max-w-[350px] 3xl:max-w-[450px] text-sm font-normal"
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
                              className="w-full bg-accent px-3 flex justify-between text-text-primary max-w-[350px] 3xl:max-w-[450px] text-sm font-normal"
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
            {loading && exportProgress >= 0 && (
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
                    {getProgressTip()}
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
                  disabled={loading}
                >
                  <Trash2Icon />
                  Clear Filters
                </Button>
                <Button
                  type="button"
                  size={"sm"}
                  className="flex items-center gap-2 bg-[#0073C6]"
                  onClick={handleExportCSV}
                  disabled={loading}
                >
                  <FileText className="w-4 h-4" />
                  Export CSV
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}