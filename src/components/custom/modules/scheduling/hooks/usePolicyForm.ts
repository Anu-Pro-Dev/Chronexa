import * as z from "zod";

export const policyFormSchema = z.object({
    show_on_report: z.enum(['first-in-last-out', 'all-transactions']),
    email_notification: z.enum(['first-in-last-out', 'all-transactions']),
    calculate_worked_hrs_flag: z.boolean(),
    default_overtime_flag: z.boolean(),
    default_break_hrs_flag: z.boolean(),
    override_schedule_on_holiday_flag: z.boolean(),
    reduce_required_hrs_flag: z.boolean(),
});