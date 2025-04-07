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
import { Checkbox } from "@/components/ui/checkbox";
import Required from "@/components/ui/required";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/providers/LanguageProvider";
import { addGradeRequest } from "@/lib/apiHandler";

const formSchema = z.object({
    gradeName: z.string().min(1, { message: "Required" }).max(100),
    descriptionEng: z.string().default(""),
    descriptionArb: z.string().default(""),
    numberOfCl: z
    .string()
    .optional()
    .transform(val => Number(val) || 0), // convert string to number
  numberOfSl: z
    .string()
    .optional()
    .transform(val => Number(val) || 0),
  numberOfAl: z
    .string()
    .optional()
    .transform(val => Number(val) || 0),
  overtimeEligibleFlag: z.boolean().optional().default(true), // true = "Y"
  seniorFlag: z.boolean().optional().default(false),
});

const getSchema = (lang: "en" | "ar") =>
  formSchema.refine((data) => {
      if (lang === "en") return !!data.descriptionEng;
      if (lang === "ar") return !!data.descriptionArb;
      return true;
  }, {
      message: "Required",
      path: [lang === "en" ? "descriptionEng" : "descriptionArb"],
});

export default function AddGrades({
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
      gradeName: "",
      descriptionEng: "",
      descriptionArb: "",
      numberOfCl: 0,
      numberOfSl: 0,
      numberOfAl: 0,
      overtimeEligibleFlag: true,
      seniorFlag: false,   
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
        gradeName: selectedRowData.gradeName,
        descriptionEng: selectedRowData.descriptionEng,
        descriptionArb: selectedRowData.descriptionArb,
        numberOfCl: selectedRowData.numberOfCl,
        numberOfSl: selectedRowData.numberOfSl,
        numberOfAl: selectedRowData.numberOfAl,
        overtimeEligibleFlag: selectedRowData.overtimeEligibleFlag === "Y",
        seniorFlag: selectedRowData.seniorFlag === "Y",
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
      const payload = {
        ...values,
        overtimeEligibleFlag: values.overtimeEligibleFlag ? "Y" : "N",
        seniorFlag: values.seniorFlag ? "Y" : "N",
      };
  
      if (selectedRowData) {
        onSave(selectedRowData.id, payload);
      } else {
        const response = await addGradeRequest(
          payload.gradeName,
          payload.descriptionEng,
          payload.descriptionArb,
          payload.numberOfCl,
          payload.numberOfSl,
          payload.numberOfAl,
          payload.overtimeEligibleFlag,
          payload.seniorFlag
        );
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
            name="gradeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Grade Name <Required />
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter your grade" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="descriptionEng"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Description (English) {language === "en" && <Required />}
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter description here..." type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="descriptionArb"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Description (العربية) {language === "ar" && <Required />}
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter description here..." type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="numberOfCl"
            render={({ field }) => (
                <FormItem>
                <FormLabel>
                    Number of causal leaves <Required />
                </FormLabel>
                <FormControl>
                    <Input placeholder="Enter the cl count" type="number" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="numberOfSl"
            render={({ field }) => (
                <FormItem>
                <FormLabel>
                    Number of sick leaves <Required />
                </FormLabel>
                <FormControl>
                    <Input placeholder="Enter the sl count" type="number" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="numberOfAl"
            render={({ field }) => (
                <FormItem>
                <FormLabel>
                  	Number of applied leaves <Required />
                </FormLabel>
                <FormControl>
                    <Input placeholder="Enter the al count" type="number" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
          />
          <div className="flex justify-between">
            <FormField
              control={form.control}
              name="overtimeEligibleFlag"
              render={({ field }) => (
                <FormItem className="">
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="overtime_eligible"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <FormLabel htmlFor="overtime_eligible" className="font-semibold text-sm text-text-primary">
                        Overtime Eligible
                      </FormLabel>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="seniorFlag"
              render={({ field }) => (
                <FormItem className="">
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="senior_employee"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <FormLabel htmlFor="senior_employee" className="font-semibold text-sm text-text-primary">
                        Senior Employee
                      </FormLabel>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
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
              Save
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
