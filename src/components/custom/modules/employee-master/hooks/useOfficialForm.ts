import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

export const officialFormSchema = z.object({
  employee_type_id: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number({ required_error: "employee_type_required" })
  ),
  location_id: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number({ required_error: "location_required" })
  ),
  citizenship_id: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number({ required_error: "citizenship_required" })
  ),
  designation_id: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number({ required_error: "designation_required" })
  ),
  organization_id: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number({ required_error: "organization_required" })
  ),
  grade_id: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().optional()
  ),
  manager_id: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().optional()
  ),
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