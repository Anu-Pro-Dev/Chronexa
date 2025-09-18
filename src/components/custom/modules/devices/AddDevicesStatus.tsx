"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import * as z from "zod";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import Required from "@/src/components/ui/required";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDeviceRequest, editDeviceRequest } from "@/src/lib/apiHandler";
import Switch from "@/src/components/ui/switch";

const formSchema = z.object({
  device_no: z.string().default(""),
  device_name: z.string().default(""),
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
  const t = translations?.modules?.devices || {};

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      device_no: "",
      device_name:"",
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
      form.reset();
    }
  }, [selectedRowData, language]);

  const addMutation = useMutation({
    mutationFn: addDeviceRequest,
    onSuccess: (data) => {
      toast.success("Device added successfully!");
      onSave(null, data.data);
      on_open_change(false);
      queryClient.invalidateQueries({ queryKey: ["device"] });
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
    mutationFn: editDeviceRequest,
    onSuccess: (_data, variables) => {
      toast.success("Device updated successfully!");
      onSave(variables.device_id?.toString() ?? null, variables);
      queryClient.invalidateQueries({ queryKey: ["device"] });
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
        device_no: values.device_no,
        device_name: values.device_name,
        device_status: values.device_status,
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
                    {t.device_no}<Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t.placeholder_device_no}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="device_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t.device_name}<Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t.placeholder_device_name}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
							control={form.control}
							name="device_status"
							render={({ field }) => (
								<FormItem className="flex items-center space-x-4">
									<FormLabel className="mb-0">{t.device_status}</FormLabel>
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
            >
              {translations.buttons.cancel}
            </Button>
            <Button type="submit" size={"lg"} className="w-full" disabled={isSubmitting}>
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