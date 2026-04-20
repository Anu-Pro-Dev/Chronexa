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
import { Checkbox } from "@/src/components/ui/checkbox";
import { apiRequest } from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { PDFExporter } from './PDFExporter';
import { ExcelExporter } from './ExcelExporter';
import { CSVExporter } from './CSVExporter';
import { CalendarIcon } from "@/src/icons/icons";
import { Eye, Download, Trash2Icon } from "lucide-react";

const SPARK_ADMIN_PARAMS = {
  employee_type_ids: '26',
  parent_orgid: '3',
  organization_id: '27',
} as const;

const formSchema = z.object({
  vertical: z.string().optional(),
  company: z.string().optional(),
  department: z.string().optional(),
  employee_type: z.array(z.string()).optional(),
  manager_id: z.string().optional(),
  employee: z.string().optional(),
  from_date: z.date().optional(),
  to_date: z.date().optional(),
});

export default function EmployeeReports() {
  const { language, translations } = useLanguage();
  const t = translations?.modules?.reports || {};
  const showToast = useShowToast();

  const { userRole } = useAuthGuard();
  const isSparkAdmin = userRole === 'SPARK_ADMIN';
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_type: [],
    },
  });

  const [popoverStates, setPopoverStates] = useState({ fromDate: false, toDate: false });
  const [loading, setLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportType, setExportType] = useState<'excel' | 'pdf' | 'csv' | null>(null);

  const [verticalSearchTerm, setVerticalSearchTerm] = useState("");
  const [companySearchTerm, setCompanySearchTerm] = useState("");
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState("");
  const [employeeTypeSearchTerm, setEmployeeTypeSearchTerm] = useState("");
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [managerSearchTerm, setManagerSearchTerm] = useState("");

  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedEmployeeTypes, setSelectedEmployeeTypes] = useState<string[]>([]);

  const [showReportView, setShowReportView] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [loadingReportData, setLoadingReportData] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showExportButtons, setShowExportButtons] = useState(false);
  const [showViewButton, setShowViewButton] = useState(true);
  const rowsPerPage = 50;

  const [progressDetails, setProgressDetails] = useState({
    current: 0,
    total: 0,
    phase: 'initializing' as 'initializing' | 'fetching' | 'processing' | 'generating' | 'complete',
  });

  const closePopover = (key: string) =>
    setPopoverStates(prev => ({ ...prev, [key]: false }));

  const selectedVertical = form.watch("vertical");
  const selectedCompany = form.watch("company");
  const selectedDepartment = form.watch("department");
  const selectedManagerId = form.watch("manager_id");

  const { data: organizations } = useFetchAllEntity("organization", {
    searchParams: { limit: "1000" },
  });

  const { data: departmentsByOrg, isLoading: isDepartmentsLoading } = useQuery({
    queryKey: ["departmentsByOrg", selectedCompany],
    queryFn: async () => {
      if (!selectedCompany) return null;
      return apiRequest(`/dept-org-mapping/by-organization/${selectedCompany}`, "GET");
    },
    enabled: !!selectedCompany && !isSparkAdmin,
  });

  const getManagerSearchParams = () => {
    const params: any = { manager_flag: "true", limit: "1000", offset: "1" };
    if (isSparkAdmin) {
      params.organization_id = SPARK_ADMIN_PARAMS.organization_id;
    } else {
      if (selectedCompany) params.organization_id = selectedCompany;
      if (selectedDepartment) params.department_id = selectedDepartment;
    }
    return { searchParams: params };
  };

  const { data: managers } = useFetchAllEntity(
    "employee",
    getManagerSearchParams(),
  );

  const getEmployeeSearchParams = () => {
    const params: any = { limit: "1000", offset: "1" };
    if (isSparkAdmin) {
      params.organization_id = SPARK_ADMIN_PARAMS.organization_id;
    } else {
      if (selectedCompany) params.organization_id = selectedCompany;
      if (selectedDepartment) params.department_id = selectedDepartment;
    }
    if (selectedManagerId) params.manager_id = selectedManagerId;
    return { searchParams: params };
  };

  const { data: employees } = useFetchAllEntity("employee", getEmployeeSearchParams());

  const { data: employeeTypes } = useFetchAllEntity("employeeType", { removeAll: true });

  const debouncedVerticalSearch = useCallback(debounce((v: string) => setVerticalSearchTerm(v), 300), []);
  const debouncedCompanySearch = useCallback(debounce((v: string) => setCompanySearchTerm(v), 300), []);
  const debouncedDepartmentSearch = useCallback(debounce((v: string) => setDepartmentSearchTerm(v), 300), []);
  const debouncedEmployeeTypeSearch = useCallback(debounce((v: string) => setEmployeeTypeSearchTerm(v), 300), []);
  const debouncedEmployeeSearch = useCallback(debounce((v: string) => setEmployeeSearchTerm(v), 300), []);
  const debouncedManagerSearch = useCallback(debounce((v: string) => setManagerSearchTerm(v), 300), []);

  const { data: searchedEmployees, isLoading: isSearchingEmployees } = useQuery({
    queryKey: ["employeeSearch", employeeSearchTerm, selectedCompany, selectedDepartment, selectedManagerId],
    queryFn: async () => {
      let url = `/employee/search?search=${encodeURIComponent(employeeSearchTerm)}`;
      const orgId = isSparkAdmin ? SPARK_ADMIN_PARAMS.organization_id : selectedCompany;
      if (orgId) url += `&organization_id=${orgId}`;
      if (!isSparkAdmin && selectedDepartment) url += `&department_id=${selectedDepartment}`;
      if (selectedManagerId) url += `&manager_id=${selectedManagerId}`;
      return apiRequest(url, "GET");
    },
    enabled: employeeSearchTerm.length > 0,
  });

  const { data: searchedManagers, isLoading: isSearchingManagers } = useQuery({
    queryKey: ["managerSearch", managerSearchTerm, selectedCompany, selectedDepartment],
    queryFn: async () => {
      let url = `/employee/search?search=${encodeURIComponent(managerSearchTerm)}&manager_flag=true`;
      const orgId = isSparkAdmin ? SPARK_ADMIN_PARAMS.organization_id : selectedCompany;
      if (orgId) url += `&organization_id=${orgId}`;
      if (!isSparkAdmin && selectedDepartment) url += `&department_id=${selectedDepartment}`;
      return apiRequest(url, "GET");
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
    if (!verticalSearchTerm) return verticals;
    return verticals.filter((item: any) =>
      item.organization_eng?.toLowerCase().includes(verticalSearchTerm.toLowerCase()) ||
      item.organization_arb?.toLowerCase().includes(verticalSearchTerm.toLowerCase())
    );
  };

  const getCompanyData = () => {
    if (!organizations?.data || !selectedVertical) return [];
    const companies = organizations.data.filter(
      (item: any) => String(item.parent_id) === selectedVertical
    );
    if (!companySearchTerm) return companies;
    return companies.filter((item: any) =>
      item.organization_eng?.toLowerCase().includes(companySearchTerm.toLowerCase()) ||
      item.organization_arb?.toLowerCase().includes(companySearchTerm.toLowerCase())
    );
  };

  const getDepartmentData = () => {
    if (!departmentsByOrg?.data || !selectedCompany) return [];
    const departmentsMap = new Map();
    const mappings = Array.isArray(departmentsByOrg.data) ? departmentsByOrg.data : [departmentsByOrg.data];
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
    if (!departmentSearchTerm) return departments;
    return departments.filter((item: any) =>
      item.department_name_eng?.toLowerCase().includes(departmentSearchTerm.toLowerCase()) ||
      item.department_name_arb?.toLowerCase().includes(departmentSearchTerm.toLowerCase()) ||
      item.department_code?.toLowerCase().includes(departmentSearchTerm.toLowerCase())
    );
  };

  const getEmployeeTypesData = () => {
    if (!employeeTypes?.data) return [];
    const types = employeeTypes.data.filter((item: any) => item.employee_type_id);
    if (!employeeTypeSearchTerm) return types;
    return types.filter((item: any) =>
      item.employee_type_eng?.toLowerCase().includes(employeeTypeSearchTerm.toLowerCase()) ||
      item.employee_type_arb?.toLowerCase().includes(employeeTypeSearchTerm.toLowerCase())
    );
  };

  const getManagerData = () => {
    if (managerSearchTerm.length > 0) {
      return (searchedManagers?.data || []).filter(
        (item: any) => item.employee_id && item.employee_id.toString().trim() !== ''
      );
    }
    return (managers?.data || []).filter(
      (item: any) =>
        item.employee_id &&
        item.employee_id.toString().trim() !== '' &&
        item.manager_flag === true
    );
  };

  const getFilteredEmployees = () => {
    const baseData = employeeSearchTerm.length > 0
      ? searchedEmployees?.data || []
      : employees?.data || [];
    return baseData.filter(
      (item: any) => item.employee_id && item.employee_id.toString().trim() !== ''
    );
  };

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId) ? prev.filter(id => id !== employeeId) : [...prev, employeeId]
    );
  };

  const handleEmployeeTypeToggle = (employeeTypeId: string) => {
    setSelectedEmployeeTypes(prev => {
      const newTypes = prev.includes(employeeTypeId)
        ? prev.filter(type => type !== employeeTypeId)
        : [...prev, employeeTypeId];
      if (showReportView) { resetButtons(); setShowReportView(false); }
      return newTypes;
    });
  };

  // UPDATED: headerMap to match sp_employee_daily_report column names
  const headerMap: Record<string, string> = {
    EmployeeNo: "Emp No",
    Name: "Employee Name",
    ParentOrganization: "Parent Organization",
    Organization: "Organization",
    Department: "Department",
    EmployeeType: "Employee Type",
    WorkDate: "Work Date",
    WorkDay: "Work Day",
    Shift: "Shift",
    PunchIn: "Punch In",
    GeoLocationIn: "GeoLocation In",
    PunchOut: "Punch Out",
    GeoLocationOut: "GeoLocation Out",
    DailyWorkedHrs: "Daily Worked Hrs",
    DailyMissedHrs: "Daily Missed Hrs",
    DailyExtraWork: "Daily Extra Work",
    IsAbsent: "Day Status",
    MissedPunch: "Missed Punch",
    EmployeeStatus: "Employee Status",
    ManagerName: "Manager Name",
    CostCode: "Cost Code",
    CostCenter: "Cost Center",
  };

  const isSingleEmployee = selectedEmployees.length === 1;

  // UPDATED: getViewHeaders to use correct column names
  const getViewHeaders = () => {
    if (isSingleEmployee) {
      return [
        'WorkDate', 'WorkDay', 'Shift', 'PunchIn', 'PunchOut',
        'DailyWorkedHrs', 'DailyMissedHrs', 'DailyExtraWork', 'IsAbsent', 'MissedPunch',
      ];
    }
    return [
      'EmployeeNo', 'Name', 'ParentOrganization', 'Organization',
      'Department', 'EmployeeType', 'WorkDate', 'WorkDay', 'Shift',
      'PunchIn', 'PunchOut', 'DailyWorkedHrs', 'DailyMissedHrs',
      'DailyExtraWork', 'IsAbsent', 'MissedPunch', 'EmployeeStatus',
    ];
  };

  const viewHeaders = getViewHeaders();

  // UPDATED: formatCellValue to handle new column names
  const formatCellValue = (header: string, value: any): string => {
    if (value === null || value === undefined || value === '') return '-';

    if (header === 'WorkDate') {
      try {
        const date = new Date(value);
        return format(date, 'dd-MM-yyyy');
      } catch {
        return value;
      }
    }

    // PunchIn and PunchOut are already formatted as HH:mm:ss strings from SP
    if (header === 'PunchIn' || header === 'PunchOut') {
      return value || '-';
    }

    // Time columns are already formatted as HH:mm:ss strings from SP
    if (['DailyWorkedHrs', 'DailyMissedHrs', 'DailyExtraWork'].includes(header)) {
      return value || '-';
    }

    // IsAbsent contains the status string directly (Absent, WeekOff, WFH, leave remarks, or empty)
    if (header === 'IsAbsent') {
      if (!value || value === '') return 'Present';
      return value;
    }

    // MissedPunch contains the status string directly (Missed IN, Missed OUT, or empty)
    if (header === 'MissedPunch') {
      if (!value || value === '') return '-';
      return value;
    }

    return String(value);
  };

  // UPDATED: calculateSummaryTotals to use correct column names
  const calculateSummaryTotals = (dataArray: any[]) => {
    const parseTimeToMinutes = (value: any) => {
      if (!value || value === '-') return 0;
      const strValue = String(value).trim();
      if (strValue.includes(':')) {
        const parts = strValue.split(':').map(Number);
        return (parts[0] || 0) * 60 + (parts[1] || 0) + ((parts[2] || 0) / 60);
      }
      return (parseFloat(strValue) || 0) * 60;
    };

    const totals = {
      totalWorkedMinutes: 0,
      totalMissedMinutes: 0,
      totalExtraMinutes: 0,
    };

    dataArray.forEach((row: any) => {
      totals.totalWorkedMinutes += parseTimeToMinutes(row.DailyWorkedHrs);
      totals.totalMissedMinutes += parseTimeToMinutes(row.DailyMissedHrs);
      totals.totalExtraMinutes += parseTimeToMinutes(row.DailyExtraWork);
    });

    const fmt = (mins: number) => {
      const h = Math.floor(Math.abs(mins) / 60);
      const m = Math.round(Math.abs(mins) % 60);
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    return {
      totalWorkedHours: fmt(totals.totalWorkedMinutes),
      totalMissedHours: fmt(totals.totalMissedMinutes),
      totalExtraHours: fmt(totals.totalExtraMinutes),
      totalLateInHours: "00:00",      // Not tracked in current SP
      totalEarlyOutHours: "00:00",    // Not tracked in current SP
      totalAbsents: dataArray.filter(row => row.IsAbsent === 'Absent').length.toString(),
    };
  };

  const handleProgressUpdate = (current: number, total: number, phase: string) => {
    setProgressDetails({ current, total, phase: phase as any });
    let percentage = 0;
    if (phase === 'initializing') percentage = 0;
    else if (phase === 'fetching') percentage = total > 0 ? Math.min(Math.round((current / total) * 70), 70) : 0;
    else if (phase === 'processing') percentage = 85;
    else if (phase === 'generating') percentage = 95;
    else if (phase === 'complete') percentage = 100;
    setExportProgress(percentage);
  };

  const buildQueryParams = (): Record<string, string> => {
    const params: Record<string, string> = {};
    const values = form.getValues();

    if (isSparkAdmin) {
      params.parent_orgid = SPARK_ADMIN_PARAMS.parent_orgid;
      params.organization_id = SPARK_ADMIN_PARAMS.organization_id;
    } else {
      if (values.vertical) params.parent_orgid = values.vertical;
      if (values.company) params.organization_id = values.company;
      if (values.department) params.department_id = values.department;
    }

    if (values.manager_id) params.manager_id = values.manager_id;
    if (values.from_date) params.from_date = format(values.from_date, 'yyyy-MM-dd');
    if (values.to_date) params.to_date = format(values.to_date, 'yyyy-MM-dd');

    return params;
  };

  const buildUrl = (params: Record<string, string>, page?: number): string => {
    const queryParts: string[] = [];

    if (isSparkAdmin && selectedEmployeeTypes.length === 0) {
      queryParts.push(`employee_type_ids=${SPARK_ADMIN_PARAMS.employee_type_ids}`);
    } else if (selectedEmployeeTypes.length > 0) {
      queryParts.push(`employee_type_ids=${selectedEmployeeTypes.join(',')}`);
    }

    if (selectedEmployees.length > 0) {
      queryParts.push(`employee_ids=${selectedEmployees.join(',')}`);
    }

    if (page !== undefined) {
      queryParts.push(`limit=${rowsPerPage}`);
      queryParts.push(`offset=${(page - 1) * rowsPerPage}`);
    }

    Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .forEach(([key, value]) => {
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      });

    const queryString = queryParts.join('&');
    return `/report/attendance${queryString ? `?${queryString}` : ''}`;
  };

  const fetchReportData = async (page: number = 1) => {
    setLoadingReportData(true);
    try {
      const params = buildQueryParams();
      const url = buildUrl(params, page);
      const response = await apiRequest(url, "GET");

      // Handle the actual API response structure
      const data = response?.data || [];
      const total = response?.total || data.length;

      setReportData(data);
      setTotalRecords(total);
      setCurrentPage(page);
      if (data.length === 0) showToast("error", "no_data_found");
    } catch (error) {
      console.error("Error fetching report data:", error);
      showToast("error", "fetch_report_error");
      setReportData([]);
      setTotalRecords(0);
    } finally {
      setLoadingReportData(false);
    }
  };
  
  const handleViewReport = async () => {
    try {
      setShowReportView(true);
      setShowExportButtons(true);
      setShowViewButton(false);
      await fetchReportData(1);
    } catch (error) {
      console.error("Error in handleViewReport:", error);
      setShowReportView(false);
      setShowExportButtons(false);
      setShowViewButton(true);
    }
  };

  const resetButtons = () => {
    setShowExportButtons(false);
    setShowViewButton(true);
  };

  const handlePageChange = (newPage: number) => fetchReportData(newPage);

  const getExportFormValues = () => ({
    ...form.getValues(),
    employee_ids: selectedEmployees,
    employee_type_ids: selectedEmployeeTypes,
    ...(isSparkAdmin && {
      vertical: SPARK_ADMIN_PARAMS.parent_orgid,
      company: SPARK_ADMIN_PARAMS.organization_id,
      _sparkAdminEmployeeTypeIds: SPARK_ADMIN_PARAMS.employee_type_ids,
    }),
  });

  const handleExportCSV = async () => {
    setLoading(true); setExportProgress(0); setExportType('csv');
    setProgressDetails({ current: 0, total: 0, phase: 'initializing' });
    try {
      const exporter = new CSVExporter({
        formValues: getExportFormValues(), headerMap, calculateSummaryTotals,
        onProgress: handleProgressUpdate, showToast,
      });
      await exporter.exportStreaming();
    } catch (error) {
      console.error("CSV export error:", error);
    } finally {
      setTimeout(() => {
        setLoading(false); setExportProgress(0); setExportType(null);
        resetButtons(); setProgressDetails({ current: 0, total: 0, phase: 'initializing' });
      }, 500);
    }
  };

  const handleExportExcel = async () => {
    setLoading(true); setExportProgress(0); setExportType('excel');
    setProgressDetails({ current: 0, total: 0, phase: 'initializing' });
    try {
      const exporter = new ExcelExporter({
        formValues: getExportFormValues(), headerMap, calculateSummaryTotals,
        onProgress: handleProgressUpdate, showToast,
      });
      await exporter.export();
    } catch (error) {
      console.error("Excel export error:", error);
    } finally {
      setTimeout(() => {
        setLoading(false); setExportProgress(0); setExportType(null);
        resetButtons(); setProgressDetails({ current: 0, total: 0, phase: 'initializing' });
      }, 500);
    }
  };

  const handleShowReport = async () => {
    setLoading(true); setExportProgress(0); setExportType('pdf');
    setProgressDetails({ current: 0, total: 0, phase: 'initializing' });
    try {
      const exporter = new PDFExporter({
        formValues: getExportFormValues(), headerMap, calculateSummaryTotals,
        logoUrl: '/Logo.png', onProgress: handleProgressUpdate, showToast,
      });
      await exporter.export();
    } catch (error) {
      console.error("PDF export error:", error);
    } finally {
      setTimeout(() => {
        setLoading(false); setExportProgress(0); setExportType(null);
        resetButtons(); setProgressDetails({ current: 0, total: 0, phase: 'initializing' });
      }, 500);
    }
  };

  useEffect(() => {
    return () => {
      debouncedVerticalSearch.cancel(); debouncedCompanySearch.cancel();
      debouncedDepartmentSearch.cancel(); debouncedEmployeeTypeSearch.cancel();
      debouncedEmployeeSearch.cancel(); debouncedManagerSearch.cancel();
    };
  }, [
    debouncedVerticalSearch, debouncedCompanySearch, debouncedDepartmentSearch,
    debouncedEmployeeTypeSearch, debouncedEmployeeSearch, debouncedManagerSearch,
  ]);

  useEffect(() => {
    if (showReportView) {
      resetButtons();
      setShowReportView(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedVertical, selectedCompany, selectedDepartment, selectedManagerId,
    selectedEmployees, selectedEmployeeTypes,
    form.watch('from_date'), form.watch('to_date'),
  ]);

  function onSubmit(_values: z.infer<typeof formSchema>) { return; }

  const getProgressMessage = () => {
    const { current, total, phase } = progressDetails;
    switch (phase) {
      case 'initializing': return t.initializing_export || 'Initializing export...';
      case 'fetching':
        return total > 0
          ? `${t.fetching_data || 'Fetching data from server'}... (${current.toLocaleString()} ${t.of || 'of'} ${total.toLocaleString()} ${t.records || 'records'})`
          : `${t.fetching_data || 'Fetching data from server'}...`;
      case 'processing': return `${t.processing || 'Processing'} ${total.toLocaleString()} ${t.records || 'records'}...`;
      case 'generating':
        if (exportType === 'csv') return t.generating_csv || 'Generating CSV file...';
        if (exportType === 'excel') return t.generating_excel || 'Generating Excel file...';
        if (exportType === 'pdf') return t.generating_pdf || 'Generating PDF file...';
        return t.generating_file || 'Generating file...';
      case 'complete': return t.export_complete || 'Export complete!';
      default: return t.processing || 'Processing...';
    }
  };

  const getProgressTip = () => {
    const { total } = progressDetails;
    if (exportType === 'csv') return t.csv_fastest || 'CSV exports are fastest for large datasets';
    if (exportType === 'excel') {
      return total > 10000
        ? `${t.processing || 'Processing'} ${total.toLocaleString()} ${t.records || 'records'}... ${t.may_take_moment || 'This may take a moment'}`
        : t.excel_includes_formatting || 'Excel export includes formatting and formulas';
    }
    if (exportType === 'pdf') {
      return total > 1000
        ? t.large_dataset_pdf || 'Large dataset detected. Showing last 1,000 records in PDF'
        : t.pdf_includes_charts || 'PDF includes charts and summary statistics';
    }
    return '';
  };

  const getPlaceholderText = () => {
    if (selectedEmployees.length === 0) return t.choose_employee || "Choose employee";
    return `${selectedEmployees.length} ${t.employee || 'employee'}${selectedEmployees.length > 1 ? 's' : ''} ${t.selected || 'selected'}`;
  };

  const getEmployeeTypePlaceholderText = () => {
    if (selectedEmployeeTypes.length === 0) return t.placeholder_employee_type || "Choose type";
    return `${selectedEmployeeTypes.length} ${t.type || 'type'}${selectedEmployeeTypes.length > 1 ? 's' : ''} ${t.selected || 'selected'}`;
  };

  const totalPages = Math.ceil(totalRecords / rowsPerPage);
  const summaryTotals = reportData.length > 0 ? calculateSummaryTotals(reportData) : null;

  // UPDATED: singleEmployeeInfo to use correct column names
  const singleEmployeeInfo = isSingleEmployee && reportData.length > 0
    ? {
      name: reportData[0]?.Name,
      empNo: reportData[0]?.EmployeeNo,
      company: reportData[0]?.ParentOrganization,
      division: reportData[0]?.Organization,
      department: reportData[0]?.Department,
      type: reportData[0]?.EmployeeType,
      status: reportData[0]?.EmployeeStatus,
    }
    : null;

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="relative bg-accent p-6 rounded-2xl">

          <div className="col-span-2 py-6">
            <h1 className="font-medium text-xl text-primary">
              {t.employee_time_attendance_report || 'Employee Time Attendance Report'}
            </h1>
          </div>

          <div>
            <p
              className={`text-xs text-primary rounded-md px-2 py-2 font-semibold bg-backdrop absolute -top-[50px] ${language === "ar" ? "left-0" : "right-0"}`}
            >
              <strong>{t.tip || 'Tip'}:</strong>{' '}
              {t.view_before_export || 'View the report on-screen first, then export to PDF, or CSV as needed.'}
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="p-5 flex flex-col">
              <div className="grid grid-cols-2 gap-y-5 gap-10 px-8 pb-5">

                {/* ── VERTICAL (hidden for SPARK_ADMIN) ──────────────────── */}
                {!isSparkAdmin && (
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
                )}

                {/* ── COMPANY (hidden for SPARK_ADMIN) ───────────────────── */}
                {!isSparkAdmin && (
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
                )}

                {/* ── DEPARTMENT (hidden for SPARK_ADMIN) ────────────────── */}
                {!isSparkAdmin && (
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
                                  : (item.department_name_eng || item.department_code)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* ── EMPLOYEE TYPE (hidden for SPARK_ADMIN) ─────────────── */}
                {!isSparkAdmin && (
                  <FormField
                    control={form.control}
                    name="employee_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex gap-1">{t.employee_type || 'Employee Type'}</FormLabel>
                        <Select>
                          <FormControl>
                            <SelectTrigger className="w-full max-w-[350px] 3xl:max-w-[450px]">
                              <SelectValue placeholder={getEmployeeTypePlaceholderText()} />
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
                            {getEmployeeTypesData().map((item: any) => {
                              const typeValue = item.employee_type_id.toString();
                              const isChecked = selectedEmployeeTypes.includes(typeValue);
                              return (
                                <div
                                  key={item.employee_type_id}
                                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEmployeeTypeToggle(typeValue); }}
                                >
                                  <Checkbox checked={isChecked} className="mr-2" />
                                  <span>
                                    {language === 'ar' ? item.employee_type_arb : item.employee_type_eng}
                                  </span>
                                </div>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* ── MANAGER (visible to all roles) ────────────────────── */}
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
                                : `${item.firstname_eng} ${item.lastname_eng || ''} ${item.emp_no ? `(${item.emp_no})` : ''}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ── EMPLOYEE (visible to all roles) ───────────────────── */}
                <FormField
                  control={form.control}
                  name="employee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex gap-1">{t.employee || 'Employee'}</FormLabel>
                      <Select>
                        <FormControl>
                          <SelectTrigger className="w-full max-w-[350px] 3xl:max-w-[450px]">
                            <SelectValue placeholder={getPlaceholderText()} />
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
                          {getFilteredEmployees().map((item: any) => {
                            const empId = item?.employee_id?.toString();
                            const isChecked = selectedEmployees.includes(empId);
                            return (
                              <div
                                key={empId}
                                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEmployeeToggle(empId); }}
                              >
                                <Checkbox checked={isChecked} className="mr-2" />
                                <span>
                                  {language === 'ar'
                                    ? `${item.firstname_arb || item.firstname_eng} ${item.emp_no ? `(${item.emp_no})` : ''}`
                                    : `${item.firstname_eng} ${item.emp_no ? `(${item.emp_no})` : ''}`}
                                </span>
                              </div>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ── FROM DATE (visible to all roles) ──────────────────── */}
                <FormField
                  control={form.control}
                  name="from_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.from_date || 'From Date'}</FormLabel>
                      <Popover
                        open={popoverStates.fromDate}
                        onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, fromDate: open }))}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              size="lg" variant="outline"
                              className="w-full bg-accent px-3 flex justify-between text-text-primary max-w-[350px] 3xl:max-w-[450px] text-sm font-normal"
                            >
                              {field.value
                                ? format(field.value, "dd/MM/yy")
                                : <span className="font-normal text-sm text-text-secondary">{t.placeholder_date || 'Choose date'}</span>}
                              <CalendarIcon />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => { field.onChange(date); closePopover('fromDate'); }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ── TO DATE (visible to all roles) ────────────────────── */}
                <FormField
                  control={form.control}
                  name="to_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.to_date || 'To Date'}</FormLabel>
                      <Popover
                        open={popoverStates.toDate}
                        onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, toDate: open }))}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              size="lg" variant="outline"
                              className="w-full bg-accent px-3 flex justify-between text-text-primary max-w-[350px] 3xl:max-w-[450px] text-sm font-normal"
                            >
                              {field.value
                                ? format(field.value, "dd/MM/yy")
                                : <span className="font-normal text-sm text-text-secondary">{t.placeholder_date || 'Choose date'}</span>}
                              <CalendarIcon />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => { field.onChange(date); closePopover('toDate'); }}
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

            {/* ── Progress Bar ──────────────────────────────────────────── */}
            {loading && exportProgress >= 0 && (
              <div className="px-8 pb-2">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-regular text-blue-900">{getProgressMessage()}</span>
                    <span className="text-sm font-medium text-blue-900">{exportProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${exportProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-blue-700 mt-2">{getProgressTip()}</p>
                </div>
              </div>
            )}

            {/* ── Action Buttons ─────────────────────────────────────────── */}
            <div className="flex justify-center gap-2 items-center pb-5">
              <div className="flex gap-4 px-5">

                {/* Clear Filters */}
                <Button
                  type="button" size="sm" variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => {
                    if (isSparkAdmin) {
                      form.reset({
                        manager_id: undefined,
                        employee: undefined,
                        from_date: undefined,
                        to_date: undefined,
                      });
                    } else {
                      form.reset();
                    }
                    setSelectedEmployees([]);
                    setSelectedEmployeeTypes([]);
                    setShowReportView(false);
                    setReportData([]);
                    resetButtons();
                  }}
                  disabled={loading}
                >
                  <Trash2Icon />
                  {translations?.buttons?.clear || 'Clear Filters'}
                </Button>

                {/* View Report */}
                {showViewButton && (
                  <Button
                    type="button" size="sm"
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    onClick={handleViewReport}
                    disabled={loading || loadingReportData}
                  >
                    <Eye className="w-4 h-4" />
                    {translations?.buttons?.view_report || 'View Report'}
                  </Button>
                )}

                {/* Export buttons — shown after viewing report */}
                {showExportButtons && reportData.length > 0 && (
                  <>
                    <Button
                      type="button" size="sm"
                      className="flex items-center gap-2 bg-[#0073C6]"
                      onClick={() => { handleExportCSV(); setShowReportView(false); }}
                      disabled={loading}
                    >
                      <Download className="w-4 h-4" />
                      {translations?.buttons?.export_csv || 'Export CSV'}
                    </Button>

                    <Button
                      type="button" size="sm"
                      className="flex items-center gap-2 bg-[#B11C20] hover:bg-[#e41c23]"
                      onClick={() => { handleShowReport(); setShowReportView(false); }}
                      disabled={loading}
                    >
                      <Download className="w-4 h-4" />
                      {translations?.buttons?.export_pdf || 'Export PDF'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </form>
      </Form>

      {/* ── Report Preview Table ─────────────────────────────────────────── */}
      {showReportView && (
        <div className="mt-6 bg-accent p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-medium text-lg text-primary">
              {t.report_preview || "Report Preview"} ({totalRecords.toLocaleString()} {t.records || "records"})
            </h2>
            <Button
              variant="outline" size="sm"
              onClick={() => { setShowReportView(false); resetButtons(); }}
            >
              {translations?.buttons?.close || "Close"}
            </Button>
          </div>

          {loadingReportData ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : reportData.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              {t.no_data_found || "No data found for the selected criteria"}
            </div>
          ) : (
            <>
              <div className="w-full">
                {/* Single employee info card */}
                {isSingleEmployee && singleEmployeeInfo && (
                  <div className="mb-6 p-4 bg-backdrop rounded-lg border border-grey">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-text-secondary">{t.employee_name || "Employee Name"}</p>
                        <p className="font-semibold text-primary">{singleEmployeeInfo.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">{t.emp_no || "Emp No"}</p>
                        <p className="font-semibold text-primary">{singleEmployeeInfo.empNo}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">{t.employee_type || "Employee Type"}</p>
                        <p className="font-semibold text-primary">{singleEmployeeInfo.type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">{t.status || "Status"}</p>
                        <p className="font-semibold text-primary">{singleEmployeeInfo.status}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">{t.parent_organization || "Parent Organization"}</p>
                        <p className="font-semibold text-primary">{singleEmployeeInfo.company}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">{t.organization || "Organization"}</p>
                        <p className="font-semibold text-primary">{singleEmployeeInfo.division}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">{t.department || "Department"}</p>
                        <p className="font-semibold text-primary">{singleEmployeeInfo.department}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Data table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-primary">
                        {viewHeaders.map((header) => (
                          <th
                            key={header}
                            className="border border-grey px-3 py-2 text-left text-xs font-semibold text-white"
                          >
                            {headerMap[header] || header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-backdrop">
                          {viewHeaders.map((header) => {
                            const cellValue = formatCellValue(header, row[header]);
                            const isAbsent = header === "IsAbsent" && cellValue !== 'Present' && cellValue !== '-';
                            const isMissedPunch = header === "MissedPunch" && cellValue !== '-';
                            return (
                              <td
                                key={header}
                                className={`border border-grey px-3 py-2 text-xs ${isAbsent || isMissedPunch ? "text-red-600 font-semibold" : ""}`}
                              >
                                {cellValue}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Summary totals */}
                  {summaryTotals && (
                    <div className="mt-8 border-t border-grey pt-6">
                      <h3 className="font-medium text-md text-primary mb-4">
                        {t.summary_totals || "Summary Totals"} ({t.current_page || "Current Page"})
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: t.total_worked_hours || "Total Worked Hours", value: summaryTotals.totalWorkedHours },
                          { label: t.total_missed_hours || "Total Missed Hours", value: summaryTotals.totalMissedHours },
                          { label: t.total_extra_hours || "Total Extra Hours", value: summaryTotals.totalExtraHours },
                          { label: t.total_absents || "Total Absents", value: summaryTotals.totalAbsents },
                        ].map(({ label, value }) => (
                          <div key={label} className="bg-backdrop p-4 rounded-lg">
                            <p className="text-xs text-text-secondary mb-1">{label}</p>
                            <p className="text-lg font-semibold text-primary">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6">
                  <Button
                    variant="outline" size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loadingReportData}
                  >
                    {translations?.buttons?.previous || "Previous"}
                  </Button>
                  <span className="text-sm text-text-secondary">
                    {t.page || "Page"} {currentPage} {t.of || "of"} {totalPages}
                  </span>
                  <Button
                    variant="outline" size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loadingReportData}
                  >
                    {translations?.buttons?.next || "Next"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}