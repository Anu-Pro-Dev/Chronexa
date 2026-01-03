"use client";
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/src/lib/utils";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Calendar } from "@/src/components/ui/calendar";
import { CalendarIcon, ClockIcon, ExclamationIcon } from "@/src/icons/icons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { format } from "date-fns";
import { TimePicker } from "@/src/components/ui/time-picker";
import Required from "@/src/components/ui/required";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { groupApproveTransactionsRequest } from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";

const formSchema = z.object({
  reason: z
    .string()
    .min(1, {
      message: "reason_required",
    })
    .max(100, {
      message: "reason_max_length",
    }),
  date: z.date({
    required_error: "date_required",
  }),
  time: z.date({
    required_error: "time_required",
  }),
  remarks: z.string().max(500, {
    message: "remarks_max_length",
  }).optional(),
});

export default function GroupApplyPunch({
  on_open_change,
  rowData,
  punchType,
}: {
  on_open_change?: any;
  rowData?: any;
  punchType?: string;
}) {
  const { employeeId } = useAuthGuard();
  const { language, translations } = useLanguage();
  const showToast = useShowToast();
  
  const t = translations?.modules?.selfServices || {};
  const formErrors = translations?.formErrors || {};
  
  const [remarksLength, setRemarksLength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const [popoverStates, setPopoverStates] = useState({
    fromDate: false,
    fromTime: false,
  });

  const closePopover = (key: string) => {
    setPopoverStates(prev => ({ ...prev, [key]: false }));
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
      remarks: "",
    },
  });

  const GroupApplyPunchMutation = useMutation({
    mutationFn: groupApproveTransactionsRequest,
    onSuccess: (data) => {
      showToast("success", "group_apply_punch_success");
      queryClient.invalidateQueries({ queryKey: ["missingMovement"] });
      setIsSubmitting(false);
      if (on_open_change) {
        on_open_change(false);
      }
    },
    onError: (error: any) => {
      console.error("API Error:", error);
      showToast("error", "group_apply_punch_error");
      setIsSubmitting(false); 
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const parseTransDate = useCallback((dateString: string) => {
    if (!dateString) return new Date();
    
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; 
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    
    return new Date(dateString);
  }, []);

  useEffect(() => {
    if (rowData && punchType) {
      form.setValue("reason", punchType);
      
      if (rowData.TransDate) {
        const parsedDate = parseTransDate(rowData.TransDate);
        form.setValue("date", parsedDate);
      }
    }
  }, [rowData, punchType, form, parseTransDate]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const combinedDateTime = new Date(values.date);
      combinedDateTime.setHours(values.time.getHours());
      combinedDateTime.setMinutes(values.time.getMinutes());
      combinedDateTime.setSeconds(values.time.getSeconds());
      combinedDateTime.setMilliseconds(0);
      
      const year = combinedDateTime.getFullYear();
      const month = String(combinedDateTime.getMonth() + 1).padStart(2, '0');
      const day = String(combinedDateTime.getDate()).padStart(2, '0');
      const hours = String(combinedDateTime.getHours()).padStart(2, '0');
      const minutes = String(combinedDateTime.getMinutes()).padStart(2, '0');
      const seconds = String(combinedDateTime.getSeconds()).padStart(2, '0');
      
      const transaction_time = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;

      const payload = {
        transaction_time: transaction_time,
        reason: values.reason,
        remarks: values.remarks || "",
      };
      GroupApplyPunchMutation.mutate(payload);
    } catch (error) {
      console.error("Form submission error", error);
      showToast("error", "formsubmission_error");
      setIsSubmitting(false);
    }
  }

  const handleCancel = () => {
    form.reset();
    if (on_open_change) {
      on_open_change(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-accent transition-all duration-300 rounded-xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {remarksLength > 500 && (
              <p className="text-xs text-destructive border border-red-200 rounded-md px-2 py-1 font-semibold bg-red-400 bg-opacity-10 flex items-center ">
                <ExclamationIcon className="mr-2" width="14" height="14"/>
                {formErrors.remarks_max_length || "Maximum 500 characters only allowed."}
              </p>
            )}
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-y-5 gap-10 pt-8">
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.reason || "Reason"} <Required /></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t.placeholder_punch_type || "Select punch type"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="IN">IN</SelectItem>
                        <SelectItem value="OUT">OUT</SelectItem>
                      </SelectContent>
                    </Select>
                    <TranslatedError
                      fieldError={form.formState.errors.reason}
                      translations={formErrors}
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>
                      {t.date || "Date"} <Required />
                    </FormLabel>
                    <Popover open={popoverStates.fromDate} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, fromDate: open }))}>
                      <FormControl>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "flex justify-between h-10 w-full max-w-[350px] 3xl:max-w-[450px] rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yy")
                            ) : (
                              <span className="text-text-secondary">{t.placeholder_date || "Choose date"}</span>
                            )}
                            <CalendarIcon />
                          </Button>
                        </PopoverTrigger>
                      </FormControl>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            closePopover('fromDate');
                          }}
                          defaultMonth={new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    <TranslatedError
                      fieldError={form.formState.errors.date}
                      translations={formErrors}
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>{t.trans_time || "Time"} <Required/></FormLabel>
                    <Popover open={popoverStates.fromTime} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, fromTime: open }))}>
                      <FormControl>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "flex justify-between h-10 w-full max-w-[350px] 3xl:max-w-[450px] rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? format(field.value, "HH:mm")
                              : <span className="text-text-secondary">{t.placeholder_time || "Choose time"}</span>
                            }
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
                    <TranslatedError
                      fieldError={form.formState.errors.time}
                      translations={formErrors}
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.remarks || "Remarks"} </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t.placeholder_remarks || "Add your remarks here"}
                        {...field} 
                        rows={3}
                        onChange={(e) => {
                          field.onChange(e);
                          setRemarksLength(e.target.value.length);
                        }}
                      />
                    </FormControl>
                    <TranslatedError
                      fieldError={form.formState.errors.remarks}
                      translations={formErrors}
                    />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-2 items-center py-3 pt-8">
              <div className="flex gap-4">
                <Button
                  variant={"outline"}
                  type="button"
                  size={"lg"}
                  className="w-full"
                  onClick={handleCancel}
                >
                  {translations.buttons?.cancel || "Cancel"}
                </Button>
                <Button 
                  type="submit" 
                  size={"lg"} 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting 
                    ? translations.buttons?.applying || "Applying..." 
                    : translations.buttons?.apply || "Apply"
                  }
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}