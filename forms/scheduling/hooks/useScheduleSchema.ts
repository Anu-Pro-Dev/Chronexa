import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import * as z from "zod";

import { normalFormSchema } from "./useNormalForm";
import { policyFormSchema } from "./usePolicyForm";
import { useScheduleEditStore } from "@/stores/scheduleEditStore";

// Merge schemas
export const scheduleFormSchema = normalFormSchema.merge(policyFormSchema);

export const useScheduleForm = () => {
  const selectedRowData = useScheduleEditStore((state) => state.selectedRowData);

  const form = useForm<z.infer<typeof scheduleFormSchema>>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      // fallback default values for Add mode
      schedule_code: "",
      schedule_location: undefined,
      organization_id: undefined,
      in_time: null,
      out_time: null,
      sch_color: "",
      required_work_hours: "",
      open_shift_flag: false,
      night_shift_flag: false,
      ramadan_flag: false,
      flexible_min: undefined,
      grace_in_min: undefined,
      grace_out_min: undefined,
      inactive_date: null,
      show_on_report: "first-in-last-out",
      email_notification: "first-in-last-out",
      calculate_worked_hrs_flag: false,
      default_overtime_flag: false,
      default_break_hrs_flag: false,
      override_schedule_on_holiday_flag: false,
      reduce_required_hrs_flag: false,
    },
  });

  function parseTimeStringToDate(timeStr: string | null): Date | null {
    if (!timeStr) return null;
    const [hours, minutes, seconds] = timeStr.split(":").map(Number);
    if (
      isNaN(hours) ||
      isNaN(minutes) ||
      isNaN(seconds)
    ) return null;

    const date = new Date();
    date.setHours(hours, minutes, seconds, 0);
    return date;
  }

  // 🔁 Reset form with selected row data when editing
  useEffect(() => {
    if (selectedRowData) {
      console.log("Resetting form with selectedRowData:", selectedRowData);
      form.reset({
        ...selectedRowData,
        organization_id: Number(selectedRowData.organization_id),
        schedule_location: Number(selectedRowData.schedule_location),
        in_time: parseTimeStringToDate(selectedRowData.in_time),
        out_time: parseTimeStringToDate(selectedRowData.out_time),
        inactive_date: selectedRowData.inactive_date ? new Date(selectedRowData.inactive_date) : null,
      });
    }
  }, [selectedRowData, form]);

  useEffect(() => {
    if (!selectedRowData?.schedule_id) {
      form.reset(); // reset to default values
    }
  }, []);

  return { form, schema: scheduleFormSchema, selectedRowData };
};
