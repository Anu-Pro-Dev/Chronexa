"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "@/icons/icons";
import Required from "@/components/ui/required";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  employee: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  leave_types: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  from_date: z.date({
    required_error: "From Date is required.",
  }),
  to_date: z.date({
    required_error: "To Date is required.",
  }),
  attachment: z.custom<any>(
    (value) => {
      if (!(value instanceof File)) {
        return false; // Ensure the value is a File object
      }
      // Validate file size (e.g., max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (value.size > maxSize) {
        return false;
      }

      // Validate file type (e.g., allow only documents)
      const allowedTypes = ["application/pdf", "application/msword"];
      if (!allowedTypes.includes(value.type)) {
        return false;
      }

      return true;
    },
    {
      message:
        "Invalid file. Ensure it's an document (PDF/DOC) and less than 5MB.",
    }
  ),
  comments: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(500, {
      message: "Maximum 500 characters only allowed",
    }),
});

export default function AddLeaveApplication({
  on_open_change,
}: {
  on_open_change?: any;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee: "",
      leave_types: "",
      attachment: "",
      comments: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(values);
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="bg-accent p-6 rounded-2xl">
        <div className="pb-3">
          <h1 className="font-bold text-xl text-primary">Leave Application</h1>
          <h1 className="font-semibold text-sm text-text-secondary">
            Fill the leave application form
          </h1>
        </div>
        <div className="flex flex-col gap-6">
          <div className="grid sm:grid-cols-2 gap-y-3 gap-x-16 md:px-5 py-5 [&>*]:max-w-[350px] [&>*:nth-child(2n)]:justify-self-end md:[&>*:nth-child(2n)]:min-w-[350px]">
            <FormField
              control={form.control}
              name="employee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Employee <Required />
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Emp 109</SelectItem>
                      <SelectItem value="2">OG123</SelectItem>
                      <SelectItem value="3">Emp 213</SelectItem>
                      <SelectItem value="4">Employee 02</SelectItem>
                    </SelectContent>
                  </Select>


                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="leave_types"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leave types <Required /></FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose leave types" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Annual leave</SelectItem>
                      <SelectItem value="2">Sick leave</SelectItem>
                      <SelectItem value="3">Medical leave</SelectItem>
                      <SelectItem value="4">Maternity leave</SelectItem>
                      <SelectItem value="5">Vacation</SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="from_date"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>
                    From Date <Required />
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button size={"lg"} variant={"outline"}
                          className="w-full bg-accent px-3 flex justify-between text-text-primary"
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

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="to_date"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>
                    To Date <Required />
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button size={"lg"} variant={"outline"}
                          className="w-full bg-accent px-3 flex justify-between text-text-primary"
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

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="attachment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Attachment
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="border-0 p-0 rounded-none h-auto text-text-secondary"
                      type="file"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comments </FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add the comments here" {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end gap-2 items-center pb-5">
            <div className="flex gap-4 px-5">
              <Button
                variant={"outline"}
                type="button"
                size={"lg"}
                className="w-full"
                onClick={() => router.push("/self-services/manage-leaves/leave-application")}
              >
                Cancel
              </Button>
              <Button type="submit" size={"lg"} className="w-full">
                Apply
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
