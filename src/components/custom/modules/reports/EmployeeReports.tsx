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
import { FileText, Trash2Icon } from "lucide-react";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useShowToast } from "@/src/utils/toastHelper";

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
    transdate: t.date || "Date",
    WorkDay: t.day || "Day",
    punch_in: t.punch_in || "Punch In",
    punch_out: t.punch_out || "Punch Out",
    dailyworkhrs: t.worked_hours || "Worked Hours",
    DailyMissedHrs: t.missed_hours || "Missed Hours",
    dailyextrawork: t.overtime || "Overtime",
    missed_punch: t.missed_punch || "Missed Punch",
    day_status: t.status || "Status",
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
        logoUrl: '/FGIC_COLOR.png',
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

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="bg-accent p-6 rounded-2xl">
          <div className="col-span-2 p-6">
            <h1 className="font-bold text-xl text-primary">
              {t.employee_time_attendance_report || 'Employee Time Attendance Report'}
            </h1>
          </div>
          <div className="relative">
            <p
              className={`text-xs text-primary border border-blue-200 rounded-md px-2 py-1 font-semibold bg-blue-400 bg-opacity-10 absolute -top-[50px] ${language === "ar" ? "left-0" : "right-0"
                }`}
            >
              <strong>💡 {t.tip || 'Tip'}:</strong> {t.csv_fastest || 'For datasets over 5,000 records, use CSV export for best performance. Excel export works great for up to 20,000 records. PDF shows last 1,000 records for large datasets.'}
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
                  }}
                  disabled={loading}
                >
                  <Trash2Icon />
                  {translations.buttons.clear_filters || "Clear Filters"}
                </Button>
                <Button
                  type="button"
                  size={"sm"}
                  className="flex items-center gap-2 bg-[#0073C6]"
                  onClick={handleExportCSV}
                  disabled={loading}
                >
                  <FileText className="w-4 h-4" />
                  {translations.buttons.export_csv || "Export CSV"}
                </Button>
                <Button
                  type="button"
                  size={"sm"}
                  className="flex items-center gap-2 bg-[#B11C20] hover:bg-[#e41c23]"
                  onClick={handleShowReport}
                  disabled={loading}
                >
                  <LoginIcon />
                  {translations.buttons.export_pdf || "Export PDF"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}