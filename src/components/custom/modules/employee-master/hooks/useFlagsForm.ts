import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

export const flagsFormSchema = z.object({
  active_flag: z.boolean(),
  punch_flag: z.boolean(),
  overtime_flag: z.boolean(),
  inpayroll_flag: z.boolean(),
  email_notification_flag: z.boolean(),
  open_shift_flag: z.boolean(),
  calculate_monthly_missed_hrs_flag: z.boolean(),
  exclude_from_integration_flag: z.boolean(),
  shift_flag: z.boolean(),
  on_reports_flag: z.boolean(),
  share_roster_flag: z.boolean(),
  include_email_flag: z.boolean(),
  web_punch_flag: z.boolean(),
  check_inout_selfie_flag: z.boolean(),
  geofench_flag: z.boolean(),
  SAP_user_flag: z.boolean(),
  local_user_flag: z.boolean(),
});

export const useFlagsForm = () => {
  const form = useForm<z.infer<typeof flagsFormSchema>>({
    resolver: zodResolver(flagsFormSchema),
    defaultValues: {
      active_flag: true,
      punch_flag: true,
      overtime_flag: false,
      inpayroll_flag: false,
      email_notification_flag: false,
      open_shift_flag: false,
      calculate_monthly_missed_hrs_flag: false,
      exclude_from_integration_flag: false,
      shift_flag: false,
      on_reports_flag: true,
      share_roster_flag: false,
      include_email_flag: false,
      web_punch_flag: false,
      check_inout_selfie_flag: false,
      geofench_flag: false,
      SAP_user_flag: false,
      local_user_flag: false,
    },
  });

  return { form, schema: flagsFormSchema };
};
