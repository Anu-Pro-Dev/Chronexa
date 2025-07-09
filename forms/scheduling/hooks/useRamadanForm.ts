import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

export const ramadanFormSchema = z.object({
    schedule_code: z.string().min(1, "Required").max(100),
    schedule_location: z.coerce.number().optional(),
    organization_id: z.coerce.number().optional(),
    in_time: z.date().nullable().optional(),
    out_time: z.date().nullable().optional(),
    sch_color: z.string().optional(),
    required_work_hours: z.string().optional(),
    open_shift_flag: z.boolean().optional(),
    night_shift_flag: z.boolean().optional(),
    ramadan_flag: z.boolean().optional(),
    flexible_min: z.coerce.number().optional(),
    grace_in_min: z.coerce.number().optional(),
    grace_out_min: z.coerce.number().optional(),
    inactive_date: z.date().nullable().optional(),
});

export const useRamadanForm = () => {
  const form = useForm<z.infer<typeof ramadanFormSchema>>({
    resolver: zodResolver(ramadanFormSchema),
    defaultValues: {
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
    },
  });

  return { form, schema: ramadanFormSchema };
};
