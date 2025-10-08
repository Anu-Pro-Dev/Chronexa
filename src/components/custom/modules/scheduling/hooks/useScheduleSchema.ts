import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import * as z from "zod";
import { normalFormSchema } from "./useNormalForm";
import { useScheduleEditStore } from "@/src/stores/scheduleEditStore";

const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, "time_invalid")
  .or(z.literal(""))
  .nullable()
  .optional();

const optionalNumber = z.preprocess(
  (val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  },
  z.number().nonnegative("Must be 0 or greater").optional()
);

const ramadanFormSchemaOptional = z.object({
  ramadan_in_time: timeString,
  ramadan_out_time: timeString,
  ramadan_break_time: timeString,
  ramadan_prayer_time: timeString,
  ramadan_flexible_min: optionalNumber,
  ramadan_grace_in_min: optionalNumber,
  ramadan_grace_out_min: optionalNumber,
});

const policyFormSchemaOptional = z.object({
  show_on_report: z.enum(['first-in-last-out', 'all-transactions']).optional(),
  email_notification: z.enum(['first-in-last-out', 'all-transactions']).optional(),
  calculate_worked_hrs_flag: z.boolean().optional(),
  default_overtime_flag: z.boolean().optional(),
  default_break_hrs_flag: z.boolean().optional(),
  override_schedule_on_holiday_flag: z.boolean().optional(),
  reduce_required_hrs_flag: z.boolean().optional(),
});

export const scheduleFormSchema = normalFormSchema
  .merge(ramadanFormSchemaOptional)
  .merge(policyFormSchemaOptional);

export const useScheduleForm = () => {
  const selectedRowData = useScheduleEditStore((state) => state.selectedRowData);

  const form = useForm<z.infer<typeof scheduleFormSchema>>({
    resolver: zodResolver(scheduleFormSchema),
    mode: "onSubmit",
    defaultValues: {
      schedule_code: "",
      schedule_location: undefined,
      organization_id: undefined,
      in_time: "",
      out_time: "",
      sch_color: "",
      required_work_hours: "",
      open_shift_flag: false,
      night_shift_flag: false,
      ramadan_flag: false,
      flexible_min: undefined,
      grace_in_min: undefined,
      grace_out_min: undefined,
      inactive_date: null,
      
      ramadan_in_time: "",
      ramadan_out_time: "",
      ramadan_break_time: "",
      ramadan_prayer_time: "",
      ramadan_flexible_min: undefined,
      ramadan_grace_in_min: undefined,
      ramadan_grace_out_min: undefined,
      
      show_on_report: "first-in-last-out",
      email_notification: "first-in-last-out",
      calculate_worked_hrs_flag: false,
      default_overtime_flag: false,
      default_break_hrs_flag: false,
      override_schedule_on_holiday_flag: false,
      reduce_required_hrs_flag: false,
    },
  });

  function normalizeTimeString(timeStr: string | null | undefined): string {
    if (!timeStr) return "";
    
    if (/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(timeStr)) {
      return timeStr;
    }
    
    if (/^([01]\d|2[0-3]):([0-5]\d)$/.test(timeStr)) {
      return `${timeStr}:00`;
    }
    
    try {
      const date = new Date(timeStr);
      if (!isNaN(date.getTime())) {
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const seconds = date.getSeconds().toString().padStart(2, "0");
        return `${hours}:${minutes}:${seconds}`;
      }
    } catch (e) {}
    
    return "";
  }

  function normalizeNumericField(value: any): string {
    if (value === null || value === undefined || value === "") return "";
    return String(value);
  }

  useEffect(() => {
    if (selectedRowData) {
      form.reset({
        ...selectedRowData,
        organization_id: Number(selectedRowData.organization_id),
        schedule_location: Number(selectedRowData.schedule_location),
        in_time: normalizeTimeString(selectedRowData.in_time),
        out_time: normalizeTimeString(selectedRowData.out_time),
        required_work_hours: normalizeTimeString(selectedRowData.required_work_hours),
        ramadan_in_time: normalizeTimeString(selectedRowData.ramadan_in_time),
        ramadan_out_time: normalizeTimeString(selectedRowData.ramadan_out_time),
        ramadan_required_work_hours: normalizeTimeString(selectedRowData.ramadan_required_work_hours),
        inactive_date: selectedRowData.inactive_date ? new Date(selectedRowData.inactive_date) : null,
        flexible_min: normalizeNumericField(selectedRowData.flexible_min),
        grace_in_min: normalizeNumericField(selectedRowData.grace_in_min),
        grace_out_min: normalizeNumericField(selectedRowData.grace_out_min),
        ramadan_flexible_min: normalizeNumericField(selectedRowData.ramadan_flexible_min),
        ramadan_grace_in_min: normalizeNumericField(selectedRowData.ramadan_grace_in_min),
        ramadan_grace_out_min: normalizeNumericField(selectedRowData.ramadan_grace_out_min),
      });
    }
  }, [selectedRowData, form]);

  useEffect(() => {
    if (!selectedRowData?.schedule_id) {
      form.reset();
    }
  }, []);

  return { form, schema: scheduleFormSchema, selectedRowData };
};