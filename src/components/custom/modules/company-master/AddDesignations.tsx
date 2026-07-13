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
import { addDesignationRequest, editDesignationRequest } from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";

const formSchema = z.object({
  designation_code: z
    .string()
    .min(1, { message: "designation_code_required" })
    .transform((val) => val.toUpperCase()),
  designation_name: z.string().min(1, { message: "designation_name_required" }),
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
  const { language, translations } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const showToast = useShowToast();
  const t = translations?.modules?.companyMaster || {};
  const errT = translations?.formErrors || {};

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      designation_code: "",
      designation_name: "",
    },
  });

  useEffect(() => {
    if (selectedRowData) {
      form.reset({
        designation_code: selectedRowData.designation_code ?? "",
        designation_name:
          language === "en"
            ? selectedRowData.designation_eng ?? ""
            : selectedRowData.designation_arb ?? "",
      });
    } else {
      form.reset({
        designation_code: "",
        designation_name: "",
      });
    }
  }, [selectedRowData, language]);

  const addMutation = useMutation({
    mutationFn: addDesignationRequest,
    onSuccess: (data) => {
      showToast("success", "adddesignation_success");
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
    mutationFn: editDesignationRequest,
    onSuccess: (_data, variables) => {
      showToast("success", "updatedesignation_success");
      onSave(variables.designation_id?.toString() ?? null, variables);
      queryClient.invalidateQueries({ queryKey: ["designation"] });
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
        designation_code: values.designation_code,
      };

      if (language === "en") {
        payload.designation_eng = values.designation_name;
      } else {
        payload.designation_arb = values.designation_name;
      }

      if (selectedRowData) {
        editMutation.mutate({ designation_id: selectedRowData.id, ...payload });
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
              name="designation_code"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>
                    {t.designation_code}
                    <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t.placeholder_designation_code}
                      {...field}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.designation_code}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="designation_name"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>
                    {language === "ar"
                      ? `${t.designation_name} (العربية)`
                      : `${t.designation_name} (English)`}
                    <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t.placeholder_designation_name}
                      {...field}
                      className={language === "ar" ? "text-right" : "text-left"}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.designation_name}
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