"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/src/components/ui/form";
import Required from "@/src/components/ui/required";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addIfmEmployeeLocationMappingRequest,
  editIfmEmployeeLocationMappingRequest,
  getAllIfmLocationMasterUnpaginated,
} from "@/src/lib/apiHandler";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";

const formSchema = z.object({
  employee_number: z.string().min(1, { message: "employee_number_required" }),
  location_id: z.string().min(1, { message: "location_id_required" }),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  active_flag: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddUserMapping({
  on_open_change,
  selectedRowData,
  onSave,
}: {
  on_open_change: (open: boolean) => void;
  selectedRowData?: any;
  onSave: (id: string | null, newData: any) => void;
}) {
  const { language, translations } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const showToast = useShowToast();
  const t = translations?.modules?.workload || {};
  const errT = translations?.formErrors || {};

  // Fetch locations dropdown unpaginated
  const { data: locationsResponse, isLoading: isLoadingLocations } = useQuery({
    queryKey: ["ifm-location-master-unpaginated"],
    queryFn: getAllIfmLocationMasterUnpaginated,
  });

  const locationsList = Array.isArray(locationsResponse?.data) ? locationsResponse.data : [];

  // Fetch employees list for dropdown
  const { data: employeesResponse, isLoading: isLoadingEmployees } = useFetchAllEntity("employee", {
    searchParams: { limit: "1000", offset: "1" },
  });

  const employeesList = Array.isArray(employeesResponse?.data) ? employeesResponse.data : [];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_number: "",
      location_id: "",
      from_date: "",
      to_date: "",
      active_flag: true,
    },
  });

  const formatDateForInput = (dateVal: string | null | undefined) => {
    if (!dateVal) return "";
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return "";
      return d.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  useEffect(() => {
    if (selectedRowData) {
      form.reset({
        employee_number: selectedRowData.employee_number ?? selectedRowData.employee?.emp_no ?? "",
        location_id: selectedRowData.location_id ? String(selectedRowData.location_id) : "",
        from_date: formatDateForInput(selectedRowData.from_date),
        to_date: formatDateForInput(selectedRowData.to_date),
        active_flag: selectedRowData.active_flag ?? true,
      });
    } else {
      form.reset({
        employee_number: "",
        location_id: "",
        from_date: "",
        to_date: "",
        active_flag: true,
      });
    }
  }, [selectedRowData, form]);

  const addMutation = useMutation({
    mutationFn: addIfmEmployeeLocationMappingRequest,
    onSuccess: (res) => {
      showToast("success", "add_ifm_mapping_success");
      onSave(null, res.data);
      queryClient.invalidateQueries({ queryKey: ["ifm-employee-location-mapping"] });
      on_open_change(false);
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        showToast("error", error?.response?.data?.message || "Mapping already exists for this employee and location");
      } else {
        showToast("error", error?.response?.data?.message || "formsubmission_error");
      }
    },
  });

  const editMutation = useMutation({
    mutationFn: editIfmEmployeeLocationMappingRequest,
    onSuccess: (res, variables) => {
      showToast("success", "update_ifm_mapping_success");
      onSave(variables.mapping_id.toString(), res.data || variables);
      queryClient.invalidateQueries({ queryKey: ["ifm-employee-location-mapping"] });
      on_open_change(false);
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        showToast("error", error?.response?.data?.message || "Duplicate mapping");
      } else {
        showToast("error", error?.response?.data?.message || "formsubmission_error");
      }
    },
  });

  async function onSubmit(values: FormValues) {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const fromDateIso = values.from_date ? new Date(values.from_date).toISOString() : undefined;
      const toDateIso = values.to_date ? new Date(values.to_date).toISOString() : undefined;

      const payload: any = {
        employee_number: values.employee_number.trim(),
        location_id: Number(values.location_id),
        from_date: fromDateIso,
        to_date: toDateIso,
        active_flag: values.active_flag,
      };

      if (selectedRowData) {
        const id = selectedRowData.mapping_id || selectedRowData.id;
        editMutation.mutate({ mapping_id: Number(id), ...payload });
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
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
            {/* Employee Number selection or input */}
            <FormField
              control={form.control}
              name="employee_number"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>
                    {t.employee_number || "Employee Number"}
                    <Required />
                  </FormLabel>
                  {employeesList.length > 0 ? (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t.placeholder_employee_number || "Select employee number"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {employeesList.map((emp: any) => {
                          const empNo = emp.emp_no || emp.employee_number || "";
                          const empName = language === "ar"
                            ? `${emp.firstname_arb || ""} ${emp.lastname_arb || ""}`.trim()
                            : `${emp.firstname_eng || ""} ${emp.lastname_eng || ""}`.trim();
                          return (
                            <SelectItem key={emp.employee_id || empNo} value={empNo}>
                              {empNo} {empName ? `- ${empName}` : ""}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  ) : (
                    <FormControl>
                      <Input
                        type="text"
                        placeholder={t.placeholder_employee_number || "Enter employee number (e.g. EMP-1001)"}
                        {...field}
                      />
                    </FormControl>
                  )}
                  <TranslatedError
                    fieldError={form.formState.errors.employee_number}
                    translations={errT}
                  />
                </FormItem>
              )}
            />

            {/* Location ID Selection */}
            <FormField
              control={form.control}
              name="location_id"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>
                    {t.location || "Location"}
                    <Required />
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoadingLocations}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t.placeholder_location_id || "Select location"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {locationsList.map((loc: any) => (
                        <SelectItem key={loc.location_id} value={String(loc.location_id)}>
                          {loc.project_name} - {loc.location_name || loc.location_code || `Location #${loc.location_id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <TranslatedError
                    fieldError={form.formState.errors.location_id}
                    translations={errT}
                  />
                </FormItem>
              )}
            />

            {/* From Date */}
            <FormField
              control={form.control}
              name="from_date"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>{t.from_date || "From Date"}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* To Date */}
            <FormField
              control={form.control}
              name="to_date"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>{t.to_date || "To Date"}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Active Flag */}
            <FormField
              control={form.control}
              name="active_flag"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 space-y-0 pt-6">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(!!checked)}
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer font-normal">
                    {t.active_flag || "Active"}
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>

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
        </div>
      </form>
    </Form>
  );
}
