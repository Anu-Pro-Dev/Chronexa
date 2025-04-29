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
import { addLocationRequest, editLocationRequest } from "@/lib/apiHandler";
import { useLanguage } from "@/providers/LanguageProvider";

const formSchema = z.object({
    locationNameEng: z.string().default(""),
    locationNameArb: z.string().default(""),
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
      locationNameEng: "",
      locationNameArb: "",
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
          values.locationNameArb
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="">
        <div className="flex flex-col gap-4">
          <FormField
              control={form.control}
              name="locationNameEng"
              render={({ field }) => (
              <FormItem>
                  <FormLabel>
                      Location name (English) {language === "en" && <Required />}
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
          />
          <div className="w-full flex gap-2 items-center py-3">
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
      </form>
    </Form>
  );
}