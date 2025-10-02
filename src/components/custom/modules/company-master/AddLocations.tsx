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
  FormMessage,
} from "@/src/components/ui/form";
import Required from "@/src/components/ui/required";
import CountryDropdown from "@/src/components/custom/common/country-dropdown";
import { useCountries } from "@/src/hooks/useCountries";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addLocationRequest, editLocationRequest } from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";

const formSchema = z.object({
  location_code: z
    .string()
    .min(1, { message: "location_code_required" })
    .transform((val) => val.toUpperCase()),
  location_name: z.string().min(1, { message: "location_name_required" }),
  radius: z.string().optional(),
  country_code: z.string().min(1, { message: "country_code_required" }),
  city: z.string().optional(),
  geolocation: z
    .string()
    .min(1, { message: "geolocation_required" })
    .refine(
      (val) => {
        const parts = val.split(",");
        if (parts.length !== 2) return false;
        const lat = parseFloat(parts[0].trim());
        const lon = parseFloat(parts[1].trim());
        return (
          !isNaN(lat) &&
          !isNaN(lon) &&
          lat >= -90 &&
          lat <= 90 &&
          lon >= -180 &&
          lon <= 180
        );
      },
      { message: "geolocation_invalid" }
    ),
});

function getGeolocationString(geolocation: string | null): string {
  if (!geolocation || geolocation.trim() === "") return "";
  return geolocation.trim();
}

export default function AddLocations({
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
  const { countries } = useCountries();
  const showToast = useShowToast();
  const t = translations?.modules?.companyMaster || {};
  const errT = translations?.formErrors || {};

  function getCountryByCode(code: string) {
    return countries.find((c) => c.country_code === code);
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location_code: "",
      location_name: "",
      radius: "",
      country_code: "",
      city: "",
      geolocation: "",
    },
  });

  useEffect(() => {
    if (selectedRowData) {
      const geolocationStr = getGeolocationString(
        selectedRowData.geolocation ?? ""
      );
      form.reset({
        location_code: selectedRowData.location_code ?? "",
        location_name:
          language === "en"
            ? selectedRowData.location_eng ?? ""
            : selectedRowData.location_arb ?? "",
        radius: selectedRowData.radius ?? "",
        country_code: selectedRowData.country_code ?? "",
        city: selectedRowData.city ?? "",
        geolocation: geolocationStr,
      });
    } else {
      form.reset({
        location_code: "",
        location_name: "",
        radius: "",
        country_code: "",
        city: "",
        geolocation: "",
      });
    }
  }, [selectedRowData, language]);

  const addMutation = useMutation({
    mutationFn: addLocationRequest,
    onSuccess: (data) => {
      showToast("success", "addlocation_success");
      onSave(null, data.data);
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

  const editMutation = useMutation({
    mutationFn: editLocationRequest,
    onSuccess: (_data, variables) => {
      showToast("success", "updatelocation_success");
      onSave(variables.location_id?.toString() ?? null, variables);
      queryClient.invalidateQueries({ queryKey: ["location"] });
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
        location_code: values.location_code,
        country_code: values.country_code,
        radius: values.radius ? Number(values.radius) : undefined,
        geolocation: values.geolocation,
        city: values.city,
      };

      if (language === "en") {
        payload.location_eng = values.location_name;
      } else {
        payload.location_arb = values.location_name;
      }

      if (selectedRowData) {
        editMutation.mutate({ location_id: selectedRowData.id, ...payload });
      } else {
        addMutation.mutate(payload);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const translatedError = (field: keyof typeof form.formState.errors) => {
    const key = form.formState.errors[field]?.message as string;
    return key ? errT[key] || key : null;
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 gap-y-4 min-w-0">
            <FormField
              control={form.control}
              name="location_code"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>
                    {t.location_code}
                    <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t.placeholder_location_code}
                      {...field}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.location_code}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location_name"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>
                    {language === "ar"
                      ? `${t.location_name} (العربية)`
                      : `${t.location_name} (English)`}
                    <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t.placeholder_location_name}
                      {...field}
                      className={language === "ar" ? "text-right" : "text-left"}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.location_name}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="geolocation"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>
                    {t.geo_cords} (lat, long)
                    <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t.placeholder_geoloc}
                      inputMode="decimal"
                      {...field}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.geolocation}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="radius"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>{t.radius}</FormLabel>
                  <FormControl>
                    <Input
                      type="string"
                      maxLength={5}
                      placeholder={t.placeholder_radius}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country_code"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel className="flex gap-1 mt-2.5">
                    {t.country_code}
                    <Required />
                  </FormLabel>
                  <CountryDropdown
                    countries={countries}
                    value={getCountryByCode(field.value) ?? null}
                    displayMode="code"
                    onChange={(c) => field.onChange(c?.country_code ?? "")}
                  />
                  <TranslatedError
                    fieldError={form.formState.errors.country_code}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>{t.city}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t.placeholder_city}
                      {...field}
                    />
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
