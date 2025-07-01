// forms/employee-master/hooks/useOfficialForm.ts
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

export const officialFormSchema = z.object({
  employee_type_id: z.coerce.number(),
  location_id: z.coerce.number(),
  citizenship_id: z.coerce.number(),
  designation_id: z.coerce.number(),
  grade_id: z.coerce.number(),
  organization_id: z.coerce.number(),
  manager_id: z.coerce.number(),
  manager_flag: z.boolean(),
  created_id: z.number().optional(),
  last_updated_id: z.number().optional(),
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
