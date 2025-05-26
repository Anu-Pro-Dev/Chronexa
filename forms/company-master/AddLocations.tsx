"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Required from "@/components/ui/required";
import CountryDropdown from "@/components/custom/country-dropdown";
import { useRouter } from "next/navigation";
import { useCountries } from "@/hooks/use-countries";
import { useLanguage } from "@/providers/LanguageProvider";
import { addLocationRequest, editLocationRequest } from "@/lib/apiHandler";

const formSchema = z.object({
  location_code: z.string().default(""),
  location_name: z.string().default(""),
  radius: z.coerce.number().min(1, "Radius must be a positive number").optional(),  
  country_code: z.any().optional(),
  geolocation: z
    .string()
    .default("")
    .refine((val) => {
      if (!val?.trim()) return true; // allow empty (optional)
      const match = val.match(/^(-?\d{1,2}(\.\d+)?)\s*,\s*(-?\d{1,3}(\.\d+)?)$/);
      if (!match) return false;
      const [lat, lon] = val.split(",").map((n) => Number(n.trim()));
      return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
    }, {
      message: "Enter valid latitude,longitude",
    }),
});

function pointToLatLon(point: string | null): string {
  if (!point?.startsWith("POINT(")) return "";
  const match = point.match(/POINT\(\s*(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s*\)/);
  if (!match) return "";
  const [, lon, lat] = match;
  return `${lat},${lon}`; // Convert POINT(lon lat) → lat,lon
}

function latLonToPoint(value: string): string {
  const [lat, lon] = value.split(",").map((s) => s.trim());
  if (!lat || !lon) return "";
  return `POINT(${lon} ${lat})`; // Convert lat,lon → POINT(lon lat)
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

  const {language } = useLanguage();
  const { countries, getCountryByCode } = useCountries();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location_code:"",
      location_name: "",
      radius: undefined,
      country_code: "",
      geolocation: "",
    },
  });

  useEffect(() => {
    form.reset(form.getValues());
  }, [language]);

  useEffect(() => {
  if (selectedRowData) {
    const geolocationStr = pointToLatLon(selectedRowData?.geolocation ?? "");

    form.reset({
      location_code: selectedRowData.location_code ?? "",
      location_name:
        language === "en"
          ? selectedRowData.location_eng ?? ""
          : selectedRowData.location_arb ?? "",
      radius: selectedRowData.radius,
      country_code: selectedRowData.country_code ?? "",
      geolocation: geolocationStr,
    });
  } else {
    form.reset(); // clears on add
  }
}, [selectedRowData, form, language]);


  const handleSave = () => {
    const formData = form.getValues();
    if (selectedRowData) {
      onSave(selectedRowData.id, formData);
    } else {
      onSave(null, formData);
    }
    on_open_change(false);
  };

  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (values.geolocation.trim() !== "") {
        const [latStr, lonStr] = values.geolocation.split(",").map((s) => s.trim());
        const latitude = parseFloat(latStr);
        const longitude = parseFloat(lonStr);

        if (
          isNaN(latitude) ||
          isNaN(longitude) ||
          latitude < -90 ||
          latitude > 90 ||
          longitude < -180 ||
          longitude > 180
        ) {
          alert(
            "Invalid coordinates. Latitude must be between -90 and 90. Longitude must be between -180 and 180."
          );
          return;
        }

        values.geolocation = latLonToPoint(values.geolocation); // ✅ Convert to POINT format
      } else {
        values.geolocation = "";
      }

      const payload = {
        location_code: values.location_code,
        country_code: values.country_code,
        radius: values.radius,
        geolocation: values.geolocation,
        // Set the correct location field based on current language
        location_eng: language === "en" ? values.location_name : "",
        location_arb: language === "ar" ? values.location_name : "",
      };

      if (selectedRowData) {
      const response = await editLocationRequest({
        location_id: selectedRowData.id,
        ...payload,
      });
      console.log("Location updated successfully:", response);
      onSave(selectedRowData.id, payload);
    } else {
      const response = await addLocationRequest(payload);
      console.log("Location added successfully:", response);
      onSave(null, response);
    }
      on_open_change(false);
    } catch (error) {
      console.error("Form submission error", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-16 gap-y-4 pl-5">
            <FormField
              control={form.control}
              name="location_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Location code<Required />
                  </FormLabel>
                  <FormControl>
                    <div className="relative" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      <span
                        className={`absolute top-1/2 -translate-y-1/2 text-sm text-text-primary pointer-events-none
                          ${language === 'ar' ? 'right-3' : 'left-3'}`}
                      >
                        CODE_
                      </span>
                      <Input
                        type="text"
                        placeholder="Enter location code"
                        value={field.value?.replace(/^CODE_/, '') || ''}
                        onChange={(e) =>
                          field.onChange(`CODE_${e.target.value.replace(/^CODE_/, '')}`)
                        }
                        className={`uppercase placeholder:lowercase ${
                          language === 'ar' ? 'pr-14 text-right' : 'pl-14 text-left'
                        }`}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location_name"
              render={({ field }) => (
              <FormItem>
                  <FormLabel>
                    {language === "ar"
                      ? "Location name (العربية) "
                      : "Location name (English) "}
                    <Required />
                  </FormLabel>
                  <FormControl>
                  <Input placeholder="Enter location name" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
              </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="geolocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Geo Coordinates (lat, long)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="25.123456,55.654321"
                      inputMode="decimal"
                      maxLength={30}
                      value={field.value}
                      onChange={(e) => {
                        const input = e.target.value;

                        // Allow only numbers, commas, minus, and dot
                        const sanitized = input.replace(/[^0-9.,\-]/g, "");

                        // Basic enforcement: 1 comma only
                        const parts = sanitized.split(",");
                        if (parts.length > 2) return;

                        const [lat, lon] = parts;

                        // Enforce: latitude max 2 digits before ".", longitude max 3
                        const isValidLat = !lat || /^-?\d{0,2}(\.\d{0,8})?$/.test(lat.trim());
                        const isValidLon = !lon || /^-?\d{0,3}(\.\d{0,8})?$/.test(lon.trim());

                        if (isValidLat && isValidLon) {
                          field.onChange(sanitized);
                        }
                      }}
                      // onPaste={(e) => {
                      //   const pasted = e.clipboardData.getData("text");
                      //   const validPattern = /^-?\d{1,2}(\.\d+)?\s*,\s*-?\d{1,3}(\.\d+)?$/;
                      //   if (!validPattern.test(pasted.trim())) {
                      //     e.preventDefault();
                      //   }
                      // }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="radius"
              render={({ field }) => (
              <FormItem>
                  <FormLabel>
                      Radius
                  </FormLabel>
                  <FormControl>
                  <Input placeholder="Enter the radius" type="number" value={field.value ?? ""} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
              </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country_code"
              render={({ field }) => {
                const selectedCountry = getCountryByCode(field.value);
                return (
                  <FormItem>
                    <FormLabel className="flex gap-1">Country Code</FormLabel>
                    <CountryDropdown
                      countries={countries}
                      value={selectedCountry}
                      onChange={(country) => field.onChange(country?.country_code ?? "")}
                    />
                    <FormMessage className="mt-1" />
                  </FormItem>
                );
              }}
            />
          </div>
          <div className="flex justify-end gap-2 items-center py-5">
            <div className="flex gap-4 px-5">
              <Button
                variant={"outline"}
                type="button"
                size={"lg"}
                className="w-full"
                onClick={() => on_open_change(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size={"lg"} className="w-full">
                {selectedRowData ? "Update" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}