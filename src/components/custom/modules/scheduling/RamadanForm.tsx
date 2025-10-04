"use client";
import React, { useState } from "react";
import { cn } from "@/src/utils/utils";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import Required from "@/src/components/ui/required";
import { ClockIcon } from "@/src/icons/icons";
import { format } from "date-fns";
import { TimePicker } from "@/src/components/ui/time-picker";
import { useFormContext } from "react-hook-form";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";

interface RamadanFormProps {
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

export default function RamadanForm({ SetPage }: RamadanFormProps) {
  const form = useFormContext();
  const { translations } = useLanguage();
  const showToast = useShowToast();
  const t = translations?.modules?.scheduling || {};
  const errT = translations?.formErrors || {};
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [popoverStates, setPopoverStates] = useState({
    ramadanInTime: false,
    ramadanOutTime: false,
    ramadanPrayerTime: false,
  });

  async function onSubmit(values: any) {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Manual validation for Ramadan required fields
      const errors: Record<string, { message: string }> = {};
      
      if (!values.ramadan_in_time || values.ramadan_in_time === "") {
        errors.ramadan_in_time = { message: "ramadan_in_time_required" };
      }
      
      if (!values.ramadan_out_time || values.ramadan_out_time === "") {
        errors.ramadan_out_time = { message: "ramadan_out_time_required" };
      }

      if (Object.keys(errors).length > 0) {
        // Set errors manually
        Object.keys(errors).forEach(key => {
          form.setError(key as any, { type: "manual", message: errors[key].message });
        });
        showToast("error", "validation_error");
        setIsSubmitting(false);
        return;
      }

      SetPage("policy-schedule");
      showToast("success", "data_saved");
    } catch (error) {
      console.error("Form submission error", error);
      showToast("error", "formsubmission_error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-y-5 gap-10 px-8 pt-8">
          <FormField
            control={form.control}
            name="ramadan_in_time"
            render={({ field }) => {
              const displayValue = field.value instanceof Date 
                ? field.value 
                : typeof field.value === 'string' 
                  ? parseTimeString(field.value)
                  : undefined;
              
              return (
                <FormItem>
                  <FormLabel className="text-left">Ramadan {t.in_time || "In Time"} <Required/></FormLabel>
                  <Popover open={popoverStates.ramadanInTime} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, ramadanInTime: open }))}>
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
                  <TranslatedError fieldError={form.formState.errors.ramadan_in_time} translations={errT} />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="ramadan_out_time"
            render={({ field }) => {
              const displayValue = field.value instanceof Date 
                ? field.value 
                : typeof field.value === 'string' 
                  ? parseTimeString(field.value)
                  : undefined;
              
              return (
                <FormItem>
                  <FormLabel className="text-left">Ramadan {t.out_time || "Out Time"} <Required/></FormLabel>
                  <Popover open={popoverStates.ramadanOutTime} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, ramadanOutTime: open }))}>
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
                  <TranslatedError fieldError={form.formState.errors.ramadan_out_time} translations={errT} />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="ramadan_prayer_time"
            render={({ field }) => {
              const displayValue = field.value instanceof Date 
                ? field.value 
                : typeof field.value === 'string' 
                  ? parseTimeString(field.value)
                  : undefined;
              
              return (
                <FormItem>
                  <FormLabel className="text-left">Ramadan Prayer Time</FormLabel>
                  <Popover open={popoverStates.ramadanPrayerTime} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, ramadanPrayerTime: open }))}>
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
                  <TranslatedError fieldError={form.formState.errors.ramadan_prayer_time} translations={errT} />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="ramadan_flexible_min"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">Ramadan {t.flexible || "Flexible"}</FormLabel>
                <FormControl>
                  <Input placeholder="0" type="text" {...field} value={field.value ?? ""}/>
                </FormControl>
                <TranslatedError fieldError={form.formState.errors.ramadan_flexible_min} translations={errT} />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ramadan_grace_in_min"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">Ramadan {t.grace_in || "Grace In"}</FormLabel>
                <FormControl>
                  <Input placeholder="0" type="text" {...field} value={field.value ?? ""}/>
                </FormControl>
                <TranslatedError fieldError={form.formState.errors.ramadan_grace_in_min} translations={errT} />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ramadan_grace_out_min"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">Ramadan {t.grace_out || "Grace Out"}</FormLabel>
                <FormControl>
                  <Input placeholder="0" type="text" {...field} value={field.value ?? ""}/>
                </FormControl>
                <TranslatedError fieldError={form.formState.errors.ramadan_grace_out_min} translations={errT} />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-2 items-center py-5 pt-8">
          <div className="flex gap-4 px-5">
            <Button
              variant={"outline"}
              type="button"
              size={"lg"}
              className="w-full"
              onClick={() => SetPage("normal-schedule")}
            >
              {translations?.buttons?.back || "Back"}
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