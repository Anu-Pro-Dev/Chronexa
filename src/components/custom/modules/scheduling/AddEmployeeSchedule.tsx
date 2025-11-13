"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import Required from "@/src/components/ui/required";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { CalendarIcon } from "@/src/icons/icons";
import { Calendar } from "@/src/components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/src/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useQuery } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addEmpScheduleRequest, editEmpScheduleRequest, searchEmployees } from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";
import { cn } from "@/src/lib/utils";

const formSchema = z.object({
  from_date: z.date({ required_error: "from_date_required" }).optional(),
  to_date: z.date({ required_error: "to_date_required" }).optional(),
  employee_id: z.coerce.number({ required_error: "employee_required" }).min(1, { message: "employee_required" }),
  schedule_id: z.coerce.number({ required_error: "schedule_required" }).min(1, { message: "schedule_required" }),
  sunday_schedule_id: z.coerce.number().optional(),
  monday_schedule_id: z.coerce.number().optional(),
  tuesday_schedule_id: z.coerce.number().optional(),
  wednesday_schedule_id: z.coerce.number().optional(),
  thursday_schedule_id: z.coerce.number().optional(),
  friday_schedule_id: z.coerce.number().optional(),
  saturday_schedule_id: z.coerce.number().optional(),
  attachment: z.custom<any>(
    (value) => {
      if (!value) return true;
      if (!(value instanceof File)) {
        return false;
      }
      const maxSize = 5 * 1024 * 1024;
      if (value.size > maxSize) {
        return false;
      }
      const allowedTypes = ["image/jpeg", "image/png"];
      if (!allowedTypes.includes(value.type)) {
        return false;
      }
      return true;
    },
    {
      message: "attachment_invalid",
    }
  ).optional(),
});

