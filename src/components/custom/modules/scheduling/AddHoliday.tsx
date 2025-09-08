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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      holiday_name: "",
      from_date: null,
      to_date: null,
      remarks:"",
      recurring_flag: false,
      public_holiday_flag: false,
    },
  });
  
  useEffect(() => {
    if (selectedRowData) {
      form.reset({
        holiday_name:
          language === "en"
            ? selectedRowData.holiday_eng ?? ""
            : selectedRowData.holiday_arb ?? "",
        from_date: selectedRowData.from_date
          ? new Date(selectedRowData.from_date): null,
        to_date: selectedRowData.to_date
          ? new Date(selectedRowData.to_date)  : null,
        remarks: selectedRowData.remarks ?? "",
        recurring_flag: selectedRowData.recurring_flag ?? false,
        public_holiday_flag: selectedRowData.public_holiday_flag ?? false,
      });
    } else {
      form.reset(); // clears on add
    }
  }, [selectedRowData, language]);

  const addMutation = useMutation({
    mutationFn: addHolidayScheduleRequest,
    onSuccess: (data) => {
      toast.success("Holiday added successfully!");
      onSave(null, data.data);
      on_open_change(false);
      queryClient.invalidateQueries({ queryKey: ["holiday"] });
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        toast.error("Duplicate data detected. Please use different values.");
      } else {
        toast.error("Form submission error.");
      }
    },
  });

  const editMutation = useMutation({
    mutationFn: editHolidayScheduleRequest,
    onSuccess: (_data, variables) => {
      toast.success("Holiday updated successfully!");
      onSave(variables.holiday_id?.toString() ?? null, variables);
      queryClient.invalidateQueries({ queryKey: ["holiday"] });
      on_open_change(false);
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        toast.error("Duplicate data detected. Please use different values.");
      } else {
        toast.error("Form submission error.");
      }
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const payload: any = {
        from_date: values.from_date
          ? format(values.from_date, "yyyy-MM-dd"): null,
        to_date: values.to_date
          ? format(values.to_date, "yyyy-MM-dd"): null,
        remarks: values.remarks,  
        recurring_flag: values.recurring_flag,
        public_holiday_flag: values.public_holiday_flag,
      };
      // Add only the language-specific name being edited
      if (language === "en") {
        payload.holiday_eng = values.holiday_name;
      } else {
        payload.holiday_arb = values.holiday_name;
      }

      if (selectedRowData) {
        editMutation.mutate({
          holiday_id: selectedRowData.id,
          ...payload,
        });
      } else {
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
          <div className="py-5 flex flex-col">
            <div className="flex gap-10 items-center p-7 pt-0">
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
              Save
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
