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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addBulkIfmEmployeeLocationMappingRequest,
  editIfmEmployeeLocationMappingRequest,
} from "@/src/lib/apiHandler";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useDebounce } from "@/src/hooks/useDebounce";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/src/lib/utils";

const formSchema = z.object({
  employee_number: z.string().min(1, { message: "employee_number_required" }),
  location_ids: z.array(z.string()).min(1, { message: "location_id_required" }),
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

  const [locSearch, setLocSearch] = useState("");
  const debouncedLocSearch = useDebounce(locSearch, 300);

  const [selectedLocationMap, setSelectedLocationMap] = useState<Record<string, any>>({});

  const queryClient = useQueryClient();
  const showToast = useShowToast();
  const t = translations?.modules?.workload || {};
  const errT = translations?.formErrors || {};

  // Fetch locations with limit=10 and search term
  const { data: locationsResponse, isLoading: isLoadingLocations } = useFetchAllEntity("ifm-location-master", {
    searchParams: {
      limit: "10",
      offset: "1",
      ...(debouncedLocSearch && { search: debouncedLocSearch }),
    },
  });

  const locationsList = Array.isArray(locationsResponse?.data) ? locationsResponse.data : [];

  // Cache locations so selected location labels persist across searches
  useEffect(() => {
    if (locationsList.length > 0) {
      setSelectedLocationMap((prev) => {
        const next = { ...prev };
        locationsList.forEach((loc: any) => {
          next[String(loc.location_id)] = loc;
        });
        return next;
      });
    }
  }, [locationsList]);

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
      location_ids: [],
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
      const locIdStr = selectedRowData.location_id ? String(selectedRowData.location_id) : "";
      form.reset({
        employee_number: selectedRowData.employee_number ?? selectedRowData.employee?.emp_no ?? "",
        location_ids: locIdStr ? [locIdStr] : [],
        from_date: formatDateForInput(selectedRowData.from_date),
        to_date: formatDateForInput(selectedRowData.to_date),
        active_flag: selectedRowData.active_flag ?? true,
      });
    } else {
      form.reset({
        employee_number: "",
        location_ids: [],
        from_date: "",
        to_date: "",
        active_flag: true,
      });
    }
  }, [selectedRowData, form]);

  const addBulkMutation = useMutation({
    mutationFn: addBulkIfmEmployeeLocationMappingRequest,
    onSuccess: (res) => {
      showToast("success", "add_ifm_mapping_success");
      queryClient.invalidateQueries({ queryKey: ["ifm-employee-location-mapping"] });
      onSave(null, res.data);
      on_open_change(false);
    },
    onError: (error: any) => {
      if (error?.response?.status === 404) {
        showToast("error", error?.response?.data?.message || "One or more locations not found");
      } else if (error?.response?.status === 409) {
        showToast("error", error?.response?.data?.message || "Mapping already exists");
      } else {
        showToast("error", error?.response?.data?.message || "formsubmission_error");
      }
    },
  });

  const editMutation = useMutation({
    mutationFn: editIfmEmployeeLocationMappingRequest,
    onSuccess: (res, variables) => {
      showToast("success", "update_ifm_mapping_success");
      queryClient.invalidateQueries({ queryKey: ["ifm-employee-location-mapping"] });
      onSave(variables.mapping_id.toString(), res.data || variables);
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

      if (selectedRowData) {
        const id = selectedRowData.mapping_id || selectedRowData.id;
        editMutation.mutate({
          mapping_id: Number(id),
          employee_number: values.employee_number.trim(),
          location_id: Number(values.location_ids[0]),
          from_date: fromDateIso,
          to_date: toDateIso,
          active_flag: values.active_flag,
        });
      } else {
        addBulkMutation.mutate({
          employee_number: values.employee_number.trim(),
          location_ids: values.location_ids.map((id) => Number(id)),
          from_date: fromDateIso,
          to_date: toDateIso,
          active_flag: values.active_flag,
        });
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
            {/* Searchable Employee Combobox */}
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
                              "flex h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors hover:bg-transparent focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 justify-between",
                              !field.value && "text-text-secondary"
                            )}
                          >
                            <span className="truncate">{triggerLabel}</span>
                            <ChevronDown className="ml-2 h-4 w-4 text-text-primary shrink-0" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[300px] sm:w-[380px] p-0 border-none shadow-dropdown bg-accent z-[100]"
                        align="start"
                        onWheel={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                      >
                        <Command shouldFilter={false} className="w-full">
                          <CommandInput
                            value={empSearch}
                            onValueChange={(val) => setEmpSearch(val)}
                            placeholder={t.placeholder_search_employee || "Search employee name or number..."}
                            className="border-none"
                          />
                          <CommandList
                            className="max-h-60 overflow-y-auto [scrollbar-width:auto] pr-1"
                            onWheel={(e) => e.stopPropagation()}
                            onTouchMove={(e) => e.stopPropagation()}
                          >
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

            {/* Searchable Multi-Select Locations Combobox */}
            <FormField
              control={form.control}
              name="location_ids"
              render={({ field }) => {
                const selectedIds = field.value || [];
                const getLocationLabel = (locId: string) => {
                  const loc = selectedLocationMap[locId] || locationsList.find((l: any) => String(l.location_id) === locId);
                  if (!loc) return `ID #${locId}`;
                  return `${loc.project_name} - ${loc.location_name || loc.location_code || `ID #${loc.location_id}`}`;
                };

                let triggerLabel = t.placeholder_location_id || "Select location(s)";
                if (selectedIds.length === 1) {
                  triggerLabel = getLocationLabel(selectedIds[0]);
                } else if (selectedIds.length > 1) {
                  const firstLabel = getLocationLabel(selectedIds[0]);
                  triggerLabel = `${firstLabel} (+${selectedIds.length - 1} more)`;
                }

                const toggleLocation = (idStr: string) => {
                  if (selectedIds.includes(idStr)) {
                    field.onChange(selectedIds.filter((item) => item !== idStr));
                  } else {
                    field.onChange([...selectedIds, idStr]);
                  }
                };

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
                              "flex h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors hover:bg-transparent focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 justify-between",
                              selectedIds.length === 0 && "text-text-secondary"
                            )}
                          >
                            <span className="truncate">{triggerLabel}</span>
                            <ChevronDown className="ml-2 h-4 w-4 text-text-primary shrink-0" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[300px] sm:w-[380px] p-0 border-none shadow-dropdown bg-accent z-[100]"
                        align="start"
                        onWheel={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                      >
                        <Command shouldFilter={false} className="w-full">
                          <CommandInput
                            value={locSearch}
                            onValueChange={(val) => setLocSearch(val)}
                            placeholder={t.placeholder_search_location || "Search project or location..."}
                            className="border-none"
                          />
                          <CommandList
                            className="max-h-60 overflow-y-auto [scrollbar-width:auto] pr-1"
                            onWheel={(e) => e.stopPropagation()}
                            onTouchMove={(e) => e.stopPropagation()}
                          >
                            <CommandEmpty className="p-4 text-sm text-text-secondary text-center">
                              {isLoadingLocations ? "Searching..." : (t.no_locations_found || "No locations found.")}
                            </CommandEmpty>
                            <CommandGroup>
                              {locationsList.map((loc: any) => {
                                const locIdStr = String(loc.location_id);
                                const label = `${loc.project_name} - ${loc.location_name || loc.location_code || `ID #${loc.location_id}`}`;
                                const isSelected = selectedIds.includes(locIdStr);
                                return (
                                  <CommandItem
                                    key={loc.location_id}
                                    value={locIdStr}
                                    onSelect={() => toggleLocation(locIdStr)}
                                    className="cursor-pointer flex items-center gap-3 py-2 px-3 hover:bg-backdrop"
                                  >
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={() => toggleLocation(locIdStr)}
                                    />
                                    <span className="truncate font-medium">{label}</span>
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <TranslatedError
                      fieldError={form.formState.errors.location_ids}
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
