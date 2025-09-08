"use client";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/src/utils/utils";
import { Button } from "@/src/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/src/components/ui/select";

import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Calendar } from "@/src/components/ui/calendar";
import { CalendarIcon, ClockIcon } from "@/src/icons/icons";
import { format } from "date-fns";
import { TimePicker } from "@/src/components/ui/time-picker";
import Required from "@/src/components/ui/required";
import { Checkbox } from "@/src/components/ui/checkbox";
import { useLanguage } from "@/src/providers/LanguageProvider"

const formSchema = z.object({
    from_date: z.date().optional(),
    to_date: z.date().optional(),
    organization:z.string().optional(),
    manager:z.string().optional(),
    employee:z.string().optional(),
    type:z.string().optional(),
  });


export default function FilterPendingApproval ({
    on_open_change,
  }: {
    on_open_change: any;
  }){
const { translations } = useLanguage();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        organization:""
    },
  });


  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
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
                    <h1 className="font-bold text-xl text-primary pb-2">Filter</h1>
                    <h1 className="font-semibold text-sm text-text-secondary pb-2">
                    Choose the Filters for easy search
                    </h1>
                </div>
                </div>
                <div className="flex flex-col gap-3">
                    <div className="grid sm:grid-cols-2 gap-y-10 gap-x-16 md:px-5 [&>*]:max-w-[350px] [&>*:nth-child(2n)]:justify-self-end md:[&>*:nth-child(2n)]:min-w-[350px]">

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
                                        <SelectValue placeholder="Choose any one" />
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
                                        <SelectValue placeholder="Choose any one" />
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
                                        <SelectValue placeholder="Choose any one" />
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
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Type</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose any one" />
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
                                From Date 
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
                                To Date 
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
                            {translations.buttons.cancel}
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