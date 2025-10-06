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
import { addDBSettingRequest, editDBSettingRequest } from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";

const dbTypeValues: Record<string, string> = {
  "1": "PostgreSQL",
  "2": "MySQL",
  "3": "SQLite",
  "4": "MongoDB",
  "5": "Microsoft SQL Server",
  "6": "CockroachDB",
};

const dbLabelToId = Object.fromEntries(
  Object.entries(dbTypeValues).map(([id, label]) => [label, id])
);

const formSchema = z.object({
  database: z.string().min(1, { message: "database_required" }),
  database_name: z
    .string()
    .min(1, { message: "database_name_required" })
    .max(100, { message: "database_name_max_length" }),
  host: z
    .string()
    .min(1, { message: "host_required" })
    .max(100, { message: "host_max_length" }),
  port: z
    .string()
    .min(1, { message: "port_required" })
    .max(100, { message: "port_max_length" }),
  user: z
    .string()
    .min(1, { message: "user_required" })
    .max(25, { message: "user_max_length" }),
  password: z
    .string()
    .min(1, { message: "password_required" })
    .max(20, { message: "password_max_length" }),
  connected: z.boolean(),
});

export default function AddDBSettings({
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
      database: "",
      database_name: "",
      host: "",
      port: "",
      user: "",
      password: "",
      connected: false,
    },
  });

  useEffect(() => {
    if (!selectedRowData) {
      form.reset({
        database: "",
        database_name: "",
        host: "",
        port: "",
        user: "",
        password: "",
        connected: false,
      });
    } else {
      const dbId = dbLabelToId[selectedRowData.db_databasetype] || "";
      form.reset({
        database: dbId,
        database_name: selectedRowData.db_databasename || "",
        host: selectedRowData.db_host_name || "",
        port: selectedRowData.db_port_no?.toString() || "",
        user: selectedRowData.db_user || "",
        password: selectedRowData.db_password || "",
        connected: selectedRowData.connect_db_flag === true || selectedRowData.connect_db_flag === "Y",
      });
    }
  }, [selectedRowData, form]);

  const addMutation = useMutation({
    mutationFn: addDBSettingRequest,
    onSuccess: (data) => {
      showToast("success", "adddbsetting_success");
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
    mutationFn: editDBSettingRequest,
    onSuccess: (_data, variables) => {
      showToast("success", "updatedbsetting_success");
      onSave(variables.db_settings_id?.toString() ?? null, variables);
      queryClient.invalidateQueries({ queryKey: ["dbSetting"] });
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
      const userId = 1; // TODO: Get from auth context
      
      const payload: any = {
        db_databasetype: dbTypeValues[values.database],
        db_databasename: values.database_name,
        db_host_name: values.host,
        db_port_no: values.port,
        db_user: values.user,
        db_password: values.password,
        connect_db_flag: values.connected,
        last_updated_id: userId,
      };

      if (selectedRowData) {
        editMutation.mutate({ 
          db_settings_id: selectedRowData.db_settings_id, 
          ...payload 
        });
      } else {
        addMutation.mutate({ 
          ...payload,
          created_id: userId 
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 gap-y-4 min-w-0">
            <FormField
              key={form.watch("database")}
              control={form.control}
              name="database"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t.database || "Database"} <Required />
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="max-w-[350px]">
                        <SelectValue placeholder="Choose Database" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(dbTypeValues).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <TranslatedError
                    fieldError={form.formState.errors.database}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="database_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t.database_name || "Database Name"} <Required />
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your Database name" type="text" {...field} />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.database_name}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="host"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t.host || "Host"} <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter the IP or domain name"
                      type="text"
                      {...field}
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
                <FormItem>
                  <FormLabel>
                    {t.port || "Port"} <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your port number"
                      type="text"
                      {...field}
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
              name="user"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User <Required /></FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your database user"
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.user}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password <Required /></FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your database user password"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.password}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="connected"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-4">
                  <FormLabel className="mb-0">
                    {t.connection || "Connect DB"}
                  </FormLabel>
                  <FormControl>
                    <Switch
                      checked={!!field.value}
                      onChange={(val: boolean) => field.onChange(val)}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.connected}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end gap-2 items-center py-5">
            <div className="flex gap-4 px-5">
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
                disabled={isSubmitting}
              >
                {isSubmitting
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