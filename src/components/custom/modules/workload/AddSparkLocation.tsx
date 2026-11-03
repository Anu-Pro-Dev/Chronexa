"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
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
import CountryDropdown from "@/src/components/custom/common/country-dropdown";
import { useCountries } from "@/src/hooks/useCountries";
import { useDebounce } from "@/src/hooks/useDebounce";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addSparkEmployeeLocationRequest,
  editSparkEmployeeLocationRequest,
} from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils";

const sanitizeCoordinateInput = (val: string) => {
  let cleaned = val.replace(/[^0-9.-]/g, "");
  const isNegative = cleaned.startsWith("-");
  cleaned = cleaned.replace(/-/g, "");
  if (isNegative) cleaned = "-" + cleaned;
  const parts = cleaned.split(".");
  if (parts.length > 2) {
    cleaned = parts[0] + "." + parts.slice(1).join("");
  }
  return cleaned;
};

const parseGeolocation = (value: unknown) => {
  const geo = value === undefined || value === null ? "" : String(value).trim();
  if (!geo) return { latitude: "", longitude: "" };
  const parts = geo.split(",");
  if (parts.length !== 2) return { latitude: "", longitude: "" };
  const latitude = parts[0].trim();
  const longitude = parts[1].trim();
  if (!latitude || !longitude) return { latitude: "", longitude: "" };
  return { latitude, longitude };
};

const formatDateForInput = (value: unknown) => {
  if (!value) return "";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

const getEmployeeNumber = (employee: any) =>
  (employee?.emp_no ?? employee?.employee_number ?? employee?.EmployeeNumber ?? "")
    .toString()
    .trim();

const getEmployeeNameEng = (employee: any) =>
  [employee?.firstname_eng, employee?.lastname_eng]
    .filter(Boolean)
    .join(" ")
    .trim();

const getEmployeeDisplay = (employee: any) => {
  const employeeNumber = getEmployeeNumber(employee);
  const name = getEmployeeNameEng(employee);
  return name ? `${employeeNumber} - ${name}` : employeeNumber;
};

const formSchema = z
  .object({
    EmployeeNumber: z.string().min(1, { message: "emp_no_required" }),
    NameEng: z.string().optional(),
    LocationCode: z.string().optional(),
    LocationEng: z.string().optional(),
    CountryCode: z.string().optional(),
    Radius: z.string().optional(),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
    City: z.string().optional(),
    FromDate: z.string().optional(),
    ToDate: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    const latitude = (values.latitude || "").trim();
    const longitude = (values.longitude || "").trim();

    if (!!latitude !== !!longitude) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: latitude ? ["longitude"] : ["latitude"],
        message: "geolocation_invalid",
      });
      return;
    }

    if (latitude) {
      const lat = Number(latitude);
      if (Number.isNaN(lat) || lat < -90 || lat > 90) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["latitude"],
          message: "geolocation_invalid",
        });
      }
    }

    if (longitude) {
      const lng = Number(longitude);
      if (Number.isNaN(lng) || lng < -180 || lng > 180) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["longitude"],
          message: "geolocation_invalid",
        });
      }
    }
  });

type FormValues = z.infer<typeof formSchema>;

const emptyValues: FormValues = {
  EmployeeNumber: "",
  NameEng: "",
  LocationCode: "",
  LocationEng: "",
  CountryCode: "",
  Radius: "",
  latitude: "",
  longitude: "",
  City: "",
  FromDate: "",
  ToDate: "",
};

