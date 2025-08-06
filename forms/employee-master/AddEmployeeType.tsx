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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addEmployeeTypeRequest, editEmployeeTypeRequest } from "@/lib/apiHandler";

const formSchema = z.object({
  employee_type_code: z.string().default("").transform((val) => val.toUpperCase()),
  employee_type_name: z.string().default(""),
});

export default function AddEmployeeTypes({
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
      employee_type_code:"",
      employee_type_name: "",
    },
  });

  useEffect(() => {
    if (selectedRowData) {
      form.reset({
        employee_type_code: selectedRowData.employee_type_code ?? "",
        employee_type_name:
          language === "en"
            ? selectedRowData.employee_type_eng ?? ""
            : selectedRowData.employee_type_arb ?? "",
      });
    } else {
      form.reset(); // clears on add
    }
  }, [selectedRowData, language]);

  const addMutation = useMutation({
    mutationFn: addEmployeeTypeRequest,
    onSuccess: (data) => {
      toast.success("Employee type added successfully!");
      onSave(null, data.data);
      on_open_change(false);
      queryClient.invalidateQueries({ queryKey: ["employeeType"] });
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
    mutationFn: editEmployeeTypeRequest,
    onSuccess: (_data, variables) => {
      toast.success("Employee type updated successfully!");
      onSave(variables.employee_type_id?.toString() ?? null, variables);
      queryClient.invalidateQueries({ queryKey: ["employeeType"] });
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
        employee_type_code: values.employee_type_code,
      };

      // Add only the language-specific name being edited
      if (language === "en") {
        payload.employee_type_eng = values.employee_type_name;
      } else {
        payload.employee_type_arb = values.employee_type_name;
      }

      if (selectedRowData) {
        editMutation.mutate({
          employee_type_id: selectedRowData.id,
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
              name="employee_type_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Employee type code<Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter employee type code"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employee_type_name"
              render={({ field }) => (
              <FormItem>
                  <FormLabel>
                    {language === "ar"
                      ? "Employee type name (العربية) "
                      : "Employee type name (English) "}
                    <Required />
                  </FormLabel>
                  <FormControl>
                  <Input placeholder="Enter employee type name" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
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