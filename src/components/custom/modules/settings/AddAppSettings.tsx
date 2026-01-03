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
import Switch from "@/src/components/ui/switch";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addAppSettingRequest, editAppSettingRequest } from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";
import { Textarea } from "@/src/components/ui/textarea";

const formSchema = z.object({
  version_name: z.string().min(1, { message: "version_name_required" }),
  tab_no: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    },
    z.number().optional()
  ),
  value: z.string().optional(),
  descr: z.string().min(1, { message: "description_required" }),
  deleted: z.boolean().default(false),
});

export default function AddAppSettings({
  on_open_change,
  selectedRowData,
  onSave,
}: {
  on_open_change: any;
  selectedRowData?: any;
  onSave: () => void;
}) {
  const { language, translations } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const showToast = useShowToast();
  const t = translations?.modules?.settings || {};
  const errT = translations?.formErrors || {};

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      version_name: "",
      tab_no: undefined,
      value: "",
      descr: "",
      deleted: false,
    },
  });

  useEffect(() => {
    if (selectedRowData) {
      form.reset({
        version_name: selectedRowData.version_name ?? "",
        tab_no: selectedRowData.tab_no ?? undefined,
        value: selectedRowData.value ?? "",
        descr: selectedRowData.descr ?? "",
        deleted: selectedRowData.deleted === 1 || selectedRowData.deleted === true,
      });
    } else {
      form.reset({
        version_name: "",
        tab_no: undefined,
        value: "",
        descr: "",
        deleted: false,
      });
    }
  }, [selectedRowData, form]);

  const addMutation = useMutation({
    mutationFn: addAppSettingRequest,
    onSuccess: () => {
      showToast("success", "addappsetting_success");
      queryClient.invalidateQueries({ queryKey: ["appSetting"] });
      onSave();
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
    mutationFn: editAppSettingRequest,
    onSuccess: () => {
      showToast("success", "updateappsetting_success");
      queryClient.invalidateQueries({ queryKey: ["appSetting"] });
      onSave();
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
        version_name: values.version_name,
        tab_no: values.tab_no,
        value: values.value,
        descr: values.descr,
        deleted: values.deleted ? 1 : 0,
      };

      if (selectedRowData) {
        editMutation.mutate({
          app_setting_id: selectedRowData.app_setting_id || selectedRowData.id,
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
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 gap-y-4 min-w-0">
            <FormField
              control={form.control}
              name="version_name"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>
                    {t.version || "Version"}
                    <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t.placeholder_version || "Enter version name"}
                      {...field}
                      className={language === "ar" ? "text-right" : "text-left"}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.version_name}
                    translations={errT}
                  />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tab_no"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>
                    {t.tab || "Tab"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t.placeholder_tab || "Enter tab number"}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === "" ? undefined : val);
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                      className={language === "ar" ? "text-right" : "text-left"}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.tab_no}
                    translations={errT}
                  />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>
                    {t.value || "Value"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t.placeholder_value || "Enter value"}
                      {...field}
                      className={language === "ar" ? "text-right" : "text-left"}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.value}
                    translations={errT}
                  />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descr"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>
                    {t.description || "Description"}
                    <Required />
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t.placeholder_description || "Enter description"}
                      {...field}
                      rows={4}
                      className={language === "ar" ? "text-right" : "text-left"}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.descr}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="deleted"
            render={({ field }) => (
              <FormItem>
                <div className={`flex items-center gap-2 ${language === "ar" ? "flex-row-reverse justify-end" : ""}`}>
                  <FormControl>
                    <Switch
                      checked={!!field.value}
                      onChange={(val: boolean) => field.onChange(val)}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0 cursor-pointer">
                    {language === "ar" ? "محذوف" : "Deleted"}
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2 items-center py-2">
            <div className="flex gap-4">
              <Button
                variant="outline"
                type="button"
                size="lg"
                className="w-full"
                onClick={() => on_open_change(false)}
              >
                {translations?.buttons?.cancel || "Cancel"}
              </Button>
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={addMutation.isPending || editMutation.isPending}
              >
                {addMutation.isPending || editMutation.isPending
                  ? selectedRowData
                    ? translations?.buttons?.updating
                    : translations?.buttons?.saving
                  : selectedRowData
                    ? translations?.buttons?.update
                    : translations?.buttons?.save}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}