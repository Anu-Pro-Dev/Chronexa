import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, "time_invalid")
  .or(z.literal(""))
  .nullable()
  .optional();

// Ramadan-specific fields only
export const ramadanFormSchema = z.object({
  ramadan_in_time: z.string().min(1, "ramadan_in_time_required").regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, "time_invalid"),
  ramadan_out_time: z.string().min(1, "ramadan_out_time_required").regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, "time_invalid"),
  ramadan_break_time: timeString,
  ramadan_prayer_time: timeString,
  ramadan_flexible_min: z.union([
    z.string().length(0),
    z.string().regex(/^\d+$/).transform(Number).pipe(z.number().nonnegative("flexible_min_invalid"))
  ]).optional(),
  ramadan_grace_in_min: z.union([
    z.string().length(0),
    z.string().regex(/^\d+$/).transform(Number).pipe(z.number().nonnegative("grace_in_min_invalid"))
  ]).optional(),
  ramadan_grace_out_min: z.union([
    z.string().length(0),
    z.string().regex(/^\d+$/).transform(Number).pipe(z.number().nonnegative("grace_out_min_invalid"))
  ]).optional(),
});

export const useRamadanForm = () => {
  const form = useForm<z.infer<typeof ramadanFormSchema>>({
    resolver: zodResolver(ramadanFormSchema),
    defaultValues: {
      ramadan_in_time: "",
      ramadan_out_time: "",
      ramadan_break_time: "",
      ramadan_prayer_time: "",
      ramadan_flexible_min: undefined,
      ramadan_grace_in_min: undefined,
      ramadan_grace_out_min: undefined,
    },
  });

  return { form, schema: ramadanFormSchema };
};