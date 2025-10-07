"use client";
import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { debounce } from "lodash";
import * as z from "zod";
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import Required from "@/src/components/ui/required";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { CalendarIcon } from "@/src/icons/icons";
import { Calendar } from "@/src/components/ui/calendar";
import { format } from "date-fns";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { addHolidayScheduleRequest, editHolidayScheduleRequest, searchEmployees } from "@/src/lib/apiHandler";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";

const formSchema = z.object({
  employee_id: z.string().min(1, { message: "employee_required" }),
  delegated_employee_id: z.string().min(1, { message: "delegated_employee_required" }),
  from_date: z.date({ required_error: "from_date_required" }),
  to_date: z.date({ required_error: "to_date_required" }),
  remarks: z.string().optional(),
  active_flag: z.boolean().optional().default(false),
});

export default function AddHoliday({
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
  const t = translations?.modules?.holiday || {};
  const errT = translations?.formErrors || {};
  const [popoverStates, setPopoverStates] = useState({
    fromDate: false,
    toDate: false,
  });
  const closePopover = (key: string) => {
    setPopoverStates(prev => ({ ...prev, [key]: false }));
  };
  const [remarksLength, setRemarksLength] = useState(0);

  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [delegatedEmployeeSearchTerm, setDelegatedEmployeeSearchTerm] = useState("");

  const [showEmployeeSearch, setShowEmployeeSearch] = useState(false);
  const [showDelegatedEmployeeSearch, setShowDelegatedEmployeeSearch] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_id: "",
      delegated_employee_id: "",
      from_date: undefined,
      to_date: undefined,
      remarks:"",
      active_flag: false,
    },
  });

  const { data: employees } = useFetchAllEntity("employee");

  const debouncedEmployeeSearch = useCallback(
    debounce((searchTerm: string) => {
      setEmployeeSearchTerm(searchTerm);
    }, 300),
    []
  );

  const debouncedDelegatedEmployeeSearch = useCallback(
    debounce((searchTerm: string) => {
      setDelegatedEmployeeSearchTerm(searchTerm);
    }, 300),
    []
  );

  const { data: searchedEmployees, isLoading: isSearchingEmployees } = useQuery({
    queryKey: ["employeeSearch", employeeSearchTerm],
    queryFn: () => searchEmployees(employeeSearchTerm),
    enabled: employeeSearchTerm.length > 0,
  });

  const { data: searchedDelegatedEmployees, isLoading: isSearchingDelegatedEmployees } = useQuery({
    queryKey: ["delegatedEmployeeSearch", delegatedEmployeeSearchTerm],
    queryFn: () => searchEmployees(delegatedEmployeeSearchTerm),
    enabled: delegatedEmployeeSearchTerm.length > 0,
  });

  const getFilteredEmployees = () => {
    const baseData = employeeSearchTerm.length > 0 
      ? searchedEmployees?.data || []
      : employees?.data || [];
    
    return baseData.filter((item: any) => 
      item.employee_id && item.employee_id.toString().trim() !== ''
    );
  };

  const getFilteredDelegatedEmployees = () => {
    const baseData = delegatedEmployeeSearchTerm.length > 0 
      ? searchedDelegatedEmployees?.data || []
      : employees?.data || [];
    
    return baseData.filter((item: any) => 
      item.employee_id && item.employee_id.toString().trim() !== ''
    );
  };

  useEffect(() => {
    if (selectedRowData) {
      form.reset({
        employee_id: selectedRowData.employee_id?.toString() ?? "",
        delegated_employee_id: selectedRowData.delegated_employee_id?.toString() ?? "",
        from_date: selectedRowData.from_date
          ? new Date(selectedRowData.from_date): undefined,
        to_date: selectedRowData.to_date
          ? new Date(selectedRowData.to_date) : undefined,
        remarks: selectedRowData.remarks ?? "",
        active_flag: selectedRowData.active_flag ?? false,
      });
    } else {
      form.reset();
    }
  }, [selectedRowData, language]);

  useEffect(() => {
    return () => {
      debouncedEmployeeSearch.cancel();
      debouncedDelegatedEmployeeSearch.cancel();
    };
  }, [debouncedEmployeeSearch, debouncedDelegatedEmployeeSearch]);

  const addMutation = useMutation({
    mutationFn: addHolidayScheduleRequest,
    onSuccess: (data) => {
      showToast("success", "addholiday_success");
      onSave(null, data.data);
      on_open_change(false);
      queryClient.invalidateQueries({ queryKey: ["holiday"] });
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
    mutationFn: editHolidayScheduleRequest,
    onSuccess: (_data, variables) => {
      showToast("success", "updateholiday_success");
      onSave(variables.holiday_id?.toString() ?? null, variables);
      queryClient.invalidateQueries({ queryKey: ["holiday"] });
      on_open_change(false);
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
        employee_id: values.employee_id ? Number(values.employee_id) : null,
        delegated_employee_id: values.delegated_employee_id ? Number(values.delegated_employee_id) : null,
        from_date: values.from_date
          ? format(values.from_date, "yyyy-MM-dd"): null,
        to_date: values.to_date
          ? format(values.to_date, "yyyy-MM-dd"): null,
        remarks: values.remarks,  
        active_flag: values.active_flag,
      };

      if (selectedRowData) {
        editMutation.mutate({
          holiday_id: selectedRowData.id,
          ...payload,
        });
      } else {
        addMutation.mutate(payload);
      }
    } finally {
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
                name="active_flag"
                render={({ field }) => (
                  <FormItem className=" ">
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="active_flag"
                          checked={!!field.value}
                          onCheckedChange={field.onChange}
                        />
                        <FormLabel htmlFor="active_flag" className="text-sm font-semibold">Status</FormLabel>
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
                  name="employee_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex gap-1">
                        {t.employee || "Employee"} <Required />
                      </FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(val)}
                        value={field.value !== undefined ? String(field.value) : ""}
                        onOpenChange={(open) => setShowEmployeeSearch(open)}
                      >
                        <FormControl>
                          <SelectTrigger className="max-w-[350px]">
                            <SelectValue placeholder={t.placeholder_employee || "Choose employee"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent
                          showSearch={true}
                          searchPlaceholder={t.search || "Search employees..."}
                          onSearchChange={debouncedEmployeeSearch}
                          className="mt-5"
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
                            if (!item.employee_id || item.employee_id.toString().trim() === '') return null;
                            return (
                              <SelectItem key={item.employee_id} value={item.employee_id.toString()}>
                                {item.firstname_eng} {item.emp_no ? `(${item.emp_no})` : ''}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <TranslatedError fieldError={form.formState.errors.employee_id} translations={errT} />
                    </FormItem>
                  )}
                />  
                <FormField
                  control={form.control}
                  name="delegated_employee_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex gap-1">
                        {t.delegated_employee || "Delegated Employee"} <Required />
                      </FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(val)}
                        value={field.value !== undefined ? String(field.value) : ""}
                        onOpenChange={(open) => setShowDelegatedEmployeeSearch(open)}
                      >
                        <FormControl>
                          <SelectTrigger className="max-w-[350px]">
                            <SelectValue placeholder={t.placeholder_delegated_employee || "Choose delegated employee"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent
                          showSearch={true}
                          searchPlaceholder={t.search || "Search employees..."}
                          onSearchChange={debouncedDelegatedEmployeeSearch}
                          className="mt-5"
                        >
                          {isSearchingDelegatedEmployees && delegatedEmployeeSearchTerm.length > 0 && (
                            <div className="p-3 text-sm text-text-secondary">
                              {t.searching || "Searching..."}
                            </div>
                          )}
                          {getFilteredDelegatedEmployees().length === 0 && delegatedEmployeeSearchTerm.length > 0 && !isSearchingDelegatedEmployees && (
                            <div className="p-3 text-sm text-text-secondary">
                              {t.no_employees_found || "No employees found"}
                            </div>
                          )}
                          {getFilteredDelegatedEmployees().map((item: any) => {
                            if (!item.employee_id || item.employee_id.toString().trim() === '') return null;
                            return (
                              <SelectItem key={item.employee_id} value={item.employee_id.toString()}>
                                {item.firstname_eng} {item.emp_no ? `(${item.emp_no})` : ''}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <TranslatedError fieldError={form.formState.errors.delegated_employee_id} translations={errT} />
                    </FormItem>
                  )}
                />
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
                                field.onChange(date);
                                closePopover('fromDate');
                              }}
                            disabled={(date) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              return date < today;
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <TranslatedError fieldError={form.formState.errors.from_date} translations={errT} />
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
                                field.onChange(date);
                                closePopover('toDate');
                              }}
                          />
                        </PopoverContent>
                      </Popover>
                      <TranslatedError fieldError={form.formState.errors.to_date} translations={errT} />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add your remarks here"
                          className="max-w-[350px]" 
                          {...field} 
                          rows={2}
                          onChange={(e) => {
                            field.onChange(e);
                            setRemarksLength(e.target.value.length);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 items-center">
            <div className="flex gap-4">
              <Button
                variant={"outline"}
                type="button"
                size={"lg"}
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