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
import { PDFExporterFGIC } from './PDFExporterFGIC';
import { ExcelExporter } from './ExcelExporter';
import { CSVExporterFGIC } from './CSVExporterFGIC';
import { CalendarIcon, LoginIcon } from "@/src/icons/icons";
import { FileText, Trash2Icon, Eye, Download } from "lucide-react";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useShowToast } from "@/src/utils/toastHelper";
import { formatInTimeZone } from "date-fns-tz";

const formSchema = z.object({
  employees: z.array(z.string()).optional(),
  from_date: z.date().optional(),
  to_date: z.date().optional(),
});

export default function EmployeeReports() {
  const { employeeId, userRole } = useAuthGuard();
  const { language, translations } = useLanguage();
  const showToast = useShowToast();
  const t = translations?.modules?.reports || {};
  const [showExportButtons, setShowExportButtons] = useState(false);
  const [showViewButton, setShowViewButton] = useState(true);

  const isManager = userRole?.toLowerCase() === 'manager';
  const isAdmin = userRole?.toLowerCase() === 'admin';

  const pdfShowToast = (type: "success" | "error", key: string, options?: { duration?: number }) => {
    showToast(type, key, undefined, true);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employees: [],
    },
  });

  const [popoverStates, setPopoverStates] = useState({
    fromDate: false,
    toDate: false,
  });

  const [loading, setLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportType, setExportType] = useState<'excel' | 'pdf' | 'csv' | null>(null);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [currentReportEmployeeCount, setCurrentReportEmployeeCount] = useState<number>(0);
  const [showReportView, setShowReportView] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [loadingReportData, setLoadingReportData] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const rowsPerPage = 50;

  const [progressDetails, setProgressDetails] = useState({
    current: 0,
    total: 0,
    phase: 'initializing' as 'initializing' | 'fetching' | 'processing' | 'generating' | 'complete'
  });

  const closePopover = (key: string) => {
    setPopoverStates(prev => ({ ...prev, [key]: false }));
  };

  const { data: employees } = useFetchAllEntity(
    "employee",
    isManager && !isAdmin && employeeId
      ? { endpoint: `/employee/all?manager_id=${employeeId}` }
      : { searchParams: { limit: "1000", offset: "1" } }
  );

  const debouncedEmployeeSearch = useCallback(
    debounce((searchTerm: string) => {
      setEmployeeSearchTerm(searchTerm);
    }, 300),
    []
  );

  const { data: searchedEmployees, isLoading: isSearchingEmployees } = useQuery({
    queryKey: ["employeeSearch", employeeSearchTerm, employeeId, isManager, isAdmin],
    queryFn: async () => {
      if (isManager && !isAdmin && employeeId) {
        const response = await apiRequest(`/employee/all?manager_id=${employeeId}`, "GET");
        if (response?.data) {
          const filtered = response.data.filter((emp: any) =>
            emp?.firstname_eng?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
            emp?.lastname_eng?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
            emp?.emp_no?.toLowerCase().includes(employeeSearchTerm.toLowerCase())
          );
          return { data: filtered };
        }
        return response;
      } else {
        const response = await apiRequest(
          `/employee/search?search=${encodeURIComponent(employeeSearchTerm)}`,
          "GET"
        );
        return response;
      }
    },
    enabled: employeeSearchTerm.length > 0,
  });

  const getFilteredEmployees = () => {
    let baseData = [];
    if (employeeSearchTerm.length > 0) {
      baseData = searchedEmployees?.data || [];
    } else {
      baseData = employees?.data || [];
    }
    return baseData.filter((item: any) =>
      item?.employee_id && item.employee_id.toString().trim() !== ''
    );
  };

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees(prev => {
      return prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId];
    });
  };

  const headerMap: Record<string, string> = {
    employee_number: t.emp_no || "Emp No",
    firstname_eng: t.employee_name || "Employee Name",
    parent_org_eng: t.company || "Company",
    organization_eng: t.division || "Division",
    employee_type: t.employee_type || "Employee Type",
    schCode: t.schedule || "Schedule",
    in_time: t.in_time || "In Time",
    out_time: t.out_time || "Out Time",
    transdate: t.date || "Date",
    WorkDay: t.day || "Day",
    punch_in: t.punch_in || "Punch In",
    punch_out: t.punch_out || "Punch Out",
    dailyworkhrs: t.worked_hours || "Worked Hours",
    DailyMissedHrs: t.missed_hours || "Missed Hours",
    dailyextrawork: t.overtime || "Overtime",
    late: t.late || "Late",
    early: t.early || "Early",
    missed_punch: t.missed_punch || "Missed Punch",
    comment: t.status || "Status",
  };

  const isSingleEmployee = selectedEmployees.length === 1;

  const getViewHeaders = () => {
    const isSingleEmployee = selectedEmployees.length === 1;

    if (isSingleEmployee) {
      return [
        'schCode',
        'in_time',
        'out_time',
        'transdate',
        'WorkDay',
        'punch_in',
        'punch_out',
        'dailyworkhrs',
        'DailyMissedHrs',
        'dailyextrawork',
        'late',
        'early',
        'missed_punch',
        'comment'
      ];
    } else {
      return [
        'employee_number',
        'firstname_eng',
        'organization_eng',
        'employee_type',
        'schCode',
        'in_time',
        'out_time',
        'transdate',
        'WorkDay',
        'punch_in',
        'punch_out',
        'dailyworkhrs',
        'DailyMissedHrs',
        'dailyextrawork',
        'late',
        'early',
        'missed_punch',
        'comment'
      ];
    }
  };

  const viewHeaders = getViewHeaders();

  const getFilteredHeaders = () => {
    return [
      'employee_number',
      'firstname_eng',
      'parent_org_eng',
      'organization_eng',
      'employee_type',
      'schCode',
      'in_time',
      'out_time',
      'transdate',
      'WorkDay',
      'punch_in',
      'punch_out',
      'dailyworkhrs',
      'DailyMissedHrs',
      'dailyextrawork',
      'late',
      'early',
      'missed_punch',
      'comment'
    ];
  };

  const formatCellValue = (header: string, value: any): string => {
    if (!value && value !== 0) return '-';

    if (header === 'transdate' && value) {
      try {
        return formatInTimeZone(value, 'UTC', 'dd-MM-yyyy');
      } catch {
        if (typeof value === 'string') {
          const datePart = value.split(' ')[0].split('T')[0];
          if (datePart.includes('-')) {
            const [year, month, day] = datePart.split('-');
            return `${day}-${month}-${year}`;
          }
        }
        return value;
      }
    }

    if ((header === 'punch_in' || header === 'punch_out' || header === 'in_time' || header === 'out_time') && value) {
      try {
        return formatInTimeZone(value, 'UTC', 'HH:mm:ss');
      } catch {
        if (typeof value === 'string') {
          if (value.includes('T')) {
            const timePart = value.split('T')[1];
            return timePart.split('.')[0];
          }
          if (value.includes(' ')) {
            const timePart = value.split(' ')[1];
            return timePart.split('.')[0];
          }
          if (value.includes(':')) {
            return value.split('.')[0];
          }
        }
        return value;
      }
    }

    if (['late', 'early', 'dailyworkhrs', 'DailyMissedHrs', 'dailyextrawork'].includes(header)) {
      if (value === '0' || value === 0) return '00:00:00';

      if (typeof value === 'string') {
        let timeOnly = value;
        if (value.includes('T')) {
          timeOnly = value.split('T')[1];
        } else if (value.includes(' ')) {
          timeOnly = value.split(' ')[1];
        }
        return timeOnly.split('.')[0];
      }

      const numValue = parseFloat(value);
      if (isNaN(numValue)) return '00:00:00';

      const totalSeconds = Math.round(Math.abs(numValue) * 3600);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
    if (phase === 'initializing') percentage = 0;
    else if (phase === 'fetching') {
      if (total > 0) percentage = Math.min(Math.round((current / total) * 70), 70);
    } else if (phase === 'processing') percentage = 85;
    else if (phase === 'generating') percentage = 95;
    else if (phase === 'complete') percentage = 100;

    setExportProgress(percentage);
  };

  const buildQueryParams = (): Record<string, string> => {
    const params: Record<string, string> = {};
    const values = form.getValues();

    if (values.from_date) {
      params.from_date = format(values.from_date, 'yyyy-MM-dd');
    }

    if (values.to_date) {
      params.to_date = format(values.to_date, 'yyyy-MM-dd');
    }

    const hasSpecificEmployees = selectedEmployees.length > 0;

    if (!hasSpecificEmployees && isManager && !isAdmin && employeeId) {
      params.manager_id = employeeId.toString();
    }

    return params;
  };

  const buildUrl = (params: Record<string, string>, page?: number): string => {
    const queryParts: string[] = [];

    if (selectedEmployees.length > 0) {
      const ids = selectedEmployees.join(',');
      queryParts.push(`employee_id=[${ids}]`);
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
    return `/report/new${queryString ? `?${queryString}` : ''}`;
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
      setCurrentReportEmployeeCount(selectedEmployees.length);

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

  const getReportParams = () => {
    const values = form.getValues();
    return {
      employee_ids: selectedEmployees,
      from_date: values.from_date,
      to_date: values.to_date,
      manager_id: (isManager && !isAdmin && employeeId && selectedEmployees.length === 0)
        ? employeeId
        : undefined,
      employeeId,
      userRole,
      isManager: isManager && !isAdmin,
      isAdmin,
    };
  };

  const handleExportCSV = async () => {
    setLoading(true);
    setExportProgress(0);
    setExportType('csv');
    setProgressDetails({ current: 0, total: 0, phase: 'initializing' });

    try {
      const exporter = new CSVExporterFGIC({
        formValues: getReportParams(),
        headerMap,
        calculateSummaryTotals,
        onProgress: handleProgressUpdate,
        showToast,
      });
      await exporter.exportStreaming();
    } catch (error) {
      console.error("CSV export error:", error);
      showToast("error", "export_csv_error");
    } finally {
      setTimeout(() => {
        setLoading(false);
        setExportProgress(0);
        setExportType(null);
        resetButtons();
        setLoading(false);
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
        formValues: getReportParams(),
        headerMap,
        calculateSummaryTotals,
        onProgress: handleProgressUpdate,
        showToast,
      });
      await exporter.export();
    } catch (error) {
      console.error("Excel export error:", error);
      showToast("error", "export_excel_error");
    } finally {
      setTimeout(() => {
        setLoading(false);
        setExportProgress(0);
        setExportType(null);
        resetButtons();
        setLoading(false);
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
      const exporter = new PDFExporterFGIC({
        formValues: getReportParams(),
        headerMap,
        calculateSummaryTotals,
        logoUrl: '/Logo.png',
        onProgress: handleProgressUpdate,
        showToast: pdfShowToast,
      });
      await exporter.export();
    } catch (error) {
      console.error("PDF export error:", error);
      showToast("error", "export_pdf_error");
    } finally {
      setTimeout(() => {
        setLoading(false);
        setExportProgress(0);
        setExportType(null);
        resetButtons();
        setLoading(false);
        setProgressDetails({ current: 0, total: 0, phase: 'initializing' });
      }, 500);
    }
  };

  useEffect(() => {
    return () => {
      debouncedEmployeeSearch.cancel();
    };
  }, [debouncedEmployeeSearch]);

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
        return t.fetching_data || 'Fetching data from server...';
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
        return t.large_dataset_pdf || `Large dataset detected. Showing last 1,000 records in PDF`;
      }
      return t.pdf_includes_charts || 'PDF includes charts and summary statistics';
    }
    return '';
  };

  const getPlaceholderText = () => {
    if (selectedEmployees.length === 0) {
      if (isAdmin) return t.choose_employee_all || "Choose employee (all employees)";
      if (isManager) return t.choose_employee_team || "Choose employee from your team";
      return t.choose_employee || "Choose employee";
    }
    return `${selectedEmployees.length} ${t.employee || 'employee'}${selectedEmployees.length > 1 ? (language === 'ar' ? '' : 's') : ''} ${t.selected || 'selected'}`;
  };

  const totalPages = Math.ceil(totalRecords / rowsPerPage);
  const summaryTotals = reportData.length > 0 ? calculateSummaryTotals(reportData) : null;

  const singleEmployeeInfo = isSingleEmployee && reportData.length > 0
    ? {
      name: reportData[0]?.firstname_eng,
      empNo: reportData[0]?.employee_number,
      company: reportData[0]?.parent_org_eng,
      division: reportData[0]?.organization_eng,
      type: reportData[0]?.employee_type,
    }
    : null;

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="bg-accent p-6 rounded-2xl relative">
          <div className="col-span-2 p-6">
            <h1 className="font-bold text-2xl text-primary">
              {t.employee_time_attendance_report || 'Employee Time Attendance Report'}
            </h1>
          </div>
          <div className="">
            <p
              className={`text-xs text-primary rounded-md px-2 py-1 font-semibold bg-blue-400 bg-opacity-10 my-3 absolute -top-[80px] ${language === "ar" ? "left-0" : "right-0"
                }`}
            >
              <strong>💡 {t.tip || 'Tip'}:</strong> {t.view_before_export || 'View the report on-screen first, then export to PDF or CSV as needed.'}
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="p-5 flex flex-col">
              <div className="grid grid-cols-2 gap-y-5 gap-10 px-8 pb-5">
                <FormField
                  control={form.control}
                  name="employees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex gap-1">{t.employee || "Employee"}</FormLabel>
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
                          {getFilteredEmployees().length === 0 && employeeSearchTerm.length === 0 && (
                            <div className="p-3 text-sm text-text-secondary">
                              {isAdmin ? (t.no_employees_available || "No employees available") :
                                isManager ? (t.no_team_members || "No team members available") :
                                  (t.no_employees_available || "No employees available")}
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
                                <span>{item?.firstname_eng} {item?.emp_no ? `(${item.emp_no})` : ''}</span>
                              </div>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-y-5 gap-10 px-8 pb-5">
                <FormField
                  control={form.control}
                  name="from_date"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel>{t.from_date || "From Date"}</FormLabel>
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
                                  {translations?.modules?.scheduling?.placeholder_date || "Choose date"}
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
                <FormField
                  control={form.control}
                  name="to_date"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel>{t.to_date || "To Date"}</FormLabel>
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
                                  {translations?.modules?.scheduling?.placeholder_date || "Choose date"}
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
                  variant="secondary"
                  className="flex items-center gap-2"
                  onClick={() => {
                    form.reset();
                    setSelectedEmployees([]);
                    setShowReportView(false);
                    setReportData([]);
                    resetButtons();
                  }}
                  disabled={loading}
                >
                  <Trash2Icon />
                  {translations.buttons.clear_filters || "Clear Filters"}
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
                    {translations.buttons.view_report || "View Report"}
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
                      {translations.buttons.export_csv || "Export CSV"}
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
                      {translations.buttons.export_excel || "Export Excel"}
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
                      {translations.buttons.export_pdf || "Export PDF"}
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
              {translations.buttons.close || "Close"}
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
                            const cellValue = formatCellValue(header, row[header]);

                            const isAbsent =
                              header === "comment" && cellValue.toLowerCase() === "absent";
                            const isWeekOff =
                              header === "comment" && cellValue.toLowerCase() === "week off";
                            const isLateOrMissed =
                              (header === "late" || header === "DailyMissedHrs") &&
                              parseFloat(cellValue) > 0;

                            return (
                              <td
                                key={header}
                                className={`border border-grey px-3 py-2 text-xs ${isAbsent
                                  ? "text-red-600 font-semibold"
                                  : isWeekOff
                                    ? "text-green-600"
                                    : isLateOrMissed
                                      ? "text-red-600"
                                      : ""
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
                    {translations.buttons.previous || "Previous"}
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
                    {translations.buttons.next || "Next"}
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