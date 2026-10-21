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
import CountryDropdown from "@/src/components/custom/common/country-dropdown";
import { useCountries } from "@/src/hooks/useCountries";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addPcpLocationMasterRequest, editPcpLocationMasterRequest } from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";

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
  project_name: z.string().min(1, { message: "project_name_required" }),
  location_code: z.string().optional(),
  location_name: z.string().optional(),
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
  radius: z.string().optional().default("100"),
  geolocation: z.string().optional(),
  city: z.string().optional(),
  country_code: z.string().optional(),
  entity: z.string().optional(),
  active_flag: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddPcpLocation({
  on_open_change,
  selectedRowData,
  onSave,
}: {
  on_open_change: (open: boolean) => void;
  selectedRowData?: any;
  onSave: (id: string | null, newData: any) => void;
}) {
  const { countries, getCountryByCode } = useCountries();
  const { language, translations } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const showToast = useShowToast();
  const t = translations?.modules?.workload || {};
  const errT = translations?.formErrors || {};

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      project_name: "",
      location_code: "",
      location_name: "",
      latitude: "",
      longitude: "",
      radius: "100",
      geolocation: "",
      city: "",
      country_code: "",
      entity: "",
      active_flag: true,
    },
  });

  const latitudeValue = form.watch("latitude");
  const longitudeValue = form.watch("longitude");

  // Automatically compute geolocation as lat,long when latitude or longitude changes
  useEffect(() => {
    const lat = (latitudeValue || "").trim();
    const lng = (longitudeValue || "").trim();
    if (lat && lng) {
      form.setValue("geolocation", `${lat},${lng}`);
    } else if (lat) {
      form.setValue("geolocation", lat);
    } else if (lng) {
      form.setValue("geolocation", lng);
    } else {
      form.setValue("geolocation", "");
    }
  }, [latitudeValue, longitudeValue, form]);

  useEffect(() => {
    if (selectedRowData) {
      let lat = selectedRowData.latitude ? String(selectedRowData.latitude) : "";
      let lng = selectedRowData.longitude ? String(selectedRowData.longitude) : "";

      if ((!lat || !lng) && selectedRowData.geolocation) {
        const geoStr = String(selectedRowData.geolocation);
        const parts = geoStr.split(",");
        if (parts.length === 2) {
          lat = lat || parts[0].trim();
          lng = lng || parts[1].trim();
        }
      }

      form.reset({
        project_name: selectedRowData.project_name ?? "",
        location_code: selectedRowData.location_code ?? "",
        location_name: selectedRowData.location_name ?? "",
        latitude: lat,
        longitude: lng,
        radius: selectedRowData.radius ? String(selectedRowData.radius) : "100",
        geolocation: selectedRowData.geolocation ? String(selectedRowData.geolocation) : "",
        city: selectedRowData.city ?? "",
        country_code: selectedRowData.country_code ?? "",
        entity: selectedRowData.entity ?? "",
        active_flag: selectedRowData.active_flag ?? true,
      });
    } else {
      form.reset({
        project_name: "",
        location_code: "",
        location_name: "",
        latitude: "",
        longitude: "",
        radius: "100",
        geolocation: "",
        city: "",
        country_code: "",
        entity: "",
        active_flag: true,
      });
    }
  }, [selectedRowData, form]);

  const addMutation = useMutation({
    mutationFn: addPcpLocationMasterRequest,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["pcp-location-master"] });
      showToast("success", "add_ifm_location_success");
      on_open_change(false);
      onSave(null, data);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to add location";
      showToast("error", message);
    },
  });

  const editMutation = useMutation({
    mutationFn: editPcpLocationMasterRequest,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["pcp-location-master"] });
      showToast("success", "update_ifm_location_success");
      on_open_change(false);
      onSave(selectedRowData?.location_id || selectedRowData?.id, data);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update location";
      showToast("error", message);
    },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      const payload: any = {
        project_name: values.project_name.trim(),
        location_code: values.location_code?.trim() || undefined,
        location_name: values.location_name?.trim() || undefined,
        latitude: parseFloat(values.latitude),
        longitude: parseFloat(values.longitude),
        radius: values.radius ? parseFloat(values.radius) || 100 : 100,
        geolocation: values.geolocation?.trim() || `${values.latitude},${values.longitude}`,
        city: values.city?.trim() || undefined,
        country_code: values.country_code?.trim() || undefined,
        entity: values.entity?.trim() || undefined,
        active_flag: values.active_flag,
      };

      if (selectedRowData) {
        const id = selectedRowData.location_id || selectedRowData.id;
        editMutation.mutate({ location_id: Number(id), ...payload });
      } else {
        addMutation.mutate(payload);
      }
    } catch {
      showToast("error", "Failed to save location");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
            {/* 1. Project Name */}
            <FormField
              control={form.control}
              name="project_name"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>
                    {t.project_name || "Project Name"}
                    <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t.placeholder_project_name || "Enter project name"}
                      {...field}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.project_name}
                    translations={errT}
                  />
                </FormItem>
              )}
            />

            {/* 2. Radius */}
            <FormField
              control={form.control}
              name="radius"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>{t.radius || "Radius"}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t.placeholder_radius || "e.g. 100"}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* 3. Location Name */}
            <FormField
              control={form.control}
              name="location_name"
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

            {/* 4. Location Code */}
            <FormField
              control={form.control}
              name="location_code"
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

            {/* 5. Latitude */}
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
                      placeholder={t.placeholder_latitude || "e.g. 24.4539"}
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

            {/* 6. Longitude */}
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
                      placeholder={t.placeholder_longitude || "e.g. 54.3773"}
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

            {/* 7. Geo Coordinate / Geolocation (Full 2-column width) */}
            <FormField
              control={form.control}
              name="geolocation"
              render={({ field }) => (
                <FormItem className="min-w-0 md:col-span-2">
                  <FormLabel>{t.geolocation || "Geolocation"}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      disabled={true}
                      placeholder={t.placeholder_geolocation || "Auto-generated from lat,long"}
                      className="bg-backdrop cursor-not-allowed opacity-80"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* 8. City */}
            <FormField
              control={form.control}
              name="city"
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

            {/* 9. Country Code */}
            <FormField
              control={form.control}
              name="country_code"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>{t.country_code || "Country Code"}</FormLabel>
                  <FormControl>
                    <CountryDropdown
                      countries={countries}
                      value={getCountryByCode(field.value ?? null) ?? null}
                      displayMode="code"
                      onChange={(c) => field.onChange(c?.country_code ?? "")}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* 10. Active Flag */}
            <FormField
              control={form.control}
              name="active_flag"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 space-y-0 pt-6 md:col-span-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(!!checked)}
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer font-normal">
                    {t.active_flag || "Active Status"}
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
