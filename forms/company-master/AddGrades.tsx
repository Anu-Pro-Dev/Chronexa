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
import { useLanguage } from "@/providers/LanguageProvider";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addGradeRequest, editGradeRequest } from "@/lib/apiHandler";

const formSchema = z.object({
  grade_code: z.string().default("").transform((val) => val.toUpperCase()),
  grade_name: z.string().default(""),
  overtime_eligible_flag: z.boolean().optional().default(true), // true = "Y"
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      grade_code:"",
      grade_name: "",
      overtime_eligible_flag: false,
    },
  });

  useEffect(() => {
    if (selectedRowData) {
      form.reset({
        grade_code: selectedRowData.grade_code ?? "",
        grade_name:
          language === "en"
            ? selectedRowData.grade_eng ?? ""
            : selectedRowData.grade_arb ?? "",
        overtime_eligible_flag: selectedRowData.overtime_eligible_flag ?? false,
      });
    } else {
      form.reset(); // clears on add
    }
  }, [selectedRowData, language]);

  const addMutation = useMutation({
    mutationFn: addGradeRequest,
    onSuccess: (data) => {
      toast.success("Grade added successfully!");
      onSave(null, data.data);
      on_open_change(false);
      queryClient.invalidateQueries({ queryKey: ["grade"] });
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
    mutationFn: editGradeRequest,
    onSuccess: (_data, variables) => {
      toast.success("Grade updated successfully!");
      onSave(variables.grade_id?.toString() ?? null, variables);
      queryClient.invalidateQueries({ queryKey: ["grade"] });
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
      const payload: any = {
        grade_code: values.grade_code,
        overtime_eligible_flag: values.overtime_eligible_flag,
      };

      // Add only the language-specific name being edited
      if (language === "en") {
        payload.grade_eng = values.grade_name;
      } else {
        payload.grade_arb = values.grade_name;
      }

      if (selectedRowData) {
        editMutation.mutate({
          grade_id: selectedRowData.id,
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
          <div className="grid gap-16 gap-y-4">
            <FormField
              control={form.control}
              name="grade_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Grade code<Required />
                  </FormLabel>
                  <FormControl>
                    {/* <div className="relative" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      <span
                        className={`absolute top-1/2 -translate-y-1/2 text-sm text-text-primary pointer-events-none
                          ${language === 'ar' ? 'right-3' : 'left-3'}`}
                      >
                        CODE_
                      </span>
                      <Input
                        type="text"
                        placeholder="Enter grade code"
                        value={field.value?.replace(/^CODE_/, '') || ''}
                        onChange={(e) =>
                          field.onChange(`CODE_${e.target.value.replace(/^CODE_/, '')}`)
                        }
                        className={`uppercase placeholder:lowercase ${
                          language === 'ar' ? 'pr-14 text-right' : 'pl-14 text-left'
                        }`}
                      />
                    </div> */}
                    <Input
                      type="text"
                      placeholder="Enter grade code"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="grade_name"
              render={({ field }) => (
              <FormItem>
                  <FormLabel>
                    {language === "ar"
                      ? "Grade name (العربية) "
                      : "Grade name (English) "}
                    <Required />
                  </FormLabel>
                  <FormControl>
                  <Input placeholder="Enter grade name" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
              </FormItem>
              )}
            />
          </div>
          <div className="flex justify-between">
            <FormField
              control={form.control}
              name="overtime_eligible_flag"
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
            <Button type="submit" size={"lg"} className="w-full" disabled={isSubmitting}>
              {isSubmitting
                ? selectedRowData
                  ? "Updating..."
                  : "Saving..."
                : selectedRowData
                  ? "Update"
                  : "Save"
              }
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
