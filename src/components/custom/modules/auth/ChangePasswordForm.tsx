"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { useRouter } from "next/navigation";
import Required from "@/src/components/ui/required";
import { resetPasswordRequest, logoutRequest } from "@/src/lib/apiHandler";

const formSchema = z.object({
  new_password: z
    .string()
    .min(6, {
      message: "Password must be at least 6 characters.",
    })
    .max(100),
});

export default function ChangePasswordForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      new_password: "",
    },
  });

  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await resetPasswordRequest(values.new_password);

      alert("Password changed successfully. Please log in again.");
      
      logoutRequest(); 
      router.push("/");
    } catch (error) {
      console.error("Password reset error", error);
      alert("Failed to reset password. Please try again.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="">
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="new_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  New Password <Required />
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your new password"
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="">
            <Button className="w-full" type="submit">
              Submit
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
