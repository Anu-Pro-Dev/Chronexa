"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
    show_on_report: z.enum(['first-in-last-out', 'all-transactions']),
    email_notification: z.enum(['first-in-last-out', 'all-transactions']),
    calculate_hours: z.boolean(),
    enable_overtime: z.boolean(),
    enable_break: z.boolean(),
    override_schedule: z.boolean(),
    reduce_required_hours: z.boolean(),
});

export default function PolicyForm({
  on_open_change,
}: {
  on_open_change?: any;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(values);
      toast(
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
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
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex p-5">
            <div className="flex flex-col gap-6 items-start">
                <FormField
                    control={form.control}
                    name="show_on_report"
                    render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <div className="flex items-center gap-2">
                                <FormLabel htmlFor="show_on_report" className="text-sm font-semibold mr-4 w-32">Show on report : </FormLabel>
                                <RadioGroup
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    className="flex justify-center items-center gap-6"
                                    >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="first-in-last-out" id="show-first" />
                                        <Label htmlFor="show-first" className="text-sm">First IN/Last Out</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="all-transactions" id="show-all" />
                                        <Label htmlFor="show-all" className="text-sm">All Transactions</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </FormControl>
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email_notification"
                    render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <div className="flex items-center gap-2">
                                <FormLabel htmlFor="email_notification" className="text-sm font-semibold mr-4 w-32">Email notification : </FormLabel>
                                <RadioGroup
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    className="flex justify-center items-center gap-6"
                                    >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="first-in-last-out" id="show-first" />
                                        <Label htmlFor="show-first" className="text-sm">First IN/Last Out</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="all-transactions" id="show-all" />
                                        <Label htmlFor="show-all" className="text-sm">All Transactions</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </FormControl>
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="calculate_hours"
                    render={({ field }) => (
                    <FormItem className=" ">
                    <FormControl>
                        <div className="flex items-center gap-2">
                            <Checkbox
                            id="calculate_hours"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                            <FormLabel htmlFor="calculate_hours" className="text-sm font-semibold">Calculate Worked Hours From Schedule Start Time</FormLabel>
                        </div>
                    </FormControl>
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="enable_overtime"
                    render={({ field }) => (
                    <FormItem className=" ">
                    <FormControl>
                    <div className="flex items-center gap-2">
                        <Checkbox
                        id="enable_overtime"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                        <FormLabel htmlFor="enable_overtime" className="text-sm font-semibold">Enable Default Overtime</FormLabel>
                    </div>
                    </FormControl>
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="enable_break"
                    render={({ field }) => (
                    <FormItem className=" ">
                    <FormControl>
                    <div className="flex items-center gap-2">
                        <Checkbox
                        id="enable_break"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                        <FormLabel htmlFor="enable_break" className="text-sm font-semibold"> Enable Default Break Hours</FormLabel>
                    </div>
                    </FormControl>
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="override_schedule"
                    render={({ field }) => (
                    <FormItem className=" ">
                    <FormControl>
                    <div className="flex items-center gap-2">
                        <Checkbox
                        id="override_schedule"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                        <FormLabel htmlFor="override_schedule" className="text-sm font-semibold">Overide Schedule On Holiday</FormLabel>
                    </div>
                    </FormControl>
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="reduce_required_hours"
                    render={({ field }) => (
                    <FormItem className=" ">
                    <FormControl>
                    <div className="flex items-center gap-2">
                        <Checkbox
                        id="reduce_required_hours"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                        <FormLabel htmlFor="reduce_required_hours" className="text-sm font-semibold">Reduce Required Hours if Personal Permission is approved</FormLabel>
                    </div>
                    </FormControl>
                    </FormItem>
                    )}
                />
            </div>
        </div>
        <div className="flex justify-end gap-2 items-center py-5">
          <div className="flex gap-4 px-5">
            <Button
              variant={"outline"}
              type="button"
              size={"lg"}
              className="w-full"
              onClick={() => router.push("/TA-master/schedules/")}
            >
              Cancel
            </Button>
            <Button type="submit" size={"lg"} className="w-full">
              Next
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
