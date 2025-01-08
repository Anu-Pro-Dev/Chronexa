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
import { CalendarIcon } from "@radix-ui/react-icons";
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="">
        <div className="grid grid-cols-2 gap-6  ">
          <div>
            <FormField
              control={form.control}
              name="from_date"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>From Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal rounded-2xl",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Enter the date</span>
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
                  <FormLabel>To Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal rounded-2xl",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Enter the date</span>
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
                      <SelectValue placeholder="choose any one" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Time Groups </SelectItem>
                    <SelectItem value="2">WorK Groups</SelectItem>
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
                  Sunday <Required />
                </FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="choose any one" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Time Groups </SelectItem>
                    <SelectItem value="2">WorK Groups</SelectItem>
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
                  Monday <Required />
                </FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="choose any one" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Time Groups </SelectItem>
                    <SelectItem value="2">WorK Groups</SelectItem>
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
                  Tuesday <Required />
                </FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="choose any one" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Time Groups </SelectItem>
                    <SelectItem value="2">WorK Groups</SelectItem>
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
                  Wednesday <Required />
                </FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="choose any one" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Time Groups </SelectItem>
                    <SelectItem value="2">WorK Groups</SelectItem>
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
                  Thursday <Required />
                </FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="choose any one" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Time Groups </SelectItem>
                    <SelectItem value="2">WorK Groups</SelectItem>
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
                  Friday <Required />
                </FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="choose any one" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Time Groups </SelectItem>
                    <SelectItem value="2">WorK Groups</SelectItem>
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
                  Saturday <Required />
                </FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="choose any one" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Time Groups </SelectItem>
                    <SelectItem value="2">WorK Groups</SelectItem>
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
              <FormItem className="flex items-center gap-2">
                <FormLabel className="flex text-nowrap">
                  Attachment <Required />
                </FormLabel>
                <FormControl>
                  <Input
                    className="pt-2"
                    placeholder="Enter your Code"
                    type="file"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className=" col-span-2 flex justify-end">
            <div className="flex  gap-2 ">
              <Button
                variant={"outline"}
                type="button"
                size={"lg"}
                className=" px-10 "
                onClick={() => router.push("/scheduling/weekly-schedule")}
              >
                Cancel
              </Button>
              <Button type="submit" size={"lg"} className=" px-10 ">
                Submit
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