export default function AddSparkLocation({
  on_open_change,
  selectedRowData,
  onSave,
}: {
  on_open_change: (open: boolean) => void;
  selectedRowData?: any;
  onSave: (id: string | null, newData: any) => void;
}) {
  const { countries, getCountryByCode } = useCountries();
  const { translations } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employeeOpen, setEmployeeOpen] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [selectedEmployeeCache, setSelectedEmployeeCache] = useState<any>(null);
  const debouncedEmployeeSearch = useDebounce(employeeSearch, 300);
  const queryClient = useQueryClient();
  const showToast = useShowToast();
  const t = translations?.modules?.workload || {};
  const errT = translations?.formErrors || {};

  const { data: employeesResponse, isLoading: isLoadingEmployees } = useFetchAllEntity(
    "employee",
    {
      searchParams: {
        limit: "100",
        offset: "1",
        ...(debouncedEmployeeSearch && { search: debouncedEmployeeSearch }),
      },
    }
  );

  const employeesList = Array.isArray(employeesResponse?.data)
    ? employeesResponse.data
    : [];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyValues,
  });

  const latitudeValue = form.watch("latitude");
  const longitudeValue = form.watch("longitude");

  useEffect(() => {
    if (selectedRowData) {
      const parsed = parseGeolocation(
        selectedRowData.Geolocation ?? selectedRowData.geolocation
      );
      setSelectedEmployeeCache(selectedRowData);
      form.reset({
        EmployeeNumber: selectedRowData.EmployeeNumber ?? "",
        NameEng: selectedRowData.NameEng ?? "",
        LocationCode: selectedRowData.LocationCode ?? "",
        LocationEng: selectedRowData.LocationEng ?? "",
        CountryCode: selectedRowData.CountryCode ?? "",
        Radius: selectedRowData.Radius != null ? String(selectedRowData.Radius) : "",
        latitude: parsed.latitude,
        longitude: parsed.longitude,
        City: selectedRowData.City ?? "",
        FromDate: formatDateForInput(selectedRowData.FromDate),
        ToDate: formatDateForInput(selectedRowData.ToDate),
      });
    } else {
      setSelectedEmployeeCache(null);
      form.reset(emptyValues);
    }
  }, [selectedRowData, form]);

  const addMutation = useMutation({
    mutationFn: addSparkEmployeeLocationRequest,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["spark-employee-location"] });
      showToast("success", "addlocation_success");
      on_open_change(false);
      onSave(null, data?.data ?? data);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to add spark location";
      showToast("error", message);
    },
  });

  const editMutation = useMutation({
    mutationFn: editSparkEmployeeLocationRequest,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["spark-employee-location"] });
      showToast("success", "updatelocation_success");
      on_open_change(false);
      onSave(selectedRowData?.location_id ?? null, data?.data ?? data);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update spark location";
      showToast("error", message);
    },
  });

  async function onSubmit(values: FormValues) {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const isEdit = !!selectedRowData;
      const optionalText = (value?: string) => {
        const trimmed = (value || "").trim();
        if (trimmed) return trimmed;
        return isEdit ? null : undefined;
      };

      const latitude = (values.latitude || "").trim();
      const longitude = (values.longitude || "").trim();
      const hasCoordinates = !!latitude && !!longitude;

      const payload: any = {
        EmployeeNumber: values.EmployeeNumber.trim(),
        NameEng: optionalText(values.NameEng),
        LocationCode: optionalText(values.LocationCode),
        LocationEng: optionalText(values.LocationEng),
        CountryCode: optionalText(values.CountryCode),
        Radius: optionalText(values.Radius),
        City: optionalText(values.City),
        FromDate: values.FromDate || (isEdit ? null : undefined),
        ToDate: values.ToDate || (isEdit ? null : undefined),
      };

      if (hasCoordinates) {
        payload.latitude = Number(latitude);
        payload.longitude = Number(longitude);
      } else if (isEdit) {
        payload.Geolocation = null;
      }

      if (isEdit) {
        const id = selectedRowData.location_id ?? selectedRowData.id;
        editMutation.mutate({ location_id: Number(id), ...payload });
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
            <FormField
              control={form.control}
              name="EmployeeNumber"
              render={({ field }) => {
                const selectedEmployee =
                  employeesList.find(
                    (employee: any) => getEmployeeNumber(employee) === field.value
                  ) ||
                  (selectedEmployeeCache &&
                  getEmployeeNumber(selectedEmployeeCache) === field.value
                    ? selectedEmployeeCache
                    : undefined);

                const selectedName =
                  getEmployeeNameEng(selectedEmployee) ||
                  (selectedEmployeeCache &&
                  getEmployeeNumber(selectedEmployeeCache) === field.value
                    ? selectedEmployeeCache.NameEng
                    : "");

                let triggerLabel =
                  t.placeholder_employee_number || "Select employee";
                if (selectedEmployee) {
                  const employeeNumber = getEmployeeNumber(selectedEmployee);
                  triggerLabel = selectedName
                    ? `${employeeNumber} - ${selectedName}`
                    : employeeNumber;
                } else if (field.value) {
                  triggerLabel = field.value;
                }

                return (
                  <FormItem className=" min-w-0">
                    <FormLabel>
                      {t.employee_number || "Employee Number"}
                      <Required />
                    </FormLabel>
                    <Popover
                      open={employeeOpen}
                      onOpenChange={(open) => {
                        setEmployeeOpen(open);
                        if (!open) setEmployeeSearch("");
                      }}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={employeeOpen}
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
                            value={employeeSearch}
                            onValueChange={setEmployeeSearch}
                            placeholder={
                              t.search_employees || "Search employee name or number..."
                            }
                            className="border-none"
                          />
                          <CommandList
                            className="max-h-60 overflow-y-auto [scrollbar-width:auto] pr-1"
                            onWheel={(e) => e.stopPropagation()}
                            onTouchMove={(e) => e.stopPropagation()}
                          >
                            <CommandEmpty className="p-4 text-sm text-text-secondary text-center">
                              {isLoadingEmployees
                                ? t.searching || "Searching..."
                                : t.no_employees_found || "No employees found."}
                            </CommandEmpty>
                            <CommandGroup>
                              {employeesList.map((employee: any) => {
                                const employeeNumber = getEmployeeNumber(employee);
                                if (!employeeNumber) return null;
                                const isSelected = field.value === employeeNumber;
                                return (
                                  <CommandItem
                                    key={employee.employee_id || employeeNumber}
                                    value={employeeNumber}
                                    onSelect={() => {
                                      field.onChange(employeeNumber);
                                      form.setValue(
                                        "NameEng",
                                        getEmployeeNameEng(employee),
                                        {
                                          shouldValidate: false,
                                          shouldDirty: true,
                                        }
                                      );
                                      setSelectedEmployeeCache(employee);
                                      setEmployeeOpen(false);
                                      setEmployeeSearch("");
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
                                      <span className="truncate font-medium">
                                        {getEmployeeDisplay(employee)}
                                      </span>
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
                      fieldError={form.formState.errors.EmployeeNumber}
                      translations={errT}
                    />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="LocationCode"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>{t.location_code || "Location Code"}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t.placeholder_location_code || "Enter location code"}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="LocationEng"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>{t.location_name || "Location Name"}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t.placeholder_location_name || "Enter location name"}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="CountryCode"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>{t.country_code || "Country Code"}</FormLabel>
                  <FormControl>
                    <CountryDropdown
                      countries={countries}
                      value={getCountryByCode(field.value ?? null) ?? null}
                      displayMode="code"
                      onChange={(country) => field.onChange(country?.country_code ?? "")}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="City"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>{t.city || "City"}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t.placeholder_city || "Enter city"}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Radius"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>{t.radius || "Radius"}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t.placeholder_radius || "Enter radius (e.g. 150)"}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="latitude"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>{t.latitude || "Latitude"}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder={t.placeholder_latitude || "Enter latitude (e.g. 24.4821)"}
                      value={field.value}
                      onChange={(event) => {
                        field.onChange(sanitizeCoordinateInput(event.target.value));
                      }}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.latitude}
                    translations={errT}
                  />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="longitude"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>{t.longitude || "Longitude"}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder={t.placeholder_longitude || "Enter longitude (e.g. 54.3612)"}
                      value={field.value}
                      onChange={(event) => {
                        field.onChange(sanitizeCoordinateInput(event.target.value));
                      }}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.longitude}
                    translations={errT}
                  />
                </FormItem>
              )}
            />

            <FormItem className="min-w-0 md:col-span-2">
              <FormLabel>{t.geolocation || "Geolocation"}</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  disabled
                  value={
                    latitudeValue && longitudeValue
                      ? `${latitudeValue},${longitudeValue}`
                      : ""
                  }
                  placeholder={t.placeholder_geolocation || "Auto-generated from latitude,longitude"}
                  className="bg-backdrop cursor-not-allowed opacity-80"
                />
              </FormControl>
            </FormItem>

            <FormField
              control={form.control}
              name="FromDate"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>{t.from_date || "From Date"}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ToDate"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>{t.to_date || "To Date"}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
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
