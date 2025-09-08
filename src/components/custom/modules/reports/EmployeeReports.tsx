"use client";
import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { debounce } from "lodash";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn, getRandomInt } from "@/src/utils/utils";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { ScrollArea, ScrollBar } from "@/src/components/ui/scroll-area";
import { USER_TOKEN } from "@/src/utils/constants";
import { useRouter } from "next/navigation";
import Required from "@/src/components/ui/required";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Calendar } from "@/src/components/ui/calendar";
import { format } from "date-fns";
import { Checkbox } from "@/src/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { getManagerEmployees, apiRequest } from "@/src/lib/apiHandler";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Input } from "@/src/components/ui/input";
import {
  CalendarIcon,
  ExportExcelIcon,
  ExportPDFIcon,
  ExportWordIcon,
  LoginIcon,
} from "@/src/icons/icons";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { searchEmployees } from "@/src/lib/apiHandler";
import { toast } from "react-hot-toast";
import { PDFExporter } from './PDFExporter';
import { ExcelExporter } from './ExcelExporter';

const formSchema = z.object({
  reports: z.string().optional(),
  organization: z.string().optional(),
  manager: z.string().optional(),
  employee: z.string().optional(),
  employee_type: z.string().optional(),
  employee_group: z.string().optional(),
  from_date: z.date().optional(),
  to_date: z.date().optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
  inactive: z.boolean().optional(),
});

