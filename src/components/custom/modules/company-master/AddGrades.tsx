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
import { Checkbox } from "@/src/components/ui/checkbox";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addGradeRequest, editGradeRequest } from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";

const formSchema = z.object({
  grade_code: z
    .string()
    .min(1, { message: "grade_code_required" })
    .transform((val) => val.toUpperCase()),
  grade_name: z.string().min(1, { message: "grade_name_required" }),
  overtime_eligible_flag: z.boolean().optional().default(false),
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
  const { language, translations } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const showToast = useShowToast();
  const t = translations?.modules?.companyMaster || {};
  const errT = translations?.formErrors || {};

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      grade_code: "",
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
      form.reset({
        grade_code: "",
        grade_name: "",
        overtime_eligible_flag: false,
      });
    }
  }, [selectedRowData, language]);

  const addMutation = useMutation({
    mutationFn: addGradeRequest,
    onSuccess: (data) => {
      showToast("success", "addgrade_success");
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
    mutationFn: editGradeRequest,
    onSuccess: (_data, variables) => {
      showToast("success", "updategrade_success");
      onSave(variables.grade_id?.toString() ?? null, variables);
      queryClient.invalidateQueries({ queryKey: ["grade"] });
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
        grade_code: values.grade_code,
        overtime_eligible_flag: values.overtime_eligible_flag,
      };

      if (language === "en") {
        payload.grade_eng = values.grade_name;
      } else {
        payload.grade_arb = values.grade_name;
      }

      if (selectedRowData) {
        editMutation.mutate({ grade_id: selectedRowData.id, ...payload });
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
                <FormItem className="min-w-0">
                  <FormLabel>
                    {t.grade_code}
                    <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t.placeholder_grade_code}
                      {...field}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.grade_code}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="grade_name"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>
                    {language === "ar"
                      ? `${t.grade_name} (العربية)`
                      : `${t.grade_name} (English)`}
                    <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t.placeholder_grade_name}
                      {...field}
                      className={language === "ar" ? "text-right" : "text-left"}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.grade_name}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-between">
            <FormField
              control={form.control}
              name="overtime_eligible_flag"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="overtime_eligible"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <FormLabel htmlFor="overtime_eligible" className="font-semibold text-sm text-text-primary">
                        {t.overtime_eligible}
                      </FormLabel>
                    </div>
                  </FormControl>
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