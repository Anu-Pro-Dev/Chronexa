"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Required from "@/components/ui/required";
import { useRouter } from "next/navigation";
import CountryDropdown from "@/components/custom/country-dropdown";
import { useLanguage } from "@/providers/LanguageProvider";
import { addLocationRequest, editLocationRequest } from "@/lib/apiHandler";

const formSchema = z.object({
  locationCode: z.string().default(""),
  locationNameEng: z.string().default(""),
  locationNameArb: z.string().default(""),
  radius: z.number(),
  countryCode: z.any().optional(),
  geoCoordinates: z.string().refine((val) => {
    const match = val.trim().match(
      /^-?\d{1,2}(\.\d+)?\s*,\s*-?\d{1,3}(\.\d+)?$/
    );
    if (!match) return false;

    const [lat, lon] = val.split(",").map(Number);
    return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
  }, {
    message: "Enter valid latitude,longitude",
  }),
});

const getSchema = (lang: "en" | "ar") =>
    formSchema.refine((data) => {
        if (lang === "en") return !!data.locationNameEng;
        if (lang === "ar") return !!data.locationNameArb;
        return true;
    }, {
        message: "Required",
        path: [lang === "en" ? "locationNameEng" : "locationNameArb"],
});

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
    
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      locationCode:"",
      locationNameEng: "",
      locationNameArb: "",
      radius: undefined,
      countryCode: "",
      geoCoordinates: "",
    },
  });

  useEffect(() => {
    form.reset(form.getValues());
  }, [language]);

  useEffect(() => {
    if (!selectedRowData) {
      form.reset();
    } else {
      form.reset({
        locationNameEng: selectedRowData.locationNameEng,
        locationNameArb: selectedRowData.locationNameArb,
        radius: selectedRowData.radius,
        countryCode: selectedRowData?.countryCode ?? "",
        geoCoordinates: selectedRowData?.geoCoordinates
    ? `${selectedRowData.geoCoordinates.latitude},${selectedRowData.geoCoordinates.longitude}`
    : "",
      });
    }
  }, [selectedRowData, form]);

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
      console.log("Submitting:", values);

      const [latStr, lonStr] = values.geoCoordinates.split(',').map(s => s.trim());
      const latitude = parseFloat(latStr);
      const longitude = parseFloat(lonStr);

      if (
        isNaN(latitude) ||
        isNaN(longitude) ||
        latitude < -90 || latitude > 90 ||
        longitude < -180 || longitude > 180
      ) {
        alert("Invalid coordinates. Latitude must be between -90 and 90. Longitude must be between -180 and 180.");
        return;
      }

      if (selectedRowData) {
        const response = await editLocationRequest(
          selectedRowData.id,
          values.locationNameEng,
          values.locationNameArb
        );
        console.log("Location updated successfully:", response);
        onSave(selectedRowData.id, values);
      } else {
        const response = await addLocationRequest(
          values.locationNameEng,
          values.locationNameArb,
          // values.geoCoordinates
        );
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
              name="locationCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Location code<Required />
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-primary pointer-events-none">
                        CODE_
                      </span>
                      <Input
                        type="text"
                        placeholder="Enter location code"
                        value={field.value?.replace(/^CODE_/, '') || ''}
                        onChange={(e) =>
                          field.onChange(`CODE_${e.target.value.replace(/^CODE_/, '')}`)
                        }
                        className="uppercase pl-14 placeholder:lowercase"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="countryCode"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel className="flex gap-1">Country Code</FormLabel>
                  <CountryDropdown value={field.value} onChange={field.onChange} />
                  <FormMessage className="mt-1"/>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="locationNameEng"
              render={({ field }) => (
              <FormItem>
                  <FormLabel>
                      Location name (English/العربية) {language === "en" && <Required />}
                  </FormLabel>
                  <FormControl>
                  <Input placeholder="Enter location name" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
              </FormItem>
              )}
            />
            {/* <FormField
              control={form.control}
              name="locationNameArb"
              render={({ field }) => (
              <FormItem>
                  <FormLabel>
                      Location name (العربية) {language === "ar" && <Required />}
                  </FormLabel>
                  <FormControl>
                  <Input placeholder="أدخل اسم الموقع" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
              </FormItem>
              )}
            /> */}
            <FormField
              control={form.control}
              name="radius"
              render={({ field }) => (
              <FormItem>
                  <FormLabel>
                      Radius <Required />
                  </FormLabel>
                  <FormControl>
                  <Input placeholder="Enter the radius" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
              </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="geoCoordinates"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Geo Coordinates (lat, long) <Required />
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
                      onPaste={(e) => {
                        const pasted = e.clipboardData.getData("text");
                        const validPattern = /^-?\d{1,2}(\.\d+)?\s*,\s*-?\d{1,3}(\.\d+)?$/;
                        if (!validPattern.test(pasted.trim())) {
                          e.preventDefault();
                        }
                      }}
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