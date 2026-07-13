"use client";
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/src/lib/utils";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/src/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Calendar } from "@/src/components/ui/calendar";
import { CalendarIcon, ClockIcon, ExclamationIcon } from "@/src/icons/icons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/src/components/ui/command";
import { Check, ChevronDown } from "lucide-react";
import { Checkbox } from "@/src/components/ui/checkbox";
import { format, subDays, startOfDay } from "date-fns";
import { TimePicker } from "@/src/components/ui/time-picker";
import Required from "@/src/components/ui/required";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import {
  groupApproveByEmployeeIdsRequest,
  apiRequest,
  getAllCostCodes,
} from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useDebounce } from "@/src/hooks/useDebounce";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from "@/src/components/ui/responsive-modal";

const ALLOWED_ATTACHMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];
const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;

/* ── schema ────────────────────────────────────────────────────────────
   Changes:
   1. remarks is now required (min 1)
   2. time split into timeIn / timeOut — both optional at schema level,
      validated conditionally in onSubmit based on reason
──────────────────────────────────────────────────────────────────────── */
const formSchema = z.object({
  reason: z
    .string()
    .min(1, { message: "reason_required" })
    .max(100, { message: "reason_max_length" }),
  date: z.date({ required_error: "date_required" }),
  timeIn: z.date().optional(),   // used for IN and BOTH
  timeOut: z.date().optional(),   // used for OUT and BOTH
  remarks: z
    .string()
    .min(1, { message: "remarks_required" })       // ← now mandatory
    .max(500, { message: "remarks_max_length" }),
  attachment: z.custom<File>(
    (value) => {
      if (!value || !(value instanceof File)) return false;
      if (value.size > MAX_ATTACHMENT_SIZE) return false;
      if (!ALLOWED_ATTACHMENT_TYPES.includes(value.type)) return false;
      return true;
    },
    { message: "invalid_file_error" }
  ),
});

type FormValues = z.infer<typeof formSchema>;

