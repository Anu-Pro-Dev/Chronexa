"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/src/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import Required from "@/src/components/ui/required";
import Switch from "@/src/components/ui/switch";

import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addSecUserRequest, editSecUserRequest } from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";

import { ChevronDown } from "lucide-react";

const formSchema = z.object({
  login: z.string().min(1, { message: "username_required" }),
  password: z.string().min(1, { message: "password_required" }),
  employee_id: z.preprocess(
    (v) => {
      if (v === undefined || v === null || v === "") return undefined;
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    },
    z
      .number({ invalid_type_error: "employee_required" })
      .min(1, { message: "employee_required" })
  ),
  access_mobile_app: z.boolean(),
  access_control_panel: z.boolean(),
  app_type: z.preprocess(
    (v) => {
      if (v === undefined || v === null || v === "") return undefined;
      return v;
    },
    z.enum(["ontime", "fieldtrack"], {
      invalid_type_error: "app_type_required",
      required_error: "app_type_required",
    })
  ),
});

type FormValues = {
  login: string;
  password: string;
  employee_id?: number;
  access_mobile_app: boolean;
  access_control_panel: boolean;
  app_type?: "ontime" | "fieldtrack" | "";
};

const DEFAULT_FORM_VALUES: FormValues = {
  login: "",
  password: "",
  employee_id: undefined,
  access_mobile_app: false,
  access_control_panel: false,
  app_type: "",
};

function toBooleanFlag(value: any): boolean {
  const normalized = String(value ?? "").trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "enabled";
}

function toNumberOrUndefined(value: any): number | undefined {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

type AppType = "ontime" | "fieldtrack";

function toAppTypeOrEmpty(value: any): AppType | "" {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "ontime") return "ontime";
  if (normalized === "fieldtrack") return "fieldtrack";
  return "";
}

