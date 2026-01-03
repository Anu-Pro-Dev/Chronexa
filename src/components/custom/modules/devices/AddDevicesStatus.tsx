"use client";
import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import Required from "@/src/components/ui/required";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDeviceRequest, editDeviceRequest } from "@/src/lib/apiHandler";
import Switch from "@/src/components/ui/switch";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";

const formSchema = z.object({
  device_no: z
    .string()
    .min(1, { message: "device_no_required" })
    .max(50, { message: "device_no_max_length" }),
  device_name: z
    .string()
    .min(1, { message: "device_name_required" })
    .max(100, { message: "device_name_max_length" }),
  device_status: z.boolean().default(false).optional(),
});

export default function AddDevices({
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
  const t = translations?.modules?.devices || {};
  const errT = translations?.formErrors || {};

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      device_no: "",
      device_name: "",
      device_status: false,
    },
  });

  useEffect(() => {
    if (selectedRowData) {
      form.reset({
        device_no: selectedRowData.device_no ?? "",
        device_name: selectedRowData.device_name ?? "",
        device_status: selectedRowData.device_status ?? false,
      });
    } else {
      form.reset({
        device_no: "",
        device_name: "",
        device_status: false,
      });
    }
  }, [selectedRowData, form]);

  const addMutation = useMutation({
    mutationFn: addDeviceRequest,
    onSuccess: (data) => {
      showToast("success", "adddevice_success");
      onSave(null, data.data);
      on_open_change(false);
      queryClient.invalidateQueries({ queryKey: ["device"] });
      form.reset();
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
    mutationFn: editDeviceRequest,
    onSuccess: (_data, variables) => {
      showToast("success", "updatedevice_success");
      onSave(variables.device_id?.toString() ?? null, variables);
      queryClient.invalidateQueries({ queryKey: ["device"] });
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
        device_no: values.device_no.trim(),
        device_name: values.device_name.trim(),
        device_status: values.device_status ?? false,
      };

      if (selectedRowData) {
        editMutation.mutate({
          device_id: selectedRowData.id,
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
              name="device_no"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t.device_no || "Device No"}<Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t.placeholder_device_no || "Enter the device no"}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.device_no}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="device_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t.device_name || "Device Name"}<Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t.placeholder_device_name || "Enter the device name"}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.device_name}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="device_status"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-4">
                  <FormLabel className="mb-0">
                    {t.device_status || "Device Status"}
                  </FormLabel>
                  <FormControl>
                    <Switch
                      checked={!!field.value}
                      onChange={(val: boolean) => field.onChange(val)}
                    />
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
              disabled={isSubmitting}
            >
              {translations?.buttons?.cancel || "Cancel"}
            </Button>
            <Button 
              type="submit" 
              size={"lg"} 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting
                ? selectedRowData
                  ? translations?.buttons?.updating || "Updating..."
                  : translations?.buttons?.saving || "Saving..."
                : selectedRowData
                  ? translations?.buttons?.update || "Update"
                  : translations?.buttons?.save || "Save"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}