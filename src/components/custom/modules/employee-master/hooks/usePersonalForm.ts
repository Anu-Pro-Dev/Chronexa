import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

export const personalFormSchema = z.object({
  emp_no: z.string().min(1, { message: "emp_no_required" }).max(100),
  firstname: z.string().min(1, { message: "firstname_required" }),
  lastname: z.string().min(1, { message: "lastname_required" }),
  mobile: z.string().optional(),
  email: z.string().nullable().optional(),
  join_date: z.date().nullable().optional(),
  active_date: z.date().nullable().optional(),
  inactive_date: z.date().nullable().optional(),
  card_number: z.string().optional(),
  pin: z.string().optional(),
  gender: z.string().optional(),
  passport_number: z.string().optional(),
  passport_expiry_date: z.date().nullable().optional(),
  passport_issue_country_id: z.number().optional(),
  national_id: z.string().optional(),
  national_id_expiry_date: z.date().nullable().optional(),
  remarks: z.string().optional(),
});

export const usePersonalForm = () => {
  const form = useForm<z.infer<typeof personalFormSchema>>({
    resolver: zodResolver(personalFormSchema),
    defaultValues: {
      emp_no: "",
      firstname: "",
      lastname: "",
      mobile: "",
      email: "",
      join_date: undefined,
      active_date: undefined,
      card_number: "",
      pin: "",
      gender: "",
      passport_number: "",
      passport_expiry_date: undefined,
      passport_issue_country_id: undefined,
      national_id: "",
      national_id_expiry_date: undefined,
      remarks: "",
      inactive_date: undefined,
    },
  });

  return { form, schema: personalFormSchema };
};