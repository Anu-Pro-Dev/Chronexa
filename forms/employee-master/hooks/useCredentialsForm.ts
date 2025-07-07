// forms/employee-master/hooks/useCredentialsForm.ts
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

export const credentialsFormSchema = z.object({
  username: z.string().min(6, "Username must be at least 6 characters").max(25),
  password: z.string().min(8, "Password must be at least 8 characters").max(20),
});

export const useCredentialsForm = () => {
  const form = useForm<z.infer<typeof credentialsFormSchema>>({
    resolver: zodResolver(credentialsFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  return { form, schema: credentialsFormSchema };
};