export default function AddEmployeeSchedule({
  selectedRowData,
  onSave,
}: {
  selectedRowData?: any;
  onSave: (id: string | null, newData: any) => void;
}) {

  const { language, translations } = useLanguage();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [scheduleSearchTerm, setScheduleSearchTerm] = useState("");
  const showToast = useShowToast();
  const t = translations?.modules?.schedulingModule || {};
  const errT = translations?.formErrors || {};
  
  const [popoverStates, setPopoverStates] = useState({
    fromDate: false,
    toDate: false,
    employee: false,
    schedule: false,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  });

  const closePopover = (key: string) => {
    setPopoverStates(prev => ({ ...prev, [key]: false }));
  };
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      from_date: undefined,
      to_date: undefined,
      employee_id: undefined,
      schedule_id: undefined,
      sunday_schedule_id: undefined,
      monday_schedule_id: undefined,
      tuesday_schedule_id: undefined,
      wednesday_schedule_id: undefined,
      thursday_schedule_id: undefined,
      friday_schedule_id: undefined,
      saturday_schedule_id: undefined,
    },
  });

  const scheduleId = form.watch("schedule_id");
  const employeeId = form.watch("employee_id");
  const prevEmpIdRef = useRef(employeeId);

  const { data: employees } = useFetchAllEntity("employee", {
    searchParams: {
      ...(employeeSearchTerm && { search: employeeSearchTerm }),
    },
  });

  const { data: schedules, isLoading: isSearchingSchedules } = useFetchAllEntity("schedule", {
    searchParams: {
      ...(scheduleSearchTerm && { search: scheduleSearchTerm }),
    },
    removeAll: true,
  });

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

  const getFilteredSchedules = () => {
    return (schedules?.data || []).filter((item: any) => 
      item.schedule_id && item.schedule_id.toString().trim() !== ''
    );
  };

  const getEmployeeName = (empId: number) => {
    const emp = employees?.data?.find((o: any) => o.employee_id === empId);
    if (!emp) return "";
    return language === "ar"
      ? emp.firstname_arb || emp.employee_arb || emp.employee_name
      : emp.firstname_eng || emp.employee_eng || emp.employee_name;
  };

  const getScheduleCode = (schedId: number) => {
    const sched = schedules?.data?.find((s: any) => s.schedule_id === schedId);
    return sched?.schedule_code || "";
  };

  useEffect(() => {
    if (selectedRowData) {
      form.reset({
        from_date: selectedRowData.from_date ? new Date(selectedRowData.from_date) : undefined,
        to_date: selectedRowData.to_date ? new Date(selectedRowData.to_date) : undefined,
        employee_id: selectedRowData.employee_id,
        schedule_id: selectedRowData.schedule_id,
        monday_schedule_id: selectedRowData.monday_schedule_id,
        tuesday_schedule_id: selectedRowData.tuesday_schedule_id,
        wednesday_schedule_id: selectedRowData.wednesday_schedule_id,
        thursday_schedule_id: selectedRowData.thursday_schedule_id,
        friday_schedule_id: selectedRowData.friday_schedule_id,
        saturday_schedule_id: selectedRowData.saturday_schedule_id,
        sunday_schedule_id: selectedRowData.sunday_schedule_id,
      });
    }
  }, [selectedRowData]);

  useEffect(() => {
    if (!scheduleId || selectedRowData) return;

    const currentValues = form.getValues();
    const updatedFields: Partial<typeof currentValues> = {};
    const days: (keyof typeof currentValues)[] = [
      "monday_schedule_id",
      "tuesday_schedule_id",
      "wednesday_schedule_id",
      "thursday_schedule_id",
      "friday_schedule_id",
      "saturday_schedule_id",
      "sunday_schedule_id",
    ];

    let shouldUpdate = false;

    days.forEach((dayKey) => {
      if (!currentValues[dayKey]) {
        updatedFields[dayKey] = scheduleId;
        shouldUpdate = true;
      }
    });

    if (shouldUpdate) {
      form.setValue("monday_schedule_id", updatedFields.monday_schedule_id ?? currentValues.monday_schedule_id);
      form.setValue("tuesday_schedule_id", updatedFields.tuesday_schedule_id ?? currentValues.tuesday_schedule_id);
      form.setValue("wednesday_schedule_id", updatedFields.wednesday_schedule_id ?? currentValues.wednesday_schedule_id);
      form.setValue("thursday_schedule_id", updatedFields.thursday_schedule_id ?? currentValues.thursday_schedule_id);
      form.setValue("friday_schedule_id", updatedFields.friday_schedule_id ?? currentValues.friday_schedule_id);
      form.setValue("saturday_schedule_id", updatedFields.saturday_schedule_id ?? currentValues.saturday_schedule_id);
      form.setValue("sunday_schedule_id", updatedFields.sunday_schedule_id ?? currentValues.sunday_schedule_id);
    }
  }, [scheduleId, form, selectedRowData]);

  useEffect(() => {
    if (prevEmpIdRef.current !== employeeId && prevEmpIdRef.current !== undefined) {
      form.resetField("schedule_id");
      form.resetField("monday_schedule_id");
      form.resetField("tuesday_schedule_id");
      form.resetField("wednesday_schedule_id");
      form.resetField("thursday_schedule_id");
      form.resetField("friday_schedule_id");
      form.resetField("saturday_schedule_id");
      form.resetField("sunday_schedule_id");
    }
    prevEmpIdRef.current = employeeId;
  }, [employeeId, form]);
  
  const addMutation = useMutation({
    mutationFn: addEmpScheduleRequest,
    onSuccess: (data) => {
      showToast("success", "addempschedule_success");     
      onSave(null, data.data);
      queryClient.invalidateQueries({ queryKey: ["employeeSchedule"] });
      router.push("/scheduling/weekly-schedule/employee-schedule");
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        showToast("error", "findduplicate_error");
      } else {
        showToast("error", "formsubmission_error"); 
      }
    },
  });

  const editMutation = useMutation({
    mutationFn: editEmpScheduleRequest,
    onSuccess: (_data, variables) => {
      showToast("success", "updateempschedule_success");
      onSave(variables.employee_schedule_id?.toString() ?? null, variables);
      queryClient.invalidateQueries({ queryKey: ["employeeSchedule"] });
      router.push("/scheduling/weekly-schedule/employee-schedule");
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        showToast("error", "findduplicate_error");
      } else {
        showToast("error", "formsubmission_error"); 
      }
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const payload: any = {
        from_date: values.from_date
          ? format(values.from_date, "yyyy-MM-dd")
          : undefined,
        to_date: values.to_date
          ? format(values.to_date, "yyyy-MM-dd")
          : undefined,
        employee_id: values.employee_id,
        schedule_id: values.schedule_id,
        sunday_schedule_id: values.sunday_schedule_id,
        monday_schedule_id: values.monday_schedule_id,
        tuesday_schedule_id: values.tuesday_schedule_id,
        wednesday_schedule_id: values.wednesday_schedule_id,
        thursday_schedule_id: values.thursday_schedule_id,
        friday_schedule_id: values.friday_schedule_id,
        saturday_schedule_id: values.saturday_schedule_id,
      };

      if (values.attachment) {
        payload.attachment = values.attachment;
      }

      if (selectedRowData) {
        editMutation.mutate({
          employee_schedule_id: selectedRowData.id,
          ...payload,
        });
      } else {
        addMutation.mutate(payload);
      }
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const isEditMode = !!selectedRowData;
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="bg-accent p-6 rounded-2xl">
        <h1 className="text-primary text-lg font-bold mb-4">
          {isEditMode ? t.edit_employee_schedule || "Edit Employee Schedule" : t.employee_schedule || "Employee Schedule"}
        </h1>
        <div className="flex flex-col gap-6 px-5">
          <div className="p-5 grid grid-cols-2 gap-y-5 gap-x-20">
            <FormField
              control={form.control}
              name="from_date"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>
                    {t.from_date || "From Date"} <Required />
                  </FormLabel>
                  <Popover open={popoverStates.fromDate} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, fromDate: open }))}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button size={"lg"} variant={"outline"}
                          className="w-full bg-accent px-3 flex justify-between text-text-primary max-w-[350px] text-sm font-normal"
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yy")
                          ) : (
                            <span className="font-normal text-sm text-text-secondary">{t.placeholder_date || "Choose date"}</span>
                          )}
                          <CalendarIcon />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? field.value : undefined}
                        onSelect={(date) => {
                          field.onChange(date)
                          closePopover('fromDate')
                        }}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <TranslatedError
                    fieldError={form.formState.errors.from_date}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="to_date"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>
                    {t.to_date || "To Date"} <Required />
                  </FormLabel>
                  <Popover open={popoverStates.toDate} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, toDate: open }))}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button size={"lg"} variant={"outline"}
                          className="w-full bg-accent px-3 flex justify-between text-text-primary max-w-[350px] text-sm font-normal"
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yy")
                          ) : (
                            <span className="font-normal text-sm text-text-secondary">{t.placeholder_date || "Choose date"}</span>
                          )}
                          <CalendarIcon />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? field.value : undefined}
                        onSelect={(date) => {
                          field.onChange(date)
                          closePopover('toDate')
                        }}
                        disabled={(date) => {
                          const empScheduleStartDate = form.getValues("from_date");
                          
                          if (!empScheduleStartDate) {
                            return true;
                          }
                          
                          const startDate = new Date(empScheduleStartDate);
                          startDate.setHours(0, 0, 0, 0);
                          
                          const compareDate = new Date(date);
                          compareDate.setHours(0, 0, 0, 0);
                          return compareDate <= startDate;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <TranslatedError
                    fieldError={form.formState.errors.to_date}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employee_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex gap-1">
                    {t.employee || "Employee"} <Required />
                  </FormLabel>
                  <Popover open={popoverStates.employee} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, employee: open }))}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={popoverStates.employee}
                          className={cn(
                            "flex h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors hover:bg-transparent focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm max-w-[350px] justify-between",
                            !field.value && "text-text-secondary"
                          )}
                          disabled={isSearchingEmployees}
                        >
                          <span className="truncate">
                            {field.value
                              ? getEmployeeName(field.value)
                              : t.placeholder_employee || "Choose employee"}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[350px] p-0 border-none shadow-dropdown">
                      <Command>
                        <CommandInput 
                          placeholder={t.search_employees || "Search employees..."} 
                          className="border-none"
                          onValueChange={setEmployeeSearchTerm}
                        />
                        <CommandEmpty>
                          {isSearchingEmployees && employeeSearchTerm.length > 0
                            ? t.searching || "Searching..."
                            : t.no_employee_found || "No employee found"}
                        </CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {getFilteredEmployees().map((item: any) => {
                            const name = language === "ar"
                              ? item.firstname_arb || item.employee_arb || item.employee_name
                              : item.firstname_eng || item.employee_eng || item.employee_name;
                            return (
                              <CommandItem
                                key={item.employee_id}
                                value={name}
                                onSelect={() => {
                                  field.onChange(item.employee_id);
                                  closePopover('employee');
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === item.employee_id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {name}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <TranslatedError
                    fieldError={form.formState.errors.employee_id}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            {!isEditMode && (
              <FormField
                control={form.control}
                name="schedule_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex gap-1">
                      {t.schedule || "Schedule"} <Required />
                    </FormLabel>
                    <Popover open={popoverStates.schedule} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, schedule: open }))}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={popoverStates.schedule}
                            className={cn(
                              "flex h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors hover:bg-transparent focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm max-w-[350px] justify-between",
                              !field.value && "text-text-secondary"
                            )}
                            disabled={isSearchingSchedules}
                          >
                            <span className="truncate">
                              {field.value
                                ? getScheduleCode(field.value)
                                : t.placeholder_schedule || "Choose schedule"}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[350px] p-0 border-none shadow-dropdown">
                        <Command>
                          <CommandInput 
                            placeholder={t.search_schedules || "Search schedules..."} 
                            className="border-none"
                            onValueChange={setScheduleSearchTerm}
                          />
                          <CommandEmpty>
                            {isSearchingSchedules && scheduleSearchTerm.length > 0
                              ? t.searching || "Searching..."
                              : t.no_schedules_found || "No schedules found"}
                          </CommandEmpty>
                          <CommandGroup className="max-h-64 overflow-auto">
                            {getFilteredSchedules().map((item: any) => (
                              <CommandItem
                                key={item.schedule_id}
                                value={item.schedule_code}
                                onSelect={() => {
                                  field.onChange(item.schedule_id);
                                  closePopover('schedule');
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === item.schedule_id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {item.schedule_code}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <TranslatedError
                      fieldError={form.formState.errors.schedule_id}
                      translations={errT}
                    />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="monday_schedule_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex gap-1">{t.monday || "Monday"}</FormLabel>
                  <Popover open={popoverStates.monday} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, monday: open }))}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={popoverStates.monday}
                          className={cn(
                            "flex h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors hover:bg-transparent focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm max-w-[350px] justify-between",
                            !field.value && "text-text-secondary"
                          )}
                        >
                          <span className="truncate">
                            {field.value
                              ? getScheduleCode(field.value)
                              : t.placeholder_schedule || "Choose schedule"}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[350px] p-0 border-none shadow-dropdown">
                      <Command>
                        <CommandInput placeholder={t.search_schedules || "Search schedules..."} className="border-none" />
                        <CommandEmpty>{t.no_schedules_found || "No schedules found"}</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {getFilteredSchedules().map((item: any) => (
                            <CommandItem
                              key={item.schedule_id}
                              value={item.schedule_code}
                              onSelect={() => {
                                field.onChange(item.schedule_id);
                                closePopover('monday');
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === item.schedule_id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {item.schedule_code}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <TranslatedError
                    fieldError={form.formState.errors.monday_schedule_id}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tuesday_schedule_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex gap-1">{t.tuesday || "Tuesday"}</FormLabel>
                  <Popover open={popoverStates.tuesday} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, tuesday: open }))}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={popoverStates.tuesday}
                          className={cn(
                            "flex h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors hover:bg-transparent focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm max-w-[350px] justify-between",
                            !field.value && "text-text-secondary"
                          )}
                        >
                          <span className="truncate">
                            {field.value
                              ? getScheduleCode(field.value)
                              : t.placeholder_schedule || "Choose schedule"}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[350px] p-0 border-none shadow-dropdown">
                      <Command>
                        <CommandInput placeholder={t.search_schedules || "Search schedules..."} className="border-none" />
                        <CommandEmpty>{t.no_schedules_found || "No schedules found"}</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {getFilteredSchedules().map((item: any) => (
                            <CommandItem
                              key={item.schedule_id}
                              value={item.schedule_code}
                              onSelect={() => {
                                field.onChange(item.schedule_id);
                                closePopover('tuesday');
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === item.schedule_id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {item.schedule_code}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <TranslatedError
                    fieldError={form.formState.errors.tuesday_schedule_id}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="wednesday_schedule_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex gap-1">{t.wednesday || "Wednesday"}</FormLabel>
                  <Popover open={popoverStates.wednesday} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, wednesday: open }))}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={popoverStates.wednesday}
                          className={cn(
                            "flex h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors hover:bg-transparent focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm max-w-[350px] justify-between",
                            !field.value && "text-text-secondary"
                          )}
                        >
                          <span className="truncate">
                            {field.value
                              ? getScheduleCode(field.value)
                              : t.placeholder_schedule || "Choose schedule"}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[350px] p-0 border-none shadow-dropdown">
                      <Command>
                        <CommandInput placeholder={t.search_schedules || "Search schedules..."} className="border-none" />
                        <CommandEmpty>{t.no_schedules_found || "No schedules found"}</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {getFilteredSchedules().map((item: any) => (
                            <CommandItem
                              key={item.schedule_id}
                              value={item.schedule_code}
                              onSelect={() => {
                                field.onChange(item.schedule_id);
                                closePopover('wednesday');
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === item.schedule_id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {item.schedule_code}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <TranslatedError
                    fieldError={form.formState.errors.wednesday_schedule_id}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="thursday_schedule_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex gap-1">{t.thursday || "Thursday"}</FormLabel>
                  <Popover open={popoverStates.thursday} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, thursday: open }))}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={popoverStates.thursday}
                          className={cn(
                            "flex h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors hover:bg-transparent focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm max-w-[350px] justify-between",
                            !field.value && "text-text-secondary"
                          )}
                        >
                          <span className="truncate">
                            {field.value
                              ? getScheduleCode(field.value)
                              : t.placeholder_schedule || "Choose schedule"}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[350px] p-0 border-none shadow-dropdown">
                      <Command>
                        <CommandInput placeholder={t.search_schedules || "Search schedules..."} className="border-none" />
                        <CommandEmpty>{t.no_schedules_found || "No schedules found"}</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {getFilteredSchedules().map((item: any) => (
                            <CommandItem
                              key={item.schedule_id}
                              value={item.schedule_code}
                              onSelect={() => {
                                field.onChange(item.schedule_id);
                                closePopover('thursday');
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === item.schedule_id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {item.schedule_code}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <TranslatedError
                    fieldError={form.formState.errors.thursday_schedule_id}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="friday_schedule_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex gap-1">{t.friday || "Friday"}</FormLabel>
                  <Popover open={popoverStates.friday} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, friday: open }))}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={popoverStates.friday}
                          className={cn(
                            "flex h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors hover:bg-transparent focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm max-w-[350px] justify-between",
                            !field.value && "text-text-secondary"
                          )}
                        >
                          <span className="truncate">
                            {field.value
                              ? getScheduleCode(field.value)
                              : t.placeholder_schedule || "Choose schedule"}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[350px] p-0 border-none shadow-dropdown">
                      <Command>
                        <CommandInput placeholder={t.search_schedules || "Search schedules..."} className="border-none" />
                        <CommandEmpty>{t.no_schedules_found || "No schedules found"}</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {getFilteredSchedules().map((item: any) => (
                            <CommandItem
                              key={item.schedule_id}
                              value={item.schedule_code}
                              onSelect={() => {
                                field.onChange(item.schedule_id);
                                closePopover('friday');
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === item.schedule_id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {item.schedule_code}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <TranslatedError
                    fieldError={form.formState.errors.friday_schedule_id}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="saturday_schedule_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex gap-1">{t.saturday || "Saturday"}</FormLabel>
                  <Popover open={popoverStates.saturday} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, saturday: open }))}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={popoverStates.saturday}
                          className={cn(
                            "flex h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors hover:bg-transparent focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm max-w-[350px] justify-between",
                            !field.value && "text-text-secondary"
                          )}
                        >
                          <span className="truncate">
                            {field.value
                              ? getScheduleCode(field.value)
                              : t.placeholder_schedule || "Choose schedule"}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[350px] p-0 border-none shadow-dropdown">
                      <Command>
                        <CommandInput placeholder={t.search_schedules || "Search schedules..."} className="border-none" />
                        <CommandEmpty>{t.no_schedules_found || "No schedules found"}</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {getFilteredSchedules().map((item: any) => (
                            <CommandItem
                              key={item.schedule_id}
                              value={item.schedule_code}
                              onSelect={() => {
                                field.onChange(item.schedule_id);
                                closePopover('saturday');
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === item.schedule_id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {item.schedule_code}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <TranslatedError
                    fieldError={form.formState.errors.saturday_schedule_id}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="sunday_schedule_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex gap-1">{t.sunday || "Sunday"}</FormLabel>
                  <Popover open={popoverStates.sunday} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, sunday: open }))}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={popoverStates.sunday}
                          className={cn(
                            "flex h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors hover:bg-transparent focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm max-w-[350px] justify-between",
                            !field.value && "text-text-secondary"
                          )}
                        >
                          <span className="truncate">
                            {field.value
                              ? getScheduleCode(field.value)
                              : t.placeholder_schedule || "Choose schedule"}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[350px] p-0 border-none shadow-dropdown">
                      <Command>
                        <CommandInput placeholder={t.search_schedules || "Search schedules..."} className="border-none" />
                        <CommandEmpty>{t.no_schedules_found || "No schedules found"}</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {getFilteredSchedules().map((item: any) => (
                            <CommandItem
                              key={item.schedule_id}
                              value={item.schedule_code}
                              onSelect={() => {
                                field.onChange(item.schedule_id);
                                closePopover('sunday');
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === item.schedule_id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {item.schedule_code}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <TranslatedError
                    fieldError={form.formState.errors.sunday_schedule_id}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="attachment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t.attachment || "Attachment"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="border-0 p-0 rounded-none h-auto text-text-secondary"
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        field.onChange(file);
                      }}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.attachment}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 items-center pt-2 py-5 px-5">
          <div className="flex gap-4 px-5">
            <Button
              variant={"outline"}
              type="button"
              size={"lg"}
              className="w-full"
              onClick={() => router.push("/scheduling/weekly-schedule/employee-schedule")}
            >
              {translations.buttons.cancel}
            </Button>
            <Button 
              type="submit" 
              size={"lg"} 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? selectedRowData
                  ? translations.buttons.updating
                  : translations.buttons.saving
                : selectedRowData
                ? translations.buttons.update
                : translations.buttons.save}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}