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
import Link from "next/link";
import { USER_TOKEN } from "@/utils/constants";
import { useRouter } from "next/navigation";
import Required from "@/components/ui/required";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "@/icons/icons";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
const formSchema = z.object({
  remarks: z
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
});

export default function AddRamadanDateRange({
  on_open_change,
}: {
  on_open_change: any;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      descriptionEng: "",
      descriptionArb: "",
      remarks: "",
    },
  });

  const router = useRouter();
  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      return;
    } catch (error) {
      console.error("Form submission error", error);
    }
  }

  return (
    <Form {...form}>
       <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <div className="py-5 flex flex-col">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-16 gap-y-4">
              <FormField
                  control={form.control}
                  name="descriptionEng"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Ramadan Date (English) <Required />
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
                  name="descriptionArb"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Ramadan Date (العربية) <Required />
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
                              className="w-full max-w-[350px] bg-accent px-3 flex justify-between text-text-primary"
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
                              className="w-full max-w-[350px] bg-accent px-3 flex justify-between text-text-primary"
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
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the remark" type="text" {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 items-center pb-5">
          <div className="flex gap-4 px-5">
            <Button
              variant={"outline"}
              type="button"
              size={"lg"}
              className="w-full"
              onClick={() => on_open_change(false)}
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
