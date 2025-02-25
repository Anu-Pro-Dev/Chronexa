"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Required from "@/components/ui/required";
import { useRouter } from "next/navigation";
import { CalendarIcon, ClockIcon } from "@/icons/icons";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { TimePicker } from "@/components/ui/time-picker";
import { Checkbox } from "@/components/ui/checkbox";
import ColorPicker from "@/components/ui/color-picker";

const formSchema = z.object({
  organization: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  code: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  schedule_location: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  color: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  in_time_1: z.date({
    required_error: "In time is required.",
  }),
  out_time_1: z.date({
    required_error: "Out time is required.",
  }),
  in_time_2: z.date({
    required_error: "In time is required.",
  }),
  out_time_2: z.date({
    required_error: "Out time is required.",
  }),
  in_time_3: z.date({
    required_error: "In time is required.",
  }),
  out_time_3: z.date({
    required_error: "Out time is required.",
  }),
  required_work_hours_1: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  required_work_hours_2: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  required_work_hours_3: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  grace_in: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  grace_out: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  flexible: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  inactive_date: z.date({
    required_error: "Inactive Date is required.",
  }),
  open_shift_1: z.boolean(),
  open_shift_2: z.boolean(),
  open_shift_3: z.boolean(),
  night_shift_1: z.boolean(),
  night_shift_2: z.boolean(),
  night_shift_3: z.boolean(),
});

