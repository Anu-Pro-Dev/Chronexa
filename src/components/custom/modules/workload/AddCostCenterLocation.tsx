"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/src/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { Calendar } from "@/src/components/ui/calendar";
import { TimePicker } from "@/src/components/ui/time-picker";
import { CalendarIcon, ClockIcon } from "@/src/icons/icons";
import Required from "@/src/components/ui/required";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addCostCodeMasterRequest,
  editCostCodeMasterRequest,
} from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";
import { cn } from "@/src/lib/utils";
import { format } from "date-fns";

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

const formSchema = z.object({
  cost_code: z.string().min(1, { message: "cost_code_required" }),
  cost_center: z.string().optional(),
  latitude: z
    .string()
    .min(1, { message: "latitude_required" })
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= -90 && parseFloat(val) <= 90, {
      message: "latitude_invalid",
    }),
  longitude: z
    .string()
    .min(1, { message: "longitude_required" })
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= -180 && parseFloat(val) <= 180, {
      message: "longitude_invalid",
    }),
  geocoordinates: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  permit_extra_hours_flag: z.boolean().default(false),
  extra_hours: z.coerce.number().optional().default(0),
  effective_from: z.string().optional(),
  effective_to: z.string().optional(),
  break_start: z.string().optional(),
  break_end: z.string().optional(),
  week_off: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const parseTimeString = (timeStr: string | null | undefined): Date | undefined => {
  if (!timeStr) return undefined;
  try {
    const str = String(timeStr).trim();
    if (!str || str === "-") return undefined;

    // Handle UTC ISO strings like "1970-01-01T08:00:00.000Z"
    if (str.includes("T") || str.includes("Z")) {
      const d = new Date(str);
      return isNaN(d.getTime()) ? undefined : d;
    }

    // Handle plain HH:mm or HH:mm:ss strings (local time)
    const today = new Date();
    const [hours, minutes, seconds] = str.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return undefined;
    today.setHours(hours, minutes, seconds || 0, 0);
    return today;
  } catch {
    return undefined;
  }
};

const formatTimeToString = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

const formatTimeForInput = (timeStr: string | null | undefined): string => {
  const d = parseTimeString(timeStr);
  if (!d) return "";
  return formatTimeToString(d);
};

// Convert local system time string (e.g. "08:00:00") into a UTC ISO timestamp string (e.g. "1970-01-01T04:00:00.000Z")
const formatTimeToUTCISO = (localTimeStr: string | null | undefined): string | undefined => {
  if (!localTimeStr) return undefined;
  try {
    const str = String(localTimeStr).trim();
    if (!str || str === "-") return undefined;

    if (str.includes("T") && str.endsWith("Z")) {
      return str;
    }

    const [hours, minutes, seconds] = str.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return undefined;

    const localDate = new Date(1970, 0, 1, hours, minutes, seconds || 0, 0);
    return localDate.toISOString();
  } catch {
    return undefined;
  }
};

const parseDateString = (dateVal: string | null | undefined): Date | undefined => {
  if (!dateVal) return undefined;
  try {
    const str = String(dateVal).trim();
    if (!str || str === "-") return undefined;

    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
      const parts = str.split("T")[0].split("-").map(Number);
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return isNaN(d.getTime()) ? undefined : d;
    }

    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
      const parts = str.split("/").map(Number);
      let d = new Date(parts[2], parts[1] - 1, parts[0]);
      if (isNaN(d.getTime()) || parts[1] > 12) {
        d = new Date(parts[2], parts[0] - 1, parts[1]);
      }
      return isNaN(d.getTime()) ? undefined : d;
    }

    const d = new Date(str);
    return isNaN(d.getTime()) ? undefined : d;
  } catch {
    return undefined;
  }
};

