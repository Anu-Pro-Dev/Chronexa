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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import Required from "@/components/ui/required";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActionIcon, CalendarIcon, ExclamationIcon } from "@/icons/icons";
import { Checkbox } from "@/components/ui/checkbox";
import ReprocessDataTakeAction from "@/forms/reports/ReprocessDataTakeAction";

const formSchema = z.object({
  employee: z
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
  from_date: z.date({
    required_error: "From Date is required.",
  }),
  to_date: z.date({
    required_error: "To Date is required.",
  }),
  delete_verification: z.boolean(),
});

export default function ReprocessData() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [open, on_open_change] = useState<boolean>(false);
  
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="bg-accent p-6 rounded-2xl relative">
        <div className="pb-3">
          <h1 className="font-bold text-xl text-primary">Reprocess data</h1>
          {/* <h1 className="font-semibold text-sm text-text-secondary">
            Select the choices for reprocess the data
          </h1> */}
        </div>
        <div className="absolute top-6 right-10">
          {!form.watch("employee") && (
            <p className="text-sm text-destructive mt-2 border border-red-200 rounded-md px-2 py-1 font-semibold bg-red-400 bg-opacity-10 flex items-center ">
              <ExclamationIcon className="mr-2" /> Select atleast one employee
            </p>
          )}
        </div>
        <div className="flex flex-col gap-6">
          <div className="p-5 flex flex-col pb-0">
            <div className="flex justify-between items-start gap-10">
              <div className="flex flex-col flex-1 max-w-[350px] gap-5">
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
                  name="delete_verification"
                  render={({ field }) => (
                    <FormItem className=" ">
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="delete_verification"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <FormLabel htmlFor="inactive" className="text-sm font-semibold">Delete verifications</FormLabel>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col flex-1 max-w-[350px] gap-5">
                <FormField
                  control={form.control}
                  name="organization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization <Required /></FormLabel>
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
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 items-center pb-5">
            <div className="flex gap-4 px-5">
              <Button type="submit" size={"sm"} variant={"destructive"} onClick={() => setIsModalOpen(true)}>
                <ActionIcon/>
                Take Action
              </Button>
            </div>
          </div>
          {isModalOpen && (
            <ReprocessDataTakeAction
              modal_props={{
                open: isModalOpen,
                on_open_change: setIsModalOpen,
              }}
            />
          )}
        </div>
      </form>
    </Form>
  );
}