export default function AddUser({
  on_open_change,
  selectedRowData,
  onSave,
}: {
  on_open_change: (open: boolean) => void;
  selectedRowData?: any;
  onSave?: () => void;
}) {
  const { language, translations } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [empPopoverOpen, setEmpPopoverOpen] = useState(false);

  const queryClient = useQueryClient();
  const showToast = useShowToast();

  const t = translations?.modules?.userManagement || {};
  const btnT = translations?.buttons || {};
  const errT = translations?.formErrors || {};

  const isEditMode = Boolean(selectedRowData?.user_id);

  const { data: employeeData, isLoading: empLoading } = useFetchAllEntity(
    "employee",
    {
      searchParams: {
        organization_id: "27",
        withCredentials: "false",
      },
    }
  );

  const employees = useMemo(() => employeeData?.data ?? [], [employeeData]);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  useEffect(() => {
    if (!selectedRowData) {
      form.reset(DEFAULT_FORM_VALUES);
      return;
    }

    const appType = toAppTypeOrEmpty(selectedRowData?.app_type);

    form.reset({
      ...DEFAULT_FORM_VALUES,
      login: selectedRowData?.login ?? "",
      // Never reveal the real password in edit; keep it masked but valid for schema
      password: "********",
      employee_id: toNumberOrUndefined(selectedRowData?.employee_id),
      access_mobile_app: toBooleanFlag(selectedRowData?.access_mobile_app ?? selectedRowData?.user_license),
      access_control_panel: toBooleanFlag(selectedRowData?.access_control_panel),
      app_type: appType,
    });

    // Some non-native inputs (Radix Select) can fail to visually update on `reset()`.
    // Re-apply the value on the next tick to ensure the trigger reflects it.
    setTimeout(() => {
      form.setValue("app_type", appType as any, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }, 0);
  }, [selectedRowData, form]);

  const selectedEmpId = form.watch("employee_id");

  const selectedEmployee = useMemo(
    () => employees.find((e: any) => e.employee_id === selectedEmpId),
    [employees, selectedEmpId]
  );
  const addMutation = useMutation({
    mutationFn: addSecUserRequest,
    onSuccess: () => {
      showToast("success", "addsecuser_success");
      queryClient.invalidateQueries({ queryKey: ["secuser"] });
      onSave?.();
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
    mutationFn: editSecUserRequest,
    onSuccess: () => {
      showToast("success", "datasave_success");
      queryClient.invalidateQueries({ queryKey: ["secuser"] });
      onSave?.();
      on_open_change(false);
    },
    onError: () => {
      showToast("error", "formsubmission_error");
    },
  });

  async function onSubmit(values: FormValues) {
    if (isSubmitting) return;

    const parsed = formSchema.parse(values);

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        editMutation.mutate({
          user_id: Number(selectedRowData.user_id),
          access_mobile_app: parsed.access_mobile_app,
          access_control_panel: parsed.access_control_panel,
          app_type: parsed.app_type,
        } as any);
      } else {
        addMutation.mutate({
          login: parsed.login,
          password: parsed.password,
          employee_id: parsed.employee_id,
          access_control_panel: parsed.access_control_panel,
          is_aduser: false,
          access_mobile_app: parsed.access_mobile_app,
          app_type: parsed.app_type,
        } as any);
      }
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-col gap-4">

          {/* Username */}
          <FormField
            control={form.control}
            name="login"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel>
                  {t.username || "Username"} <Required />
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder={t.placeholder_username || "Enter username"}
                    {...field}
                    readOnly={isEditMode}
                    className={language === "ar" ? "text-right" : "text-left"}
                  />
                </FormControl>
                <TranslatedError
                  fieldError={form.formState.errors.login}
                  translations={errT}
                />
              </FormItem>
            )}
          />

          {/* Password */}
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
                    type="password"
                    placeholder={t.placeholder_password || "Enter password"}
                    {...field}
                    readOnly={isEditMode}
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

          {/* Employee Dropdown */}
          <FormField
            control={form.control}
            name="employee_id"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel>
                  {t.employee || "Employee"} <Required />
                </FormLabel>

                <Popover
                  open={isEditMode ? false : empPopoverOpen}
                  onOpenChange={(open) => {
                    if (isEditMode) return;
                    setEmpPopoverOpen(open);
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      size="lg"
                      variant="outline"
                      disabled={isEditMode}
                      className="w-full bg-accent px-4 flex justify-between border-grey"
                    >
                      <span className="text-sm truncate">
                        {selectedEmployee ? (
                          <span className="text-text-primary">
                            {selectedEmployee.emp_no ?? ""} —{" "}
                            {language === "ar"
                              ? selectedEmployee.firstname_arb ||
                              selectedEmployee.name
                              : selectedEmployee.name ||
                              selectedEmployee.firstname_eng}
                          </span>
                        ) : (
                          <span className="text-text-secondary">
                            {empLoading
                              ? "Loading employees..."
                              : t.placeholder_employee || "Choose employee"}
                          </span>
                        )}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 text-text-primary" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-dropdown">
                    <Command>
                      <CommandInput placeholder="Search by name or emp no..." />
                      <CommandEmpty>No employee found.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {employees.map((emp: any) => (
                          <CommandItem
                            key={emp.employee_id}
                            value={`${emp.emp_no ?? ""} ${language === "ar"
                              ? emp.firstname_arb || emp.name || ""
                              : emp.name || emp.firstname_eng || ""
                              }`}
                            onSelect={() => {
                              field.onChange(emp.employee_id);
                              setEmpPopoverOpen(false);
                            }}
                          >
                            <span className="font-regular text-text-secondary mr-2">
                              {emp.emp_no}
                            </span>
                            {language === "ar"
                              ? emp.firstname_arb || emp.name
                              : emp.name || emp.firstname_eng}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>

                <TranslatedError
                  fieldError={form.formState.errors.employee_id}
                  translations={errT}
                />
              </FormItem>
            )}
          />


          {/* App Type */}
          <FormField
            control={form.control}
            name="app_type"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel>
                  {t.app_type || "App type"} <Required />
                </FormLabel>
                <Select
                  value={((field.value as any) ?? "") as any}
                  onValueChange={field.onChange as any}
                >
                  <FormControl>
                    <SelectTrigger className="bg-accent border-grey">
                      <SelectValue placeholder={t.choose_app_type || "Choose app type"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ontime">Ontime</SelectItem>
                    <SelectItem value="fieldtrack">Field Track</SelectItem>
                  </SelectContent>
                </Select>
                <TranslatedError
                  fieldError={form.formState.errors.app_type}
                  translations={errT}
                />
              </FormItem>
            )}
          />

          {/* Mobile License Toggle */}
          <div className="w-full flex gap-2 items-center pt-2 pb-2">
            <FormField
              control={form.control}
              name="access_mobile_app"
              render={({ field }) => (
                <FormItem>
                  <div
                    className={`flex items-center gap-1 mt-2 ${language === "ar" ? "flex-row-reverse justify-end" : ""
                      }`}
                  >
                    <FormControl>
                      <Switch
                        checked={!!field.value}
                        onChange={(val: boolean) => field.onChange(val)}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0 cursor-pointer font-regular">
                      {t.license || "License"}
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {/* Web App Toggle */}
            <FormField
              control={form.control}
              name="access_control_panel"
              render={({ field }) => (
                <FormItem>
                  <div
                    className={`flex items-center gap-1 mt-2 ${language === "ar" ? "flex-row-reverse justify-end" : ""
                      }`}
                  >
                    <FormControl>
                      <Switch
                        checked={!!field.value}
                        onChange={(val: boolean) => field.onChange(val)}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0 cursor-pointer font-regular">
                      {t.web_app || "Web app"}
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
          {/* Actions */}
          <div className="w-full flex gap-2 items-center pt-2 pb-2">
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
              disabled={isSubmitting || addMutation.isPending || editMutation.isPending}
            >
              {isSubmitting || addMutation.isPending || editMutation.isPending
                ? btnT?.saving || "Saving..."
                : btnT?.save || "Save"}
            </Button>
          </div>

        </div>
      </form>
    </Form>
  );
}