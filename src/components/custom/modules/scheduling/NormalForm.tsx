"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/src/utils/utils";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import Required from "@/src/components/ui/required";
import { CalendarIcon, ClockIcon } from "@/src/icons/icons";
import { Calendar } from "@/src/components/ui/calendar";
import { differenceInMinutes, format } from "date-fns";
import { TimePicker } from "@/src/components/ui/time-picker";
import { Checkbox } from "@/src/components/ui/checkbox";
import ColorPicker from "@/src/components/ui/color-picker";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useFormContext } from "react-hook-form";
import { useScheduleEditStore } from "@/src/stores/scheduleEditStore";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";

interface NormalFormProps {
  SetPage: (page: string) => void;
}

const formatTimeToString = (date: Date | undefined): string => {
  if (!date || !(date instanceof Date)) return "";
  return format(date, "HH:mm:ss");
};

const parseTimeString = (timeString: string): Date | undefined => {
  if (!timeString) return undefined;
  const [hours, minutes, seconds = "00"] = timeString.split(":");
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds || "0"), 0);
  return date;
};

export default function NormalForm({ SetPage }: NormalFormProps) {
  const form = useFormContext();
  const router = useRouter();
  const clearSelectedRowData = useScheduleEditStore((state) => state.clearSelectedRowData);
  const { translations } = useLanguage();
  const showToast = useShowToast();
  const t = translations?.modules?.scheduling || {};
  const errT = translations?.formErrors || {};
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [popoverStates, setPopoverStates] = useState({
    inTime: false,
    outTime: false,
    inactiveDate: false,
  });

  const closePopover = (key: string) => {
    setPopoverStates(prev => ({ ...prev, [key]: false }));
  };

  const { data: organizations } = useFetchAllEntity("organization");
  const { data: locations } = useFetchAllEntity("location");

  async function onSubmit(values: any) {
    if (isSubmitting) return;
    setIsSubmitting(true);
    console.log("submitting");
    try {
      const isRamadanSchedule = values.ramadan_flag || form.getValues("ramadan_flag");
      
      if (isRamadanSchedule) {
        SetPage("ramadan-schedule");
      } else {
        SetPage("policy-schedule");
      }
      showToast("success", "data_saved");
    } catch (error) {
      console.error("Form submission error", error);
      showToast("error", "formsubmission_error");
    } finally {
      setIsSubmitting(false);
    }
  }
  
  useEffect(() => {
    const inTime = form.watch("in_time");
    const outTime = form.watch("out_time");

    if (inTime && outTime) {
      const inDate = inTime instanceof Date ? inTime : parseTimeString(inTime);
      const outDate = outTime instanceof Date ? outTime : parseTimeString(outTime);
      
      if (inDate && outDate) {
        let diff = differenceInMinutes(outDate, inDate);
        if (diff < 0) diff += 24 * 60;

        const hours = Math.floor(diff / 60);
        const minutes = diff % 60;
        const seconds = 0;
        const formatted = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

        form.setValue("required_work_hours", formatted);
      }
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
                <FormLabel className="flex gap-1">{t.organization || "Organization"} <Required/></FormLabel>
                <Select
                  onValueChange={val => field.onChange(Number(val))}
                  value={field.value ? String(field.value) : ""}
                >
                  <FormControl>
                    <SelectTrigger className="max-w-[350px]">
                      <SelectValue placeholder={t.placeholder_org || "Choose organization"} />
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
                <TranslatedError fieldError={form.formState.errors.organization_id} translations={errT} />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="schedule_location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">{t.schedule_location || "Schedule Location"} <Required/></FormLabel>
                <Select
                  onValueChange={val => field.onChange(Number(val))}
                  value={field.value ? String(field.value) : ""}
                >
                  <FormControl>
                    <SelectTrigger className="max-w-[350px]">
                      <SelectValue placeholder={t.placeholder_schedule_location || "Choose schedule location"} />
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
                <TranslatedError fieldError={form.formState.errors.schedule_location} translations={errT} />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="schedule_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">{t.code || "Code"} <Required /></FormLabel>
                <FormControl>
                  <Input placeholder={t.placeholder_code || "Enter the code"} type="text" {...field} />
                </FormControl>
                <TranslatedError fieldError={form.formState.errors.schedule_code} translations={errT} />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sch_color"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">{t.color || "Color"} <Required/></FormLabel>
                <FormControl>
                  <ColorPicker value={field.value} onChange={field.onChange} />
                </FormControl>
                <TranslatedError fieldError={form.formState.errors.sch_color} translations={errT} />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="in_time"
            render={({ field }) => {
              const displayValue = field.value instanceof Date 
                ? field.value 
                : typeof field.value === 'string' 
                  ? parseTimeString(field.value)
                  : undefined;
              
              return (
                <FormItem>
                  <FormLabel className="text-left">{t.in_time || "In time"} <Required/></FormLabel>
                  <Popover open={popoverStates.inTime} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, inTime: open }))}>
                    <FormControl>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "flex justify-between h-10 w-full max-w-[350px] rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                            !displayValue && "text-muted-foreground"
                          )}
                        >
                          {displayValue
                            ? format(displayValue, "HH:mm:ss")
                            : <span className="text-text-secondary">{t.placeholder_time || "Choose time"}</span>
                          }
                          <ClockIcon />
                        </Button>
                      </PopoverTrigger>
                    </FormControl>
                    <PopoverContent className="w-auto p-0">
                      <TimePicker
                        setDate={(date) => {
                          field.onChange(date ? formatTimeToString(date) : undefined);
                        }}
                        date={displayValue}
                      />
                    </PopoverContent>
                  </Popover>
                  <TranslatedError fieldError={form.formState.errors.in_time} translations={errT} />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="out_time"
            render={({ field }) => {
              const displayValue = field.value instanceof Date 
                ? field.value 
                : typeof field.value === 'string' 
                  ? parseTimeString(field.value)
                  : undefined;
              
              return (
                <FormItem>
                  <FormLabel className="text-left">{t.out_time || "Out time"} <Required/></FormLabel>
                  <Popover open={popoverStates.outTime} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, outTime: open }))}>
                    <FormControl>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "flex justify-between h-10 w-full max-w-[350px] rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                            !displayValue && "text-muted-foreground"
                          )}
                        >
                          {displayValue
                            ? format(displayValue, "HH:mm:ss")
                            : <span className="text-text-secondary">{t.placeholder_time || "Choose time"}</span>
                          }
                          <ClockIcon />
                        </Button>
                      </PopoverTrigger>
                    </FormControl>
                    <PopoverContent className="w-auto p-0">
                      <TimePicker
                        setDate={(date) => {
                          field.onChange(date ? formatTimeToString(date) : undefined);
                        }}
                        date={displayValue}
                      />
                    </PopoverContent>
                  </Popover>
                  <TranslatedError fieldError={form.formState.errors.out_time} translations={errT} />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="required_work_hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-left">{t.required_work_hrs || "Required Work Hours"}</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    value={field.value || ""}
                    readOnly
                    placeholder={t.auto_cal_duration || "Duration will be auto-calculated"}
                  />
                </FormControl>
                <TranslatedError fieldError={form.formState.errors.required_work_hours} translations={errT} />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="flexible_min"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">{t.flexible || "Flexible"}</FormLabel>
                <FormControl>
                  <Input placeholder="0" type="text" {...field} value={field.value ?? ""}/>
                </FormControl>
                <TranslatedError fieldError={form.formState.errors.flexible_min} translations={errT} />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="grace_in_min"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">{t.grace_in || "Grace In"}</FormLabel>
                <FormControl>
                  <Input placeholder="0" type="text" {...field} value={field.value ?? ""}/>
                </FormControl>
                <TranslatedError fieldError={form.formState.errors.grace_in_min} translations={errT} />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="grace_out_min"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">{t.grace_out || "Grace Out"}</FormLabel>
                <FormControl>
                  <Input placeholder="0" type="text" {...field} value={field.value ?? ""}/>
                </FormControl>
                <TranslatedError fieldError={form.formState.errors.grace_out_min} translations={errT} />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="inactive_date"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel>{t.inactive_date || "Inactive Date"}</FormLabel>
                <Popover open={popoverStates.inactiveDate} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, inactiveDate: open }))}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button size={"lg"} variant={"outline"}
                        className="w-full bg-accent px-3 flex justify-between text-text-primary max-w-[350px] text-sm font-normal"
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yy")
                        ) : (
                          <span className="font-normal text-sm text-text-secondary">{t.placeholder_date || "Choose date"}</span>
                        )}
                        <CalendarIcon />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? field.value : undefined}
                      onSelect={(date) => {
                        field.onChange(date)
                        closePopover('inactiveDate')
                      }}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <TranslatedError fieldError={form.formState.errors.inactive_date} translations={errT} />
              </FormItem>
            )}
          />
          <div className="w-full py-2 grid grid-rows-3 gap-y-2 items-center space-y-0">
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
                      <FormLabel htmlFor="open_shift_flag" className="text-sm font-semibold">{t.open_shift || "Open shift"}</FormLabel>
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
                      <FormLabel htmlFor="night_shift_flag" className="text-sm font-semibold">{t.night_shift || "Night shift"}</FormLabel>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ramadan_flag"
              render={({ field }) => (
                <FormItem className="">
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="ramadan_flag"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <FormLabel htmlFor="ramadan_flag" className="text-sm font-semibold">{t.ramadan_schedule || "Ramadan Schedule"}</FormLabel>
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
              {translations?.buttons?.cancel || "Cancel"}
            </Button>
            <Button type="submit" size={"lg"} className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (translations?.buttons?.loading || "Loading") : (translations?.buttons?.next || "Next")}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}