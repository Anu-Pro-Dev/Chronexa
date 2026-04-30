"use client";
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/src/lib/utils";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
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
import { ClockIcon, ExclamationIcon } from "@/src/icons/icons";
import { format } from "date-fns";
import { TimePicker } from "@/src/components/ui/time-picker";
import Required from "@/src/components/ui/required";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import {
  addManualPunchRequest,
  editManualPunchRequest,
} from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";

// ─── Constants ────────────────────────────────────────────────────────────────
const ALLOWED_ATTACHMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];
const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024; // 5 MB

// ─── Schema ───────────────────────────────────────────────────────────────────
const formSchema = z.object({
  employee: z
    .string()
    .min(1, { message: "employee_required" })
    .max(100, { message: "employee_max_length" }),
  reason: z
    .string()
    .min(1, { message: "reason_required" })
    .max(100, { message: "reason_max_length" }),
  date: z.date({ required_error: "date_required" }),
  time: z.date({ required_error: "time_required" }),
  employee_remarks: z
    .string()
    .max(500, { message: "remarks_max_length" })
    .optional(),
  // Optional in schema — "required on add" enforced manually in onSubmit
  attachment: z
    .custom<File | undefined>(
      (value) => {
        if (!value) return true;
        if (!(value instanceof File)) return false;
        if (value.size > MAX_ATTACHMENT_SIZE) return false;
        if (!ALLOWED_ATTACHMENT_TYPES.includes(value.type)) return false;
        return true;
      },
      { message: "invalid_file_error" }
    )
    .optional(),
});

