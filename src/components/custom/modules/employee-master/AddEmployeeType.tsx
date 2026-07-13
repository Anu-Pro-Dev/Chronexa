"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/src/components/ui/form";
import Required from "@/src/components/ui/required";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addEmployeeTypeRequest, editEmployeeTypeRequest } from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";

const formSchema = z.object({
  employee_type_code: z
    .string()
    .min(1, { message: "employee_type_code_required" })
    .transform((val) => val.toUpperCase()),
  employee_type_name: z.string().min(1, { message: "employee_type_name_required" }),
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
  const { language, translations } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const showToast = useShowToast();
  const t = translations?.modules?.employeeMaster || {};
  const errT = translations?.formErrors || {};

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_type_code: "",
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
      form.reset({
        employee_type_code: "",
        employee_type_name: "",
      });
    }
  }, [selectedRowData, language]);

  const addMutation = useMutation({
    mutationFn: addEmployeeTypeRequest,
    onSuccess: (data) => {
      showToast("success", "addemptype_success");
      onSave(null, data.data);
      on_open_change(false);
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        showToast("error", "findduplicate_error");
      } else {
        showToast("error", "formsubmission_error");
      }
    },
  });

  const editMutation = useMutation({
    mutationFn: editEmployeeTypeRequest,
    onSuccess: (_data, variables) => {
      showToast("success", "updateemptype_success");
      onSave(variables.employee_type_id?.toString() ?? null, variables);
      queryClient.invalidateQueries({ queryKey: ["employeeType"] });
      on_open_change(false);
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        showToast("error", "findduplicate_error");
      } else {
        showToast("error", "formsubmission_error");
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

      if (language === "en") {
        payload.employee_type_eng = values.employee_type_name;
      } else {
        payload.employee_type_arb = values.employee_type_name;
      }

      if (selectedRowData) {
        editMutation.mutate({ employee_type_id: selectedRowData.id, ...payload });
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
                <FormItem className="min-w-0">
                  <FormLabel>
                    {t.emp_type_code}
                    <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t.placeholder_emp_type_code}
                      {...field}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.employee_type_code}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employee_type_name"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>
                    {language === "ar"
                      ? `${t.emp_type_name} (العربية)`
                      : `${t.emp_type_name} (English)`}
                    <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t.placeholder_emp_type_name}
                      {...field}
                      className={language === "ar" ? "text-right" : "text-left"}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.employee_type_name}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
          </div>
          <div className="w-full flex gap-2 items-center pt-4 py-2">
            <Button
              variant="outline"
              type="button"
              size="lg"
              className="w-full"
              onClick={() => on_open_change(false)}
            >
              {translations.buttons.cancel}
            </Button>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? selectedRowData
                  ? translations.buttons.updating
                  : translations.buttons.saving
                : selectedRowData
                ? translations.buttons.update
                : translations.buttons.save}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}