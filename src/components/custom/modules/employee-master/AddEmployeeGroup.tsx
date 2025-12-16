"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/src/components/ui/form";
import Required from "@/src/components/ui/required";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { CalendarIcon } from "@/src/icons/icons";
import { Calendar } from "@/src/components/ui/calendar";
import { format } from "date-fns";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addEmployeeGroupRequest, editEmployeeGroupRequest, getManagerEmployees } from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/src/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/src/lib/utils";

const formSchema = z.object({
  group_code: z
    .string()
    .min(1, { message: "employee_group_code_required" })
    .transform((val) => val.toUpperCase()),
  group_name: z.string().min(1, { message: "employee_group_name_required" }),
  group_start_date: z.string().nullable().optional(),
  group_end_date: z.string().nullable().optional(),
  schedule_flag: z.boolean().optional().default(false),
  reporting_group_flag: z.boolean().optional().default(false),
  reporting_person_id: z.coerce.number().optional(),
}).refine((data) => {
  if (data.reporting_group_flag && !data.reporting_person_id) {
    return false;
  }
  return true;
}, {
  message: "reporting_person_required",
  path: ["reporting_person_id"],
});

export default function AddEmployeeGroups({
  on_open_change,
  selectedRowData,
  onSave,
}: {
  on_open_change: any;
  selectedRowData?: any;
  onSave: (id: string | null, newData: any) => void;
}) {
  const { language, translations } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const showToast = useShowToast();
  const t = translations?.modules?.employeeMaster || {};
  const errT = translations?.formErrors || {};

  const [popoverStates, setPopoverStates] = useState({
    fromDate: false,
    toDate: false,
    manager: false,
  });

  const closePopover = (key: string) => {
    setPopoverStates(prev => ({ ...prev, [key]: false }));
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      group_code: "",
      group_name: "",
      group_start_date: "",
      group_end_date: "",
      schedule_flag: false,
      reporting_group_flag: false,
      reporting_person_id: undefined,
    },
  });

  const reportingGroupChecked = form.watch("reporting_group_flag");

  const { data: managerEmployees, isLoading: loadingManagers } = useQuery({
    queryKey: ["managerEmployees"],
    queryFn: getManagerEmployees,
  });

  const getManagersData = () => (managerEmployees?.data || []).filter((emp: any) => 
    emp.employee_id != null
  );

  useEffect(() => {
    if (selectedRowData) {
      form.reset({
        group_code: selectedRowData.group_code ?? "",
        group_name:
          language === "en"
            ? selectedRowData.group_name_eng ?? ""
            : selectedRowData.group_name_arb ?? "",
        group_start_date: selectedRowData.original_group_start_date ?? "",
        group_end_date: selectedRowData.original_group_end_date ?? "",
        schedule_flag: selectedRowData.schedule_flag ?? false,
        reporting_group_flag: selectedRowData.reporting_group_flag ?? false,
        reporting_person_id: selectedRowData.reporting_person_id ?? undefined,
      });
    } else {
      form.reset({
        group_code: "",
        group_name: "",
        group_start_date: "",
        group_end_date: "",
        schedule_flag: false,
        reporting_group_flag: false,
        reporting_person_id: undefined,
      });
    }
  }, [selectedRowData, language]);

  const addMutation = useMutation({
    mutationFn: addEmployeeGroupRequest,
    onSuccess: (data) => {
      showToast("success", "addempgrp_success");
      onSave(null, data.data);
      on_open_change(false);
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        showToast("error", "findduplicate_error");
      } else {
        showToast("error", "formsubmission_error");
      }
      setIsSubmitting(false);
    },
  });

  const editMutation = useMutation({
    mutationFn: editEmployeeGroupRequest,
    onSuccess: (_data, variables) => {
      showToast("success", "updateempgrp_success");
      onSave(variables.employee_group_id?.toString() ?? null, variables);
      queryClient.invalidateQueries({ queryKey: ["employeeGroup"] });
      on_open_change(false);
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        showToast("error", "findduplicate_error");
      } else {
        showToast("error", "formsubmission_error");
      }
      setIsSubmitting(false);
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const payload: any = {
        group_code: values.group_code,
        schedule_flag: values.schedule_flag,
        reporting_group_flag: values.reporting_group_flag,
      };

      if (values.group_start_date) {
        payload.group_start_date = format(new Date(values.group_start_date), "yyyy-MM-dd");
      }

      if (values.group_end_date) {
        payload.group_end_date = format(new Date(values.group_end_date), "yyyy-MM-dd");
      }

      if (values.reporting_person_id) {
        payload.reporting_person_id = values.reporting_person_id;
      }

      if (language === "en") {
        payload.group_name_eng = values.group_name;
      } else {
        payload.group_name_arb = values.group_name;
      }

      if (selectedRowData) {
        editMutation.mutate({
          employee_group_id: selectedRowData.id,
          ...payload,
        });
      } else {
        addMutation.mutate(payload);
      }
    } catch (error) {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col">
            <div className="flex gap-10 items-center mb-5">
              <FormField
                control={form.control}
                name="schedule_flag"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="schedule_flag"
                          checked={!!field.value}
                          onCheckedChange={field.onChange}
                        />
                        <FormLabel htmlFor="schedule_flag" className="text-sm font-semibold">
                          {t.schedule}
                        </FormLabel>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reporting_group_flag"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="reporting_group_flag"
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            if (!checked) {
                              form.setValue("reporting_person_id", undefined);
                            }
                          }}
                        />
                        <FormLabel htmlFor="reporting_group_flag" className="text-sm font-semibold">
                          {t.reporting_group}
                        </FormLabel>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 gap-y-4 min-w-0">
                <FormField
                  control={form.control}
                  name="group_code"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>
                        {t.group_code}
                        <Required />
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder={t.placeholder_emp_group_code}
                          {...field}
                        />
                      </FormControl>
                      <TranslatedError
                        fieldError={form.formState.errors.group_code}
                        translations={errT}
                      />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="group_name"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>
                        {language === "ar"
                          ? `${t.group_name} (العربية)`
                          : `${t.group_name} (English)`}
                        <Required />
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder={t.placeholder_emp_group_name}
                          {...field}
                          className={language === "ar" ? "text-right" : "text-left"}
                        />
                      </FormControl>
                      <TranslatedError
                        fieldError={form.formState.errors.group_name}
                        translations={errT}
                      />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="group_start_date"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>
                        {t.group_start_date}
                      </FormLabel>
                      <Popover open={popoverStates.fromDate} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, fromDate: open }))}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button size={"lg"} variant={"outline"}
                              className="w-full bg-accent px-3 flex justify-between text-text-primary max-w-[350px] 3xl:max-w-[450px] text-sm font-normal"
                            >
                              {field.value ? (
                                format(new Date(field.value), "dd/MM/yy")
                              ) : (
                                <span className="font-normal text-sm text-text-secondary">
                                  {t.placeholder_date}
                                </span>
                              )}
                              <CalendarIcon />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => {
                              field.onChange(date ? date.toISOString() : "");
                              closePopover('fromDate');
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <TranslatedError
                        fieldError={form.formState.errors.group_start_date}
                        translations={errT}
                      />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="group_end_date"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>
                        {t.group_end_date}
                      </FormLabel>
                      <Popover open={popoverStates.toDate} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, toDate: open }))}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button size={"lg"} variant={"outline"}
                              className="w-full bg-accent px-3 flex justify-between text-text-primary max-w-[350px] 3xl:max-w-[450px] text-sm font-normal"
                            >
                              {field.value ? (
                                format(new Date(field.value), "dd/MM/yy")
                              ) : (
                                <span className="font-normal text-sm text-text-secondary">
                                  {t.placeholder_date}
                                </span>
                              )}
                              <CalendarIcon />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => {
                              field.onChange(date ? date.toISOString() : "");
                              closePopover('toDate');
                            }}
                            disabled={(date) => {
                              const groupStartDate = form.getValues("group_start_date");
                              
                              if (!groupStartDate) {
                                return true;
                              }
                              
                              const startDate = new Date(groupStartDate);
                              startDate.setHours(0, 0, 0, 0);
                              
                              const compareDate = new Date(date);
                              compareDate.setHours(0, 0, 0, 0);
                              return compareDate <= startDate;
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <TranslatedError
                        fieldError={form.formState.errors.group_end_date}
                        translations={errT}
                      />
                    </FormItem>
                  )}
                />
                {reportingGroupChecked && (
                  <FormField
                    control={form.control}
                    name="reporting_person_id"
                    render={({ field }) => (
                      <FormItem className="flex flex-col min-w-0">
                        <FormLabel className="flex gap-1">
                          {t.reporting} <Required />
                        </FormLabel>
                        <Popover 
                          open={popoverStates.manager} 
                          onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, manager: open }))}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={popoverStates.manager}
                                className={cn(
                                  "flex h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors hover:bg-transparent focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm max-w-[350px] 3xl:max-w-[450px] justify-between",
                                  !field.value && "text-text-secondary"
                                )}
                                disabled={loadingManagers}
                              >
                                <span className="truncate">
                                  {field.value
                                    ? getManagersData().find(
                                        (emp: any) => emp.employee_id === field.value
                                      )?.firstname_eng
                                    : t.placeholder_manager || "Choose reporting person"}
                                </span>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[350px] p-0">
                            <Command>
                              <CommandInput placeholder={t.search || "Search reporting person..."} />
                              <CommandEmpty>{t.no_results || "No reporting person found"}</CommandEmpty>
                              <CommandGroup className="max-h-64 overflow-y-auto overscroll-contain">
                                {getManagersData().map((emp: any) => (
                                  <CommandItem
                                    key={emp.employee_id}
                                    value={emp.firstname_eng}
                                    onSelect={() => {
                                      field.onChange(emp.employee_id);
                                      closePopover('manager');
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value === emp.employee_id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {emp.firstname_eng}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <TranslatedError
                          fieldError={form.formState.errors.reporting_person_id}
                          translations={errT}
                        />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 items-center pt-4 py-2">
            <div className="flex gap-4">
              <Button
                variant="outline"
                type="button"
                size="lg"
                className="w-full"
                onClick={() => on_open_change(false)}
              >
                {translations.buttons.cancel}
              </Button>
              <Button
                type="submit"
                size="lg"
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
        </div>
      </form>
    </Form>
  );
}