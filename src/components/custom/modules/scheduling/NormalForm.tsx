"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { cn } from "@/src/utils/utils";
import { Button } from "@/src/components/ui/button";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import Required from "@/src/components/ui/required";
import { CalendarIcon, ClockIcon } from "@/src/icons/icons";
import { Calendar } from "@/src/components/ui/calendar";
import { differenceInMinutes, addMinutes, format } from "date-fns";
import { TimePicker } from "@/src/components/ui/time-picker";
import { Checkbox } from "@/src/components/ui/checkbox";
import ColorPicker from "@/src/components/ui/color-picker";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useFormContext } from "react-hook-form";
import { useScheduleEditStore } from "@/src/stores/scheduleEditStore";
import { useLanguage } from "@/src/providers/LanguageProvider"

interface NormalFormProps {
  SetPage: (page: string) => void;
}

export default function NormalForm({ SetPage }: NormalFormProps) {
  const form = useFormContext();
  const router = useRouter();
  const clearSelectedRowData = useScheduleEditStore((state) => state.clearSelectedRowData);
  const { translations } = useLanguage();
  // Fetch organizations and locations
  const { data: organizations } = useFetchAllEntity("organization");
  const { data: locations } = useFetchAllEntity("location");

  async function onSubmit(values: any) {
    try {
      SetPage("policy-schedule");
      toast.success("Data Saved!");
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }
  
  // Auto-calculate required_work_hours when in_time or out_time changes
  useEffect(() => {
    const inTime = form.watch("in_time");
    const outTime = form.watch("out_time");

    if (inTime && outTime && inTime instanceof Date && outTime instanceof Date) {
      let diff = differenceInMinutes(outTime, inTime);
      if (diff < 0) diff += 24 * 60; // handle overnight shifts

      const hours = Math.floor(diff / 60);
      const minutes = diff % 60;
      const formatted = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;

      form.setValue("required_work_hours", formatted);
    } else {
      form.setValue("required_work_hours", "");
    }
  }, [form.watch("in_time"), form.watch("out_time")]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-y-5 gap-10 px-8 pt-8">
          <FormField
            control={form.control}
            name="organization_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">Organization <Required/> </FormLabel>
                <Select
                  onValueChange={val => field.onChange(Number(val))}
                  value={field.value ? String(field.value) : ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose organization" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(organizations?.data || []).map((item: any) => {
                      if (!item.organization_id || item.organization_id.toString().trim() === '') return null;
                      return (
                        <SelectItem key={item.organization_id} value={item.organization_id.toString()}>
                          {item.organization_eng}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage className="mt-1"/>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="schedule_location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">Schedule Location <Required/> </FormLabel>
                <Select
                  onValueChange={val => field.onChange(Number(val))}
                  value={field.value ? String(field.value) : ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose schedule location" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(locations?.data || []).map((item: any) => {
                      if (!item.location_id || item.location_id.toString().trim() === '') return null;
                      return (
                        <SelectItem key={item.location_id} value={item.location_id.toString()}>
                          {item.location_eng}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage className="mt-1"/>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="schedule_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">Code <Required /></FormLabel>
                <FormControl>
                  <Input placeholder="Enter the code" type="text" {...field} />
                </FormControl>
                <FormMessage className="mt-1"/>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sch_color"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">Color <Required/></FormLabel>
                <FormControl>
                  <ColorPicker value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage className="mt-1"/>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="in_time"
            render={({ field }) => {
              const value =
                field.value instanceof Date
                  ? field.value
                  : field.value
                  ? new Date(field.value)
                  : undefined;
              return (
                <FormItem>
                  <FormLabel className="text-left">In time <Required/></FormLabel>
                  <Popover>
                    <FormControl>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "flex justify-between h-10 w-full max-w-[350px] rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                            !value && "text-muted-foreground"
                          )}
                        >
                          {value
                            ? format(value, "HH:mm")
                            : <span className="text-text-secondary">Choose time</span>
                          }
                          <ClockIcon />
                        </Button>
                      </PopoverTrigger>
                    </FormControl>
                    <PopoverContent className="w-auto p-0">
                      <TimePicker
                        setDate={field.onChange}
                        date={value}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="mt-1"/>
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="out_time"
            render={({ field }) => {
              // Ensure value is a Date object or undefined
              const value =
                field.value instanceof Date
                  ? field.value
                  : field.value
                  ? new Date(field.value)
                  : undefined;
              return (
                <FormItem>
                  <FormLabel className="text-left">Out time <Required/></FormLabel>
                  <Popover>
                    <FormControl>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "flex justify-between h-10 w-full max-w-[350px] rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                            !value && "text-muted-foreground"
                          )}
                        >
                          {value
                            ? format(value, "HH:mm")
                            : <span className="text-text-secondary">Choose time</span>
                          }
                          <ClockIcon />
                        </Button>
                      </PopoverTrigger>
                    </FormControl>
                    <PopoverContent className="w-auto p-0">
                      <TimePicker
                        setDate={field.onChange}
                        date={value}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="mt-1"/>
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="required_work_hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-left">Required Work Hours</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    value={field.value || ""}
                    readOnly
                    placeholder="Duration will be auto-calculated"
                  />
                </FormControl>
                <FormMessage className="mt-1"/>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="flexible_min"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">Flexible (Minutes)</FormLabel>
                <FormControl>
                  <Input placeholder="0" type="text" {...field} value={field.value ?? ""}/>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="grace_in_min"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">Grace In (Minutes)</FormLabel>
                <FormControl>
                  <Input placeholder="0" type="text" {...field} value={field.value ?? ""}/>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="grace_out_min"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">Grace out (Minutes)</FormLabel>
                <FormControl>
                  <Input placeholder="0" type="text" {...field} value={field.value ?? ""}/>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="inactive_date"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel>
                  Inactive Date
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button size={"lg"} variant={"outline"}
                        className="w-full bg-accent px-3 flex justify-between text-text-primary max-w-[350px] text-sm font-normal"
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
                      selected={field.value ? field.value : undefined}
                      onSelect={field.onChange}
                      disabled={(date) => {
                        // Get today's date at start of day for comparison
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        
                        // Disable dates before today
                        return date < today;
                      }}
                    />
                  </PopoverContent>
                </Popover>

                <FormMessage />
              </FormItem>
            )}
          />
          <div className="w-full py-2 grid grid-rows-2 gap-y-2 items-center space-y-0">
            <FormField
              control={form.control}
              name="open_shift_flag"
              render={({ field }) => (
                <FormItem className=" ">
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="open_shift_flag"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <FormLabel htmlFor="open_shift_flag" className="text-sm font-semibold">Open shift</FormLabel>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="night_shift_flag"
              render={({ field }) => (
                <FormItem className="">
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="night_shift_flag"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <FormLabel htmlFor="night_shift_flag" className="text-sm font-semibold">Night shift</FormLabel>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 items-center py-5 pt-8">
          <div className="flex gap-4 px-5">
            <Button
              variant={"outline"}
              type="button"
              size={"lg"}
              className="w-full"
              onClick={() => {
                clearSelectedRowData();
                router.push("/scheduling/schedules/");
              }}
            >
              {translations.buttons.cancel}
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
