"use client";
import { useState } from "react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import Required from "@/components/ui/required"
import { useRouter } from "next/navigation"
import { CalendarIcon } from "@/icons/icons"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"



export default function credentialsForm({
  Page, SetPage,credentialsFormSchema,credentialsForm
}: {
  Page?: any;
  SetPage?:any;
  credentialsFormSchema:any;
  credentialsForm:any
}) {
 

  function onSubmit(values: z.infer<typeof credentialsFormSchema>) {
    try {
      console.log(values)
      SetPage("business-form")
      console.log(1)
      toast(
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-accent">{JSON.stringify(values, null, 2)}</code>
        </pre>
      );
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  const router = useRouter();
  const [step, setStep] = useState(1);

  function generateRandomPassword(length = 12) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~";
    let password = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      password += charset.charAt(Math.floor(Math.random() * n));
    }
    return password;
  }  

  return (
    <Form {...credentialsForm}>
      <form onSubmit={credentialsForm.handleSubmit(onSubmit)}>
        <div className="grid gap-y-2 px-6">
          <FormField
            control={credentialsForm.control}
            name="username"
            render={({ field }) => (
                <FormItem className="flex gap-5 items-center">
                  <div className="">
                    <FormLabel className="">Username <Required /></FormLabel>
                  </div>
                  <div>
                    <FormControl>
                      <Input placeholder="Enter the username" type="text" {...field} />
                    </FormControl>
                    <FormMessage className="mt-1"/>
                  </div>
              </FormItem>
            )}
          />
  
          <FormField
            control={credentialsForm.control}
            name="password"
            render={({ field }) => (
              <FormItem className="flex gap-5 items-center">
                <div className="">
                  <FormLabel className="">Password <Required /></FormLabel>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-3">
                    <FormControl>
                      <Input
                        placeholder="Click 'Create Password'"
                        type="text"
                        {...field}
                        readOnly
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant={"gradient"}
                      className="text-sm"
                      onClick={() => {
                        const newPassword = generateRandomPassword();
                        credentialsForm.setValue("password", newPassword);
                        toast.success("Password generated!");
                      }}
                    >
                      Create Password
                    </Button>
                  </div>
                  <FormMessage className="mt-1" />
                </div>
              </FormItem>
            )}
          />

        </div>
        <div className="flex justify-end gap-2 items-center py-5">
          <div className="flex gap-4 px-5">
            <Button
              variant={"outline"}
              type="button"
              size={"lg"}
              className="w-full"
              onClick={() => setStep((prev) => prev - 1)}
            >
              Back
            </Button>
            <Button type="submit" size={"lg"} className="w-full">
              Next
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
