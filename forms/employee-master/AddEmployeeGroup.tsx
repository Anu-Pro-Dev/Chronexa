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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { USER_TOKEN } from "@/lib/Instance";
import { useRouter } from "next/navigation";
import Required from "@/components/ui/required";
import { RefreshIcon } from "@/icons/icons";
import { IoMdRefresh } from "react-icons/io";
import { Textarea } from "@/components/ui/textarea";
import { DatePickerForm } from "@/components/ui/date-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "@/icons/icons";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  code: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  descriptionEng: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  descriptionArb: z
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
  schedule_flag: z.boolean().optional(),
  reporting_group: z.boolean().optional(),
  employee: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  refresh_member: z.boolean().optional(),
});

export default function AddEmployeeGroup() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      descriptionEng: "",
      descriptionArb: "",
    },
  });

  const router = useRouter();
  const reportingGroupChecked = form.watch("reporting_group");

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
        <div className="pb-3">
          <h1 className="font-bold text-xl text-primary">Employee groups</h1>
          <h1 className="font-semibold text-sm text-text-secondary">
            Select the choices for group of employee
          </h1>
        </div>
        <div className="flex flex-col gap-6">
          <div className="p-5 flex flex-col">
            <div className="flex gap-4 items-center pb-6">
              <FormField
                control={form.control}
                name="schedule_flag"
                render={({ field }) => (
                  <FormItem className=" ">
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="schedule_flag"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <FormLabel htmlFor="schedule_flag" className="text-sm font-semibold">Schedule flag</FormLabel>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reporting_group"
                render={({ field }) => (
                  <FormItem className=" ">
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="reporting_group"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <FormLabel htmlFor="reporting_group" className="text-sm font-semibold">Reporting group</FormLabel>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-between items-start gap-10">
              <div className="flex flex-col flex-1 max-w-[350px] gap-5">
                <FormField
                  control={form.control}
                  name="descriptionEng"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Description (English) <Required />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter description in english" type="text" {...field} />
                      </FormControl>

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

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Code <Required />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the code" type="text" {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col flex-1 max-w-[350px] gap-5">
                <FormField
                  control={form.control}
                  name="descriptionArb"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Description (العربية) <Required />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter description in arabic" type="text" {...field} />
                      </FormControl>

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

                      <FormMessage />
                    </FormItem>
                  )}
                />
                {reportingGroupChecked && (
                  <>
                    <FormField
                      control={form.control}
                      name="employee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employee <Required /></FormLabel>
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
                              <SelectItem value="1">1 </SelectItem>
                              <SelectItem value="2">2</SelectItem>
                            </SelectContent>
                          </Select>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="refresh_member"
                      render={({ field }) => (
                        <FormItem className=" ">
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id="refresh_member"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              <FormLabel htmlFor="refresh_member" className="text-sm font-semibold">Auto Refresh Membership by Organization</FormLabel>
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 items-center py-5">
          <div className="flex gap-4 px-5">
            <Button
              variant={"outline"}
              type="button"
              size={"lg"}
              className="w-full"
              onClick={() => router.push("/employee-master/employee-groups/")}
            >
              Cancel
            </Button>
            <Button type="submit" size={"lg"} className="w-full">
              Save
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
