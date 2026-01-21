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
import { useShowToast } from "@/src/utils/toastHelper";
import { useLanguage } from "@/src/providers/LanguageProvider";
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
  const { language, translations } = useLanguage();
  const t = translations?.modules?.reports || {};
  const showToast = useShowToast();

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

  const [verticalSearchTerm, setVerticalSearchTerm] = useState("");
  const [companySearchTerm, setCompanySearchTerm] = useState("");
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

  const debouncedVerticalSearch = useCallback(
    debounce((searchTerm: string) => {
      setVerticalSearchTerm(searchTerm);
    }, 300),
    []
  );

  const debouncedCompanySearch = useCallback(
    debounce((searchTerm: string) => {
      setCompanySearchTerm(searchTerm);
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

    const verticals = Array.from(parentMap.values());

    if (verticalSearchTerm) {
      return verticals.filter((item: any) =>
        item.organization_eng?.toLowerCase().includes(verticalSearchTerm.toLowerCase()) ||
        item.organization_arb?.toLowerCase().includes(verticalSearchTerm.toLowerCase())
      );
    }

    return verticals;
  };

  const getCompanyData = () => {
    if (!organizations?.data || !selectedVertical) return [];

    const companies = organizations.data.filter(
      (item: any) => String(item.parent_id) === selectedVertical
    );

    if (companySearchTerm) {
      return companies.filter((item: any) =>
        item.organization_eng?.toLowerCase().includes(companySearchTerm.toLowerCase()) ||
        item.organization_arb?.toLowerCase().includes(companySearchTerm.toLowerCase())
      );
    }

    return companies;
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

    const departments = Array.from(departmentsMap.values());

    if (departmentSearchTerm) {
      return departments.filter((item: any) =>
        item.department_name_eng?.toLowerCase().includes(departmentSearchTerm.toLowerCase()) ||
        item.department_name_arb?.toLowerCase().includes(departmentSearchTerm.toLowerCase()) ||
        item.department_code?.toLowerCase().includes(departmentSearchTerm.toLowerCase())
      );
    }

    return departments;
  };

  const getEmployeeTypesData = () => {
    if (!employeeTypes?.data) return [];

    const types = employeeTypes.data.filter((item: any) => item.employee_type_id);

    if (employeeTypeSearchTerm) {
      return types.filter((item: any) =>
        item.employee_type_eng?.toLowerCase().includes(employeeTypeSearchTerm.toLowerCase()) ||
        item.employee_type_arb?.toLowerCase().includes(employeeTypeSearchTerm.toLowerCase())
      );
    }

    return types;
  };

  const getManagerData = () => {
    if (managerSearchTerm.length > 0) {
      const searchData = searchedManagers?.data || [];
      return searchData.filter((item: any) =>
        item.employee_id &&
        item.employee_id.toString().trim() !== ''
      );
    }

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
    transdate: "transdate",
    WorkDay: "WorkDay",
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
      const exporter = new CSVExporter({
        formValues: form.getValues(),
        headerMap,
        calculateSummaryTotals,
        onProgress: handleProgressUpdate,
        showToast,
      });

      await exporter.exportStreaming();

    } catch (error) {
      console.error("CSV export error:", error);
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
        showToast,
      });

      await exporter.export();

    } catch (error) {
      console.error("Excel export error:", error);
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
        showToast,
      });

      await exporter.export();

    } catch (error) {
      console.error("PDF export error:", error);
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
      debouncedVerticalSearch.cancel();
      debouncedCompanySearch.cancel();
      debouncedDepartmentSearch.cancel();
      debouncedEmployeeTypeSearch.cancel();
      debouncedEmployeeSearch.cancel();
      debouncedManagerSearch.cancel();
    };
  }, [debouncedVerticalSearch, debouncedCompanySearch, debouncedDepartmentSearch,
    debouncedEmployeeTypeSearch, debouncedEmployeeSearch, debouncedManagerSearch]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    return;
  }

  const getProgressMessage = () => {
    const { current, total, phase } = progressDetails;

    switch (phase) {
      case 'initializing':
        return t.initializing_export || 'Initializing export...';
      case 'fetching':
        if (total > 0) {
          return `${t.fetching_data || 'Fetching data from server'}... (${current.toLocaleString()} ${t.of || 'of'} ${total.toLocaleString()} ${t.records || 'records'})`;
        }
        return `${t.fetching_data || 'Fetching data from server'}...`;
      case 'processing':
        return `${t.processing || 'Processing'} ${total.toLocaleString()} ${t.records || 'records'}...`;
      case 'generating':
        if (exportType === 'csv') return t.generating_csv || 'Generating CSV file...';
        if (exportType === 'excel') return t.generating_excel || 'Generating Excel file...';
        if (exportType === 'pdf') return t.generating_pdf || 'Generating PDF file...';
        return t.generating_file || 'Generating file...';
      case 'complete':
        return t.export_complete || 'Export complete!';
      default:
        return t.processing || 'Processing...';
    }
  };

  const getProgressTip = () => {
    const { total } = progressDetails;

    if (exportType === 'csv') {
      return t.csv_fastest || 'CSV exports are fastest for large datasets';
    }
    if (exportType === 'excel') {
      if (total > 10000) {
        return `${t.processing || 'Processing'} ${total.toLocaleString()} ${t.records || 'records'}... ${t.may_take_moment || 'This may take a moment'}`;
      }
      return t.excel_includes_formatting || 'Excel export includes formatting and formulas';
    }
    if (exportType === 'pdf') {
      if (total > 1000) {
        return t.large_dataset_pdf || 'Large dataset detected. Showing last 1,000 records in PDF';
      }
      return t.pdf_includes_charts || 'PDF includes charts and summary statistics';
    }
    return '';
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="bg-accent p-6 rounded-2xl">
          <div className="col-span-2 py-6">
            <h1 className="font-bold text-xl text-primary">
              {t.employee_time_attendance_report || 'Employee Time Attendance Report'}          </h1>
          </div>
          <div className="relative">
            <p
              className={`text-xs text-primary rounded-md px-2 py-2 font-semibold bg-backdrop absolute -top-[50px] ${language === "ar" ? "left-0" : "right-0"
                }`}
            >
              <strong>💡 {t.tip || 'Tip'}:</strong> {t.csv_fastest || 'For datasets over 5,000 records, use CSV export for best performance. Excel export works great for up to 20,000 records. PDF shows last 1,000 records for large datasets.'}
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="p-5 flex flex-col">
              <div className="grid grid-cols-2 gap-y-5 gap-10 px-8 pb-5">
                {/* VERTICAL */}
                <FormField
                  control={form.control}
                  name="vertical"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex gap-1">{t.vertical || 'Vertical'}</FormLabel>
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
                          <SelectTrigger className="w-full max-w-[350px] 3xl:max-w-[450px]">
                            <SelectValue placeholder={t.placeholder_vertical || "Choose vertical"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent
                          showSearch={true}
                          searchPlaceholder={t.search_verticals || "Search verticals..."}
                          onSearchChange={debouncedVerticalSearch}
                          className="mt-5 w-full max-w-[350px] 3xl:max-w-[450px]"
                        >
                          {getVerticalData().length === 0 && verticalSearchTerm && (
                            <div className="p-3 text-sm text-text-secondary">
                              {t.no_verticals_found || "No verticals found"}
                            </div>
                          )}
                          {getVerticalData().map((item: any) => (
                            <SelectItem key={item.organization_id} value={item.organization_id.toString()}>
                              {language === 'ar' ? item.organization_arb : item.organization_eng}
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
                      <FormLabel className="flex gap-1">{t.company || 'Company'}</FormLabel>
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
                          <SelectTrigger className="w-full max-w-[350px] 3xl:max-w-[450px]">
                            <SelectValue placeholder={t.placeholder_company || "Choose company"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent
                          showSearch={true}
                          searchPlaceholder={t.search_companies || "Search companies..."}
                          onSearchChange={debouncedCompanySearch}
                          className="mt-5 w-full max-w-[350px] 3xl:max-w-[450px]"
                        >
                          {getCompanyData().length === 0 && companySearchTerm && (
                            <div className="p-3 text-sm text-text-secondary">
                              {t.no_companies_found || "No companies found"}
                            </div>
                          )}
                          {getCompanyData().map((item: any) => (
                            <SelectItem key={item.organization_id} value={item.organization_id.toString()}>
                              {language === 'ar' ? item.organization_arb : item.organization_eng}
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
                      <FormLabel className="flex gap-1">{t.department || 'Department'}</FormLabel>
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
                          <SelectTrigger className="w-full max-w-[350px] 3xl:max-w-[450px]">
                            <SelectValue placeholder={
                              isDepartmentsLoading
                                ? (t.loading_departments || "Loading departments...")
                                : (t.placeholder_department || "Choose department")
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent
                          showSearch={true}
                          searchPlaceholder={t.search_departments || "Search departments..."}
                          onSearchChange={debouncedDepartmentSearch}
                          className="mt-5 w-full max-w-[350px] 3xl:max-w-[450px]"
                        >
                          {getDepartmentData().length === 0 && departmentSearchTerm && (
                            <div className="p-3 text-sm text-text-secondary">
                              {t.no_departments_found || "No departments found"}
                            </div>
                          )}
                          {getDepartmentData().map((item: any) => (
                            <SelectItem key={item.department_id} value={item.department_id.toString()}>
                              {language === 'ar'
                                ? (item.department_name_arb || item.department_code)
                                : (item.department_name_eng || item.department_code)
                              }
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
                      <FormLabel className="flex gap-1">{t.employee_type || 'Employee Type'}</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(val)}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full max-w-[350px] 3xl:max-w-[450px]">
                            <SelectValue placeholder={t.placeholder_employee_type || "Choose type"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent
                          showSearch={true}
                          searchPlaceholder={t.search_employee_types || "Search employee types..."}
                          onSearchChange={debouncedEmployeeTypeSearch}
                          className="mt-5 w-full max-w-[350px] 3xl:max-w-[450px]"
                        >
                          {getEmployeeTypesData().length === 0 && employeeTypeSearchTerm && (
                            <div className="p-3 text-sm text-text-secondary">
                              {t.no_employee_types_found || "No employee types found"}
                            </div>
                          )}
                          {getEmployeeTypesData().map((item: any) => (
                            <SelectItem key={item.employee_type_id} value={item.employee_type_eng || item.employee_type_id.toString()}>
                              {language === 'ar' ? item.employee_type_arb : item.employee_type_eng}
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
                      <FormLabel className="flex gap-1">{t.manager || 'Manager'}</FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          form.setValue("employee", undefined);
                        }}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full max-w-[350px] 3xl:max-w-[450px]">
                            <SelectValue placeholder={t.placeholder_manager || "Choose manager"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent
                          showSearch={true}
                          searchPlaceholder={t.search_managers || "Search managers..."}
                          onSearchChange={debouncedManagerSearch}
                          className="mt-5 w-full max-w-[350px] 3xl:max-w-[450px]"
                        >
                          {isSearchingManagers && managerSearchTerm.length > 0 && (
                            <div className="p-3 text-sm text-text-secondary">
                              {t.searching || "Searching..."}
                            </div>
                          )}
                          {getManagerData().length === 0 && managerSearchTerm.length > 0 && !isSearchingManagers && (
                            <div className="p-3 text-sm text-text-secondary">
                              {t.no_managers_found || "No managers found"}
                            </div>
                          )}
                          {getManagerData().map((item: any) => (
                            <SelectItem key={item.employee_id} value={item.employee_id.toString()}>
                              {language === 'ar'
                                ? `${item.firstname_arb || item.firstname_eng} ${item.lastname_arb || item.lastname_eng || ''} ${item.emp_no ? `(${item.emp_no})` : ''}`
                                : `${item.firstname_eng} ${item.lastname_eng || ''} ${item.emp_no ? `(${item.emp_no})` : ''}`
                              }
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
                      <FormLabel className="flex gap-1">{t.employee || 'Employee'}</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(val)}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full max-w-[350px] 3xl:max-w-[450px]">
                            <SelectValue placeholder={t.choose_employee || "Choose employee"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent
                          showSearch={true}
                          searchPlaceholder={t.search_employees || "Search employees..."}
                          onSearchChange={debouncedEmployeeSearch}
                          className="mt-5 w-full max-w-[350px] 3xl:max-w-[450px]"
                        >
                          {isSearchingEmployees && employeeSearchTerm.length > 0 && (
                            <div className="p-3 text-sm text-text-secondary">
                              {t.searching || "Searching..."}
                            </div>
                          )}
                          {getFilteredEmployees().length === 0 && employeeSearchTerm.length > 0 && !isSearchingEmployees && (
                            <div className="p-3 text-sm text-text-secondary">
                              {t.no_employees_found || "No employees found"}
                            </div>
                          )}
                          {getFilteredEmployees().map((item: any) => (
                            <SelectItem key={item.employee_id} value={item.employee_id.toString()}>
                              {language === 'ar'
                                ? `${item.firstname_arb || item.firstname_eng} ${item.emp_no ? `(${item.emp_no})` : ''}`
                                : `${item.firstname_eng} ${item.emp_no ? `(${item.emp_no})` : ''}`
                              }
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
                      <FormLabel>{t.from_date || 'From Date'}</FormLabel>
                      <Popover open={popoverStates.fromDate} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, fromDate: open }))}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button size={"lg"} variant={"outline"}
                              className="w-full bg-accent px-3 flex justify-between text-text-primary max-w-[350px] 3xl:max-w-[450px] text-sm font-normal"
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yy")
                              ) : (
                                <span className="font-normal text-sm text-text-secondary">
                                  {t.placeholder_date || 'Choose date'}
                                </span>
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
                      <FormLabel>{t.to_date || 'To Date'}</FormLabel>
                      <Popover open={popoverStates.toDate} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, toDate: open }))}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button size={"lg"} variant={"outline"}
                              className="w-full bg-accent px-3 flex justify-between text-text-primary max-w-[350px] 3xl:max-w-[450px] text-sm font-normal"
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yy")
                              ) : (
                                <span className="font-normal text-sm text-text-secondary">
                                  {t.placeholder_date || 'Choose date'}
                                </span>
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
                  {translations?.buttons?.clear || 'Clear Filters'}
                </Button>

                <Button
                  type="button"
                  size={"sm"}
                  className="flex items-center gap-2 bg-[#B11C20] hover:bg-[#e41c23]"
                  onClick={handleShowReport}
                  disabled={loading}
                >
                  <LoginIcon />
                  {translations?.buttons?.show_pdf || 'Show PDF'}
                </Button>

                <Button
                  type="button"
                  size={"sm"}
                  className="flex items-center gap-2 bg-[#0073C6]"
                  onClick={handleExportCSV}
                  disabled={loading}
                >
                  <FileText className="w-4 h-4" />
                  {translations?.buttons?.export_csv || 'Export CSV'}
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
                  {translations?.buttons?.export_excel || 'Export Excel'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}