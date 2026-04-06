"use client";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
import { Check, ChevronsUpDown } from "lucide-react";
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
  getAllCostCenters,
} from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useDebounce } from "@/src/hooks/useDebounce";

const ALLOWED_ATTACHMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];
const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;

const formSchema = z.object({
  reason: z
    .string()
    .min(1, { message: "reason_required" })
    .max(100, { message: "reason_max_length" }),
  date: z.date({ required_error: "date_required" }),
  time: z.date({ required_error: "time_required" }),
  remarks: z.string().max(500, { message: "remarks_max_length" }).optional(),

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

export default function GroupApplyPunch({
  on_open_change,
  rowData,
  punchType,
}: {
  on_open_change?: any;
  rowData?: any;
  punchType?: string;
}) {
  const { employeeId, userInfo } = useAuthGuard();
  const { language, translations } = useLanguage();
  const showToast = useShowToast();

  const t = translations?.modules?.selfServices || {};
  const formErrors = translations?.formErrors || {};

  const [remarksLength, setRemarksLength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const [popoverStates, setPopoverStates] = useState({
    fromDate: false,
    fromTime: false,
  });

  const [selectedEmployeeTypes, setSelectedEmployeeTypes] = useState<string[]>([]);
  const [employeeTypeSearchTerm, setEmployeeTypeSearchTerm] = useState("");

  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const debouncedEmployeeSearch = useDebounce(employeeSearchTerm, 300);
  const debouncedEmployeeTypeSearch = useDebounce(employeeTypeSearchTerm, 300);

  const [selectedDepartment, setSelectedDepartment] = useState<number | undefined>(undefined);
  const [openDepartment, setOpenDepartment] = useState(false);

  const [selectedCostCenter, setSelectedCostCenter] = useState<string | undefined>(undefined);
  const [openCostCenter, setOpenCostCenter] = useState(false);
  const [costCenterSearch, setCostCenterSearch] = useState("");

  const closePopover = (key: string) =>
    setPopoverStates((prev) => ({ ...prev, [key]: false }));

  const orgId = userInfo?.organization_id ?? userInfo?.organization?.id;

  const today = startOfDay(new Date());

  const allowedDays = orgId === 25 ? 4 : 7;

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

  const { data: costCentersData, isLoading: loadingCostCenters } = useQuery({
    queryKey: ["costCenters"],
    queryFn: getAllCostCenters,
  });

  const employeeTypeKey = selectedEmployeeTypes.slice().sort().join(",");

  const employeeSearchParams = useMemo(
    () => ({
      limit: "1000",
      offset: "1",
      ...(employeeTypeKey && { employeeTypeids: employeeTypeKey }),
    }),
    [employeeTypeKey]
  );

  const { data: employees } = useFetchAllEntity("employee", {
    searchParams: employeeSearchParams,
  });

  const { data: searchedEmployees, isLoading: isSearchingEmployees } = useQuery({
    queryKey: ["employeeSearch", debouncedEmployeeSearch, selectedEmployeeTypes],
    queryFn: async () => {
      let url = `/employee/search?search=${encodeURIComponent(debouncedEmployeeSearch)}`;
      if (selectedEmployeeTypes.length > 0) {
        url += `&employeeTypeids=${selectedEmployeeTypes.join(",")}`;
      }
      return apiRequest(url, "GET");
    },
    enabled: debouncedEmployeeSearch.length > 0,
  });

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

  const getCostCentersData = (): string[] => {
    const raw = costCentersData?.data ?? costCentersData ?? [];
    const list: string[] = Array.isArray(raw)
      ? raw.filter((item: any) => typeof item === "string" && item.trim() !== "")
      : [];
    if (!costCenterSearch) return list;
    return list.filter((item) =>
      item.toLowerCase().includes(costCenterSearch.toLowerCase())
    );
  };

  const getFilteredEmployees = () => {
    const baseData =
      debouncedEmployeeSearch.length > 0
        ? searchedEmployees?.data || []
        : employees?.data || [];
    return baseData.filter(
      (item: any) => item.employee_id && item.employee_id.toString().trim() !== ""
    );
  };

  const handleEmployeeTypeToggle = (typeId: string) => {
    setSelectedEmployeeTypes((prev) =>
      prev.includes(typeId) ? prev.filter((t) => t !== typeId) : [...prev, typeId]
    );
    setSelectedEmployees([]);
    setEmployeeSearchTerm("");
  };

  const handleEmployeeToggle = (empId: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  const getEmployeeTypePlaceholder = () => {
    if (selectedEmployeeTypes.length === 0) return t.placeholder_employee_type || "Choose type";
    return `${selectedEmployeeTypes.length} ${t.type || "type"}${selectedEmployeeTypes.length > 1 ? "s" : ""} ${t.selected || "selected"}`;
  };

  const getEmployeePlaceholder = () => {
    if (selectedEmployees.length === 0) return t.choose_employee || "Choose employee";
    return `${selectedEmployees.length} ${t.employee || "employee"}${selectedEmployees.length > 1 ? "s" : ""} ${t.selected || "selected"}`;
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { reason: "", remarks: "" },
  });

  const GroupApplyPunchMutation = useMutation({
    mutationFn: groupApproveByEmployeeIdsRequest,
    onSuccess: () => {
      showToast("success", "group_apply_punch_success");
      queryClient.invalidateQueries({ queryKey: ["missingMovement"],exact: false });
      setIsSubmitting(false);
      if (on_open_change) on_open_change(false);
    },
    onError: (error: any) => {
      console.error("API Error:", error);
      showToast("error", "group_apply_punch_error");
      setIsSubmitting(false);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const parseTransDate = useCallback((dateString: string) => {
    if (!dateString) return new Date();
    const parts = dateString.split("/");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date(dateString);
  }, []);

  useEffect(() => {
    if (rowData && punchType) {
      form.setValue("reason", punchType);
      if (rowData.TransDate) {
        form.setValue("date", parseTransDate(rowData.TransDate));
      }
    }
  }, [rowData, punchType, form, parseTransDate]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const combinedDateTime = new Date(values.date);
      combinedDateTime.setHours(values.time.getHours());
      combinedDateTime.setMinutes(values.time.getMinutes());
      combinedDateTime.setSeconds(values.time.getSeconds());
      combinedDateTime.setMilliseconds(0);

      const year = combinedDateTime.getFullYear();
      const month = String(combinedDateTime.getMonth() + 1).padStart(2, "0");
      const day = String(combinedDateTime.getDate()).padStart(2, "0");
      const hours = String(combinedDateTime.getHours()).padStart(2, "0");
      const minutes = String(combinedDateTime.getMinutes()).padStart(2, "0");
      const seconds = String(combinedDateTime.getSeconds()).padStart(2, "0");

      const transaction_time = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;

      GroupApplyPunchMutation.mutate({
        transaction_time,
        reason: values.reason,
        remarks: values.remarks || "",
        attachment: values.attachment,
        ...(selectedEmployees.length > 0 && {
          employeeIds: selectedEmployees.map(Number),
        }),
        ...(selectedEmployeeTypes.length > 0 && {
          employeeTypeIds: selectedEmployeeTypes.map(Number),
        }),
        ...(selectedDepartment && { department_id: selectedDepartment }),
        ...(selectedCostCenter && { cost_center: selectedCostCenter }),
      });
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
    setSelectedCostCenter(undefined);
    setEmployeeSearchTerm("");
    setEmployeeTypeSearchTerm("");
    setCostCenterSearch("");
    if (on_open_change) on_open_change(false);
  };

  return (
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

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t.reason || "Reason"} <Required />
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t.placeholder_punch_type || "Select punch type"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="IN">IN</SelectItem>
                        <SelectItem value="OUT">OUT</SelectItem>
                      </SelectContent>
                    </Select>
                    <TranslatedError fieldError={form.formState.errors.reason} translations={formErrors} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t.date || "Date"} <Required />
                    </FormLabel>
                    <Popover
                      open={popoverStates.fromDate}
                      onOpenChange={(open) =>
                        setPopoverStates((prev) => ({ ...prev, fromDate: open }))
                      }
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
                            {field.value ? (
                              format(field.value, "dd/MM/yy")
                            ) : (
                              <span className="text-text-secondary">
                                {t.placeholder_date || "Choose date"}
                              </span>
                            )}
                            <CalendarIcon />
                          </Button>
                        </PopoverTrigger>
                      </FormControl>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            closePopover("fromDate");
                          }}
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

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t.trans_time || "Time"} <Required />
                    </FormLabel>
                    <Popover
                      open={popoverStates.fromTime}
                      onOpenChange={(open) =>
                        setPopoverStates((prev) => ({ ...prev, fromTime: open }))
                      }
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
                            {field.value ? (
                              format(field.value, "HH:mm")
                            ) : (
                              <span className="text-text-secondary">
                                {t.placeholder_time || "Choose time"}
                              </span>
                            )}
                            <ClockIcon />
                          </Button>
                        </PopoverTrigger>
                      </FormControl>
                      <PopoverContent className="w-auto p-0">
                        <TimePicker setDate={field.onChange} date={field.value} />
                      </PopoverContent>
                    </Popover>
                    <TranslatedError fieldError={form.formState.errors.time} translations={formErrors} />
                  </FormItem>
                )}
              />

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
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEmployeeTypeToggle(typeValue);
                          }}
                        >
                          <Checkbox checked={isChecked} className="mr-2" />
                          <span>
                            {language === "ar" ? item.employee_type_arb : item.employee_type_eng}
                          </span>
                        </div>
                      );
                    })}
                  </SelectContent>
                </Select>
              </FormItem>

              <FormItem className="flex flex-col">
                <FormLabel>{t.department || "Department"}</FormLabel>
                <Popover open={openDepartment} onOpenChange={setOpenDepartment}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openDepartment}
                      disabled={loadingDepartments}
                      className={cn(
                        "flex h-10 w-full max-w-[350px] 3xl:max-w-[450px] rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors hover:bg-transparent focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm justify-between",
                        !selectedDepartment && "text-text-secondary"
                      )}
                    >
                      <span className="truncate">
                        {selectedDepartment
                          ? getDepartmentsData().find(
                            (item: any) => item.department_id === selectedDepartment
                          )?.[language === "ar" ? "department_name_arb" : "department_name_eng"] ||
                          t.placeholder_department || "Choose department"
                          : t.placeholder_department || "Choose department"}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="max-w-[350px] 3xl:max-w-[450px] p-0">
                    <Command>
                      <CommandInput placeholder={t.search_department || "Search department..."} />
                      <CommandEmpty>{t.no_results || "No department found"}</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
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

              <FormItem className="flex flex-col">
                <FormLabel>{t.cost_center || "Cost Center"}</FormLabel>
                <Popover open={openCostCenter} onOpenChange={setOpenCostCenter}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCostCenter}
                      disabled={loadingCostCenters}
                      className={cn(
                        "flex h-10 w-full max-w-[350px] 3xl:max-w-[450px] rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors hover:bg-transparent focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm justify-between",
                        !selectedCostCenter && "text-text-secondary"
                      )}
                    >
                      <span className="truncate">
                        {selectedCostCenter || t.placeholder_cost_center || "Choose cost center"}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="max-w-[350px] 3xl:max-w-[450px] p-0">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder={t.search_cost_center || "Search cost center..."}
                        onValueChange={setCostCenterSearch}
                      />
                      <CommandGroup className="max-h-64 overflow-auto">
                        {getCostCentersData().length === 0 ? (
                          <CommandEmpty>{t.no_results || "No cost center found"}</CommandEmpty>
                        ) : (
                          getCostCentersData().map((item: string, index: number) => (
                            <CommandItem
                              key={`${item}-${index}`}
                              value={item}
                              onSelect={() => {
                                setSelectedCostCenter(
                                  selectedCostCenter === item ? undefined : item
                                );
                                setCostCenterSearch("");
                                setOpenCostCenter(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedCostCenter === item ? "opacity-100" : "opacity-0"
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

              <div className="grid gap-3">

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
                        <div className="p-3 text-sm text-text-secondary">
                          {t.searching || "Searching..."}
                        </div>
                      )}
                      {getFilteredEmployees().length === 0 && !isSearchingEmployees && (
                        <div className="p-3 text-sm text-text-secondary">
                          {debouncedEmployeeSearch.length > 0
                            ? t.no_employees_found || "No employees found"
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
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleEmployeeToggle(empId);
                            }}
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

                <FormField
                  control={form.control}
                  name="attachment"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>
                        {t.attachment || "Attachment"} <Required />
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...fieldProps}
                          className="border-0 p-0 rounded-none h-auto text-text-secondary"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/jpg,image/png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            onChange(file ?? undefined);
                          }}
                        />
                      </FormControl>
                      <p className="text-xs text-text-secondary">
                        {t.group_apply_attachment_note || "PDF, JPG, PNG — max 5 MB"}
                      </p>
                      <TranslatedError
                        fieldError={form.formState.errors.attachment}
                        translations={formErrors}
                      />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.remarks || "Remarks"}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t.placeholder_remarks || "Add your remarks here"}
                        {...field}
                        rows={5}
                        onChange={(e) => {
                          field.onChange(e);
                          setRemarksLength(e.target.value.length);
                        }}
                      />
                    </FormControl>
                    <TranslatedError fieldError={form.formState.errors.remarks} translations={formErrors} />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 items-center py-3 pt-8">
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  type="button"
                  size="lg"
                  className="w-full"
                  onClick={handleCancel}
                >
                  {translations.buttons?.cancel || "Cancel"}
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
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
  );
}