export default function GroupApplyPunch({
  on_open_change,
  rowData,
  punchType,
}: {
  on_open_change?: any;
  rowData?: any;
  punchType?: string;
}) {
  const { userInfo } = useAuthGuard();
  const { language, translations } = useLanguage();
  const showToast = useShowToast();

  const t = translations?.modules?.selfServices || {};
  const formErrors = translations?.formErrors || {};

  const [remarksLength, setRemarksLength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  /* confirmation modal */
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null);

  const [popoverStates, setPopoverStates] = useState({
    fromDate: false,
    timeIn: false,
    timeOut: false,
  });

  const [selectedEmployeeTypes, setSelectedEmployeeTypes] = useState<string[]>([]);
  const [employeeTypeSearchTerm, setEmployeeTypeSearchTerm] = useState("");

  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const debouncedEmployeeSearch = useDebounce(employeeSearchTerm, 300);
  const debouncedEmployeeTypeSearch = useDebounce(employeeTypeSearchTerm, 300);

  const [selectedDepartment, setSelectedDepartment] = useState<number | undefined>(undefined);
  const [openDepartment, setOpenDepartment] = useState(false);

  const [selectedCostCode, setSelectedCostCode] = useState<string | undefined>(undefined);
  const [openCostCode, setOpenCostCode] = useState(false);
  const [costCodeSearch, setCostCodeSearch] = useState("");

  const closePopover = (key: string) =>
    setPopoverStates((prev) => ({ ...prev, [key]: false }));

  const orgId = userInfo?.organization_id ?? userInfo?.organization?.id;
  const today = startOfDay(new Date());
  const allowedDays = orgId === 25 ? 30 : 60;
  const allowedDaysAgo = startOfDay(subDays(today, allowedDays));
  const isDateDisabled = (date: Date) => {
    const d = startOfDay(date);
    return d < allowedDaysAgo || d > today;
  };

  const { data: employeeTypes } = useFetchAllEntity("employeeType", { removeAll: true });
  const { data: departmentsData, isLoading: loadingDepartments } = useFetchAllEntity(
    "department",
    { searchParams: { offset: "1", limit: "1000" } }
  );
  const { data: costCodesData, isLoading: loadingCostCodes } = useQuery({
    queryKey: ["costCodes"],
    queryFn: getAllCostCodes,
  });

  /* fetch ALL employees without pagination */
  const { data: allEmployees } = useQuery({
    queryKey: ["allEmployeesNoPagination"],
    queryFn: () => apiRequest("/employee/", "GET"),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const { data: searchedEmployees, isLoading: isSearchingEmployees } = useQuery({
    queryKey: ["employeeSearch", debouncedEmployeeSearch],
    queryFn: () =>
      apiRequest(`/employee/search?search=${encodeURIComponent(debouncedEmployeeSearch)}`, "GET"),
    enabled: debouncedEmployeeSearch.length > 0,
  });

  /* ── data helpers ─────────────────────────────────────────────────── */
  const getEmployeeTypesData = () => {
    if (!employeeTypes?.data) return [];
    const types = employeeTypes.data.filter((item: any) => item.employee_type_id);
    if (!debouncedEmployeeTypeSearch) return types;
    return types.filter(
      (item: any) =>
        item.employee_type_eng?.toLowerCase().includes(debouncedEmployeeTypeSearch.toLowerCase()) ||
        item.employee_type_arb?.toLowerCase().includes(debouncedEmployeeTypeSearch.toLowerCase())
    );
  };

  const getDepartmentsData = () =>
    (departmentsData?.data || []).filter(
      (item: any) => item.department_id && item.department_id.toString().trim() !== ""
    );

  const getCostCodesData = (): string[] => {
    const raw = costCodesData?.data ?? costCodesData ?? [];
    const list: string[] = Array.isArray(raw)
      ? raw.filter((item: any) => typeof item === "string" && item.trim() !== "")
      : [];
    if (!costCodeSearch) return list;
    return list.filter((item) => item.toLowerCase().includes(costCodeSearch.toLowerCase()));
  };

  const getFilteredEmployees = useCallback(() => {
    const base: any[] =
      debouncedEmployeeSearch.length > 0
        ? searchedEmployees?.data ?? []
        : allEmployees?.data ?? [];

    return base.filter((item: any) => {
      if (!item.employee_id || item.employee_id.toString().trim() === "") return false;
      if (selectedEmployeeTypes.length > 0) {
        if (!selectedEmployeeTypes.includes(String(item.employee_type_id ?? ""))) return false;
      }
      if (selectedDepartment !== undefined) {
        if (Number(item.department_id) !== Number(selectedDepartment)) return false;
      }
      if (selectedCostCode !== undefined) {
        if (String(item.cost_code ?? "") !== String(selectedCostCode)) return false;
      }
      return true;
    });
  }, [debouncedEmployeeSearch, searchedEmployees, allEmployees, selectedEmployeeTypes, selectedDepartment, selectedCostCode]);

  useEffect(() => {
    const validIds = new Set(getFilteredEmployees().map((e: any) => e.employee_id?.toString()));
    setSelectedEmployees((prev) => prev.filter((id) => validIds.has(id)));
  }, [selectedEmployeeTypes, selectedDepartment, selectedCostCode]);

  const handleEmployeeTypeToggle = (typeId: string) =>
    setSelectedEmployeeTypes((prev) =>
      prev.includes(typeId) ? prev.filter((t) => t !== typeId) : [...prev, typeId]
    );

  const handleEmployeeToggle = (empId: string) =>
    setSelectedEmployees((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );

  const getEmployeeTypePlaceholder = () => {
    if (selectedEmployeeTypes.length === 0) return t.placeholder_employee_type || "Choose type";
    return `${selectedEmployeeTypes.length} ${t.type || "type"}${selectedEmployeeTypes.length > 1 ? "s" : ""} ${t.selected || "selected"}`;
  };

  const getEmployeePlaceholder = () => {
    if (selectedEmployees.length === 0) return t.choose_employee || "Choose employee";
    return `${selectedEmployees.length} ${t.employee || "employee"}${selectedEmployees.length > 1 ? "s" : ""} ${t.selected || "selected"}`;
  };

  const affectedCount =
    selectedEmployees.length > 0 ? selectedEmployees.length : getFilteredEmployees().length;

  /* ── form ─────────────────────────────────────────────────────────── */
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { reason: "", remarks: "" },
  });

  const watchedReason = form.watch("reason");
  const isBoth = watchedReason === "BOTH";
  const isIn = watchedReason === "IN";
  const isOut = watchedReason === "OUT";

  const GroupApplyPunchMutation = useMutation({
    mutationFn: groupApproveByEmployeeIdsRequest,
    onSuccess: () => {
      showToast("success", "group_apply_punch_success");
      queryClient.invalidateQueries({ queryKey: ["missingMovement"], exact: false });
      setIsSubmitting(false);
      if (on_open_change) on_open_change(false);
    },
    onError: (error: any) => {
      console.error("API Error:", error);
      showToast("error", "group_apply_punch_error");
      setIsSubmitting(false);
    },
    onSettled: () => { setIsSubmitting(false); },
  });

  const parseTransDate = useCallback((dateString: string) => {
    if (!dateString) return new Date();
    // DD/MM/YYYY or DD/MM/YY display format — parse first to avoid
    // new Date() misinterpreting DD/MM/YYYY as MM/DD/YYYY
    const parts = dateString.split("/");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    // ISO string from API e.g. "2026-04-22T00:00:00.000Z"
    const iso = new Date(dateString);
    if (!isNaN(iso.getTime())) return iso;
    return new Date();
  }, []);

  useEffect(() => {
    if (rowData && punchType) {
      form.setValue("reason", punchType);
      const dateSource = rowData.raw_TransDate ?? rowData.TransDate;
      if (dateSource) form.setValue("date", parseTransDate(dateSource));
    }
  }, [rowData, punchType, form, parseTransDate]);

  /* helper: build ISO datetime string from a date + time object */
  const buildISO = (date: Date, time: Date): string => {
    const d = new Date(date);
    d.setHours(time.getHours(), time.getMinutes(), time.getSeconds(), 0);
    const Y = d.getFullYear();
    const M = String(d.getMonth() + 1).padStart(2, "0");
    const D = String(d.getDate()).padStart(2, "0");
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    const s = String(d.getSeconds()).padStart(2, "0");
    return `${Y}-${M}-${D}T${h}:${m}:${s}.000Z`;
  };

  /* step 1: validate + extra conditional checks → open confirm modal */
  function onSubmit(values: FormValues) {
    if (isSubmitting) return;

    /* conditional time validation based on reason */
    if ((values.reason === "IN" || values.reason === "BOTH") && !values.timeIn) {
      form.setError("timeIn", { message: "time_required" });
      return;
    }
    if ((values.reason === "OUT" || values.reason === "BOTH") && !values.timeOut) {
      form.setError("timeOut", { message: "time_required" });
      return;
    }

    setPendingValues(values);
    setShowConfirm(true);
  }

  /* step 2: user confirms → call API with correct FormData fields */
  function handleConfirm() {
    if (!pendingValues || isSubmitting) return;
    setShowConfirm(false);
    setIsSubmitting(true);

    try {
      const { reason, date, timeIn, timeOut, remarks, attachment } = pendingValues;

      /* ── Build payload per reason ────────────────────────────────────
         IN   → transaction_time_in  only
         OUT  → transaction_time_out only
         BOTH → transaction_time_in + transaction_time_out
         reason is always sent as-is ("IN" | "OUT" | "BOTH")
      ─────────────────────────────────────────────────────────────────── */
      const payload: Parameters<typeof groupApproveByEmployeeIdsRequest>[0] = {
        reason,
        remarks: remarks || "",
        attachment,
        ...(selectedEmployees.length > 0 && { employeeIds: selectedEmployees.map(Number) }),
        ...(selectedEmployeeTypes.length > 0 && { employeeTypeIds: selectedEmployeeTypes.map(Number) }),
        ...(selectedDepartment && { department_id: selectedDepartment }),
        ...(selectedCostCode && { cost_code: selectedCostCode }),
      };

      if (reason === "BOTH") {
        // BOTH → two separate time fields
        payload.transaction_time_in = buildISO(date, timeIn!);
        payload.transaction_time_out = buildISO(date, timeOut!);
      } else {
        // IN or OUT → single transaction_time (original format)
        const time = reason === "IN" ? timeIn! : timeOut!;
        payload.transaction_time = buildISO(date, time);
      }

      GroupApplyPunchMutation.mutate(payload);
    } catch (error) {
      console.error("Form submission error", error);
      showToast("error", "formsubmission_error");
      setIsSubmitting(false);
    }
  }

  const handleCancel = () => {
    form.reset();
    setSelectedEmployees([]);
    setSelectedEmployeeTypes([]);
    setSelectedDepartment(undefined);
    setSelectedCostCode(undefined);
    setEmployeeSearchTerm("");
    setEmployeeTypeSearchTerm("");
    setCostCodeSearch("");
    if (on_open_change) on_open_change(false);
  };

  /* ── render ───────────────────────────────────────────────────────── */
  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="bg-accent transition-all duration-300 rounded-xl">

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {remarksLength > 500 && (
                <p className="text-xs text-destructive border border-red-200 rounded-md px-2 py-1 font-semibold bg-red-400 bg-opacity-10 flex items-center">
                  <ExclamationIcon className="mr-2" width="14" height="14" />
                  {formErrors.remarks_max_length || "Maximum 500 characters only allowed."}
                </p>
              )}
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid grid-cols-2 gap-y-5 gap-10 pt-8">

                {/* ── Reason — 3 options: IN / OUT / BOTH ────────────── */}
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.reason || "Reason"} <Required /></FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          // clear time errors on reason change
                          form.clearErrors(["timeIn", "timeOut"]);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t.placeholder_punch_type || "Select punch type"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="IN">IN</SelectItem>
                          <SelectItem value="OUT">OUT</SelectItem>
                          <SelectItem value="BOTH">BOTH</SelectItem>
                        </SelectContent>
                      </Select>
                      <TranslatedError fieldError={form.formState.errors.reason} translations={formErrors} />
                    </FormItem>
                  )}
                />

                {/* ── Date ───────────────────────────────────────────── */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.date || "Date"} <Required /></FormLabel>
                      <Popover
                        open={popoverStates.fromDate}
                        onOpenChange={(open) => setPopoverStates((prev) => ({ ...prev, fromDate: open }))}
                      >
                        <FormControl>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "flex justify-between h-10 w-full max-w-[350px] 3xl:max-w-[450px] rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? format(field.value, "dd/MM/yy")
                                : <span className="text-text-secondary">{t.placeholder_date || "Choose date"}</span>}
                              <CalendarIcon />
                            </Button>
                          </PopoverTrigger>
                        </FormControl>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => { field.onChange(date); closePopover("fromDate"); }}
                            disabled={isDateDisabled}
                            defaultMonth={today}
                            fromDate={allowedDaysAgo}
                            toDate={today}
                          />
                        </PopoverContent>
                      </Popover>
                      <TranslatedError fieldError={form.formState.errors.date} translations={formErrors} />
                    </FormItem>
                  )}
                />

                {/* ── Time IN — shown for IN and BOTH ────────────────── */}
                {(isIn || isBoth) && (
                  <FormField
                    control={form.control}
                    name="timeIn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {isBoth ? (t.time_in || "Time In") : (t.trans_time || "Time")} <Required />
                        </FormLabel>
                        <Popover
                          open={popoverStates.timeIn}
                          onOpenChange={(open) => setPopoverStates((prev) => ({ ...prev, timeIn: open }))}
                        >
                          <FormControl>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "flex justify-between h-10 w-full max-w-[350px] 3xl:max-w-[450px] rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? format(field.value, "HH:mm")
                                  : <span className="text-text-secondary">{t.placeholder_time_in || "Choose in time"}</span>}
                                <ClockIcon />
                              </Button>
                            </PopoverTrigger>
                          </FormControl>
                          <PopoverContent className="w-auto p-0">
                            <TimePicker setDate={field.onChange} date={field.value} />
                          </PopoverContent>
                        </Popover>
                        <TranslatedError fieldError={form.formState.errors.timeIn} translations={formErrors} />
                      </FormItem>
                    )}
                  />
                )}

                {/* ── Time OUT — shown for OUT and BOTH ──────────────── */}
                {(isOut || isBoth) && (
                  <FormField
                    control={form.control}
                    name="timeOut"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {isBoth ? (t.time_out || "Time Out") : (t.trans_time || "Time")} <Required />
                        </FormLabel>
                        <Popover
                          open={popoverStates.timeOut}
                          onOpenChange={(open) => setPopoverStates((prev) => ({ ...prev, timeOut: open }))}
                        >
                          <FormControl>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "flex justify-between h-10 w-full max-w-[350px] 3xl:max-w-[450px] rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? format(field.value, "HH:mm")
                                  : <span className="text-text-secondary">{t.placeholder_time_out || "Choose out time"}</span>}
                                <ClockIcon />
                              </Button>
                            </PopoverTrigger>
                          </FormControl>
                          <PopoverContent className="w-auto p-0">
                            <TimePicker setDate={field.onChange} date={field.value} />
                          </PopoverContent>
                        </Popover>
                        <TranslatedError fieldError={form.formState.errors.timeOut} translations={formErrors} />
                      </FormItem>
                    )}
                  />
                )}

                {/* ── Employee Type ───────────────────────────────────── */}
                <FormItem>
                  <FormLabel>{t.employee_type || "Employee Type"}</FormLabel>
                  <Select>
                    <SelectTrigger className="w-full max-w-[350px] 3xl:max-w-[450px]">
                      <SelectValue placeholder={getEmployeeTypePlaceholder()} />
                    </SelectTrigger>
                    <SelectContent
                      showSearch={true}
                      searchPlaceholder={t.search_employee_types || "Search employee types..."}
                      onSearchChange={setEmployeeTypeSearchTerm}
                      className="mt-5 w-full max-w-[350px] 3xl:max-w-[450px]"
                    >
                      {getEmployeeTypesData().length === 0 && debouncedEmployeeTypeSearch && (
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
                            <span>{language === "ar" ? item.employee_type_arb : item.employee_type_eng}</span>
                          </div>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </FormItem>

                {/* ── Department ─────────────────────────────────────── */}
                <FormItem className="flex flex-col">
                  <FormLabel>{t.department || "Department"}</FormLabel>
                  <Popover open={openDepartment} onOpenChange={setOpenDepartment}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        disabled={loadingDepartments}
                        className={cn(
                          "flex h-10 w-full max-w-[350px] 3xl:max-w-[450px] rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors hover:bg-transparent focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm justify-between",
                          !selectedDepartment && "text-text-secondary"
                        )}
                      >
                        <span className="truncate">
                          {selectedDepartment
                            ? getDepartmentsData().find((item: any) => item.department_id === selectedDepartment)
                            ?.[language === "ar" ? "department_name_arb" : "department_name_eng"] ||
                            t.placeholder_department || "Choose department"
                            : t.placeholder_department || "Choose department"}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 text-text-primary" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="max-w-[350px] 3xl:max-w-[450px] p-0">
                      <Command>
                        <CommandInput placeholder={t.search_department || "Search department..."} />
                        <CommandEmpty>{t.no_results || "No department found"}</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {selectedDepartment !== undefined && (
                            <CommandItem
                              value="__clear_dept__"
                              onSelect={() => { setSelectedDepartment(undefined); setOpenDepartment(false); }}
                              className="text-text-secondary italic"
                            >
                              {t.all_departments || "All departments"}
                            </CommandItem>
                          )}
                          {getDepartmentsData().map((item: any) => (
                            <CommandItem
                              key={item.department_id}
                              value={language === "ar" ? item.department_name_arb : item.department_name_eng}
                              onSelect={() => {
                                setSelectedDepartment(
                                  selectedDepartment === item.department_id ? undefined : item.department_id
                                );
                                setOpenDepartment(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedDepartment === item.department_id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {language === "ar" ? item.department_name_arb : item.department_name_eng}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormItem>

                {/* ── Cost Code ──────────────────────────────────────── */}
                <FormItem className="flex flex-col">
                  <FormLabel>{t.cost_code || "Cost Code"}</FormLabel>
                  <Popover open={openCostCode} onOpenChange={setOpenCostCode}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        disabled={loadingCostCodes}
                        className={cn(
                          "flex h-10 w-full max-w-[350px] 3xl:max-w-[450px] rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors hover:bg-transparent focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm justify-between",
                          !selectedCostCode && "text-text-secondary"
                        )}
                      >
                        <span className="truncate">
                          {selectedCostCode || t.placeholder_cost_code || "Choose cost code"}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 text-text-primary" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="max-w-[350px] 3xl:max-w-[450px] p-0">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder={t.search_cost_code || "Search cost code..."}
                          onValueChange={setCostCodeSearch}
                        />
                        <CommandGroup className="max-h-64 overflow-auto">
                          {selectedCostCode !== undefined && (
                            <CommandItem
                              value="__clear_cc__"
                              onSelect={() => { setSelectedCostCode(undefined); setCostCodeSearch(""); setOpenCostCode(false); }}
                              className="text-text-secondary italic"
                            >
                              {t.all_cost_codes || "All cost codes"}
                            </CommandItem>
                          )}
                          {getCostCodesData().length === 0 ? (
                            <CommandEmpty>{t.no_results || "No cost code found"}</CommandEmpty>
                          ) : (
                            getCostCodesData().map((item: string, index: number) => (
                              <CommandItem
                                key={`${item}-${index}`}
                                value={item}
                                onSelect={() => {
                                  setSelectedCostCode(selectedCostCode === item ? undefined : item);
                                  setCostCodeSearch("");
                                  setOpenCostCode(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedCostCode === item ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {item}
                              </CommandItem>
                            ))
                          )}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormItem>

                {/* ── Employee ──────────────────────────────────────── */}
                <FormItem>
                  <FormLabel>{t.employee || "Employee"}</FormLabel>
                  <Select>
                    <SelectTrigger className="w-full max-w-[350px] 3xl:max-w-[450px]">
                      <SelectValue placeholder={getEmployeePlaceholder()} />
                    </SelectTrigger>
                    <SelectContent
                      showSearch={true}
                      searchPlaceholder={t.search_employees || "Search employees..."}
                      onSearchChange={setEmployeeSearchTerm}
                      className="mt-5 w-full max-w-[350px] 3xl:max-w-[450px]"
                    >
                      {isSearchingEmployees && debouncedEmployeeSearch.length > 0 && (
                        <div className="p-3 text-sm text-text-secondary">{t.searching || "Searching..."}</div>
                      )}
                      {getFilteredEmployees().length === 0 && !isSearchingEmployees && (
                        <div className="p-3 text-sm text-text-secondary">
                          {debouncedEmployeeSearch.length > 0
                            ? t.no_employees_found || "No employees found"
                            : (selectedEmployeeTypes.length > 0 || selectedDepartment !== undefined || selectedCostCode !== undefined)
                              ? t.no_employees_match_filter || "No employees match the selected filters"
                              : t.no_employees || "No employees available"}
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
                              {language === "ar"
                                ? `${item.firstname_arb || item.firstname_eng} ${item.emp_no ? `(${item.emp_no})` : ""}`
                                : `${item.firstname_eng} ${item.emp_no ? `(${item.emp_no})` : ""}`}
                            </span>
                          </div>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </FormItem>

                {/* ── Remarks — now mandatory ────────────────────────── */}
                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.remarks || "Remarks"} <Required /></FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t.placeholder_remarks || "Add your remarks here"}
                          {...field}
                          rows={5}
                          onChange={(e) => { field.onChange(e); setRemarksLength(e.target.value.length); }}
                        />
                      </FormControl>
                      <TranslatedError fieldError={form.formState.errors.remarks} translations={formErrors} />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="attachment"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>{t.attachment || "Attachment"} <Required /></FormLabel>
                      <FormControl>
                        <Input
                          {...fieldProps}
                          className="border-0 p-0 rounded-none h-auto text-text-secondary"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/jpg,image/png"
                          onChange={(e) => { const file = e.target.files?.[0]; onChange(file ?? undefined); }}
                        />
                      </FormControl>
                      <p className="text-xs text-text-secondary">
                        {t.group_apply_attachment_note || "PDF, JPG, PNG — max 5 MB"}
                      </p>
                      <TranslatedError fieldError={form.formState.errors.attachment} translations={formErrors} />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2 items-center py-3 pt-8">
                <div className="flex gap-4">
                  <Button variant="outline" type="button" size="lg" className="w-full" onClick={handleCancel}>
                    {translations.buttons?.cancel || "Cancel"}
                  </Button>
                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting
                      ? translations.buttons?.applying || "Applying..."
                      : translations.buttons?.apply || "Apply"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>

      {/* ── Confirmation modal — matches ApprovalModal structure ─────── */}
      <ResponsiveModal
        open={showConfirm}
        onOpenChange={(open) => { if (!open) setShowConfirm(false); }}
      >
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>
              {t.confirm_group_apply_title || "Confirm Manual Adjustment"}
            </ResponsiveModalTitle>
            <ResponsiveModalDescription>
              {t.confirm_group_apply_desc
                ? t.confirm_group_apply_desc.replace("{count}", String(affectedCount))
                : `You have selected ${affectedCount} employee${affectedCount !== 1 ? "s" : ""} for manual punch adjustment. This action will create a pending transaction for each employee. Do you want to proceed?`}
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>

          {/* summary chips */}
          <div className="flex flex-wrap gap-2 py-3 pt-6 justify-center">
            {pendingValues?.reason && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                {pendingValues.reason}
              </span>
            )}
            {pendingValues?.date && (
              <span className="text-xs bg-background border border-border-accent px-2 py-1 rounded-full">
                {format(pendingValues.date, "dd MMM yyyy")}
              </span>
            )}
            {pendingValues?.timeIn && (
              <span className="text-xs bg-background border border-border-accent px-2 py-1 rounded-full">
                {isBoth ? "In: " : ""}{format(pendingValues.timeIn, "HH:mm")}
              </span>
            )}
            {pendingValues?.timeOut && (
              <span className="text-xs bg-background border border-border-accent px-2 py-1 rounded-full">
                {isBoth ? "Out: " : ""}{format(pendingValues.timeOut, "HH:mm")}
              </span>
            )}
            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-full font-medium">
              {affectedCount} {affectedCount !== 1 ? (t.employees || "employees") : (t.employee || "employee")}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              type="button"
              size="lg"
              className="flex-1"
              onClick={() => setShowConfirm(false)}
              disabled={isSubmitting}
            >
              {translations.buttons?.cancel || "Cancel"}
            </Button>
            <Button
              variant="success"
              type="button"
              size="lg"
              className="flex-1"
              onClick={handleConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? translations.buttons?.applying || "Applying..."
                : translations.buttons?.confirm || "Confirm"}
            </Button>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </>
  );
}
