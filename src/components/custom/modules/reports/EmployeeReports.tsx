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
import { searchEmployees } from "@/src/lib/apiHandler";
import { toast } from "react-hot-toast";
import { PDFExporter } from './PDFExporter';
import { ExcelExporter } from './ExcelExporter';
import { CSVExporter } from './CSVExporter';
import { CalendarIcon, ExportExcelIcon, LoginIcon } from "@/src/icons/icons";
import { FileText } from "lucide-react";

const formSchema = z.object({
  organization: z.string().optional(),
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
  const [organizationSearchTerm, setOrganizationSearchTerm] = useState("");

  const closePopover = (key: string) => {
    setPopoverStates(prev => ({ ...prev, [key]: false }));
  };

  const { data: organizations } = useFetchAllEntity("organization", { removeAll: true });
  const { data: employees } = useFetchAllEntity("employee");

  const debouncedEmployeeSearch = useCallback(
    debounce((searchTerm: string) => {
      setEmployeeSearchTerm(searchTerm);
    }, 300),
    []
  );

  const debouncedOrganizationSearch = useCallback(
    debounce((searchTerm: string) => {
      setOrganizationSearchTerm(searchTerm);
    }, 300),
    []
  );

  const { data: searchedEmployees, isLoading: isSearchingEmployees } = useQuery({
    queryKey: ["employeeSearch", employeeSearchTerm],
    queryFn: () => searchEmployees(employeeSearchTerm),
    enabled: employeeSearchTerm.length > 0,
  });

  const getFilteredEmployees = () => {
    const baseData = employeeSearchTerm.length > 0 
      ? searchedEmployees?.data || []
      : employees?.data || [];
    
    return baseData.filter((item: any) => 
      item.employee_id && item.employee_id.toString().trim() !== ''
    );
  };

  const getFilteredOrganizations = () => {
    const baseData = organizations?.data || [];
    if (organizationSearchTerm.length === 0) return baseData;
    
    return baseData.filter((item: any) => 
      item.organization_id && 
      item.organization_id.toString().trim() !== '' &&
      item.organization_eng?.toLowerCase().includes(organizationSearchTerm.toLowerCase())
    );
  };

  const headerMap: Record<string, string> = {
    employee_number: "Emp No",
    firstname_eng: "Employee Name",
    organization_eng: "Organization",
    transdate: "Date",
    punch_in: "Time In",
    punch_out: "Time Out",
    late: "Late",
    early: "Early",
    dailyworkhrs: "Total Work Hrs",
    DailyMissedHrs: "Missed Hrs",
    dailyextrawork: "Overtime",
    remarks: "Missed Punch",
    isabsent: "Absent"
  };

  const calculateSummaryTotals = (dataArray: any[]) => {
    const totals = {
      totalLateInHours: 0,
      totalWorkedHours: 0,
      totalEarlyOutHours: 0,
      totalMissedHours: 0,
      totalExtraHours: 0,
      totalAbsents: 0,
    };

    dataArray.forEach((row: any) => {
      totals.totalLateInHours += parseFloat(row.late || 0) / 60;
      totals.totalWorkedHours += parseFloat(row.dailyworkhrs || 0);
      totals.totalEarlyOutHours += parseFloat(row.early || 0) / 60;
      totals.totalMissedHours += parseFloat(row.DailyMissedHrs || 0);
      totals.totalExtraHours += parseFloat(row.dailyextrawork || 0);
    });

    const formatToHoursMinutes = (hours: number) => {
      const h = Math.floor(Math.abs(hours));
      const m = Math.round((Math.abs(hours) - h) * 60);
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    return {
      totalLateInHours: formatToHoursMinutes(totals.totalLateInHours),
      totalWorkedHours: formatToHoursMinutes(totals.totalWorkedHours),
      totalEarlyOutHours: formatToHoursMinutes(totals.totalEarlyOutHours),
      totalMissedHours: formatToHoursMinutes(totals.totalMissedHours),
      totalExtraHours: formatToHoursMinutes(totals.totalExtraHours),
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
      debouncedOrganizationSearch.cancel();
    };
  }, [debouncedEmployeeSearch, debouncedOrganizationSearch]);

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
                <FormField
                  control={form.control}
                  name="organization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex gap-1">Organization</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        value={field.value !== undefined ? String(field.value) : ""}
                      >
                        <FormControl>
                          <SelectTrigger className="max-w-[350px]">
                            <SelectValue placeholder="Choose organization" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent
                          showSearch={true}
                          searchPlaceholder="Search organizations..."
                          onSearchChange={debouncedOrganizationSearch}
                          className="mt-5"
                        >
                          {getFilteredOrganizations().length === 0 && organizationSearchTerm.length > 0 && (
                            <div className="p-3 text-sm text-text-secondary">
                              No organizations found
                            </div>
                          )}
                          {getFilteredOrganizations().map((item: any) => {
                            if (!item.organization_id || item.organization_id.toString().trim() === '') return null;
                            return (
                              <SelectItem key={item.organization_id} value={item.organization_id.toString()}>
                                {item.organization_eng}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="employee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex gap-1">Employee</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        value={field.value !== undefined ? String(field.value) : ""}
                      >
                        <FormControl>
                          <SelectTrigger className="max-w-[350px]">
                            <SelectValue placeholder="Choose employee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent
                          showSearch={true}
                          searchPlaceholder="Search employees..."
                          onSearchChange={debouncedEmployeeSearch}
                          className="mt-5"
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
                          {getFilteredEmployees().map((item: any) => {
                            if (!item.employee_id || item.employee_id.toString().trim() === '') return null;
                            return (
                              <SelectItem key={item.employee_id} value={item.employee_id.toString()}>
                                {item.firstname_eng} {item.emp_no ? `(${item.emp_no})` : ''}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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