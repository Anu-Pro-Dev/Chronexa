"use client";
import { useEffect, useState } from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn, getRandomInt } from "@/src/utils/utils";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";

import { useRouter } from "next/navigation";

import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Calendar } from "@/src/components/ui/calendar";
import { format } from "date-fns";

const formSchema = z.object({
  to_date: z.date({
    required_error: "To Date is required.",
  }),
  from_date: z.date({
    required_error: "From Date is required.",
  }),
});

export default function FilterEmailForm({
  on_open_change,
}: {
  on_open_change: any;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const router = useRouter();
  const { translations } = useLanguage();
  const [popoverStates, setPopoverStates] = useState({
    fromDate: false,
    toDate: false,
  });

  const closePopover = (key: string) => {
    setPopoverStates(prev => ({ ...prev, [key]: false }));
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      on_open_change(false);
    } catch (error) {
      console.error("Form submission error", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="">
        <div className="flex flex-col gap-4  ">
          <div>
            <FormField
              control={form.control}
              name="from_date"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>From Date</FormLabel>
                  <Popover open={popoverStates.fromDate} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, fromDate: open }))}>
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
                        onSelect={(date) => {
                          field.onChange(date)
                          closePopover('fromDate')
                        }}
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
                  <Popover open={popoverStates.toDate} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, toDate: open }))}>
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
                        onSelect={(date) => {
                          field.onChange(date)
                          closePopover('toDate')
                        }}
                      />
                    </PopoverContent>
                  </Popover>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className=" col-span-2 flex justify-end">
            <div className="flex  gap-2 ">
              <Button
                variant={"outline"}
                type="button"
                size={"lg"}
                className=" px-10 "
                onClick={() => on_open_change(false)}
              >
                {translations.buttons.cancel}
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
