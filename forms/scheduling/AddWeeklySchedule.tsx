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

import { useRouter } from "next/navigation";

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
import Required from "@/components/ui/required";
import { Input } from "@/components/ui/input";
const formSchema = z.object({
  to_date: z.date({
    required_error: "To Date is required.",
  }),
  from_date: z.date({
    required_error: "From Date is required.",
  }),

  schedule: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  sunday: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  monday: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  tuesday: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  wednesday: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  thursday: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  friday: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  saturday: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
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

      // Validate file type (e.g., allow only images)
      const allowedTypes = ["image/jpeg", "image/png"];
      if (!allowedTypes.includes(value.type)) {
        return false;
      }

      return true;
    },
    {
      message:
        "Invalid file. Ensure it's an image (JPEG/PNG) and less than 5MB.",
    }
  ),
});

export default function AddWeeklySchedule() {
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
        <div className="pb-3">
          <h1 className="font-bold text-xl text-primary">Scheduling</h1>
          <h1 className="font-semibold text-sm text-text-secondary">
            Select the choices for weekly schedule for employee
          </h1>
        </div>
        <div className="flex flex-col gap-6 px-5">
          <div className="p-5 grid grid-cols-2 gap-y-5 gap-x-20">
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
            <FormField
              control={form.control}
              name="schedule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Schedule <Required />
                  </FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose schedule" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Normal(08:00 - 16:00)</SelectItem>
                      <SelectItem value="2">Day(06:00 - 13:00)</SelectItem>
                      <SelectItem value="3">Night(22:00 - 06:00)</SelectItem>
                      <SelectItem value="4">Friday(07:30 - 12:00)</SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sunday"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Sunday 
                  </FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose schedule" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Normal(08:00 - 16:00)</SelectItem>
                      <SelectItem value="2">Day(06:00 - 13:00)</SelectItem>
                      <SelectItem value="3">Night(22:00 - 06:00)</SelectItem>
                      <SelectItem value="4">Friday(07:30 - 12:00)</SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="monday"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Monday 
                  </FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose schedule" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Normal(08:00 - 16:00)</SelectItem>
                      <SelectItem value="2">Day(06:00 - 13:00)</SelectItem>
                      <SelectItem value="3">Night(22:00 - 06:00)</SelectItem>
                      <SelectItem value="4">Friday(07:30 - 12:00)</SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tuesday"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tuesday 
                  </FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose schedule" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Normal(08:00 - 16:00)</SelectItem>
                      <SelectItem value="2">Day(06:00 - 13:00)</SelectItem>
                      <SelectItem value="3">Night(22:00 - 06:00)</SelectItem>
                      <SelectItem value="4">Friday(07:30 - 12:00)</SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="wednesday"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Wednesday 
                  </FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose schedule" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Normal(08:00 - 16:00)</SelectItem>
                      <SelectItem value="2">Day(06:00 - 13:00)</SelectItem>
                      <SelectItem value="3">Night(22:00 - 06:00)</SelectItem>
                      <SelectItem value="4">Friday(07:30 - 12:00)</SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="thursday"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Thursday 
                  </FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose schedule" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Normal(08:00 - 16:00)</SelectItem>
                      <SelectItem value="2">Day(06:00 - 13:00)</SelectItem>
                      <SelectItem value="3">Night(22:00 - 06:00)</SelectItem>
                      <SelectItem value="4">Friday(07:30 - 12:00)</SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="friday"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Friday 
                  </FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose schedule" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Normal(08:00 - 16:00)</SelectItem>
                      <SelectItem value="2">Day(06:00 - 13:00)</SelectItem>
                      <SelectItem value="3">Night(22:00 - 06:00)</SelectItem>
                      <SelectItem value="4">Friday(07:30 - 12:00)</SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="saturday"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Saturday 
                  </FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose schedule" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Normal(08:00 - 16:00)</SelectItem>
                      <SelectItem value="2">Day(06:00 - 13:00)</SelectItem>
                      <SelectItem value="3">Night(22:00 - 06:00)</SelectItem>
                      <SelectItem value="4">Friday(07:30 - 12:00)</SelectItem>
                    </SelectContent>
                  </Select>

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
                    Attachment <Required/>
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
          </div>
        </div>
        <div className="flex justify-end gap-2 items-center py-5 px-5">
          <div className="flex gap-4 px-5">
            <Button
              variant={"outline"}
              type="button"
              size={"lg"}
              className="w-full"
              onClick={() => router.push("/scheduling/weekly-schedule")}
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
