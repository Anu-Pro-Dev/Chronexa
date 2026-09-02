"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/src/components/ui/form";
import Required from "@/src/components/ui/required";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addIfmEmployeeLocationMappingRequest,
  editIfmEmployeeLocationMappingRequest,
  getAllIfmLocationMasterUnpaginated,
} from "@/src/lib/apiHandler";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useDebounce } from "@/src/hooks/useDebounce";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/src/lib/utils";

const formSchema = z.object({
  employee_number: z.string().min(1, { message: "employee_number_required" }),
  location_id: z.string().min(1, { message: "location_id_required" }),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  active_flag: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

function getEmployeeFirstName(emp: any, language: string) {
  if (!emp) return "";
  if (language === "ar") {
    return (emp.firstname_arb || emp.firstname_eng || "").trim();
  }
  return (emp.firstname_eng || emp.firstname_arb || "").trim();
}

function getEmployeeDisplay(emp: any, language: string) {
  if (!emp) return "";
  const empNo = emp.emp_no || emp.employee_number || "";
  const firstName = getEmployeeFirstName(emp, language);
  return firstName ? `${empNo} - ${firstName}` : empNo;
}

export default function AddUserMapping({
  on_open_change,
  selectedRowData,
  onSave,
}: {
  on_open_change: (open: boolean) => void;
  selectedRowData?: any;
  onSave: (id: string | null, newData: any) => void;
}) {
  const { language, translations } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [empOpen, setEmpOpen] = useState(false);
  const [locOpen, setLocOpen] = useState(false);

  const [empSearch, setEmpSearch] = useState("");
  const debouncedEmpSearch = useDebounce(empSearch, 300);

  const queryClient = useQueryClient();
  const showToast = useShowToast();
  const t = translations?.modules?.workload || {};
  const errT = translations?.formErrors || {};

  // Fetch locations dropdown unpaginated
  const { data: locationsResponse, isLoading: isLoadingLocations } = useQuery({
    queryKey: ["ifm-location-master-unpaginated"],
    queryFn: getAllIfmLocationMasterUnpaginated,
  });

  const locationsList = Array.isArray(locationsResponse?.data) ? locationsResponse.data : [];

  // Fetch employees with limit=10, parent_orgids=5, and search term
  const { data: employeesResponse, isLoading: isLoadingEmployees } = useFetchAllEntity("employee", {
    searchParams: {
      limit: "10",
      offset: "1",
      parent_orgids: "5",
      ...(debouncedEmpSearch && { search: debouncedEmpSearch }),
    },
  });

  const employeesList = Array.isArray(employeesResponse?.data) ? employeesResponse.data : [];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_number: "",
      location_id: "",
      from_date: "",
      to_date: "",
      active_flag: true,
    },
  });

  const formatDateForInput = (dateVal: string | null | undefined) => {
    if (!dateVal) return "";
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return "";
      return d.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  useEffect(() => {
    if (selectedRowData) {
      form.reset({
        employee_number: selectedRowData.employee_number ?? selectedRowData.employee?.emp_no ?? "",
        location_id: selectedRowData.location_id ? String(selectedRowData.location_id) : "",
        from_date: formatDateForInput(selectedRowData.from_date),
        to_date: formatDateForInput(selectedRowData.to_date),
        active_flag: selectedRowData.active_flag ?? true,
      });
    } else {
      form.reset({
        employee_number: "",
        location_id: "",
        from_date: "",
        to_date: "",
        active_flag: true,
      });
    }
  }, [selectedRowData, form]);

  const addMutation = useMutation({
    mutationFn: addIfmEmployeeLocationMappingRequest,
    onSuccess: (res) => {
      showToast("success", "add_ifm_mapping_success");
      onSave(null, res.data);
      queryClient.invalidateQueries({ queryKey: ["ifm-employee-location-mapping"] });
      on_open_change(false);
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        showToast("error", error?.response?.data?.message || "Mapping already exists for this employee and location");
      } else {
        showToast("error", error?.response?.data?.message || "formsubmission_error");
      }
    },
  });

  const editMutation = useMutation({
    mutationFn: editIfmEmployeeLocationMappingRequest,
    onSuccess: (res, variables) => {
      showToast("success", "update_ifm_mapping_success");
      onSave(variables.mapping_id.toString(), res.data || variables);
      queryClient.invalidateQueries({ queryKey: ["ifm-employee-location-mapping"] });
      on_open_change(false);
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        showToast("error", error?.response?.data?.message || "Duplicate mapping");
      } else {
        showToast("error", error?.response?.data?.message || "formsubmission_error");
      }
    },
  });

  async function onSubmit(values: FormValues) {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const fromDateIso = values.from_date ? new Date(values.from_date).toISOString() : undefined;
      const toDateIso = values.to_date ? new Date(values.to_date).toISOString() : undefined;

      const payload: any = {
        employee_number: values.employee_number.trim(),
        location_id: Number(values.location_id),
        from_date: fromDateIso,
        to_date: toDateIso,
        active_flag: values.active_flag,
      };

      if (selectedRowData) {
        const id = selectedRowData.mapping_id || selectedRowData.id;
        editMutation.mutate({ mapping_id: Number(id), ...payload });
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
            {/* Searchable Employee Combobox with limit=10 & parent_orgids=5 */}
            <FormField
              control={form.control}
              name="employee_number"
              render={({ field }) => {
                const selectedEmp = employeesList.find(
                  (e: any) => (e.emp_no || e.employee_number) === field.value
                );
                let triggerLabel = field.value || (t.placeholder_employee_number || "Select employee");
                if (selectedEmp) {
                  triggerLabel = getEmployeeDisplay(selectedEmp, language);
                } else if (
                  selectedRowData?.employee &&
                  (selectedRowData.employee.emp_no === field.value || selectedRowData.employee_number === field.value)
                ) {
                  triggerLabel = getEmployeeDisplay(selectedRowData.employee, language);
                }

                return (
                  <FormItem className="flex flex-col min-w-0">
                    <FormLabel>
                      {t.employee_number || "Employee Number"}
                      <Required />
                    </FormLabel>
                    <Popover open={empOpen} onOpenChange={setEmpOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={empOpen}
                            disabled={isLoadingEmployees}
                            className={cn(
                              "w-full justify-between font-normal h-10 px-3 border border-border-grey bg-transparent text-text-primary hover:bg-backdrop",
                              !field.value && "text-text-secondary"
                            )}
                          >
                            <span className="truncate">{triggerLabel}</span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[300px] sm:w-[380px] p-0 shadow-lg bg-accent border border-border-grey z-[100]"
                        align="start"
                      >
                        <Command shouldFilter={false} className="w-full">
                          <CommandInput
                            value={empSearch}
                            onValueChange={(val) => setEmpSearch(val)}
                            placeholder={t.placeholder_search_employee || "Search employee name or number..."}
                          />
                          <CommandList className="max-h-60 overflow-y-auto">
                            <CommandEmpty className="p-4 text-sm text-text-secondary text-center">
                              {isLoadingEmployees ? "Searching..." : (t.no_employees_found || "No employees found.")}
                            </CommandEmpty>
                            <CommandGroup>
                              {employeesList.map((emp: any) => {
                                const empNo = emp.emp_no || emp.employee_number || "";
                                const displayLabel = getEmployeeDisplay(emp, language);
                                const isSelected = field.value === empNo;
                                return (
                                  <CommandItem
                                    key={emp.employee_id || empNo}
                                    value={empNo}
                                    onSelect={() => {
                                      field.onChange(empNo);
                                      setEmpOpen(false);
                                    }}
                                    className="cursor-pointer flex items-center justify-between py-2 px-3 hover:bg-backdrop"
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <Check
                                        className={cn(
                                          "h-4 w-4 text-primary shrink-0",
                                          isSelected ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      <span className="truncate font-medium">{displayLabel}</span>
                                    </div>
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <TranslatedError
                      fieldError={form.formState.errors.employee_number}
                      translations={errT}
                    />
                  </FormItem>
                );
              }}
            />

            {/* Searchable Location Combobox */}
            <FormField
              control={form.control}
              name="location_id"
              render={({ field }) => {
                const selectedLoc = locationsList.find(
                  (loc: any) => String(loc.location_id) === field.value
                );
                const triggerLabel = selectedLoc
                  ? `${selectedLoc.project_name} - ${selectedLoc.location_name || selectedLoc.location_code || `ID #${selectedLoc.location_id}`}`
                  : (t.placeholder_location_id || "Select location");

                return (
                  <FormItem className="flex flex-col min-w-0">
                    <FormLabel>
                      {t.location || "Location"}
                      <Required />
                    </FormLabel>
                    <Popover open={locOpen} onOpenChange={setLocOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={locOpen}
                            disabled={isLoadingLocations}
                            className={cn(
                              "w-full justify-between font-normal h-10 px-3 border border-border-grey bg-transparent text-text-primary hover:bg-backdrop",
                              !field.value && "text-text-secondary"
                            )}
                          >
                            <span className="truncate">{triggerLabel}</span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[300px] sm:w-[380px] p-0 shadow-lg bg-accent border border-border-grey z-[100]"
                        align="start"
                      >
                        <Command className="w-full">
                          <CommandInput
                            placeholder={t.placeholder_search_location || "Search project or location..."}
                          />
                          <CommandList className="max-h-60 overflow-y-auto">
                            <CommandEmpty className="p-4 text-sm text-text-secondary text-center">
                              {isLoadingLocations ? "Loading locations..." : (t.no_locations_found || "No locations found.")}
                            </CommandEmpty>
                            <CommandGroup>
                              {locationsList.map((loc: any) => {
                                const locIdStr = String(loc.location_id);
                                const label = `${loc.project_name} - ${loc.location_name || loc.location_code || `ID #${loc.location_id}`}`;
                                const isSelected = field.value === locIdStr;
                                return (
                                  <CommandItem
                                    key={loc.location_id}
                                    value={`${loc.project_name} ${loc.location_name || ""} ${loc.location_code || ""} ${loc.location_id}`}
                                    onSelect={() => {
                                      field.onChange(locIdStr);
                                      setLocOpen(false);
                                    }}
                                    className="cursor-pointer flex items-center justify-between py-2 px-3 hover:bg-backdrop"
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <Check
                                        className={cn(
                                          "h-4 w-4 text-primary shrink-0",
                                          isSelected ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      <span className="truncate font-medium">{label}</span>
                                    </div>
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <TranslatedError
                      fieldError={form.formState.errors.location_id}
                      translations={errT}
                    />
                  </FormItem>
                );
              }}
            />

            {/* From Date */}
            <FormField
              control={form.control}
              name="from_date"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>{t.from_date || "From Date"}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* To Date */}
            <FormField
              control={form.control}
              name="to_date"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>{t.to_date || "To Date"}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Active Flag */}
            <FormField
              control={form.control}
              name="active_flag"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 space-y-0 pt-6">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(!!checked)}
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer font-normal">
                    {t.active_flag || "Active"}
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-2 items-center py-2">
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
                  ? selectedRowData
                    ? translations?.buttons?.updating || "Updating..."
                    : translations?.buttons?.saving || "Saving..."
                  : selectedRowData
                  ? translations?.buttons?.update || "Update"
                  : translations?.buttons?.save || "Save"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
