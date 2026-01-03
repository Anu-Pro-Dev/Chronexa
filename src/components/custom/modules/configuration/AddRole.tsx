"use client";
import { useEffect, useState } from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Checkbox } from "@/src/components/ui/checkbox";
import Required from "@/src/components/ui/required";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addRoleRequest, editRoleRequest } from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";

const formSchema = z.object({
  role_name: z
    .string()
    .min(1, { message: "role_name_required" })
    .max(100, { message: "role_name_max_length" }),
  editable_flag: z.boolean().default(true),
});

export default function AddRole({ 
  on_open_change,
  selectedRowData,
  onSave,
}: {
  on_open_change: any;
  selectedRowData?: any;
  onSave: (id: string | null, newData: any) => void;
}) {
  const { translations } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const showToast = useShowToast();
  const t = translations?.modules?.configurations || {};
  const errT = translations?.formErrors || {};

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role_name: "",
      editable_flag: true,
    },
  });

  useEffect(() => {
    if (selectedRowData) {
      form.reset({
        role_name: selectedRowData.role_name || "",
        editable_flag: selectedRowData.editable_flag ?? true,
      });
    } else {
      form.reset({
        role_name: "",
        editable_flag: true,
      });
    }
  }, [selectedRowData, form]);

  const addMutation = useMutation({
    mutationFn: addRoleRequest,
    onSuccess: (data) => {
      showToast("success", "addrole_success");
      queryClient.invalidateQueries({ queryKey: ["secRole"] });
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
    mutationFn: editRoleRequest,
    onSuccess: () => {
      showToast("success", "updaterole_success");
      queryClient.invalidateQueries({ queryKey: ["secRole"] });
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
        role_name: values.role_name,
        editable_flag: values.editable_flag,
      };

      if (selectedRowData) {
        const roleId = selectedRowData.role_id || selectedRowData.id;
        editMutation.mutate({ role_id: roleId, ...payload });
      } else {
        addMutation.mutate(payload);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="">
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="role_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t.role_name || "Role Name"} <Required />
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t.placeholder_role_name || "Enter the role name"} 
                    type="text" 
                    {...field} 
                  />
                </FormControl>
                <TranslatedError
                  fieldError={form.formState.errors.role_name}
                  translations={errT}
                />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="editable_flag"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal px-2">
                  {t.editable || "Editable"}
                </FormLabel>
              </FormItem>
            )}
          />

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
            <Button 
              type="submit" 
              size={"lg"} 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? selectedRowData
                  ? translations.buttons.updating || "Updating..."
                  : translations.buttons.saving || "Saving..."
                : selectedRowData
                ? translations.buttons.update || "Update"
                : translations.buttons.save || "Save"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}