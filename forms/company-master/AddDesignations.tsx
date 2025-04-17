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
import { useLanguage } from "@/providers/LanguageProvider";
import { addDesignationRequest } from "@/lib/apiHandler";

const formSchema = z.object({
    designationName: z.string().min(1, { message: "Required" }).max(100),
    designationNameEng: z.string().default(""),
    designationNameArb: z.string().default(""),
    vacancy: z
    .string()
    .optional()
    .transform(val => Number(val) || 0),
    remarks: z.string().optional().default(""),
});

const getSchema = (lang: "en" | "ar") =>
    formSchema.refine((data) => {
        if (lang === "en") return !!data.designationNameEng;
        if (lang === "ar") return !!data.designationNameArb;
        return true;
    }, {
        message: "Required",
        path: [lang === "en" ? "designationNameEng" : "designationNameArb"],
});

export default function AddDesignations({
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
      designationName: "",
      designationNameEng: "",
      designationNameArb: "",
      vacancy: 0,
      remarks: "", 
    },
  });

  useEffect(() => {
    form.reset(form.getValues()); // Maintain values but trigger resolver update
  }, [language]);

  // Reset form when modal is opened for Add or when selectedRowData is null
  useEffect(() => {
    if (!selectedRowData) {
      form.reset(); // Reset the form values when in "Add" mode
    } else {
      form.reset({
        designationName: selectedRowData.designationName,
        designationNameEng: selectedRowData.designationNameEng,
        designationNameArb: selectedRowData.designationNameArb,
      }); // Pre-fill the form when in "Edit" mode
    }
  }, [selectedRowData, form]);

  const handleSave = () => {
    const formData = form.getValues(); // Get the form data directly from the hook
    if (selectedRowData) {
      // Update existing row
      onSave(selectedRowData.id, formData);
    } else {
      // Add new row
      onSave(null, formData);
    }
    on_open_change(false); // Close modal after saving
  };

  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log("Submitting:", values);

      if (selectedRowData) {
        // Update logic (edit mode)
        onSave(selectedRowData.id, values);
        console.log("Updating designation:", values);
      } else {
        // Add logic (create mode) - Call API
        const response = await addDesignationRequest(
          values.designationName,
          values.designationNameEng,
          values.designationNameArb,
          values.vacancy,
          values.remarks
        );
        console.log("Designation added successfully:", response);
        
        onSave(null, response); // Use response data if needed
      }

      on_open_change(false); // Close the modal after submission
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
              name="designationName"
              render={({ field }) => (
                  <FormItem>
                  <FormLabel>
                    Designation <Required />
                  </FormLabel>
                  <FormControl>
                      <Input placeholder="Enter the designationName" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                  </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="designationNameEng"
              render={({ field }) => (
              <FormItem>
                  <FormLabel>
                    Designation name (English) {language === "en" && <Required />}
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
              name="designationNameArb"
              render={({ field }) => (
              <FormItem>
                  <FormLabel>
                    Designation name (العربية) {language === "ar" && <Required />}
                  </FormLabel>
                  <FormControl>
                  <Input placeholder="أدخل اسم الموقع" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
              </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vacancy"
              render={({ field }) => (
                  <FormItem>
                  <FormLabel>
                      Vacancy <Required />
                  </FormLabel>
                  <FormControl>
                      <Input placeholder="Enter the vacancy" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                  </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                  <FormItem>
                  <FormLabel>
                      Remark <Required />
                  </FormLabel>
                  <FormControl>
                      <Input placeholder="Enter the remark" type="text" {...field} />
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