"use client";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
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
import { format } from "date-fns";
import { TimePicker } from "@/src/components/ui/time-picker";
import Required from "@/src/components/ui/required";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { addManualPunchRequest } from "@/src/lib/apiHandler";

const formSchema = z.object({
  employee: z
    .string()
    .min(1, {
      message: "Employee is required.",
    })
    .max(100),
  reason: z
    .string()
    .min(1, {
      message: "Reason is required.",
    })
    .max(100),
  from_date: z.date({
    required_error: "Date is required.",
  }),
  time: z.date({
    required_error: "Time is required.",
  }),
  employee_remarks: z.string().optional(),
});

export default function ApplyMissingPunch({
  on_open_change,
  rowData,
  punchType,
}: {
  on_open_change?: any;
  rowData?: any;
  punchType?: string;
}) {
  const { employeeId, userInfo, isAuthenticated, isChecking } = useAuthGuard();
  const { language, translations } = useLanguage();
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
      employee: "",
      reason: "",
      employee_remarks: "",
    },
  });

  const applyMissingPunchMutation = useMutation({
    mutationFn: addManualPunchRequest,
    onSuccess: (data) => {
      toast.success("Missing punch applied successfully!");
      queryClient.invalidateQueries({ queryKey: ["missingMovement"] });
      setIsSubmitting(false);
      if (on_open_change) {
        on_open_change(false);
      }
    },
    onError: (error: any) => {
      console.error("API Error:", error);
      toast.error(error?.response?.data?.message || "Failed to apply missing punch. Please try again.");
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
      
      const employeeDisplay = `${rowData.employee_name} (${rowData.Employee_Id})`;
      form.setValue("employee", employeeDisplay);
      
      form.setValue("reason", punchType);
      
      if (rowData.TransDate) {
        const parsedDate = parseTransDate(rowData.TransDate);
        form.setValue("from_date", parsedDate);
      }
      
    }
  }, [rowData, punchType, form, parseTransDate]);
  if (isChecking) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !employeeId) {
    return <div>Unauthorized access</div>;
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const combinedDateTime = new Date(values.from_date);
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
        employee_id: Number(rowData?.Employee_Id),
        transaction_time: transaction_time,
        Emp_Missing_Movements_Id: Number(rowData?.emp_missing_Movements_Id),
        reason: values.reason,
        remarks: values.employee_remarks || "",
        transaction_status: "Pending",
      };

      console.log('Selected time:', format(values.time, "HH:mm:ss"));
      console.log('Transaction time (ISO):', transaction_time);
      
      applyMissingPunchMutation.mutate(payload);
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
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
                <ExclamationIcon className="mr-2" width="14" height="14"/> Maximum 500 characters only allowed.
              </p>
            )}
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-y-5 gap-10 pt-8">
              <FormField
                control={form.control}
                name="employee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Employee <Required />
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        readOnly
                        className="bg-gray-50 cursor-not-allowed"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason <Required /></FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        readOnly
                        className="bg-gray-50 cursor-not-allowed"
                        placeholder="Punch Type"
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
                      Date <Required />
                    </FormLabel>
                    <Popover open={popoverStates.fromDate} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, fromDate: open }))}>
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
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date)
                            closePopover('fromDate')
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
                name="time"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>Time <Required/></FormLabel>
                    <Popover open={popoverStates.fromTime} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, fromTime: open }))}>
                      <FormControl>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "flex justify-between h-10 w-full max-w-[350px] rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? format(field.value, "HH:mm")
                              : <span className="text-text-secondary">Choose time</span>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employee_remarks"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Remarks </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add your remarks here"
                        {...field} 
                        rows={3}
                        onChange={(e) => {
                          field.onChange(e);
                          setRemarksLength(e.target.value.length);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
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
                  {isSubmitting ? "Applying..." : "Apply"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}