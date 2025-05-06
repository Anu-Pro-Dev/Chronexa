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
import { addGradeRequest, editGradeRequest } from "@/lib/apiHandler";

const formSchema = z.object({
  gradeNameEng: z.string().default(""),
  gradeNameArb: z.string().default(""),
  overtimeEligibleFlag: z.boolean().optional().default(true), // true = "Y"
});

const getSchema = (lang: "en" | "ar") =>
  formSchema.refine((data) => {
      if (lang === "en") return !!data.gradeNameEng;
      if (lang === "ar") return !!data.gradeNameArb;
      return true;
  }, {
      message: "Required",
      path: [lang === "en" ? "gradeNameEng" : "gradeNameArb"],
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
      gradeNameEng: "",
      gradeNameArb: "",
      overtimeEligibleFlag: false,
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
        gradeNameEng: selectedRowData.gradeNameEng,
        gradeNameArb: selectedRowData.gradeNameArb,        
        overtimeEligibleFlag: selectedRowData.overtimeEligibleFlag === "N",
      });
    }
  }, [selectedRowData, form]);

  const handleSave = () => {
    const formData = form.getValues(); // Get the form data directly from the hook
    if (selectedRowData) {
      onSave(selectedRowData.id, formData);
    } else {
      onSave(null, formData);
    }
    on_open_change(false);
  };

  const router = useRouter();

  // async function onSubmit(values: z.infer<typeof formSchema>) {
  //   try {
  //     const payload = {
  //       ...values,
  //       overtimeEligibleFlag: values.overtimeEligibleFlag ? "Y" : "N",
  //     };
  
  //     if (selectedRowData) {
  //       onSave(selectedRowData.id, payload);
  //     } else {
  //       const response = await addGradeRequest(
  //         payload.gradeNameEng,
  //         payload.gradeNameArb,
  //         payload.overtimeEligibleFlag,
  //       );
  //       onSave(null, response);
  //     }
  
  //     on_open_change(false);
      
  //   } catch (error) {
  //     console.error("Form submission error", error);
  //   }
  // }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (selectedRowData) {
        const response = await editGradeRequest(
          selectedRowData.id,
          values.gradeNameEng,
          values.gradeNameArb,
          values.overtimeEligibleFlag ? "Y" : "N"
        );
        console.log("Grade updated successfully:", response);
        onSave(selectedRowData.id, values);
      } else {
        const response = await addGradeRequest(
          values.gradeNameEng,
          values.gradeNameArb,
          values.overtimeEligibleFlag ? "Y" : "N"
        );
        console.log("Grade added successfully:", response);
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
            name="gradeNameEng"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Grade (English) {language === "en" && <Required />}
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter gradeName here..." type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gradeNameArb"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Grade (العربية) {language === "ar" && <Required />}
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter gradeName here..." type="text" {...field} />
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
              {selectedRowData ? "Update" : "Save"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
