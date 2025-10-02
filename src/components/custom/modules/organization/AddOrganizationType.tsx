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
import { addOrganizationTypeRequest, editOrganizationTypeRequest } from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";

const formSchema = z.object({
  hierarchy: z
    .string()
    .min(1, { message: "hierarchy_required" }),
  organization_type_name: z.string().min(1, { message: "organization_type_name_required" }),
});

export default function AddOrganizationType({
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
  const t = translations?.modules?.organization || {};
  const errT = translations?.formErrors || {};

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hierarchy: "",
      organization_type_name: "",
    },
  });

  useEffect(() => {
    if (selectedRowData) {
      form.reset({
        hierarchy: selectedRowData.org_type_level?.toString() ?? "",
        organization_type_name:
          language === "en"
            ? selectedRowData.organization_type_eng ?? ""
            : selectedRowData.organization_type_arb ?? "",
      });
    } else {
      form.reset({
        hierarchy: "",
        organization_type_name: "",
      });
    }
  }, [selectedRowData, language]);

  const addMutation = useMutation({
    mutationFn: addOrganizationTypeRequest,
    onSuccess: (data) => {
      showToast("success", "addorgtype_success");
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
    mutationFn: editOrganizationTypeRequest,
    onSuccess: (_data, variables) => {
      showToast("success", "updateorgtype_success");
      onSave(variables.organization_type_id?.toString() ?? null, variables);
      queryClient.invalidateQueries({ queryKey: ["organizationType"] });
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
        org_type_level: Number(values.hierarchy),
      };

      if (language === "en") {
        payload.organization_type_eng = values.organization_type_name;
      } else {
        payload.organization_type_arb = values.organization_type_name;
      }

      if (selectedRowData) {
        editMutation.mutate({ organization_type_id: selectedRowData.id, ...payload });
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
              name="hierarchy"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>
                    {t.hierarchy}
                    <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t.placeholder_hierarchy}
                      {...field}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.hierarchy}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="organization_type_name"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>
                    {language === "ar"
                      ? `${t.org_type_name} (العربية)`
                      : `${t.org_type_name} (English)`}
                    <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t.placeholder_org_type}
                      {...field}
                      className={language === "ar" ? "text-right" : "text-left"}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.organization_type_name}
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