"use client";
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

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, ClockIcon } from "@/icons/icons";
import { format } from "date-fns";
import { TimePicker } from "@/components/ui/time-picker";
import Required from "@/components/ui/required";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
    from_date: z.date({
      required_error: "From Date is required.",
    }),
    to_date: z.date({
      required_error: "To Date is required.",
    }),
    from_time: z.date({
      required_error: "From Time is required.",
    }),
    to_time: z.date({
      required_error: "To Time is required.",
    }),
    individual_values: z.boolean().default(false),
  });


export default function FilterManualMovement ({
    on_open_change,
  }: {
    on_open_change: any;
  }){

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        individual_values: false, 
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

    return(
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="bg-accent rounded-2xl">
                <div className="flex justify-between">
                <div className="pb-6">
                    <h1 className="font-bold text-xl text-primary pb-2">Manual Movements Filter</h1>
                    <h1 className="font-semibold text-sm text-text-secondary pb-2">
                    Select the options of the Manual movements filter
                    </h1>
                </div>
                </div>
                <div className="flex flex-col gap-3">
                    <div className="grid sm:grid-cols-2 gap-y-10 gap-x-16 md:px-5 [&>*]:max-w-[350px] [&>*:nth-child(2n)]:justify-self-end md:[&>*:nth-child(2n)]:min-w-[350px]">
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
                                />
                                </PopoverContent>
                            </Popover>

                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="from_time"
                        render={({ field }) => (
                            <FormItem className="">
                            <FormLabel>From time <Required/></FormLabel>
                            <Popover>
                                <FormControl>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant="outline"
                                    className={cn(
                                        "flex justify-between h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                                        !field.value && "text-muted-foreground"
                                    )}
                                    >
                                    {field.value ? (
                                        format(field.value, "HH:mm")
                                    ) : (
                                        <span className="text-text-secondary">Choose time</span>
                                    )}
                                    <ClockIcon />
                                    </Button>
                                </PopoverTrigger>
                                </FormControl>
                                <PopoverContent className="w-auto p-0">
                                    <TimePicker
                                    setDate={field.onChange}
                                    date={field.value}
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="to_time"
                        render={({ field }) => (
                            <FormItem className="">
                            <FormLabel>To time <Required/></FormLabel>
                            <Popover>
                                <FormControl>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant="outline"
                                    className={cn(
                                        "flex justify-between h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                                        !field.value && "text-muted-foreground"
                                    )}
                                    >
                                    {field.value ? (
                                        format(field.value, "HH:mm")
                                    ) : (
                                        <span className="text-text-secondary">Choose time</span>
                                    )}
                                    <ClockIcon />
                                    </Button>
                                </PopoverTrigger>
                                </FormControl>
                                <PopoverContent className="w-auto p-0">
                                    <TimePicker
                                    setDate={field.onChange}
                                    date={field.value}
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                            control={form.control}
                            name="individual_values"
                            render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                                </FormControl>
                                <FormLabel className="font-normal">
                                Use individual values to process                                </FormLabel>
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
                            onClick={() => on_open_change(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" size={"lg"} className="w-full">
                            Filter
                        </Button>
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    )
}