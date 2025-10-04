import * as z from "zod";

const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, "time_invalid")
  .or(z.literal(""))
  .nullable()
  .optional();

export const normalFormSchema = z.object({
  schedule_code: z.string().min(1, "schedule_code_required").max(100, "schedule_code_max"),
  schedule_location: z.coerce.number({
    required_error: "schedule_location_required",
    invalid_type_error: "schedule_location_invalid"
  }).positive("schedule_location_invalid"),
  organization_id: z.coerce.number({
    required_error: "organization_id_required",
    invalid_type_error: "organization_id_invalid"
  }).positive("organization_id_invalid"),
  in_time: z.string().min(1, "in_time_required").regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, "time_invalid"),
  out_time: z.string().min(1, "out_time_required").regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, "time_invalid"),
  sch_color: z.string().min(1, "sch_color_required"),
  required_work_hours: timeString,
  open_shift_flag: z.boolean().optional(),
  night_shift_flag: z.boolean().optional(),
  ramadan_flag: z.boolean().optional(),
  flexible_min: z.union([
    z.string().length(0),
    z.string().regex(/^\d+$/).transform(Number).pipe(z.number().nonnegative("flexible_min_invalid"))
  ]).optional(),
  grace_in_min: z.union([
    z.string().length(0),
    z.string().regex(/^\d+$/).transform(Number).pipe(z.number().nonnegative("grace_in_min_invalid"))
  ]).optional(),
  grace_out_min: z.union([
    z.string().length(0),
    z.string().regex(/^\d+$/).transform(Number).pipe(z.number().nonnegative("grace_out_min_invalid"))
  ]).optional(),
  inactive_date: z.date().nullable().optional(),
});