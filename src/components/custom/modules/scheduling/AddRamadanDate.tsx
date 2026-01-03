"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import Required from "@/src/components/ui/required";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { CalendarIcon } from "@/src/icons/icons";
import { Calendar } from "@/src/components/ui/calendar";
import { format } from "date-fns";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addRamadanScheduleRequest, editRamadanScheduleRequest } from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";

const formSchema = z.object({
  ramadan_name: z.string().min(1, { message: "ramadan_name_required" }),
  from_date: z.date({ required_error: "from_date_required" }),
  to_date: z.date({ required_error: "to_date_required" }),
  remarks: z.string().optional(),
});

export default function AddRamadanDate({
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
  const [originalValues, setOriginalValues] = useState<any>(null);
  const queryClient = useQueryClient();
  const showToast = useShowToast();
  const t = translations?.modules?.scheduling || {};
  const errT = translations?.formErrors || {};
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
      ramadan_name: "",
      from_date: undefined,
      to_date: undefined,
      remarks: "",
    },
  });
  
  useEffect(() => {
    if (selectedRowData) {
      const fromDate = selectedRowData.from_date ? new Date(selectedRowData.from_date) : undefined;
      const toDate = selectedRowData.to_date ? new Date(selectedRowData.to_date) : undefined;

      form.reset({
        ramadan_name:
          language === "en"
            ? selectedRowData.ramadan_name_eng ?? ""
            : selectedRowData.ramadan_name_arb ?? "",
        from_date: fromDate,
        to_date: toDate,
        remarks: selectedRowData.remarks ?? "",
      });

      setOriginalValues({
        ramadan_name_eng: selectedRowData.ramadan_name_eng ?? "",
        ramadan_name_arb: selectedRowData.ramadan_name_arb ?? "",
        from_date: fromDate ? format(fromDate, "yyyy-MM-dd") : null,
        to_date: toDate ? format(toDate, "yyyy-MM-dd") : null,
        remarks: selectedRowData.remarks ?? "",
      });
    } else {
      form.reset({
        ramadan_name: "",
        from_date: undefined,
        to_date: undefined,
        remarks: "",
      });
      setOriginalValues(null);
    }
  }, [selectedRowData, language, form]);

  const handleError = (error: any) => {
    console.error("API Error:", error);
    
    const errorMessage = 
      error?.response?.data?.message || 
      error?.message || 
      translations?.toastNotifications?.formsubmission_error || 
      "Form submission error.";
    
    const overlappingDates = error?.response?.data?.overlapping_dates;

    showToast("error", "formsubmission_error");

    if (overlappingDates && Array.isArray(overlappingDates) && overlappingDates.length > 0) {
      overlappingDates.forEach((overlap: any, index: number) => {
        const fromDate = new Date(overlap.from_date).toLocaleDateString();
        const toDate = new Date(overlap.to_date).toLocaleDateString();
        const name = language === "en" 
          ? overlap.ramadan_name_eng 
          : overlap.ramadan_name_arb;
        
        setTimeout(() => {
          showToast("error", `Overlap ${index + 1}: ${name} (${fromDate} - ${toDate})`);
        }, (index + 1) * 100);
      });
    }

    if (error?.response?.status === 409) {
      showToast("error", "findduplicate_error");
    }
  };

  const addMutation = useMutation({
    mutationFn: addRamadanScheduleRequest,
    onSuccess: (data) => {
      showToast("success", "addramadan_success");
      onSave(null, data.data);
      on_open_change(false);
      queryClient.invalidateQueries({ queryKey: ["ramadan"] });
    },
    onError: handleError,
  });

  const editMutation = useMutation({
    mutationFn: editRamadanScheduleRequest,
    onSuccess: (_data, variables) => {
      showToast("success", "updateramadan_success");
      onSave(variables.ramadan_id?.toString() ?? null, variables);
      queryClient.invalidateQueries({ queryKey: ["ramadan"] });
      on_open_change(false);
    },
    onError: handleError,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      if (selectedRowData) {
        const ramadanId = selectedRowData.ramadan_id || selectedRowData.id;
        
        if (!ramadanId) {
          console.error("No valid ramadan ID found. selectedRowData:", selectedRowData);
          showToast("error", "formsubmission_error");
          setIsSubmitting(false);
          return;
        }

        const payload: any = {
          ramadan_id: Number(ramadanId),
        };

        if (originalValues) {
          if (language === "en") {
            if (values.ramadan_name !== originalValues.ramadan_name_eng) {
              payload.ramadan_name_eng = values.ramadan_name;
            }
          } else {
            if (values.ramadan_name !== originalValues.ramadan_name_arb) {
              payload.ramadan_name_arb = values.ramadan_name;
            }
          }

          const fromDateString = values.from_date ? format(values.from_date, "yyyy-MM-dd") : null;
          if (fromDateString !== originalValues.from_date) {
            payload.from_date = fromDateString;
          }

          const toDateString = values.to_date ? format(values.to_date, "yyyy-MM-dd") : null;
          if (toDateString !== originalValues.to_date) {
            payload.to_date = toDateString;
          }

          const currentRemarks = values.remarks ?? "";
          if (currentRemarks !== originalValues.remarks) {
            payload.remarks = currentRemarks;
          }
        } else {
          if (language === "en") {
            payload.ramadan_name_eng = values.ramadan_name;
          } else {
            payload.ramadan_name_arb = values.ramadan_name;
          }
          payload.from_date = values.from_date ? format(values.from_date, "yyyy-MM-dd") : null;
          payload.to_date = values.to_date ? format(values.to_date, "yyyy-MM-dd") : null;
          payload.remarks = values.remarks;
        }

        const hasChanges = Object.keys(payload).length > 1;

        if (!hasChanges) {
          setIsSubmitting(false);
          return;
        }
        editMutation.mutate(payload);
      } else {
        const payload: any = {
          from_date: values.from_date ? format(values.from_date, "yyyy-MM-dd") : null,
          to_date: values.to_date ? format(values.to_date, "yyyy-MM-dd") : null,  
          remarks: values.remarks,
        };

        if (language === "en") {
          payload.ramadan_name_eng = values.ramadan_name;
        } else {
          payload.ramadan_name_arb = values.ramadan_name;
        }
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 gap-y-4 min-w-0">
            <FormField
              control={form.control}
              name="ramadan_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {language === "ar"
                      ? `${t.ramadan_name || "Ramadan Name"} (العربية)`
                      : `${t.ramadan_name || "Ramadan Name"} (English)`}
                    <Required />
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t.Placeholder_ramadan_name || "Enter ramadan name"} 
                      type="text" 
                      {...field}
                      disabled={isSubmitting}
                      className={language === "ar" ? "text-right" : "text-left"}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.ramadan_name}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.remarks || "Remarks"}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t.Placeholder_remark || "Enter the remark"} 
                      type="text" 
                      {...field}
                      disabled={isSubmitting}
                    />
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
                    {t.from_date || "From Date"} <Required />
                  </FormLabel>
                  <Popover open={popoverStates.fromDate} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, fromDate: open }))}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button 
                          size={"lg"} 
                          variant={"outline"}
                          className="w-full bg-accent px-3 flex justify-between text-text-primary max-w-[350px] 3xl:max-w-[450px] text-sm font-normal"
                          disabled={isSubmitting}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yy")
                          ) : (
                            <span className="font-normal text-sm text-text-secondary">
                              {t.placeholder_date || "Choose date"}
                            </span>
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
                  <TranslatedError
                    fieldError={form.formState.errors.from_date}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="to_date"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>
                    {t.to_date || "To Date"} <Required />
                  </FormLabel>
                  <Popover open={popoverStates.toDate} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, toDate: open }))}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button 
                          size={"lg"} 
                          variant={"outline"}
                          className="w-full bg-accent px-3 flex justify-between text-text-primary max-w-[350px] 3xl:max-w-[450px] text-sm font-normal"
                          disabled={isSubmitting}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yy")
                          ) : (
                            <span className="font-normal text-sm text-text-secondary">
                              {t.placeholder_date || "Choose date"}
                            </span>
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
                        disabled={(date) => {
                          const ramadanStartDate = form.getValues("from_date");
                          
                          if (!ramadanStartDate) {
                            return true;
                          }
                          
                          const startDate = new Date(ramadanStartDate);
                          startDate.setHours(0, 0, 0, 0);
                          
                          const compareDate = new Date(date);
                          compareDate.setHours(0, 0, 0, 0);
                          return compareDate <= startDate;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <TranslatedError
                    fieldError={form.formState.errors.to_date}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end gap-2 items-center">
            <div className="flex gap-4">
              <Button
                variant={"outline"}
                type="button"
                size={"lg"}
                className="w-full"
                onClick={() => on_open_change(false)}
                disabled={addMutation.isPending || editMutation.isPending}
              >
                {translations?.buttons?.cancel || "Cancel"}
              </Button>
              <Button 
                type="submit" 
                size={"lg"} 
                className="w-full"
                disabled={addMutation.isPending || editMutation.isPending}
              >
                {addMutation.isPending || editMutation.isPending
                  ? selectedRowData
                    ? translations?.buttons?.updating || "Updating..."
                    : translations?.buttons?.saving || "Saving..."
                  : selectedRowData
                    ? translations?.buttons?.update || "Update"
                    : translations?.buttons?.save || "Save"
                }
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}