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
import { addSecUserRequest, updateSecUserRequest } from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";
import { IoEye, IoEyeOff } from "react-icons/io5";

const formSchema = z.object({
  login: z.string().min(6, "Username must be at least 6 characters").max(25),
  password: z.string().min(5, "Password must be at least 5 characters").max(20),
  employee_id: z.coerce.number().min(1, { message: "employee_id_required" }),
});

export default function UpdateUser({
  on_open_change,
  selectedRowData,
  onSave,
}: {
  on_open_change: any;
  selectedRowData?: any;
  onSave: (id: string | null, newData: any) => void;
}) {
  const { language, translations } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const queryClient = useQueryClient();
  const showToast = useShowToast();
  const t = translations?.modules?.configuration || {};
  const errT = translations?.formErrors || {};

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      login: "",
      password: "",
      employee_id: 0,
    },
  });

  useEffect(() => {
    if (selectedRowData) {
      form.reset({
        login: selectedRowData.login ?? "",
        password: "",
        employee_id: selectedRowData.employee_id ?? 0,
      });
    } else {
      form.reset({
        login: "",
        password: "",
        employee_id: 0,
      });
    }
    setShowPassword(false);
  }, [selectedRowData, form]);

  const addMutation = useMutation({
    mutationFn: addSecUserRequest,
    onSuccess: (data) => {
      showToast("success", "adduser_success");
      onSave(null, data.data);
      queryClient.invalidateQueries({ queryKey: ["secuser"] });
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
    mutationFn: updateSecUserRequest,
    onSuccess: (data, variables) => {
      showToast("success", "updateuser_success");
      onSave(variables.user_id?.toString() ?? null, data.data);
      queryClient.invalidateQueries({ queryKey: ["secuser"] });
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
    const payload = {
      login: values.login,
      password: values.password,
      employee_id: values.employee_id,
    };

    if (selectedRowData) {
      editMutation.mutate({
        user_id: selectedRowData.id,
        ...payload,
      });
    } else {
      addMutation.mutate(payload);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="employee_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t.employee_id || "Employee ID"}
                    <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t.placeholder_employee_id || "Enter employee ID"}
                      {...field}
                      readOnly={!!selectedRowData}
                      disabled={!!selectedRowData || addMutation.isPending || editMutation.isPending}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.employee_id}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="login"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t.login || "Username"}
                    <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t.placeholder_login || "Enter username"}
                      {...field}
                      disabled={addMutation.isPending || editMutation.isPending}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.login}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>
                    {t.password || "Password"}
                    <Required />
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder={
                          selectedRowData
                            ? t.placeholder_password_update || "Enter new password"
                            : t.placeholder_password || "Enter password"
                        }
                        suppressHydrationWarning
                        {...field}
                        disabled={addMutation.isPending || editMutation.isPending}
                      />
                    </FormControl>
                    <button
                      type="button"
                      tabIndex={-1}
                      className={`absolute top-1/2 text-text-secondary -translate-y-1/2 ${language === "ar" ? "left-3" : "right-3"
                        }`}
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={addMutation.isPending || editMutation.isPending}
                    >
                      {showPassword ? (
                        <IoEyeOff className="w-5 h-5" />
                      ) : (
                        <IoEye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <TranslatedError
                    fieldError={form.formState.errors.password}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end gap-2 items-center">
            <div className="flex gap-4">
              <Button
                variant="outline"
                type="button"
                size="lg"
                className="w-full"
                onClick={() => on_open_change(false)}
                disabled={addMutation.isPending || editMutation.isPending}
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
                    ? translations?.buttons?.updating || "Updating..."
                    : translations?.buttons?.saving || "Saving..."
                  : selectedRowData
                    ? translations?.buttons?.update || "Update"
                    : translations?.buttons?.save || "Save"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}