export default function EmployeeReports() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      limit: "1000",
      offset: "1",
    }
  });

  const router = useRouter();
  const { language, translations } = useLanguage();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showReportData, setShowReportData] = useState(false);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [showEmployeeSearch, setShowEmployeeSearch] = useState(false);

  // Watch form values for real-time query parameters
  const watchedValues = form.watch();

  // const { data: organizations } = useFetchAllEntity("organization");
  const { data: organizations } = useFetchAllEntity("organization", { removeAll: true });
  const { data: employees } = useFetchAllEntity("employee");

  const { data: managerEmployees } = useQuery({
    queryKey: ["managerEmployees"],
    queryFn: getManagerEmployees,
  });

  // Add debounced search function
  const debouncedEmployeeSearch = useCallback(
    debounce((searchTerm: string) => {
      setEmployeeSearchTerm(searchTerm);
    }, 300),
    []
  );

  // Add search query for employees
  const { data: searchedEmployees, isLoading: isSearchingEmployees } = useQuery({
    queryKey: ["employeeSearch", employeeSearchTerm],
    queryFn: () => searchEmployees(employeeSearchTerm),
    enabled: employeeSearchTerm.length > 0,
  });

  // Determine which employee data to use
  const employeeData = employeeSearchTerm.length > 0 
    ? searchedEmployees?.data || []
    : employees?.data || [];

  // Function to build query parameters from form values
  const buildQueryParams = (values: any) => {
    const params: Record<string, string> = {};

    if (values.from_date) {
      params.startDate = format(values.from_date, 'yyyy-MM-dd');
    }
    if (values.to_date) {
      params.endDate = format(values.to_date, 'yyyy-MM-dd');
    }
    if (values.employee) {
      params.employeeId = values.employee.toString();
    }
    if (values.organization) {
      // Find organization name from organizations data
      const org = organizations?.data?.find((o: any) => o.organization_id.toString() === values.organization.toString());
      if (org) {
        params.organization = org.organization_eng;
      }
    }
    if (values.limit) {
      params.limit = values.limit;
    }
    if (values.offset) {
      params.offset = values.offset;
    }

    return params;
  };

  // TanStack Query for fetching reports with the new endpoint
  const {
    data: reportsQueryData,
    isLoading: isLoadingReports,
    error: reportsError,
    refetch: refetchReports
  } = useQuery({
    queryKey: ["reports", watchedValues],
    queryFn: async () => {
      const params = buildQueryParams(watchedValues);
      
      // Build query string
      const queryString = Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
      
      const url = `/report${queryString ? `?${queryString}` : ''}`;
      const response = await apiRequest(url, "GET");
      return response;
    },
    enabled: false, // Only fetch when manually triggered
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  // Function to fetch report data (now uses TanStack Query)
  const fetchReportData = async () => {
    setLoading(true);
    
    try {
      const result = await refetchReports();
      const data = result.data?.data || result.data;
      setReportData(data);
      return data;
    } catch (error) {
      toast.error("Error fetching report data. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Updated header map for the specified columns only
  const headerMap: Record<string, string> = {
    employee_number: "Emp No",
    firstname_eng: "Employee Name",
    organization_eng: "Organization",
    transdate: "Date",
    punch_in: "Time In",
    punch_out: "Time Out",
    late: "Late",
    early: "Early",
    // workmts: "Total Work Minutes",
    dailyworkhrs: "Total Work Hrs",
    DailyMissedHrs: "Missed Hrs",
    dailyextrawork: "Overtime",
    remarks: "Missed Punch",
    isabsent: "Absent"
  };

  // Function to calculate summary totals from data
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
      // Convert minutes to hours and sum up
      totals.totalLateInHours += parseFloat(row.late || 0) / 60;
      totals.totalWorkedHours += parseFloat(row.dailyworkhrs || 0);
      totals.totalEarlyOutHours += parseFloat(row.early || 0) / 60;
      totals.totalMissedHours += parseFloat(row.DailyMissedHrs || 0);
      totals.totalExtraHours += parseFloat(row.dailyextrawork || 0);
    });

    // Format to 2 decimal places and convert to HH:MM format
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

  // Function to handle Excel export with PDF-like formatting
  const handleExportExcel = async () => {
    const data = await fetchReportData();
    const dataArray = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
    
    if (dataArray.length > 0) {
      const exporter = new ExcelExporter({
        data: dataArray,
        formValues: form.getValues(),
        headerMap,
        calculateSummaryTotals,
      });
      
      await exporter.export();
    } else {
      toast.error("No data available to export.");
    }
  };

  // Updated PDF export handler using the new PDFExporter class
  const handleShowReport = async () => {
    const data = await fetchReportData();
    const dataArray = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
    
    if (dataArray.length > 0) {
      const exporter = new PDFExporter({
        data: dataArray,
        formValues: form.getValues(),
        headerMap,
        calculateSummaryTotals,
        logoUrl: '/ChronexaLogo.png'
      });
      
      await exporter.export();
    } else {
      toast.error("No data available to export.");
    }
  };

  useEffect(() => {
    return () => {
      debouncedEmployeeSearch.cancel();
    };
  }, [debouncedEmployeeSearch]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      return;
    } catch (error) {
      console.error("Form submission error", error);
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="bg-accent p-6 rounded-2xl">
          <div className="flex flex-col gap-6">
            <div className="p-5 flex flex-col">
              <div className="grid grid-cols-2 gap-y-5 gap-10 px-8 pb-5">
                <FormField
                  control={form.control}
                  name="reports"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reports</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose report" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Daily Movement Report</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                          <SelectTrigger>
                            <SelectValue placeholder="Choose organization" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {(organizations?.data || []).map((item: any) => {
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
                      <FormLabel className="flex gap-1">Employee </FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        value={field.value !== undefined ? String(field.value) : ""}
                        onOpenChange={(open) => setShowEmployeeSearch(open)}
                      >
                        <FormControl>
                          <SelectTrigger>
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
                          {employeeData.length === 0 && employeeSearchTerm.length > 0 && !isSearchingEmployees && (
                            <div className="p-3 text-sm text-text-secondary">
                              No employees found
                            </div>
                          )}
                          {employeeData.map((item: any) => {
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
                  name="manager"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex gap-1">Manager</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        value={field.value !== undefined ? String(field.value) : ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose manager" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {managerEmployees?.data?.length > 0 &&
                            managerEmployees.data
                              .filter((emp: any) => emp.employee_id != null)
                              .map((emp: any) => (
                                <SelectItem key={emp.employee_id} value={emp.employee_id.toString()}>
                                  {emp.firstname_eng}
                                </SelectItem>
                              ))}
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
                      <FormLabel>
                        From Date
                      </FormLabel>
                      <Popover>
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
                            onSelect={field.onChange}
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
                      <FormLabel>
                        To Date
                      </FormLabel>
                      <Popover>
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
                            onSelect={field.onChange}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Add Limit field */}
                <FormField
                  control={form.control}
                  name="limit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Limit (Records per page)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter limit (default: 100)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Add Offset field */}
                <FormField
                  control={form.control}
                  name="offset"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Offset (Page offset)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter offset (default: 0)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="flex justify-center gap-2 items-center pb-5">
              <div className="flex gap-4 px-5">
                <Button
                  type="button"
                  size={"sm"}
                  className="flex items-center space-y-0.5"
                  onClick={handleShowReport}
                  disabled={loading || isLoadingReports}
                >
                  <LoginIcon />
                  {loading || isLoadingReports ? "Loading..." : "Show report"}
                </Button>
                <Button
                  type="button"
                  variant={"success"}
                  size={"sm"}
                  className="flex items-center space-y-0.5 bg-[#21A366]"
                  onClick={handleExportExcel}
                  disabled={loading || isLoadingReports}
                >
                  <ExportExcelIcon />
                  Export to excel
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    
    </div>
  );
}