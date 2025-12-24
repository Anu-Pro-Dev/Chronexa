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
import { useMutation } from "@tanstack/react-query";
import {
  addMonthlyScheduleRequest
} from "@/src/lib/apiHandler";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/src/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  organization_id: z.coerce.number().min(1, { message: "organization_required" }),
  employee_id: z.coerce.number().min(1, { message: "employee_required" }),
  from_date: z.string().min(1, { message: "from_date_required" }),
  to_date: z.string().min(1, { message: "to_date_required" }),
  version_no: z.coerce.number().min(1, { message: "version_required" }).default(1),
  manager_id: z.coerce.number().optional(),
  finalize_flag: z.boolean().optional().default(false),
}).refine((data) => {
  if (data.from_date && data.to_date) {
    return new Date(data.from_date) <= new Date(data.to_date);
  }
  return true;
}, {
  message: "to_date_must_be_after_from_date",
  path: ["to_date"],
});

export default function AddMonthlySchedule({
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
  const showToast = useShowToast();
  const router = useRouter();
  const t = translations?.modules?.scheduling || {};
  const errT = translations?.formErrors || {};

  const [organizationSearchTerm, setOrganizationSearchTerm] = useState("");
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [managerSearchTerm, setManagerSearchTerm] = useState("");

  const [popoverStates, setPopoverStates] = useState({
    fromDate: false,
    toDate: false,
    organization: false,
    employee: false,
    manager: false,
  });

  const closePopover = (key: string) => {
    setPopoverStates(prev => ({ ...prev, [key]: false }));
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organization_id: undefined,
      employee_id: undefined,
      from_date: "",
      to_date: "",
      version_no: 1,
      manager_id: undefined,
      finalize_flag: false,
    },
  });

  const selectedOrganization = form.watch("organization_id");

  const { data: organizations, isLoading: loadingOrgs } = useFetchAllEntity("organization", {
    searchParams: { 
      limit: "1000",
      ...(organizationSearchTerm && { search: organizationSearchTerm }),
    },
    removeAll: true
  });

  const { data: employees, isLoading: loadingEmployees } = useFetchAllEntity("employee", {
    searchParams: {
      limit: "1000",
      offset: "1",
      ...(selectedOrganization && { organization_id: selectedOrganization.toString() }),
      ...(employeeSearchTerm && { search: employeeSearchTerm }),
    },
    removeAll: true
  });

  const { data: managerEmployees, isLoading: loadingManagers } = useFetchAllEntity("employee", {
    searchParams: {
      manager_flag: "true",
      limit: "1000",
      offset: "1",
      ...(managerSearchTerm && { search: managerSearchTerm }),
    }
  });

  const getOrganizationsData = () => {
    if (!organizations?.data || !Array.isArray(organizations.data)) return [];
    return organizations.data.filter((org: any) =>
      org?.organization_id &&
      org.organization_id.toString().trim() !== ''
    );
  };

  const getEmployeesData = () => {
    if (!employees?.data || !Array.isArray(employees.data)) return [];
    
    let filteredEmployees = employees.data.filter((emp: any) =>
      emp?.employee_id &&
      emp.employee_id.toString().trim() !== ''
    );

    if (selectedOrganization) {
      filteredEmployees = filteredEmployees.filter((emp: any) => 
        emp.organization_id === selectedOrganization
      );
    }

    return filteredEmployees;
  };

  const getManagersData = () => {
    if (!managerEmployees?.data || !Array.isArray(managerEmployees.data)) return [];
    return managerEmployees.data.filter((emp: any) =>
      emp?.employee_id &&
      emp.employee_id.toString().trim() !== '' &&
      emp?.manager_flag === true
    );
  };

  const getOrganizationName = (orgId: number) => {
    const org = organizations?.data?.find((o: any) => o.organization_id === orgId);
    if (!org) return "";
    return language === 'ar' ? org.organization_arb : org.organization_eng;
  };

  useEffect(() => {
    if (selectedRowData) {
      form.reset({
        organization_id: selectedRowData.organization_id ?? undefined,
        employee_id: selectedRowData.employee_id ?? undefined,
        from_date: selectedRowData.from_date ?? "",
        to_date: selectedRowData.to_date ?? "",
        version_no: selectedRowData.version_no ?? 1,
        manager_id: selectedRowData.manager_id ?? undefined,
        finalize_flag: selectedRowData.finalize_flag ?? false,
      });
    }
  }, [selectedRowData]);

  const addMutation = useMutation({
    mutationFn: addMonthlyScheduleRequest,
    onSuccess: (data) => {
      showToast("success", "add_roster_success");
      router.push("/scheduling/monthly-schedule");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message;
      showToast("error", errorMessage);
      setIsSubmitting(false);
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const payload: any = {
        employee_id: values.employee_id,
        from_date: format(new Date(values.from_date), "yyyy-MM-dd"),
        to_date: format(new Date(values.to_date), "yyyy-MM-dd"),
        version_no: values.version_no,
        finalize_flag: values.finalize_flag,
      };

      if (values.manager_id) {
        payload.manager_id = values.manager_id;
      }

      addMutation.mutate(payload);
    } catch (error) {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 gap-y-4 min-w-0">
            <FormField
              control={form.control}
              name="organization_id"
              render={({ field }) => (
                <FormItem className="flex flex-col min-w-0">
                  <FormLabel className="flex gap-1">
                    {t.organization || "Organization"} <Required />
                  </FormLabel>
                  <Popover
                    open={popoverStates.organization}
                    onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, organization: open }))}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={popoverStates.organization}
                          className={cn(
                            "flex h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors hover:bg-transparent focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm max-w-[350px] 3xl:max-w-[450px] justify-between",
                            !field.value && "text-text-secondary"
                          )}
                          disabled={loadingOrgs}
                        >
                          <span className="truncate">
                            {field.value
                              ? getOrganizationName(field.value)
                              : t.select_organization || "Select Organization"}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[350px] p-0 border-none shadow-dropdown" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput 
                          placeholder={t.search || "Search organization..."} 
                          className="border-none"
                          onValueChange={setOrganizationSearchTerm}
                        />
                        <CommandEmpty>
                          {loadingOrgs && organizationSearchTerm.length > 0
                            ? t.searching || "Searching..."
                            : t.no_results || "No organization found"}
                        </CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-y-auto overscroll-contain" onWheel={(e) => e.stopPropagation()}>
                          {getOrganizationsData().map((org: any) => {
                            const name = language === "ar" ? org.organization_arb : org.organization_eng;
                            return (
                              <CommandItem
                                key={org.organization_id}
                                value={name}
                                onSelect={() => {
                                  field.onChange(org.organization_id);
                                  form.setValue("employee_id", 0);
                                  closePopover('organization');
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === org.organization_id ? "opacity-100" : "opacity-0"
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
                    fieldError={form.formState.errors.organization_id}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employee_id"
              render={({ field }) => (
                <FormItem className="flex flex-col min-w-0">
                  <FormLabel className="flex gap-1">
                    {t.employee || "Employee"} <Required />
                  </FormLabel>
                  <Popover
                    open={popoverStates.employee}
                    onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, employee: open }))}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={popoverStates.employee}
                          className={cn(
                            "flex h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors hover:bg-transparent focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm max-w-[350px] 3xl:max-w-[450px] justify-between",
                            !field.value && "text-text-secondary"
                          )}
                          disabled={loadingEmployees || !selectedOrganization}
                        >
                          <span className="truncate">
                            {field.value
                              ? getEmployeesData().find(
                                (emp: any) => emp.employee_id === field.value
                              )?.firstname_eng
                              : !selectedOrganization 
                                ? "Select organization first"
                                : t.select_employee || "Select Employee"}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[350px] p-0 border-none shadow-dropdown" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput 
                          placeholder={t.search || "Search employee..."} 
                          className="border-none"
                          onValueChange={setEmployeeSearchTerm}
                        />
                        <CommandEmpty>
                          {loadingEmployees && employeeSearchTerm.length > 0
                            ? t.searching || "Searching..."
                            : t.no_results || "No employee found"}
                        </CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-y-auto overscroll-contain" onWheel={(e) => e.stopPropagation()}>
                          {getEmployeesData().map((emp: any) => (
                            <CommandItem
                              key={emp.employee_id}
                              value={emp.firstname_eng}
                              onSelect={() => {
                                field.onChange(emp.employee_id);
                                closePopover('employee');
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
                    fieldError={form.formState.errors.employee_id}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="from_date"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>
                    {t.from_date || "From Date"} <Required />
                  </FormLabel>
                  <Popover open={popoverStates.fromDate} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, fromDate: open }))}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button size={"lg"} variant={"outline"}
                          className="w-full bg-accent px-3 flex justify-between text-text-primary max-w-[350px] 3xl:max-w-[450px] text-sm font-normal"
                        >
                          {field.value ? (
                            format(new Date(field.value), "dd/MM/yyyy")
                          ) : (
                            <span className="font-normal text-sm text-text-secondary">
                              {t.pick_date || "Pick Date"}
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
                <FormItem className="min-w-0">
                  <FormLabel>
                    {t.to_date || "To Date"} <Required />
                  </FormLabel>
                  <Popover open={popoverStates.toDate} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, toDate: open }))}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button size={"lg"} variant={"outline"}
                          className="w-full bg-accent px-3 flex justify-between text-text-primary max-w-[350px] 3xl:max-w-[450px] text-sm font-normal"
                        >
                          {field.value ? (
                            format(new Date(field.value), "dd/MM/yyyy")
                          ) : (
                            <span className="font-normal text-sm text-text-secondary">
                              {t.pick_date || "Pick Date"}
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
                          const fromDate = form.getValues("from_date");

                          if (!fromDate) {
                            return true;
                          }

                          const startDate = new Date(fromDate);
                          startDate.setHours(0, 0, 0, 0);

                          const compareDate = new Date(date);
                          compareDate.setHours(0, 0, 0, 0);
                          return compareDate < startDate;
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
              name="version_no"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>
                    {t.version_number || "Version Number"}
                    <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="1"
                      {...field}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.version_no}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="manager_id"
              render={({ field }) => (
                <FormItem className="flex flex-col min-w-0">
                  <FormLabel className="flex gap-1">
                    {t.manager || "Manager"} ({t.optional || "Optional"})
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
                              : t.select_manager || "Select Manager"}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[350px] p-0 border-none shadow-dropdown" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput 
                          placeholder={t.search || "Search manager..."} 
                          className="border-none"
                          onValueChange={setManagerSearchTerm}
                        />
                        <CommandEmpty>
                          {loadingManagers && managerSearchTerm.length > 0
                            ? t.searching || "Searching..."
                            : t.no_results || "No manager found"}
                        </CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-y-auto overscroll-contain" onWheel={(e) => e.stopPropagation()}>
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
                    fieldError={form.formState.errors.manager_id}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
          </div>
          <div className="flex gap-10 items-center mb-5">
            <FormField
              control={form.control}
              name="finalize_flag"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="finalize_flag"
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                      />
                      <FormLabel htmlFor="finalize_flag" className="text-sm font-semibold">
                        {t.finalize_roster || "Finalize Roster"}
                      </FormLabel>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 items-center">
          <div className="flex gap-4">
            <Button
              variant="outline"
              type="button"
              size="lg"
              className="w-full"
              onClick={() => on_open_change(false)}
            >
              {translations?.buttons?.cancel || "Cancel"}
            </Button>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? translations?.buttons?.saving || "Saving..."
                : translations?.buttons?.save || "Save"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}