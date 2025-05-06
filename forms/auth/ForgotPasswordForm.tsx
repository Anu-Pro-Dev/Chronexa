"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn, getRandomInt } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { USER_TOKEN } from "@/utils/constants";
import { useRouter } from "next/navigation";
import Required from "@/components/ui/required";
import toast from "react-hot-toast";
import { forgotPasswordRequest } from "@/lib/apiHandler";

const formSchema = z.object({
  username: z
    .string()
    .min(1, {
      message: "Username is required.",
    })
    .max(100),
});

export default function ForgotPassword() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const router = useRouter();
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const employeeId = Number(values.username);
  
      if (isNaN(employeeId)) {
        toast.error("Username must be a number.");
        return;
      }
  
      await forgotPasswordRequest(employeeId);
  
      toast.success("Password reset link sent to your registered email.");
      router.push("/");
    } catch (error) {
      console.error("Forgot password error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred.");
      }
    }
  }
  

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <h1 className="text-center text-xl font-bold">Forgot your password?</h1>
            <p className="text-center text-sm font-semibold text-text-secondary">It's okay! Reset your password.</p>
          </div>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Username <Required />
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your username"
                    type="text"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="mt-4 flex gap-2 justify-center">
            <Button size={"lg"} variant={"outline"} className="w-auto" onClick={() => router.push('/')}>Cancel</Button>
            <Button type="submit" size={"lg"} className="w-auto">Submit</Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
