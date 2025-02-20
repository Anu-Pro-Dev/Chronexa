"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Required from "@/components/ui/required";
import { useRouter } from "next/navigation";
import { CalendarIcon } from "@/icons/icons";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

const formSchema = z.object({
  organization: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  code: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  card_number: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  pin: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  username: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  password: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  name_en: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  name_ar: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  mobile: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  sex: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  email: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  remarks: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  employee_system_activation: z.date({
    required_error: "Employee system activation Date is required.",
  }),
  join_date: z.date({
    required_error: "Join Date is required.",
  }),
  inactive_date: z.date({
    required_error: "Inactive Date is required.",
  }),
});

export default function PersonalForm({
  on_open_change,
}: {
  on_open_change?: any;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organization: "",
      code: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(values);
      toast(
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      );
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  const router = useRouter();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex justify-evenly gap-10 p-5">
          <div className="flex flex-col flex-1 items-end">
            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
              <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                  <div className="flex justify-end pr-2">
                    <FormLabel className="flex gap-1">Organization <Required/> </FormLabel>
                  </div>
                  <div>
                    <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    >
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Choose organization" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="1">organization 1</SelectItem>
                    </SelectContent>
                    </Select>
                    <FormMessage className="mt-1"/>
                  </div>
              </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="card_number"
              render={({ field }) => (
                  <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                    <div className="flex justify-end pr-2">
                      <FormLabel className="flex gap-1"> Card <Required /></FormLabel>
                    </div>
                    <div>
                      <FormControl>
                        <Input placeholder="Enter the card number" type="text" {...field} />
                      </FormControl>
                      <FormMessage className="mt-1"/>
                    </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                  <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                    <div className="flex justify-end pr-2">
                      <FormLabel className="flex gap-1">Username <Required /></FormLabel>
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
              control={form.control}
              name="name_en"
              render={({ field }) => (
                <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                  <div className="flex justify-end pr-2">
                    <FormLabel className="flex gap-1">Name (English) <Required /></FormLabel>
                  </div>
                  <div>
                    <FormControl>
                      <Input placeholder="Enter the name in english" type="text" {...field} />
                    </FormControl>
                    <FormMessage className="mt-1"/>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                  <div className="flex justify-end pr-2">
                    <FormLabel className="flex gap-1">Mobile</FormLabel>
                  </div>  
                  <div>
                    <FormControl>
                      <Input placeholder="Enter the mobile number" type="text" {...field} />
                    </FormControl>
                    <FormMessage className="mt-1"/>
                  </div>  
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                  <div className="flex justify-end pr-2">
                    <FormLabel className="flex gap-1">Email</FormLabel>
                  </div>
                  <div>
                    <FormControl>
                      <Input placeholder="Enter the email address" type="text" {...field} />
                    </FormControl>
                    <FormMessage className="mt-1"/>
                  </div>  
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                  <div className="flex justify-end pr-2">
                    <FormLabel className="flex gap-1">Remarks</FormLabel>
                  </div>
                  <div>
                    <FormControl>
                      <Input placeholder="Enter remarks" type="text" {...field} />
                    </FormControl>
                    <FormMessage className="mt-1"/>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employee_system_activation"
              render={({ field }) => (
                <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                  <div className="flex justify-end pr-2">
                    <FormLabel className="flex gap-1 text-right">Employee system activation</FormLabel>
                  </div>
                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button size={"lg"} variant={"outline"}
                            className="w-full bg-white px-3 flex justify-between text-text-primary"
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yy")
                            ) : (
                              <span className="font-normal text-sm text-text-secondary">Choose date</span>
                            )}
                            <CalendarIcon />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          // disabled={(date) =>
                          //   date > new Date() || date < new Date("1900-01-01")
                          // }
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="mt-1"/>
                  </div>
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col flex-1 items-end">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                  <div className="flex justify-end pr-2">
                    <FormLabel className="flex gap-1">Code <Required /></FormLabel>
                  </div>
                  <div>
                    <FormControl>
                    <Input placeholder="Enter the code" type="text" {...field} />
                    </FormControl>
                    <FormMessage className="mt-1"/>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pin"
              render={({ field }) => (
                <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                  <div className="flex justify-end pr-2">
                    <FormLabel className="flex gap-1">Pin</FormLabel>
                  </div>
                  <div>
                    <FormControl>
                      <Input placeholder="Enter the pin" type="text" {...field} />
                    </FormControl>
                    <FormMessage className="mt-1"/>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                  <div className="flex justify-end pr-2">
                    <FormLabel className="flex gap-1">Password <Required /></FormLabel>
                  </div>
                  <div>
                    <FormControl>
                      <Input placeholder="Enter the password" type="text" {...field} />
                    </FormControl>
                    <FormMessage className="mt-1"/>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name_ar"
              render={({ field }) => (
                <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                  <div className="flex justify-end pr-2">
                    <FormLabel className="flex gap-1">Name (العربية) <Required /></FormLabel>
                  </div>
                  <div> 
                    <FormControl>
                      <Input placeholder="Enter the name in arabic" type="text" {...field} />
                    </FormControl>
                    <FormMessage className="mt-1"/>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sex"
              render={({ field }) => (
                <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                  <div className="flex justify-end pr-2">
                    <FormLabel className="flex gap-1">Sex <Required/></FormLabel>
                  </div>
                  <div>
                    <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    >
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Choose Sex" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="1">Female</SelectItem>
                        <SelectItem value="2">Male</SelectItem>
                    </SelectContent>
                    </Select>
                    <FormMessage className="mt-1"/>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="join_date"
              render={({ field }) => (
                <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                  <div className="flex justify-end pr-2">
                    <FormLabel className="flex gap-1">Join date</FormLabel>
                  </div>
                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button size={"lg"} variant={"outline"}
                            className="w-full bg-white px-3 flex justify-between text-text-primary"
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yy")
                            ) : (
                              <span className="font-normal text-sm text-text-secondary">Choose date</span>
                            )}
                            <CalendarIcon />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          // disabled={(date) =>
                          //   date > new Date() || date < new Date("1900-01-01")
                          // }
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="mt-1"/>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="inactive_date"
              render={({ field }) => (
                <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                  <div className="flex justify-end pr-2">
                    <FormLabel className="flex gap-1">Inactive date</FormLabel>
                  </div>
                  <div> 
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button size={"lg"} variant={"outline"}
                            className="w-full bg-white px-3 flex justify-between text-text-primary"
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yy")
                            ) : (
                              <span className="font-normal text-sm text-text-secondary">Choose date</span>
                            )}
                            <CalendarIcon />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          // disabled={(date) =>
                          //   date > new Date() || date < new Date("1900-01-01")
                          // }
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="mt-1"/>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 items-center py-5">
          <div className="flex gap-4 px-5">
            <Button
              variant={"outline"}
              type="button"
              size={"lg"}
              className="w-full"
              onClick={() => router.push("/employee-master/employees")}
            >
              Cancel
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