// ─── Helper ───────────────────────────────────────────────────────────────────
// Parse raw ISO string or HH:mm[:ss] into a Date for the TimePicker.
// API returns Trans_IN / Trans_OUT as e.g. "2026-04-22T16:57:14.000Z"
function parseRawTime(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;

  // Full ISO / datetime string
  const d = new Date(value);
  if (!isNaN(d.getTime())) return d;

  // Bare HH:mm or HH:mm:ss
  const m = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (m) {
    const now = new Date();
    now.setHours(Number(m[1]), Number(m[2]), Number(m[3] ?? 0), 0);
    return now;
  }

  return undefined;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ApplyMissingPunch({
  on_open_change,
  rowData,
  punchType,
}: {
  on_open_change?: (open: boolean) => void;
  rowData?: any;
  punchType?: string;
}) {
  const { employeeId } = useAuthGuard();
  const { language, translations } = useLanguage();
  const [remarksLength, setRemarksLength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const [timePopoverOpen, setTimePopoverOpen] = useState(false);
  const showToast = useShowToast();
  const t = translations?.modules?.selfServices || {};
  const formErrors = translations?.formErrors || {};

  // ── Edit-mode detection ───────────────────────────────────────────────────
  //
  // From the actual API response (emp_missing_movements):
  //   trans_IN_id / trans_OUT_id  → set only AFTER approval (event tx id)
  //   Status_IN  / Status_OUT     → null | "Pending" | "Approved" | "Rejected"
  //   manual_trans_IN_id / manual_trans_OUT_id → added by backend join (see note)
  //
  // We use manual_trans_*_id (from backend join) as primary source.
  // If the backend hasn't been updated yet, we fall back to trans_*_id.
  const existingManualTransId =
    punchType === "IN"
      ? (rowData?.manual_trans_IN_id ?? rowData?.trans_IN_id ?? null)
      : (rowData?.manual_trans_OUT_id ?? rowData?.trans_OUT_id ?? null);

  const isEditMode = !!existingManualTransId;

  // ── Form ──────────────────────────────────────────────────────────────────
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee: "",
      reason: "",
      employee_remarks: "",
    },
  });

  // ── Mutation ──────────────────────────────────────────────────────────────
  const applyMissingPunchMutation = useMutation({
    mutationFn: (payload: any) =>
      isEditMode
        ? editManualPunchRequest(payload)
        : addManualPunchRequest(payload),
    onSuccess: () => {
      showToast("success", "apply_missing_punch_success");
      queryClient.invalidateQueries({
        queryKey: ["missingMovement"],
        exact: false,
      });
      setIsSubmitting(false);
      if (on_open_change) on_open_change(false);
    },
    onError: (error: any) => {
      console.error("API Error:", error);
      showToast("error", "apply_missing_punch_error");
      setIsSubmitting(false);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  // ── Date parser ───────────────────────────────────────────────────────────
  const parseTransDate = useCallback((dateString: string) => {
    if (!dateString) return new Date();
    // ISO string from API e.g. "2026-04-22T00:00:00.000Z"
    const iso = new Date(dateString);
    if (!isNaN(iso.getTime())) return iso;
    // DD/MM/YYYY or DD/MM/YY display format
    const parts = dateString.split("/");
    if (parts.length === 3) {
      return new Date(
        parseInt(parts[2], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[0], 10)
      );
    }
    return new Date();
  }, []);

  // ── Populate form when modal opens ────────────────────────────────────────
  useEffect(() => {
    if (!rowData || !punchType) return;

    // Employee
    const name =
      rowData.employee_name ??
      rowData.employee_master?.firstname_eng ??
      "";
    form.setValue("employee", `${name} (${rowData.Employee_Id})`);

    // Reason
    form.setValue("reason", punchType);

    // Date — TransDate is "2026-04-22T00:00:00.000Z" from the API
    if (rowData.TransDate) {
      form.setValue("date", parseTransDate(rowData.TransDate));
    }

    // ── FIX: Pre-fill time ────────────────────────────────────────────────
    // page.tsx maps raw API Trans_IN / Trans_OUT into raw_Trans_IN / raw_Trans_OUT
    // before display formatting. We read either variant.
    //
    // For punchType "OUT" (the missing punch), we pre-fill with nothing so the
    // user picks the correct OUT time. For punchType "IN", we pre-fill the
    // existing IN time.
    //
    // When in edit mode (re-submitting a pending/rejected punch), we always
    // pre-fill with the previously submitted time.
    const rawTime =
      punchType === "IN"
        ? (rowData.raw_Trans_IN ?? rowData.Trans_IN)
        : (rowData.raw_Trans_OUT ?? rowData.Trans_OUT);

    const parsedTime = parseRawTime(rawTime);
    if (parsedTime) {
      form.setValue("time", parsedTime);
    }
  }, [rowData, punchType, form, parseTransDate]);

  // ── Submit ────────────────────────────────────────────────────────────────
  function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return;

    // Attachment required only when creating a new punch request
    if (!isEditMode && !values.attachment) {
      form.setError("attachment", { message: "invalid_file_error" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine date + time into a single datetime string
      const dt = new Date(values.date);
      dt.setHours(
        values.time.getHours(),
        values.time.getMinutes(),
        values.time.getSeconds(),
        0
      );
      const pad = (n: number) => String(n).padStart(2, "0");
      const transaction_time =
        `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}` +
        `T${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}.000Z`;

      const payload = isEditMode
        ? {
            employee_manual_transaction_id: Number(existingManualTransId),
            transaction_time,
            reason: values.reason,
            remarks: values.employee_remarks || "",
            // Only send a new file if the user selected one
            ...(values.attachment ? { attachment: values.attachment } : {}),
          }
        : {
            employee_id: Number(rowData?.Employee_Id),
            transaction_time,
            Emp_Missing_Movements_Id: Number(rowData?.emp_missing_Movements_Id),
            reason: values.reason,
            remarks: values.employee_remarks || "",
            transaction_status: "Pending",
            attachment: values.attachment as File,
          };

      applyMissingPunchMutation.mutate(payload);
    } catch (error) {
      console.error("Form submission error", error);
      showToast("error", "formsubmission_error");
      setIsSubmitting(false);
    }
  }

  const handleCancel = () => {
    form.reset();
    if (on_open_change) on_open_change(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-accent transition-all duration-300 rounded-xl">
        {remarksLength > 500 && (
          <div className="flex items-center gap-4 mb-2">
            <p className="text-xs text-destructive border border-red-200 rounded-md px-2 py-1 font-semibold bg-red-400 bg-opacity-10 flex items-center">
              <ExclamationIcon className="mr-2" width="14" height="14" />
              {formErrors.remarks_max_length ||
                "Maximum 500 characters only allowed."}
            </p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-y-5 gap-10 pt-8">

              {/* Employee */}
              <FormField
                control={form.control}
                name="employee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t.employee || "Employee"} <Required />
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        readOnly
                        className="bg-gray-50 cursor-not-allowed"
                      />
                    </FormControl>
                    <TranslatedError
                      fieldError={form.formState.errors.employee}
                      translations={formErrors}
                    />
                  </FormItem>
                )}
              />

              {/* Reason */}
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t.reason || "Reason"} <Required />
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        readOnly
                        className="bg-gray-50 cursor-not-allowed"
                        placeholder={t.placeholder_reason || "Punch Type"}
                      />
                    </FormControl>
                    <TranslatedError
                      fieldError={form.formState.errors.reason}
                      translations={formErrors}
                    />
                  </FormItem>
                )}
              />

              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t.date || "Date"} <Required />
                    </FormLabel>
                    <FormControl>
                      <Input
                        value={
                          field.value ? format(field.value, "dd/MM/yy") : ""
                        }
                        readOnly
                        className="bg-gray-50 cursor-not-allowed"
                        placeholder={t.placeholder_date || "Choose date"}
                      />
                    </FormControl>
                    <TranslatedError
                      fieldError={form.formState.errors.date}
                      translations={formErrors}
                    />
                  </FormItem>
                )}
              />

              {/* Time */}
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t.trans_time || "Time"} <Required />
                    </FormLabel>
                    <Popover
                      open={timePopoverOpen}
                      onOpenChange={setTimePopoverOpen}
                    >
                      <FormControl>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "flex justify-between h-10 w-full max-w-[350px] 3xl:max-w-[450px] rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "HH:mm")
                            ) : (
                              <span className="text-text-secondary">
                                {t.placeholder_time || "Choose time"}
                              </span>
                            )}
                            <ClockIcon />
                          </Button>
                        </PopoverTrigger>
                      </FormControl>
                      <PopoverContent className="w-auto p-0">
                        <TimePicker
                          setDate={field.onChange}
                          date={field.value}
                        />
                      </PopoverContent>
                    </Popover>
                    <TranslatedError
                      fieldError={form.formState.errors.time}
                      translations={formErrors}
                    />
                  </FormItem>
                )}
              />

              {/* Attachment */}
              <FormField
                control={form.control}
                name="attachment"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>
                      {t.attachment || "Attachment"}{" "}
                      {!isEditMode && <Required />}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...fieldProps}
                        className="border-0 p-0 rounded-none h-auto text-text-secondary"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/jpg,image/png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          onChange(file ?? undefined);
                        }}
                      />
                    </FormControl>
                    <p className="text-xs text-text-secondary">
                      {isEditMode
                        ? t.group_apply_attachment_note_edit ||
                          "Leave empty to keep existing file. PDF, JPG, PNG — max 5 MB"
                        : t.group_apply_attachment_note ||
                          "PDF, JPG, PNG — max 5 MB"}
                    </p>
                    <TranslatedError
                      fieldError={form.formState.errors.attachment}
                      translations={formErrors}
                    />
                  </FormItem>
                )}
              />

              {/* Remarks */}
              <FormField
                control={form.control}
                name="employee_remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.remarks || "Remarks"}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={
                          t.placeholder_remarks || "Add your remarks here"
                        }
                        {...field}
                        rows={3}
                        onChange={(e) => {
                          field.onChange(e);
                          setRemarksLength(e.target.value.length);
                        }}
                      />
                    </FormControl>
                    <TranslatedError
                      fieldError={form.formState.errors.employee_remarks}
                      translations={formErrors}
                    />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 items-center py-3 pt-8">
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  type="button"
                  size="lg"
                  className="w-full"
                  onClick={handleCancel}
                >
                  {translations.buttons?.cancel || "Cancel"}
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? translations.buttons?.applying || "Applying..."
                    : translations.buttons?.apply || "Apply"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}