"use client";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Calendar } from "@/src/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, ExclamationIcon } from "@/src/icons/icons";
import Required from "@/src/components/ui/required";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { addLeaveRequest } from "@/src/lib/apiHandler";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";

const formSchema = z.object({
  employee: z
    .string()
    .min(1, {
      message: "Employee is required.",
    })
    .max(100),
  leave_types: z
    .string()
    .min(1, {
      message: "Leave type is required.",
    })
    .max(100),
  from_date: z.date({
    required_error: "From Date is required.",
  }),
  to_date: z.date({
    required_error: "To Date is required.",
  }),
  leave_doc_filename_path: z.custom<any>(
    (value) => {
      // Allow empty string
      if (value === "" || value === null || value === undefined) {
        return true;
      }
      
      if (!(value instanceof File)) {
        return false;
      }
      
      // Validate file size (e.g., max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (value.size > maxSize) {
        return false;
      }

      // Validate file type - match server requirements
      const allowedTypes = [
        "application/pdf",
        "image/jpeg", 
        "image/jpg",
        "image/png"
      ];
      if (!allowedTypes.includes(value.type)) {
        return false;
      }

      return true;
    },
    {
      message: "Invalid file. Ensure it's a document/image (PDF/JPG/JPEG/PNG) and less than 5MB.",
    }
  ).optional(),
  employee_remarks: z.string().optional(),
});

