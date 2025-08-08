"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Required from "@/components/ui/required";
import CountryDropdown from "@/components/custom/country-dropdown";
import { useCountries } from "@/hooks/useCountries";
import { useLanguage } from "@/providers/LanguageProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addLocationRequest, editLocationRequest } from "@/lib/apiHandler";

const formSchema = z.object({
  location_code: z.string().default("").transform((val) => val.toUpperCase()),
  location_name: z.string().default(""),
  radius: z.string().default("").optional(),
  country_code: z.any().optional(),
  city: z.string().optional(),
  geolocation: z
  .string()
  .default("")
  .refine((val) => {
    if (!val?.trim()) return true;
    
    // Split and validate each part
    const parts = val.split(',');
    if (parts.length !== 2) return false;
    
    const latStr = parts[0].trim();
    const lonStr = parts[1].trim();
    
    // Check if they're valid number strings
    if (!/^-?\d+\.?\d*$/.test(latStr) || !/^-?\d+\.?\d*$/.test(lonStr)) {
      return false;
    }
    
    // Validate ranges
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);
    
    return !isNaN(lat) && !isNaN(lon) && 
           lat >= -90 && lat <= 90 && 
           lon >= -180 && lon <= 180;
  }, {
    message: "Enter valid coordinates: latitude (-90 to 90), longitude (-180 to 180)",
  }),
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
  const { language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { countries } = useCountries();
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
      const geolocationStr = getGeolocationString(selectedRowData.geolocation ?? "");
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
      toast.success("Location added successfully!");
      onSave(null, data.data);
      on_open_change(false);
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        toast.error("Duplicate data detected. Please use different values.");
      } else {
        toast.error("Form submission error.");
      }
    },
  });

  const editMutation = useMutation({
    mutationFn: editLocationRequest,
    onSuccess: (_data, variables) => {
      toast.success("Location updated successfully!");
      onSave(
        variables.location_id?.toString() ?? null,
        variables
      );
      queryClient.invalidateQueries({ queryKey: ["location"] });
      on_open_change(false);
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        toast.error("Duplicate data detected. Please use different values.");
      } else {
        toast.error("Form submission error.");
      }
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return;
    setIsSubmitting(true);

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
          setIsSubmitting(false);
          return;
        }
      }

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
        editMutation.mutate({
          location_id: selectedRowData.id,
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
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-16 gap-y-4 pl-7">
            <FormField
              control={form.control}
              name="location_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location code<Required /></FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter the location code"
                      {...field}
                    />
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
                    <Input
                      placeholder="Enter the location name"
                      type="text"
                      {...field}
                      className={language === "ar" ? "text-right" : "text-left"}
                    />
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
                  <FormLabel>Geo Coordinates (lat, long)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Example: 25.123456,55.654321"
                      inputMode="decimal"
                      value={field.value}
                      onChange={(e) => {
                        const cleaned = e.target.value;
                        field.onChange(cleaned);
                      }}
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
                  <FormLabel>Radius</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter the radius"
                      type="string"
                      maxLength={5}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country_code"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel className="flex gap-1 mt-2.5">Country Code</FormLabel>
                    <CountryDropdown
                      countries={countries}
                      value={getCountryByCode(field.value) ?? null}
                      displayMode="code"
                      onChange={(country) => field.onChange(country?.country_code ?? "")}
                    />
                    <FormMessage className="mt-1" />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter the city"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end gap-2 items-center py-5">
            <div className="flex gap-4 px-5">
              <Button
                variant="outline"
                type="button"
                size="lg"
                className="w-full"
                onClick={() => on_open_change(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? selectedRowData
                    ? "Updating..."
                    : "Saving..."
                  : selectedRowData
                    ? "Update"
                    : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}