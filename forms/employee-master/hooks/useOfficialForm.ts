// forms/employee-master/hooks/useOfficialForm.ts
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

export const officialFormSchema = z.object({
  employee_type_id: z.coerce.number().optional(),
  location_id: z.coerce.number().optional(),
  citizenship_id: z.coerce.number().optional(),
  designation_id: z.coerce.number().optional(),
  grade_id: z.coerce.number().optional(),
  organization_id: z.coerce.number().optional(),
  manager_id: z.coerce.number().optional(),
  manager_flag: z.boolean(),
});

export const useOfficialForm = () => {
  const form = useForm<z.infer<typeof officialFormSchema>>({
    resolver: zodResolver(officialFormSchema),
    defaultValues: {
      employee_type_id: undefined,
      location_id: undefined,
      citizenship_id: undefined,
      designation_id: undefined,
      grade_id: undefined,
      organization_id: undefined,
      manager_id: undefined,
      manager_flag: false,
    },
  });

  return { form, schema: officialFormSchema };
};
