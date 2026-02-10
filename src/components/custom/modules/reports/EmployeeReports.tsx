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
import { searchEmployees, apiRequest } from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { PDFExporter } from './PDFExporter';
import { ExcelExporter } from './ExcelExporter';
import { CSVExporter } from './CSVExporter';
import { DeleteIcon, CalendarIcon, ExportExcelIcon, LoginIcon } from "@/src/icons/icons";
import { FileText, Trash2Icon, TrashIcon, Eye, Download } from "lucide-react";

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_type: [],
    },
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

  const getManagerSearchParams = () => {
    const params: any = {
      manager_flag: "true",
      limit: "1000",
      offset: "1"
    };
    if (selectedCompany) {
      params.organization_id = selectedCompany;
    }
    if (selectedDepartment) {
      params.department_id = selectedDepartment;
    }
    return { searchParams: params };
  };

  const { data: managers } = useFetchAllEntity(
    "employee",
    (selectedCompany || selectedDepartment) ? getManagerSearchParams() : {
      searchParams: {
        manager_flag: "true",
        limit: "1000",
        offset: "1"
      }
    }
  );

  const getEmployeeSearchParams = () => {
    const params: any = {
      limit: "1000",
      offset: "1"
    };
    if (selectedCompany) {
      params.organization_id = selectedCompany;
    }
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
    (selectedCompany || selectedDepartment || selectedManagerId) ? getEmployeeSearchParams() : {
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
    queryKey: ["employeeSearch", employeeSearchTerm, selectedCompany, selectedDepartment, selectedManagerId],
    queryFn: async () => {
      let url = `/employee/search?search=${encodeURIComponent(employeeSearchTerm)}`;
      if (selectedCompany) {
        url += `&organization_id=${selectedCompany}`;
      }
      if (selectedDepartment) {
        url += `&department_id=${selectedDepartment}`;
      }
      if (selectedManagerId) {
        url += `&manager_id=${selectedManagerId}`;
      }
      const response = await apiRequest(url, "GET");
      return response;
    },
    enabled: employeeSearchTerm.length > 0,
  });

  const { data: searchedManagers, isLoading: isSearchingManagers } = useQuery({
    queryKey: ["managerSearch", managerSearchTerm, selectedCompany, selectedDepartment],
    queryFn: async () => {
      let url = `/employee/search?search=${encodeURIComponent(managerSearchTerm)}&manager_flag=true`;
      if (selectedCompany) {
        url += `&organization_id=${selectedCompany}`;
      }
      if (selectedDepartment) {
        url += `&department_id=${selectedDepartment}`;
      }
      const response = await apiRequest(url, "GET");
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

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees(prev => {
      return prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId];
    });
  };

  const handleEmployeeTypeToggle = (employeeType: string) => {
    setSelectedEmployeeTypes(prev => {
      const newTypes = prev.includes(employeeType)
        ? prev.filter(type => type !== employeeType)
        : [...prev, employeeType];
      
      if (showReportView) {
        resetButtons();
        setShowReportView(false);
      }
      
      return newTypes;
    });
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

  const getDepartmentName = (row: any) => {
    if (row?.departments?.department_name_eng) {
      return language === 'ar' 
        ? (row.departments.department_name_arb || row.departments.department_name_eng)
        : row.departments.department_name_eng;
    }
    return row?.department_name_eng || '-';
  };

  const isSingleEmployee = selectedEmployees.length === 1;

  const getViewHeaders = () => {
    if (isSingleEmployee) {
      return [
        'transdate',
        'WorkDay',
        'punch_in',
        'punch_out',
        'dailyworkhrs',
        'DailyMissedHrs',
        'dailyextrawork',
        'isabsent',
        'MissedPunch'
      ];
    } else {
      return [
        'employee_number',
        'firstname_eng',
        'parent_org_eng',
        'organization_eng',
        'department_name_eng',
        'employee_type',
        'transdate',
        'WorkDay',
        'punch_in',
        'punch_out',
        'dailyworkhrs',
        'DailyMissedHrs',
        'dailyextrawork',
        'isabsent',
        'MissedPunch'
      ];
    }
  };

  const viewHeaders = getViewHeaders();

  const formatCellValue = (header: string, value: any): string => {
    if (!value && value !== 0) return '-';

    if (header === 'transdate' && value) {
      try {
        return format(new Date(value), 'dd-MM-yyyy');
      } catch {
        return value;
      }
    }

    if ((header === 'punch_in' || header === 'punch_out') && value) {
      try {
        return format(new Date(value), 'HH:mm:ss');
      } catch {
        return value;
      }
    }

    if (['dailyworkhrs', 'DailyMissedHrs', 'dailyextrawork'].includes(header)) {
      if (value === '0' || value === 0) return '00:00:00';
      
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return '00:00:00';

      const totalSeconds = Math.round(Math.abs(numValue) * 3600);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    if (header === 'isabsent') {
      return value ? 'Absent' : 'Present';
    }

    if (header === 'MissedPunch') {
      return value ? 'Yes' : 'No';
    }

    return String(value);
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

  const buildQueryParams = (): Record<string, string> => {
    const params: Record<string, string> = {};
    const values = form.getValues();

    if (values.vertical) params.vertical = values.vertical;
    if (values.company) params.company = values.company;
    if (values.department) params.department = values.department;
    if (selectedEmployeeTypes.length > 0) {
      params.employee_type = selectedEmployeeTypes.join(',');
    }
    if (values.manager_id) params.manager_id = values.manager_id;
    if (values.from_date) params.from_date = format(values.from_date, 'yyyy-MM-dd');
    if (values.to_date) params.to_date = format(values.to_date, 'yyyy-MM-dd');

    return params;
  };

  const buildUrl = (params: Record<string, string>, page?: number): string => {
    const queryParts: string[] = [];

    if (selectedEmployees.length > 0) {
      const ids = selectedEmployees.join(',');
      queryParts.push(`employee_ids=${ids}`);
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

      const data = Array.isArray(response) ? response : (response?.data || []);
      const total = response?.total || data.length;

      setReportData(data);
      setTotalRecords(total);
      setCurrentPage(page);

      if (data.length === 0) {
        showToast("error", "no_data_found");
      }
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

  const handlePageChange = (newPage: number) => {
    fetchReportData(newPage);
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
        resetButtons();
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
        resetButtons();
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
        resetButtons();
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

  useEffect(() => {
    if (showReportView) {
      resetButtons();
      setShowReportView(false);
    }
  }, [selectedVertical, selectedCompany, selectedDepartment, selectedManagerId, selectedEmployees, selectedEmployeeTypes, form.watch('from_date'), form.watch('to_date')]);

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

  const getPlaceholderText = () => {
    if (selectedEmployees.length === 0) {
      return t.choose_employee || "Choose employee";
    }
    return `${selectedEmployees.length} ${t.employee || 'employee'}${selectedEmployees.length > 1 ? 's' : ''} ${t.selected || 'selected'}`;
  };

  const getEmployeeTypePlaceholderText = () => {
    if (selectedEmployeeTypes.length === 0) {
      return t.placeholder_employee_type || "Choose type";
    }
    return `${selectedEmployeeTypes.length} ${t.type || 'type'}${selectedEmployeeTypes.length > 1 ? 's' : ''} ${t.selected || 'selected'}`;
  };

  const totalPages = Math.ceil(totalRecords / rowsPerPage);
  const summaryTotals = reportData.length > 0 ? calculateSummaryTotals(reportData) : null;

  const singleEmployeeInfo = isSingleEmployee && reportData.length > 0
    ? {
      name: reportData[0]?.firstname_eng,
      empNo: reportData[0]?.employee_number,
      company: reportData[0]?.parent_org_eng,
      division: reportData[0]?.organization_eng,
      department: getDepartmentName(reportData[0]),
      type: reportData[0]?.employee_type,
    }
    : null;

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="relative bg-accent p-6 rounded-2xl">
          <div className="col-span-2 py-6">
            <h1 className="font-bold text-xl text-primary">
              {t.employee_time_attendance_report || 'Employee Time Attendance Report'}
            </h1>
          </div>
          <div>
            <p
              className={`text-xs text-primary rounded-md px-2 py-2 font-semibold bg-backdrop absolute -top-[50px] ${language === "ar" ? "left-0" : "right-0"
                }`}
            >
              <strong>{t.tip || 'Tip'}:</strong> {t.view_before_export || 'View the report on-screen first, then export to PDF, Excel, or CSV as needed.'}
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
                            const typeValue = item.employee_type_eng || item.employee_type_id.toString();
                            const isChecked = selectedEmployeeTypes.includes(typeValue);
                            return (
                              <div
                                key={item.employee_type_id}
                                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleEmployeeTypeToggle(typeValue);
                                }}
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
                                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleEmployeeToggle(empId);
                                }}
                              >
                                <Checkbox checked={isChecked} className="mr-2" />
                                <span>
                                  {language === 'ar'
                                    ? `${item.firstname_arb || item.firstname_eng} ${item.emp_no ? `(${item.emp_no})` : ''}`
                                    : `${item.firstname_eng} ${item.emp_no ? `(${item.emp_no})` : ''}`
                                  }
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
                  onClick={() => {
                    form.reset();
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

                {showViewButton && (
                  <Button
                    type="button"
                    size={"sm"}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    onClick={handleViewReport}
                    disabled={loading || loadingReportData}
                  >
                    <Eye className="w-4 h-4" />
                    {translations?.buttons?.view_report || 'View Report'}
                  </Button>
                )}

                {showExportButtons && reportData.length > 0 && (
                  <>
                    <Button
                      type="button"
                      size={"sm"}
                      className="flex items-center gap-2 bg-[#0073C6]"
                      onClick={() => {
                        handleExportCSV();
                        setShowReportView(false);
                      }}
                      disabled={loading}
                    >
                      <Download className="w-4 h-4" />
                      {translations?.buttons?.export_csv || 'Export CSV'}
                    </Button>

                    <Button
                      type="button"
                      size={"sm"}
                      className="flex items-center gap-2 bg-[#217346] hover:bg-[#1a5c37]"
                      onClick={() => {
                        handleExportExcel();
                        setShowReportView(false);
                      }}
                      disabled={loading}
                    >
                      <Download className="w-4 h-4" />
                      {translations?.buttons?.export_excel || 'Export Excel'}
                    </Button>

                    <Button
                      type="button"
                      size={"sm"}
                      className="flex items-center gap-2 bg-[#B11C20] hover:bg-[#e41c23]"
                      onClick={() => {
                        handleShowReport();
                        setShowReportView(false);
                      }}
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

      {showReportView && (
        <div className="mt-6 bg-accent p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg text-primary">
              {t.report_preview || "Report Preview"} ({totalRecords.toLocaleString()} {t.records || "records"})
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowReportView(false);
                resetButtons();
              }}
            >
              {translations?.buttons?.close || "Close"}
            </Button>
          </div>

          {loadingReportData ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : reportData.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              {t.no_data_found || "No data found for the selected criteria"}
            </div>
          ) : (
            <>
              <div className="w-full">
                {isSingleEmployee && singleEmployeeInfo && (
                  <div className="mb-6 p-4 bg-backdrop rounded-lg border border-grey">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
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
                        <p className="text-xs text-text-secondary">{t.company || "Company"}</p>
                        <p className="font-semibold text-primary">{singleEmployeeInfo.company}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">{t.division || "Division"}</p>
                        <p className="font-semibold text-primary">{singleEmployeeInfo.division}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">{t.department || "Department"}</p>
                        <p className="font-semibold text-primary">{singleEmployeeInfo.department}</p>
                      </div>
                    </div>
                  </div>
                )}
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
                            let cellValue;
                            if (header === 'department_name_eng') {
                              cellValue = getDepartmentName(row);
                            } else {
                              cellValue = formatCellValue(header, row[header]);
                            }
                            
                            const isAbsent = header === "isabsent" && cellValue === "Absent";
                            const isMissed = header === "MissedPunch" && cellValue === "Yes";

                            return (
                              <td
                                key={header}
                                className={`border border-grey px-3 py-2 text-xs ${
                                  isAbsent || isMissed ? "text-red-600 font-semibold" : ""
                                }`}
                              >
                                {cellValue}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {summaryTotals && (
                    <div className="mt-8 border-t border-grey pt-6">
                      <h3 className="font-bold text-md text-primary mb-4">
                        {t.summary_totals || "Summary Totals"} ({t.current_page || "Current Page"})
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-backdrop p-4 rounded-lg">
                          <p className="text-xs text-text-secondary mb-1">{t.total_late_hours || "Total Late Hours"}</p>
                          <p className="text-lg font-semibold text-primary">{summaryTotals.totalLateInHours}</p>
                        </div>
                        <div className="bg-backdrop p-4 rounded-lg">
                          <p className="text-xs text-text-secondary mb-1">{t.total_early_hours || "Total Early Out Hours"}</p>
                          <p className="text-lg font-semibold text-primary">{summaryTotals.totalEarlyOutHours}</p>
                        </div>
                        <div className="bg-backdrop p-4 rounded-lg">
                          <p className="text-xs text-text-secondary mb-1">{t.total_missed_hours || "Total Missed Hours"}</p>
                          <p className="text-lg font-semibold text-primary">{summaryTotals.totalMissedHours}</p>
                        </div>
                        <div className="bg-backdrop p-4 rounded-lg">
                          <p className="text-xs text-text-secondary mb-1">{t.total_worked_hours || "Total Worked Hours"}</p>
                          <p className="text-lg font-semibold text-primary">{summaryTotals.totalWorkedHours}</p>
                        </div>
                        <div className="bg-backdrop p-4 rounded-lg">
                          <p className="text-xs text-text-secondary mb-1">{t.total_extra_hours || "Total Extra Hours"}</p>
                          <p className="text-lg font-semibold text-primary">{summaryTotals.totalExtraHours}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loadingReportData}
                  >
                    {translations?.buttons?.previous || "Previous"}
                  </Button>
                  <span className="text-sm text-text-secondary">
                    {t.page || "Page"} {currentPage} {t.of || "of"} {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
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