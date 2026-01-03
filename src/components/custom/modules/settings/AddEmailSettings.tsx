"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { useLanguage } from "@/src/providers/LanguageProvider";
import Required from "@/src/components/ui/required";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import Switch from "@/src/components/ui/switch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addEmailSettingRequest, editEmailSettingRequest } from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";

const encryptionValues: Record<string, string> = {
  "1": "TLS",
  "2": "SSL",
  "3": "None",
};

const encryptionLabelToId = Object.fromEntries(
  Object.entries(encryptionValues).map(([id, label]) => [label, id])
);

const formSchema = z.object({
  host: z
    .string()
    .min(1, { message: "host_required" })
    .max(100, { message: "host_max_length" }),
  port: z
    .string()
    .min(1, { message: "port_required" })
    .max(100, { message: "port_max_length" }),
  name: z
    .string()
    .min(1, { message: "name_required" })
    .max(100, { message: "name_max_length" }),
  password: z
    .string()
    .min(1, { message: "password_required" })
    .max(100, { message: "password_max_length" }),
  from_email: z
    .string()
    .min(1, { message: "email_required" })
    .email({ message: "email_invalid" })
    .max(100, { message: "email_max_length" }),
  encryption: z.string().min(1, { message: "encryption_required" }),
  active: z.boolean(),
});

export default function AddEmailSettings({
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
  const t = translations?.modules?.settings || {};
  const errT = translations?.formErrors || {};
  const btnT = translations?.buttons || {};

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      password: "",
      host: "",
      port: "",
      encryption: "",
      from_email: "",
      active: false,
    },
  });

  useEffect(() => {
    if (!selectedRowData) {
      form.reset({
        name: "",
        password: "",
        host: "",
        port: "",
        encryption: "",
        from_email: "",
        active: false,
      });
    } else {
      const encryptionId = encryptionLabelToId[selectedRowData.em_encryption] || "";
      form.reset({
        name: selectedRowData.em_smtp_name || "",
        password: selectedRowData.em_smtp_password || "",
        host: selectedRowData.em_host_name || "",
        port: selectedRowData.em_port_no?.toString() || "",
        from_email: selectedRowData.em_from_email || "",
        encryption: encryptionId,
        active: selectedRowData.em_active_smtp_flag === true || selectedRowData.em_active_smtp_flag === "Y",
      });
    }
  }, [selectedRowData, form]);

  const addMutation = useMutation({
    mutationFn: addEmailSettingRequest,
    onSuccess: (data) => {
      showToast("success", "addemailsetting_success");
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
    mutationFn: editEmailSettingRequest,
    onSuccess: (_data, variables) => {
      showToast("success", "updateemailsetting_success");
      onSave(variables.em_id?.toString() ?? null, variables);
      queryClient.invalidateQueries({ queryKey: ["emailSetting"] });
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
        em_smtp_name: values.name,
        em_smtp_password: values.password,
        em_host_name: values.host,
        em_port_no: values.port,
        em_from_email: values.from_email,
        em_encryption: encryptionValues[values.encryption],
        em_active_smtp_flag: values.active,
      };

      if (selectedRowData) {
        editMutation.mutate({
          em_id: selectedRowData.em_id,
          ...payload
        });
      } else {
        addMutation.mutate({
          ...payload,
        });
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
              name="host"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>
                    {t.host || "Host"} <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t.placeholder_host || "Enter the IP or domain name"}
                      type="text"
                      {...field}
                      className={language === "ar" ? "text-right" : "text-left"}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.host}
                    translations={errT}
                  />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="port"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>
                    {t.port || "Port"} <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t.placeholder_port || "Enter port number"}
                      type="text"
                      {...field}
                      className={language === "ar" ? "text-right" : "text-left"}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.port}
                    translations={errT}
                  />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>
                    {t.name || "Name"} <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t.placeholder_smtp_name || "Enter SMTP configuration name"}
                      type="text"
                      {...field}
                      className={language === "ar" ? "text-right" : "text-left"}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.name}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            
            <FormField
              key={form.watch("encryption")}
              control={form.control}
              name="encryption"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>
                    {t.encryption || "Encryption"} <Required />
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t.placeholder_encryption || "Choose encryption"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(encryptionValues).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <TranslatedError
                    fieldError={form.formState.errors.encryption}
                    translations={errT}
                  />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="from_email"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>
                    {t.from_email || "From Email"} <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t.placeholder_from_email || "Enter from email address"}
                      type="email"
                      {...field}
                      className={language === "ar" ? "text-right" : "text-left"}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.from_email}
                    translations={errT}
                  />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>
                    {t.password || "Password"} <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t.placeholder_smtp_password || "Enter SMTP password"}
                      type="password"
                      {...field}
                      className={language === "ar" ? "text-right" : "text-left"}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.password}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="active"
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
                    {t.active || "Active"} SMTP
                  </FormLabel>
                </div>
                <TranslatedError
                  fieldError={form.formState.errors.active}
                  translations={errT}
                />
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
                {btnT?.cancel || "Cancel"}
              </Button>
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={addMutation.isPending || editMutation.isPending}
              >
                {addMutation.isPending || editMutation.isPending
                  ? selectedRowData
                    ? btnT?.updating || "Updating..."
                    : btnT?.saving || "Saving..."
                  : selectedRowData
                    ? btnT?.update || "Update"
                    : btnT?.save || "Save"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}