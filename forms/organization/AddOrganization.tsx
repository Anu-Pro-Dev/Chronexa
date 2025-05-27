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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Required from "@/components/ui/required";
import { useRouter } from "next/navigation";
import { addOrganizationRequest } from "@/lib/apiHandler"; // Import API request function
import { useLanguage } from "@/providers/LanguageProvider";
import { toast } from "react-hot-toast";

const formSchema = z.object({
    parentType: z.string().default(""),
    parentName: z.string().default(""),
    organizationNameEng: z.string().min(1, { message: "Required" }).max(100),
    organizationNameArb: z.string().default(""),
    organizationType: z.string().default(""),
});

const getSchema = (lang: "en" | "ar") =>
    formSchema.refine((data) => {
        if (lang === "en") return !!data.organizationNameEng;
        if (lang === "ar") return !!data.organizationNameArb;
        return true;
    }, {
        message: "Required",
        path: [lang === "en" ? "organizationNameEng" : "organizationNameArb"],
});

export default function AddOrganization({
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
      parentType: "",
      parentName: "",
      organizationNameEng: "",
      organizationNameArb: "",
      organizationType: "",
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
        parentType: selectedRowData.parentType,
        parentName: selectedRowData.parentName,
        organizationNameEng: selectedRowData.organizationNameEng,
        organizationNameArb: selectedRowData.organizationNameArb,
        organizationType: selectedRowData.organizationType,
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
      if (selectedRowData) {
        onSave(selectedRowData.id, values);
      } else {
        const response = await addOrganizationRequest(values.parentName, values.organizationNameEng, values.organizationNameArb, values.organizationType);
        toast.success("Organization added successfully!");
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
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-16 gap-y-4 pl-5">
            <FormField
              name="parentType"
              render={({ field }) => (
              <FormItem >
                  <FormLabel className="flex gap-1">Parent Type </FormLabel>
                  <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                  >
                  <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose parent type" />
                      </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                      <SelectItem value="1">ROOT</SelectItem>
                      <SelectItem value="2">DEPARTMENT</SelectItem>
                      <SelectItem value="3">DIVISION</SelectItem>
                      <SelectItem value="4">SECTION</SelectItem>
                  </SelectContent>
                  </Select>
                  <FormMessage className="mt-1"/>
              </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="parentName"
              render={({ field }) => (
                <FormItem>
                <FormLabel>
                  parent <Required />
                </FormLabel>
                <FormControl>
                    <Input placeholder="Enter the parent" type="text" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="organizationNameEng"
              render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Organization (English) {language === "en" && <Required />}
                </FormLabel>
                <FormControl>
                <Input placeholder="Enter organization name" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="organizationNameArb"
              render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Organization (العربية) {language === "ar" && <Required />}
                </FormLabel>
                <FormControl>
                <Input placeholder="أدخل اسم الموقع" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
              )}
            />
            <FormField
              name="organizationType"
              render={({ field }) => (
              <FormItem >
                  <FormLabel className="flex gap-1">Organization Type </FormLabel>
                  <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                  >
                  <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose organization type" />
                      </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                      <SelectItem value="2">DEPARTMENT</SelectItem>
                      <SelectItem value="3">DIVISION</SelectItem>
                      <SelectItem value="4">SECTION</SelectItem>
                  </SelectContent>
                  </Select>
                  <FormMessage className="mt-1"/>
              </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end gap-2 items-center pb-5">
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