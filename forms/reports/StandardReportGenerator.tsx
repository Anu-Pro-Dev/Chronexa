"use client";
import { useEffect, useState } from "react";

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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { USER_TOKEN } from "@/lib/Instance";
import { useRouter } from "next/navigation";
import Required from "@/components/ui/required";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { TimePicker12Demo } from "@/components/ui/time-picker-demo";
import { TimerIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ExportExcelIcon,
  ExportPDFIcon,
  ExportWordIcon,
  LogoutIcon,
} from "@/icons/icons";

const formSchema = z.object({
  reports: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  organization: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  manager: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  employee: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  employee_types: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  employee_group: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  to_date: z.date({
    required_error: "To Date is required.",
  }),
  from_date: z.date({
    required_error: "From Date is required.",
  }),
});

export default function StandardReportGenerator() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const router = useRouter();
  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(values);
    } catch (error) {
      console.error("Form submission error", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white p-6 rounded-2xl">
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="col-span-2">
            <h1 className="font-bold text-xl text-primary">Standard Reports</h1>
            <h1 className="font-semibold text-sm text-text-secondary">
              Select the Filter you want to view
            </h1>
          </div>
          <div>
            <FormField
              control={form.control}
              name="reports"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reports</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="choose any one" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 </SelectItem>
                      <SelectItem value="2">2</SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div>
            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="choose any one" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 </SelectItem>
                      <SelectItem value="2">2</SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div>
            <FormField
              control={form.control}
              name="manager"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manager</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="choose any one" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 </SelectItem>
                      <SelectItem value="2">2</SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div>
            <FormField
              control={form.control}
              name="employee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="choose any one" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 </SelectItem>
                      <SelectItem value="2">2</SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div>
            <FormField
              control={form.control}
              name="employee_types"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee Types</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="choose any one" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 </SelectItem>
                      <SelectItem value="2">2</SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div>
            <FormField
              control={form.control}
              name="employee_group"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee Group </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="choose any one" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 </SelectItem>
                      <SelectItem value="2">2</SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div>
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
                        <Button
                          className={cn(
                            "w-full pl-3 text-left font-normal bg-transparent border rounded-md text-black",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
          </div>
          <div>
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
                        <Button
                          className={cn(
                            "w-full pl-3 text-left font-normal bg-transparent border rounded-md text-black",
                            !field.value && ""
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
          </div>

          <div className="w-full flex gap-2 items-center col-span-2 justify-center">
            <Button size={"lg"} type="button">
              <div className="rotate-180">
                <LogoutIcon />
              </div>
              Show report
            </Button>

            <Button size={"lg"} variant="success" type="button">
              <ExportExcelIcon />
              Export to excel
            </Button>
            <Button size={"lg"} variant="destructive" type="button">
              <ExportPDFIcon />
              Export to PDF
            </Button>
            <Button size={"lg"} type="button">
              <ExportWordIcon />
              Export to Word
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
