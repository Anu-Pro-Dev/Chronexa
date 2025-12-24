"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import * as z from "zod";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import Required from "@/src/components/ui/required";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { CalendarIcon } from "@/src/icons/icons";
import { Calendar } from "@/src/components/ui/calendar";
import { format } from "date-fns";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addHolidayScheduleRequest, editHolidayScheduleRequest } from "@/src/lib/apiHandler";

const formSchema = z.object({
  holiday_name: z.string().default(""),
  from_date: z.date().nullable().optional(),
  to_date: z.date().nullable().optional(),
  remarks: z.string().optional(),
  recurring_flag: z.boolean().optional().default(false),
  public_holiday_flag: z.boolean().optional().default(false),
});

export default function AddHoliday({
  on_open_change,
  selectedRowData,
  onSave,
}: {
  on_open_change: any;
  selectedRowData?: any;
  onSave: (id: string | null, newData: any) => void;
}) {

  const { language, translations } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const [originalValues, setOriginalValues] = useState<any>(null);
  const [popoverStates, setPopoverStates] = useState({
    fromDate: false,
    toDate: false,
  });

  const closePopover = (key: string) => {
    setPopoverStates(prev => ({ ...prev, [key]: false }));
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      holiday_name: "",
      from_date: null,
      to_date: null,
      remarks: "",
      recurring_flag: false,
      public_holiday_flag: false,
    },
  });

  useEffect(() => {
    if (selectedRowData) {
      const fromDate = selectedRowData.from_date ? new Date(selectedRowData.from_date) : null;
      const toDate = selectedRowData.to_date ? new Date(selectedRowData.to_date) : null;

      form.reset({
        holiday_name:
          language === "en"
            ? selectedRowData.holiday_eng ?? ""
            : selectedRowData.holiday_arb ?? "",
        from_date: fromDate,
        to_date: toDate,
        remarks: selectedRowData.remarks ?? "",
        recurring_flag: selectedRowData.recurring_flag ?? false,
        public_holiday_flag: selectedRowData.public_holiday_flag ?? false,
      });

      // Store original values for comparison
      setOriginalValues({
        holiday_eng: selectedRowData.holiday_eng ?? "",
        holiday_arb: selectedRowData.holiday_arb ?? "",
        from_date: fromDate ? format(fromDate, "yyyy-MM-dd") : null,
        to_date: toDate ? format(toDate, "yyyy-MM-dd") : null,
        remarks: selectedRowData.remarks ?? "",
        recurring_flag: selectedRowData.recurring_flag ?? false,
        public_holiday_flag: selectedRowData.public_holiday_flag ?? false,
      });
    } else {
      form.reset();
      setOriginalValues(null);
    }
  }, [selectedRowData, language, form]);

  const handleError = (error: any) => {
    console.error("API Error:", error);
    
    // Try to extract the error message from various possible error structures
    const errorMessage = 
      error?.response?.data?.message || 
      error?.message || 
      "Form submission error.";
    
    const overlappingDates = error?.response?.data?.overlapping_dates;

    // Display the main error message
    toast.error(errorMessage, { duration: 5000 });

    // If there are overlapping dates, show additional details
    if (overlappingDates && Array.isArray(overlappingDates) && overlappingDates.length > 0) {
      overlappingDates.forEach((overlap: any, index: number) => {
        const fromDate = new Date(overlap.from_date).toLocaleDateString();
        const toDate = new Date(overlap.to_date).toLocaleDateString();
        const name = language === "en" 
          ? overlap.holiday_eng 
          : overlap.holiday_arb;
        
        setTimeout(() => {
          toast.error(
            `Overlap ${index + 1}: ${name} (${fromDate} - ${toDate})`,
            { duration: 6000 }
          );
        }, (index + 1) * 100);
      });
    }

    // Handle specific status codes if needed
    if (error?.response?.status === 409) {
      // Duplicate/conflict is already handled by the message above
      return;
    }
  };

  const addMutation = useMutation({
    mutationFn: addHolidayScheduleRequest,
    onSuccess: (data) => {
      toast.success("Holiday added successfully!");
      onSave(null, data.data);
      on_open_change(false);
      queryClient.invalidateQueries({ queryKey: ["holiday"] });
    },
    onError: handleError,
  });

  const editMutation = useMutation({
    mutationFn: editHolidayScheduleRequest,
    onSuccess: (_data, variables) => {
      toast.success("Holiday updated successfully!");
      onSave(variables.holiday_id?.toString() ?? null, variables);
      queryClient.invalidateQueries({ queryKey: ["holiday"] });
      on_open_change(false);
    },
    onError: handleError,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      if (selectedRowData) {
        // EDIT MODE - Send only changed fields
        const payload: any = {
          holiday_id: selectedRowData.id,
        };

        // Only add fields that have changed
        if (originalValues) {
          // Check holiday name based on current language
          if (language === "en") {
            if (values.holiday_name !== originalValues.holiday_eng) {
              payload.holiday_eng = values.holiday_name;
            }
          } else {
            if (values.holiday_name !== originalValues.holiday_arb) {
              payload.holiday_arb = values.holiday_name;
            }
          }

          // Check from date
          const fromDateString = values.from_date ? format(values.from_date, "yyyy-MM-dd") : null;
          if (fromDateString !== originalValues.from_date) {
            payload.from_date = fromDateString;
          }

          // Check to date
          const toDateString = values.to_date ? format(values.to_date, "yyyy-MM-dd") : null;
          if (toDateString !== originalValues.to_date) {
            payload.to_date = toDateString;
          }

          // Check remarks
          const currentRemarks = values.remarks ?? "";
          if (currentRemarks !== originalValues.remarks) {
            payload.remarks = currentRemarks;
          }

          // Check recurring flag
          if (values.recurring_flag !== originalValues.recurring_flag) {
            payload.recurring_flag = values.recurring_flag;
          }

          // Check public holiday flag
          if (values.public_holiday_flag !== originalValues.public_holiday_flag) {
            payload.public_holiday_flag = values.public_holiday_flag;
          }
        } else {
          // Fallback: if no original values, send all fields (shouldn't happen)
          if (language === "en") {
            payload.holiday_eng = values.holiday_name;
          } else {
            payload.holiday_arb = values.holiday_name;
          }
          payload.from_date = values.from_date ? format(values.from_date, "yyyy-MM-dd") : null;
          payload.to_date = values.to_date ? format(values.to_date, "yyyy-MM-dd") : null;
          payload.remarks = values.remarks;
          payload.recurring_flag = values.recurring_flag;
          payload.public_holiday_flag = values.public_holiday_flag;
        }

        // Check if there are any changes to submit
        const hasChanges = Object.keys(payload).length > 1; // More than just holiday_id

        if (!hasChanges) {
          setIsSubmitting(false);
          return;
        }

        console.log("Editing holiday with ID:", selectedRowData.id);
        console.log("Changed fields payload:", payload);

        editMutation.mutate(payload);
      } else {
        // ADD MODE - Send all required fields
        const payload: any = {
          from_date: values.from_date ? format(values.from_date, "yyyy-MM-dd") : null,
          to_date: values.to_date ? format(values.to_date, "yyyy-MM-dd") : null,
          remarks: values.remarks,
          recurring_flag: values.recurring_flag,
          public_holiday_flag: values.public_holiday_flag,
        };

        if (language === "en") {
          payload.holiday_eng = values.holiday_name;
        } else {
          payload.holiday_arb = values.holiday_name;
        }

        console.log("Adding new holiday. Payload:", payload);
        addMutation.mutate(payload);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col">
            <div className="flex gap-10 items-center mb-5">
              <FormField
                control={form.control}
                name="recurring_flag"
                render={({ field }) => (
                  <FormItem className=" ">
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="recurring_flag"
                          checked={!!field.value}
                          onCheckedChange={field.onChange}
                        />
                        <FormLabel htmlFor="recurring_flag" className="text-sm font-semibold">Recurring</FormLabel>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="public_holiday_flag"
                render={({ field }) => (
                  <FormItem className=" ">
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="public_holiday_flag"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <FormLabel htmlFor="public_holiday_flag" className="text-sm font-semibold">Public Holiday</FormLabel>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 gap-y-4 min-w-0">
                <FormField
                  control={form.control}
                  name="holiday_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {language === "ar"
                          ? "Holiday Name (العربية) "
                          : "Holiday Name (English) "}
                        <Required />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter holiday name" type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the remark" type="text" {...field} />
                      </FormControl>

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
                      <Popover open={popoverStates.fromDate} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, fromDate: open }))}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button size={"lg"} variant={"outline"}
                              className="w-full bg-accent px-3 flex justify-between text-text-primary max-w-[350px] 3xl:max-w-[450px] text-sm font-normal"
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
                            onSelect={(date) => {
                              field.onChange(date)
                              closePopover('fromDate')
                            }}
                            disabled={(date) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);

                              return date < today;
                            }}
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
                      <Popover open={popoverStates.toDate} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, toDate: open }))}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button size={"lg"} variant={"outline"}
                              className="w-full bg-accent px-3 flex justify-between text-text-primary max-w-[350px] 3xl:max-w-[450px] text-sm font-normal"
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
            </div>
          </div>
          <div className="flex justify-end gap-2 items-center">
            <div className="flex gap-4">
              <Button
                variant={"outline"}
                type="button"
                size={"lg"}
                className="w-full"
                onClick={() => on_open_change(false)}
              >
                {translations.buttons.cancel}
              </Button>
              <Button
                type="submit"
                size={"lg"}
                className="w-full"
                disabled={addMutation.isPending || editMutation.isPending}
              >
                {addMutation.isPending || editMutation.isPending
                  ? selectedRowData
                    ? "Updating..."
                    : "Saving..."
                  : selectedRowData
                    ? "Update"
                    : "Save"
                }
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}