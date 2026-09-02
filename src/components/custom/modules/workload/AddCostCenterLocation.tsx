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
import Required from "@/src/components/ui/required";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addCostCodeMasterRequest,
  editCostCodeMasterRequest,
} from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";

const formSchema = z.object({
  cost_code: z.string().min(1, { message: "cost_code_required" }),
  cost_center: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
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

  const formatDateForInput = (dateVal: string | null | undefined) => {
    if (!dateVal) return "";
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return dateVal;
      return d.toISOString().split("T")[0];
    } catch {
      return dateVal;
    }
  };

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

      form.reset({
        cost_code: selectedRowData.cost_code || "",
        cost_center: selectedRowData.cost_center || "",
        latitude: lat,
        longitude: lng,
        geocoordinates: selectedRowData.geocoordinates || "",
        start_time: selectedRowData.start_time || "",
        end_time: selectedRowData.end_time || "",
        permit_extra_hours_flag: !!selectedRowData.permit_extra_hours_flag,
        extra_hours: Number(selectedRowData.extra_hours || 0),
        effective_from: formatDateForInput(selectedRowData.effective_from),
        effective_to: formatDateForInput(selectedRowData.effective_to),
        break_start: selectedRowData.break_start || "",
        break_end: selectedRowData.break_end || "",
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
        start_time: values.start_time ? values.start_time.trim() : undefined,
        end_time: values.end_time ? values.end_time.trim() : undefined,
        permit_extra_hours_flag: values.permit_extra_hours_flag,
        extra_hours: Number(values.extra_hours || 0),
        effective_from: values.effective_from || undefined,
        effective_to: values.effective_to || undefined,
        break_start: values.break_start ? values.break_start.trim() : undefined,
        break_end: values.break_end ? values.break_end.trim() : undefined,
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

            {/* Latitude */}
            <FormField
              control={form.control}
              name="latitude"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>{t.latitude || "Latitude"}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t.placeholder_latitude || "Enter latitude (e.g. 24.4539)"}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Longitude */}
            <FormField
              control={form.control}
              name="longitude"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>{t.longitude || "Longitude"}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t.placeholder_longitude || "Enter longitude (e.g. 54.3773)"}
                      {...field}
                    />
                  </FormControl>
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

            {/* Start Time */}
            <FormField
              control={form.control}
              name="start_time"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>{t.start_time || "Start Time"}</FormLabel>
                  <FormControl>
                    <Input type="time" step="1" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* End Time */}
            <FormField
              control={form.control}
              name="end_time"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>{t.end_time || "End Time"}</FormLabel>
                  <FormControl>
                    <Input type="time" step="1" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Effective From */}
            <FormField
              control={form.control}
              name="effective_from"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>{t.effective_from || "Effective From"}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Effective To */}
            <FormField
              control={form.control}
              name="effective_to"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>{t.effective_to || "Effective To"}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                </FormItem>
              )}
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