const formatDateForInput = (dateVal: string | null | undefined) => {
  const d = parseDateString(dateVal);
  if (!d) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const formatDateDisplay = (dateVal: string | null | undefined): string | null => {
  const d = parseDateString(dateVal);
  if (!d) return null;
  try {
    return format(d, "dd/MM/yyyy");
  } catch {
    return null;
  }
};

export default function AddCostCenterLocation({
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

  const [popoverStates, setPopoverStates] = useState({
    effectiveFrom: false,
    effectiveTo: false,
    startTime: false,
    endTime: false,
    breakStart: false,
    breakEnd: false,
  });

  const queryClient = useQueryClient();
  const showToast = useShowToast();
  const t = translations?.modules?.workload || {};
  const errT = translations?.formErrors || {};

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cost_code: "",
      cost_center: "",
      latitude: "",
      longitude: "",
      geocoordinates: "",
      start_time: "08:00:00",
      end_time: "17:00:00",
      permit_extra_hours_flag: false,
      extra_hours: 0,
      effective_from: "",
      effective_to: "",
      break_start: "",
      break_end: "",
      week_off: "Friday,Saturday",
    },
  });

  const latitudeValue = form.watch("latitude");
  const longitudeValue = form.watch("longitude");

  // Auto-fill geocoordinates as lat,long when latitude or longitude changes
  useEffect(() => {
    const lat = (latitudeValue || "").trim();
    const lng = (longitudeValue || "").trim();
    if (lat && lng) {
      form.setValue("geocoordinates", `${lat},${lng}`);
    } else if (lat) {
      form.setValue("geocoordinates", lat);
    } else if (lng) {
      form.setValue("geocoordinates", lng);
    } else {
      form.setValue("geocoordinates", "");
    }
  }, [latitudeValue, longitudeValue, form]);

  useEffect(() => {
    if (selectedRowData) {
      let lat = "";
      let lng = "";
      if (selectedRowData.geocoordinates && typeof selectedRowData.geocoordinates === "string") {
        const parts = selectedRowData.geocoordinates.split(",");
        if (parts.length === 2) {
          lat = parts[0].trim();
          lng = parts[1].trim();
        }
      }

      const effFrom = selectedRowData.effective_from ?? selectedRowData.effectiveFrom;
      const effTo = selectedRowData.effective_to ?? selectedRowData.effectiveTo;

      form.reset({
        cost_code: selectedRowData.cost_code || "",
        cost_center: selectedRowData.cost_center || "",
        latitude: lat,
        longitude: lng,
        geocoordinates: selectedRowData.geocoordinates || "",
        start_time: formatTimeForInput(selectedRowData.start_time),
        end_time: formatTimeForInput(selectedRowData.end_time),
        permit_extra_hours_flag: !!selectedRowData.permit_extra_hours_flag,
        extra_hours: Number(selectedRowData.extra_hours || 0),
        effective_from: formatDateForInput(effFrom),
        effective_to: formatDateForInput(effTo),
        break_start: formatTimeForInput(selectedRowData.break_start),
        break_end: formatTimeForInput(selectedRowData.break_end),
        week_off: selectedRowData.week_off || "",
      });
    } else {
      form.reset({
        cost_code: "",
        cost_center: "",
        latitude: "",
        longitude: "",
        geocoordinates: "",
        start_time: "08:00:00",
        end_time: "17:00:00",
        permit_extra_hours_flag: false,
        extra_hours: 0,
        effective_from: "",
        effective_to: "",
        break_start: "",
        break_end: "",
        week_off: "Friday,Saturday",
      });
    }
  }, [selectedRowData, form]);

  const addMutation = useMutation({
    mutationFn: addCostCodeMasterRequest,
    onSuccess: (res) => {
      showToast("success", "add_success");
      onSave(null, res.data);
      queryClient.invalidateQueries({ queryKey: ["cost-code-master"] });
      on_open_change(false);
    },
    onError: (error: any) => {
      showToast("error", error?.response?.data?.message || "formsubmission_error");
    },
  });

  const editMutation = useMutation({
    mutationFn: editCostCodeMasterRequest,
    onSuccess: (res, variables) => {
      showToast("success", "update_success");
      onSave(variables.id.toString(), res.data || variables);
      queryClient.invalidateQueries({ queryKey: ["cost-code-master"] });
      on_open_change(false);
    },
    onError: (error: any) => {
      showToast("error", error?.response?.data?.message || "formsubmission_error");
    },
  });

  async function onSubmit(values: FormValues) {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const payload: any = {
        cost_code: values.cost_code.trim(),
        cost_center: values.cost_center ? values.cost_center.trim() : undefined,
        geocoordinates: values.geocoordinates ? values.geocoordinates.trim() : undefined,
        start_time: formatTimeToUTCISO(values.start_time),
        end_time: formatTimeToUTCISO(values.end_time),
        permit_extra_hours_flag: values.permit_extra_hours_flag,
        extra_hours: Number(values.extra_hours || 0),
        effective_from: values.effective_from || undefined,
        effective_to: values.effective_to || undefined,
        break_start: formatTimeToUTCISO(values.break_start),
        break_end: formatTimeToUTCISO(values.break_end),
        week_off: values.week_off ? values.week_off.trim() : undefined,
      };

      if (selectedRowData) {
        const id = selectedRowData.id || selectedRowData.cost_code_id;
        editMutation.mutate({ id: Number(id), ...payload });
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
            {/* Cost Code */}
            <FormField
              control={form.control}
              name="cost_code"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>
                    {t.cost_code || "Cost Code"}
                    <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t.placeholder_cost_code || "Enter cost code (e.g. CC-1001)"}
                      {...field}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.cost_code}
                    translations={errT}
                  />
                </FormItem>
              )}
            />

            {/* Cost Center */}
            <FormField
              control={form.control}
              name="cost_center"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>{t.cost_center || "Cost Center"}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t.placeholder_cost_center || "Enter cost center"}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Latitude (Mandatory Numeric Only) */}
            <FormField
              control={form.control}
              name="latitude"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>
                    {t.latitude || "Latitude"}
                    <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder={t.placeholder_latitude || "Enter latitude (e.g. 24.4539)"}
                      value={field.value}
                      onChange={(e) => {
                        const cleaned = sanitizeCoordinateInput(e.target.value);
                        field.onChange(cleaned);
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

            {/* Longitude (Mandatory Numeric Only) */}
            <FormField
              control={form.control}
              name="longitude"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>
                    {t.longitude || "Longitude"}
                    <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder={t.placeholder_longitude || "Enter longitude (e.g. 54.3773)"}
                      value={field.value}
                      onChange={(e) => {
                        const cleaned = sanitizeCoordinateInput(e.target.value);
                        field.onChange(cleaned);
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

            {/* Geocoordinates (Auto-filled & Non-editable) */}
            <FormField
              control={form.control}
              name="geocoordinates"
              render={({ field }) => (
                <FormItem className="min-w-0 md:col-span-2">
                  <FormLabel>{t.geocoordinates || "Geocoordinates"}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      disabled={true}
                      placeholder={t.placeholder_geocoordinates || "Auto-generated from lat,long"}
                      className="bg-backdrop cursor-not-allowed opacity-80"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Start Time (TimePicker Component) */}
            <FormField
              control={form.control}
              name="start_time"
              render={({ field }) => {
                const timeDate = parseTimeString(field.value);
                return (
                  <FormItem className="min-w-0">
                    <FormLabel>{t.start_time || "Start Time"}</FormLabel>
                    <Popover
                      open={popoverStates.startTime}
                      onOpenChange={(open) =>
                        setPopoverStates((prev) => ({ ...prev, startTime: open }))
                      }
                    >
                      <FormControl>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="lg"
                            className={cn(
                              "w-full bg-accent px-3 flex justify-between items-center text-text-primary text-sm font-normal overflow-hidden",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <span className="truncate">
                              {field.value ? field.value : (t.placeholder_time || "Choose time")}
                            </span>
                            <ClockIcon className="shrink-0" />
                          </Button>
                        </PopoverTrigger>
                      </FormControl>
                      <PopoverContent className="w-auto p-4" align="start">
                        <TimePicker
                          setDate={(date) => {
                            field.onChange(date ? formatTimeToString(date) : "");
                          }}
                          date={timeDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                );
              }}
            />

            {/* End Time (TimePicker Component) */}
            <FormField
              control={form.control}
              name="end_time"
              render={({ field }) => {
                const timeDate = parseTimeString(field.value);
                return (
                  <FormItem className="min-w-0">
                    <FormLabel>{t.end_time || "End Time"}</FormLabel>
                    <Popover
                      open={popoverStates.endTime}
                      onOpenChange={(open) =>
                        setPopoverStates((prev) => ({ ...prev, endTime: open }))
                      }
                    >
                      <FormControl>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="lg"
                            className={cn(
                              "w-full bg-accent px-3 flex justify-between items-center text-text-primary text-sm font-normal overflow-hidden",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <span className="truncate">
                              {field.value ? field.value : (t.placeholder_time || "Choose time")}
                            </span>
                            <ClockIcon className="shrink-0" />
                          </Button>
                        </PopoverTrigger>
                      </FormControl>
                      <PopoverContent className="w-auto p-4" align="start">
                        <TimePicker
                          setDate={(date) => {
                            field.onChange(date ? formatTimeToString(date) : "");
                          }}
                          date={timeDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                );
              }}
            />

            {/* Effective From (Calendar Component) */}
            <FormField
              control={form.control}
              name="effective_from"
              render={({ field }) => {
                const formattedDate = formatDateDisplay(field.value);
                const selectedDate = parseDateString(field.value);

                return (
                  <FormItem className="min-w-0">
                    <FormLabel>{t.effective_from || "Effective From"}</FormLabel>
                    <Popover
                      open={popoverStates.effectiveFrom}
                      onOpenChange={(open) =>
                        setPopoverStates((prev) => ({ ...prev, effectiveFrom: open }))
                      }
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            size="lg"
                            className={cn(
                              "w-full bg-accent px-3 flex justify-between items-center text-text-primary text-sm font-normal overflow-hidden",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <span className="truncate">
                              {formattedDate ? (
                                formattedDate
                              ) : (
                                (t.placeholder_date || "Choose date")
                              )}
                            </span>
                            <CalendarIcon className="shrink-0" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            if (date) {
                              const yyyy = date.getFullYear();
                              const mm = String(date.getMonth() + 1).padStart(2, "0");
                              const dd = String(date.getDate()).padStart(2, "0");
                              field.onChange(`${yyyy}-${mm}-${dd}`);
                            } else {
                              field.onChange("");
                            }
                            setPopoverStates((prev) => ({ ...prev, effectiveFrom: false }));
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                );
              }}
            />

            {/* Effective To (Calendar Component) */}
            <FormField
              control={form.control}
              name="effective_to"
              render={({ field }) => {
                const formattedDate = formatDateDisplay(field.value);
                const selectedDate = parseDateString(field.value);

                return (
                  <FormItem className="min-w-0">
                    <FormLabel>{t.effective_to || "Effective To"}</FormLabel>
                    <Popover
                      open={popoverStates.effectiveTo}
                      onOpenChange={(open) =>
                        setPopoverStates((prev) => ({ ...prev, effectiveTo: open }))
                      }
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            size="lg"
                            className={cn(
                              "w-full bg-accent px-3 flex justify-between items-center text-text-primary text-sm font-normal overflow-hidden",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <span className="truncate">
                              {formattedDate ? (
                                formattedDate
                              ) : (
                                (t.placeholder_date || "Choose date")
                              )}
                            </span>
                            <CalendarIcon className="shrink-0" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            if (date) {
                              const yyyy = date.getFullYear();
                              const mm = String(date.getMonth() + 1).padStart(2, "0");
                              const dd = String(date.getDate()).padStart(2, "0");
                              field.onChange(`${yyyy}-${mm}-${dd}`);
                            } else {
                              field.onChange("");
                            }
                            setPopoverStates((prev) => ({ ...prev, effectiveTo: false }));
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                );
              }}
            />

            {/* Break Start (TimePicker Component) */}
            <FormField
              control={form.control}
              name="break_start"
              render={({ field }) => {
                const timeDate = parseTimeString(field.value);
                return (
                  <FormItem className="min-w-0">
                    <FormLabel>{t.break_start || "Break Start"}</FormLabel>
                    <Popover
                      open={popoverStates.breakStart}
                      onOpenChange={(open) =>
                        setPopoverStates((prev) => ({ ...prev, breakStart: open }))
                      }
                    >
                      <FormControl>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="lg"
                            className={cn(
                              "w-full bg-accent px-3 flex justify-between items-center text-text-primary text-sm font-normal overflow-hidden",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <span className="truncate">
                              {field.value ? field.value : (t.placeholder_time || "Choose time")}
                            </span>
                            <ClockIcon className="shrink-0" />
                          </Button>
                        </PopoverTrigger>
                      </FormControl>
                      <PopoverContent className="w-auto p-4" align="start">
                        <TimePicker
                          setDate={(date) => {
                            field.onChange(date ? formatTimeToString(date) : "");
                          }}
                          date={timeDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                );
              }}
            />

            {/* Break End (TimePicker Component) */}
            <FormField
              control={form.control}
              name="break_end"
              render={({ field }) => {
                const timeDate = parseTimeString(field.value);
                return (
                  <FormItem className="min-w-0">
                    <FormLabel>{t.break_end || "Break End"}</FormLabel>
                    <Popover
                      open={popoverStates.breakEnd}
                      onOpenChange={(open) =>
                        setPopoverStates((prev) => ({ ...prev, breakEnd: open }))
                      }
                    >
                      <FormControl>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="lg"
                            className={cn(
                              "w-full bg-accent px-3 flex justify-between items-center text-text-primary text-sm font-normal overflow-hidden",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <span className="truncate">
                              {field.value ? field.value : (t.placeholder_time || "Choose time")}
                            </span>
                            <ClockIcon className="shrink-0" />
                          </Button>
                        </PopoverTrigger>
                      </FormControl>
                      <PopoverContent className="w-auto p-4" align="start">
                        <TimePicker
                          setDate={(date) => {
                            field.onChange(date ? formatTimeToString(date) : "");
                          }}
                          date={timeDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                );
              }}
            />

            {/* Extra Hours */}
            <FormField
              control={form.control}
              name="extra_hours"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>{t.extra_hours || "Extra Hours"}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t.placeholder_extra_hours || "Enter extra hours (e.g. 2)"}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Week Off */}
            <FormField
              control={form.control}
              name="week_off"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>{t.week_off || "Week Off"}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t.placeholder_week_off || "Select or enter week off (e.g. Friday,Saturday)"}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Permit Extra Hours Flag */}
            <FormField
              control={form.control}
              name="permit_extra_hours_flag"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 space-y-0 pt-6 md:col-span-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(!!checked)}
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer font-normal">
                    {t.permit_extra_hours_flag || "Permit Extra Hours"}
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