export default function AddLeaveApplication({
  on_open_change,
}: {
  on_open_change?: any;
}) {
  const { employeeId, userInfo, isAuthenticated, isChecking } = useAuthGuard();
  const { data: leaveTypesData, isLoading: isLeaveTypesLoading, error: leaveTypesError } = useFetchAllEntity("leaveType");
  const { language, translations } = useLanguage();
  const router = useRouter();
  const [remarksLength, setRemarksLength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedDays, setCalculatedDays] = useState<number>(0);
  const queryClient = useQueryClient();
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
      employee: "",
      leave_types: "",
      leave_doc_filename_path: undefined,
      employee_remarks: "",
    },
  });

  // Function to calculate number of days between dates
  const calculateLeaveDays = useCallback((fromDate: Date, toDate: Date) => {
    if (!fromDate || !toDate) return 0;
    
    // Ensure dates are at start of day for accurate calculation
    const startDate = new Date(fromDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(toDate);
    endDate.setHours(0, 0, 0, 0);
    
    // Calculate the difference in time
    const timeDifference = endDate.getTime() - startDate.getTime();
    
    // Calculate the difference in days and add 1 to include both start and end dates
    const dayDifference = Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1;
    
    return Math.max(0, dayDifference); // Ensure non-negative result
  }, []);

  // Watch for date changes and calculate days
  const watchFromDate = form.watch("from_date");
  const watchToDate = form.watch("to_date");

  useEffect(() => {
    if (watchFromDate && watchToDate) {
      const days = calculateLeaveDays(watchFromDate, watchToDate);
      setCalculatedDays(days);
    } else {
      setCalculatedDays(0);
    }
  }, [watchFromDate, watchToDate, calculateLeaveDays]);

  const addMutation = useMutation({
    mutationFn: addLeaveRequest,
    onSuccess: (data) => {
      toast.success("Leave application submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["employeeLeave"] });
      router.push("/self-services/leaves/my-request");
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        toast.error("Duplicate leave request detected. Please use different values.");
      } else {
        toast.error("Failed to submit leave application. Please try again.");
      }
    },
  });

  useEffect(() => {
    if (userInfo && employeeId) {
      const employeeDisplayInfo = getEmployeeDisplayInfoWithLanguage(); 
      form.setValue("employee", employeeDisplayInfo.displayName);
    } else if (employeeId) {
      const fallbackName = `Employee ${employeeId}`;
      form.setValue("employee", fallbackName);
    }
  }, [userInfo, employeeId, form, language]);

  if (isChecking) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !employeeId) {
    return <div>Unauthorized access</div>;
  }

  const getEmployeeDisplayInfo = () => {
    if (userInfo) {
      let employeeName = "Unknown Employee";
      let employeeCode = employeeId?.toString() || "Unknown Code";
      
      if (userInfo.employeename) {
        if (userInfo.employeename.firsteng && userInfo.employeename.lasteng) {
          employeeName = `${userInfo.employeename.firsteng}`.trim();
        }
        else if (userInfo.employeename.firstarb && userInfo.employeename.lastarb) {
          employeeName = `${userInfo.employeename.firstarb}`.trim();
        }
        else if (userInfo.employeename.firsteng) {
          employeeName = userInfo.employeename.firsteng;
        }
        else if (userInfo.employeename.firstarb) {
          employeeName = userInfo.employeename.firstarb;
        }
      }
      
      if (userInfo.employeenumber) {
        employeeCode = userInfo.employeenumber.toString();
      }
      
      const result = {
        displayName: `${employeeName} (${employeeCode})`,
        name: employeeName,
        code: employeeCode
      };
      
      return result;
    }
    
    const fallbackResult = {
      displayName: employeeId ? `Employee ${employeeId}` : "Unknown Employee",
      name: employeeId ? `Employee ${employeeId}` : "Unknown Employee", 
      code: employeeId ? employeeId.toString() : "Unknown"
    };
    
    return fallbackResult;
  };

  const getEmployeeDisplayInfoWithLanguage = () => {
    if (userInfo && userInfo.employeename) {
      let employeeName = "Unknown Employee";
      let employeeCode = userInfo.employeenumber?.toString() || employeeId?.toString() || "Unknown Code";
      
      if (language === "ar") {
        if (userInfo.employeename.firstarb && userInfo.employeename.lastarb) {
          employeeName = `${userInfo.employeename.firstarb}`.trim();
        } else if (userInfo.employeename.firsteng && userInfo.employeename.lasteng) {
          employeeName = `${userInfo.employeename.firsteng}`.trim();
        } else if (userInfo.employeename.firstarb) {
          employeeName = userInfo.employeename.firstarb;
        } else if (userInfo.employeename.firsteng) {
          employeeName = userInfo.employeename.firsteng;
        }
      } else {
        if (userInfo.employeename.firsteng && userInfo.employeename.lasteng) {
          employeeName = `${userInfo.employeename.firsteng}`.trim();
        } else if (userInfo.employeename.firstarb && userInfo.employeename.lastarb) {
          employeeName = `${userInfo.employeename.firstarb}`.trim();
        } else if (userInfo.employeename.firsteng) {
          employeeName = userInfo.employeename.firsteng;
        } else if (userInfo.employeename.firstarb) {
          employeeName = userInfo.employeename.firstarb;
        }
      }
            
      return {
        displayName: `${employeeName} (${employeeCode})`,
        name: employeeName,
        code: employeeCode
      };
    }
    
    return {
      displayName: employeeId ? `Employee ${employeeId}` : "Unknown Employee",
      name: employeeId ? `Employee ${employeeId}` : "Unknown Employee", 
      code: employeeId ? employeeId.toString() : "Unknown"
    };
  };

  const employeeDisplayInfo = getEmployeeDisplayInfo();

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const selectedLeaveType = leaveTypesData?.data?.find(
        (leaveType: any) => leaveType.leave_type_id.toString() === values.leave_types
      );

      const fromDate = new Date(values.from_date);
      fromDate.setHours(0, 0, 0, 0);
      const fromDateISO = fromDate.toISOString();

      const toDate = new Date(values.to_date);
      toDate.setHours(23, 59, 59, 999);
      const toDateISO = toDate.toISOString();

      const numberOfLeaveDays = calculateLeaveDays(values.from_date, values.to_date);

      const payload: any = {
        leave_type_id: selectedLeaveType?.leave_type_id || null,
        employee_id: employeeId,
        from_date: fromDateISO,
        to_date: toDateISO,
        number_of_leaves: numberOfLeaveDays,
        employee_remarks: values.employee_remarks,
      };

      if (values.leave_doc_filename_path && values.leave_doc_filename_path instanceof File) {
        payload.leave_doc_filename_path = values.leave_doc_filename_path;
      }

      addMutation.mutate(payload);
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-accent transition-all duration-300 rounded-xl p-6">
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-xl text-primary flex items-center justify-between">
            My Leave Request
          </h1>
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
            <div className="grid grid-cols-2 gap-y-5 gap-10 px-8 pt-8">
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
                        value={employeeDisplayInfo.displayName}
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
                name="leave_types"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leave types <Required /></FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLeaveTypesLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="max-w-[350px]">
                          <SelectValue 
                            placeholder={
                              isLeaveTypesLoading 
                                ? "Loading leave types..." 
                                : leaveTypesError 
                                ? "Error loading leave types" 
                                : "Choose leave types"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {leaveTypesData?.data?.map((leaveType: any) => (
                          <SelectItem
                            key={leaveType.leave_type_id}
                            value={leaveType.leave_type_id.toString()}
                          >
                            {language === "ar" && leaveType.leave_type_arb 
                              ? leaveType.leave_type_arb 
                              : leaveType.leave_type_eng || leaveType.leave_type_name
                            }
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                          disabled={(date) => {
                            const tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            tomorrow.setHours(0, 0, 0, 0);
                            return date < tomorrow;
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
                            closePopover('toDate')
                          }}
                          disabled={(date) => {
                            const fromDate = form.getValues("from_date");
                            
                            if (!fromDate) {
                              return true;
                            }
                            
                            const startDate = new Date(fromDate);
                            startDate.setHours(0, 0, 0, 0);
                            
                            const compareDate = new Date(date);
                            compareDate.setHours(0, 0, 0, 0);
                            return compareDate < startDate;
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
                name="leave_doc_filename_path"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>
                      Attachment
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...fieldProps}
                        className="border-0 p-0 rounded-none h-auto text-text-secondary"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/jpg,image/png"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          onChange(file || undefined);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employee_remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add your remarks here"
                        className="max-w-[350px]" 
                        {...field} 
                        rows={4}
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
            <div className="flex justify-end gap-2 items-center py-5 pt-8">
              <div className="flex gap-4 px-5">
                <Button
                  variant={"outline"}
                  type="button"
                  size={"lg"}
                  className="w-full"
                  onClick={() => router.push("/self-services/leaves/my-request")}
                >
                  {translations.buttons.cancel}
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