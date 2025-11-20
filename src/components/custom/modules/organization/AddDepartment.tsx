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
import { addDepartmentRequest, editDepartmentRequest } from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";

const formSchema = z.object({
  department_code: z
    .string()
    .min(1, { message: "department_code_required" })
    .transform((val) => val.toUpperCase()),
  department_name: z.string().min(1, { message: "department_name_required" }),
});

export default function AddDepartments({
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
  const t = translations?.modules?.companyMaster || {};
  const errT = translations?.formErrors || {};

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      department_code: "",
      department_name: "",
    },
  });

  useEffect(() => {
    if (selectedRowData) {
      form.reset({
        department_code: selectedRowData.department_code ?? "",
        department_name:
          language === "en"
            ? selectedRowData.department_name_eng ?? ""
            : selectedRowData.department_name_arb ?? "",
      });
    } else {
      form.reset({
        department_code: "",
        department_name: "",
      });
    }
  }, [selectedRowData, language]);

  const addMutation = useMutation({
    mutationFn: addDepartmentRequest,
    onSuccess: (data) => {
      showToast("success", "adddept_success");
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
    mutationFn: editDepartmentRequest,
    onSuccess: (_data, variables) => {
      showToast("success", "updatedept_success");
      onSave(variables.department_id?.toString() ?? null, variables);
      queryClient.invalidateQueries({ queryKey: ["department"] });
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
        department_code: values.department_code,
      };

      if (language === "en") {
        payload.department_name_eng = values.department_name;
      } else {
        payload.department_name_arb = values.department_name;
      }

      if (selectedRowData) {
        editMutation.mutate({ department_id: selectedRowData.id, ...payload });
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
              name="department_code"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>
                    Department Code
                    <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder='Enter department code'
                      {...field}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.department_code}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="department_name"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>
                    {language === "ar"
                      ? `${t.department_name} (العربية)`
                      : `Department Name (English)`}
                    <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder='Enter department name'
                      {...field}
                      className={language === "ar" ? "text-right" : "text-left"}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.department_name}
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