export default function NormalForm({
  on_open_change,
}: {
  on_open_change?: any;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organization: "",
      code: "",
    },
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
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const iconMap: Record<string, React.ReactNode> = {
    normal: <span className="w-4 h-4 bg-[#0E6ECF]"/>,
    day: <span className="w-4 h-4 bg-[#00C875]"/>,
    night: <span className="w-4 h-4 bg-[#DF2F4A]"/>,
    friday: <span className="w-4 h-4 bg-[#9D50DD]"/>,
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex justify-evenly gap-10 p-5">
          <div className="flex flex-col flex-1 items-end">
            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
              <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                  <div className="flex justify-end pr-2">
                    <FormLabel className="flex gap-1">Organization <Required/> </FormLabel>
                  </div>
                  <div>
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
                        <SelectItem value="1">organization 1</SelectItem>
                    </SelectContent>
                    </Select>
                    <FormMessage className="mt-1"/>
                  </div>
              </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                  <div className="flex justify-end pr-2">
                    <FormLabel className="flex gap-1">Code <Required /></FormLabel>
                  </div>
                  <div>
                    <FormControl>
                    <Input placeholder="Enter the code" type="text" {...field} />
                    </FormControl>
                    <FormMessage className="mt-1"/>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="in_time_1"
              render={({ field }) => (
                <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                  <div className="flex justify-end pr-2">
                    <FormLabel className="text-left">In time 1<Required /></FormLabel>
                  </div>
                  <div>
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
                              <span className="text-text-secondary">_ _ : _ _</span>
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
                    <FormMessage className="mt-1"/>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="required_work_hours_1"
              render={({ field }) => (
                <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                  <div className="flex justify-end pr-2">
                    <FormLabel className="text-left">Required Work Hours</FormLabel>
                  </div>
                  <div>
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
                              <span className="text-text-secondary">_ _ : _ _</span>
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
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="in_time_2"
              render={({ field }) => (
                <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                  <div className="flex justify-end pr-2">
                    <FormLabel className="text-left">In time 2</FormLabel>
                  </div>
                  <div>
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
                              <span className="text-text-secondary">_ _ : _ _</span>
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
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="required_work_hours_2"
              render={({ field }) => (
                <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                  <div className="flex justify-end pr-2">
                    <FormLabel className="text-left">Required Work Hours</FormLabel>
                  </div>
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
                            <span className="text-text-secondary">_ _ : _ _</span>
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
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="in_time_3"
              render={({ field }) => (
                <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                  <div className="flex justify-end pr-2">
                    <FormLabel className="text-left">In time 3</FormLabel>
                  </div>
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
                            <span className="text-text-secondary">_ _ : _ _</span>
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
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="required_work_hours_3"
              render={({ field }) => (
                <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                  <div className="flex justify-end pr-2">
                    <FormLabel className="text-left">Required Work Hours</FormLabel>
                  </div>
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
                            <span className="text-text-secondary">_ _ : _ _</span>
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
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="grace_in"
              render={({ field }) => (
                  <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                    <div className="flex justify-end pr-2">
                      <FormLabel className="flex gap-1">Grace In (Minutes)</FormLabel>
                    </div>
                    <FormControl>
                      <Input placeholder="0" type="text" {...field} />
                    </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="flexible"
              render={({ field }) => (
                  <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                    <div className="flex justify-end pr-2">
                      <FormLabel className="flex gap-1">Flexible (Minutes)</FormLabel>
                    </div>
                    <FormControl>
                      <Input placeholder="0" type="text" {...field} />
                    </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col flex-1 items-end">
            <FormField
              control={form.control}
              name="schedule_location"
              render={({ field }) => (
              <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                  <div className="flex justify-end pr-2">
                    <FormLabel className="flex gap-1">Schedule Location <Required/> </FormLabel>
                  </div>
                  <div>
                    <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    >
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Choose schedule location" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="1">Main Branch</SelectItem>
                        <SelectItem value="2">Branch 1</SelectItem>
                        <SelectItem value="3">Branch 2</SelectItem>
                    </SelectContent>
                    </Select>
                    <FormMessage className="mt-1"/>
                  </div>
              </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                  <div className="flex justify-end pr-2">
                    <FormLabel className="text-left">Color <Required/></FormLabel>
                  </div>
                  <div>
                    <ColorPicker/>
                    <FormMessage className="mt-1"/>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="out_time_1"
              render={({ field }) => (
                <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                  <div className="flex justify-end pr-2">
                    <FormLabel className="text-left">Out time 1 <Required/></FormLabel>
                  </div>
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
                            <span className="text-text-secondary">_ _ : _ _</span>
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
                </FormItem>
              )}
            />
            <div className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
              <div></div>
              <div>
                <FormField
                  control={form.control}
                  name="open_shift_1"
                  render={({ field }) => (
                    <FormItem className=" ">
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="open_shift_1"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <FormLabel htmlFor="open_shift_1" className="text-sm font-semibold">Open shift</FormLabel>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="night_shift_1"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="night_shift_1"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <FormLabel htmlFor="night_shift_1" className="text-sm font-semibold">Night shift</FormLabel>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <FormField
              control={form.control}
              name="out_time_2"
              render={({ field }) => (
                <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                  <div className="flex justify-end pr-2">
                    <FormLabel className="text-left">Out time 2</FormLabel>
                  </div>
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
                            <span className="text-text-secondary">_ _ : _ _</span>
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
                </FormItem>
              )}
            />
            <div className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
              <div></div>
              <div>
                <FormField
                  control={form.control}
                  name="open_shift_2"
                  render={({ field }) => (
                    <FormItem className=" ">
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="open_shift_2"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <FormLabel htmlFor="open_shift_2" className="text-sm font-semibold">Open shift</FormLabel>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="night_shift_2"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="night_shift_2"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <FormLabel htmlFor="night_shift_2" className="text-sm font-semibold">Night shift</FormLabel>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <FormField
              control={form.control}
              name="out_time_3"
              render={({ field }) => (
                <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                  <div className="flex justify-end pr-2">
                    <FormLabel className="text-left">Out time 3</FormLabel>
                  </div>
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
                            <span className="text-text-secondary">_ _ : _ _</span>
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
                </FormItem>
              )}
            />
            <div className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
              <div></div>
              <div>
                <FormField
                  control={form.control}
                  name="open_shift_3"
                  render={({ field }) => (
                    <FormItem className=" ">
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="open_shift_3"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <FormLabel htmlFor="open_shift_3" className="text-sm font-semibold">Open shift</FormLabel>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="night_shift_3"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="night_shift_3"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <FormLabel htmlFor="night_shift_3" className="text-sm font-semibold">Night shift</FormLabel>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <FormField
              control={form.control}
              name="grace_out"
              render={({ field }) => (
                  <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                    <div className="flex justify-end pr-2">
                      <FormLabel className="flex gap-1">Grace out (Minutes)</FormLabel>
                    </div>
                    <FormControl>
                      <Input placeholder="0" type="text" {...field} />
                    </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="inactive_date"
              render={({ field }) => (
                <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                  <div className="flex justify-end pr-2">
                    <FormLabel className="flex gap-1">Inactive date</FormLabel>
                  </div>  
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
                      />
                    </PopoverContent>
                  </Popover>
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
              Save
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
