"use client";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { debounce } from "lodash";
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
import { addLeaveRequest, editLeaveRequest } from "@/src/lib/apiHandler";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { InlineLoading } from "@/src/app/loading";

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
      if (value === "" || value === null || value === undefined) {
        return true;
      }

      if (!(value instanceof File)) {
        return false;
      }

      const maxSize = 5 * 1024 * 1024;
      if (value.size > maxSize) {
        return false;
      }

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
  selectedRowData,
  onSave,
}: {
  selectedRowData?: any;
  onSave?: (id: string | null, newData: any) => void;
}) {
  const { employeeId, userInfo, isAuthenticated, isChecking } = useAuthGuard();
  const { data: leaveTypesData, isLoading: isLeaveTypesLoading, error: leaveTypesError } = useFetchAllEntity("leaveType", {
    removeAll: true,
  });
  const { language, translations } = useLanguage();
  const router = useRouter();
  const [remarksLength, setRemarksLength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedDays, setCalculatedDays] = useState<number>(0);
  const [leaveTypeSearchTerm, setLeaveTypeSearchTerm] = useState("");
  const queryClient = useQueryClient();
  const [popoverStates, setPopoverStates] = useState({
    fromDate: false,
    toDate: false,
  });
  const [originalValues, setOriginalValues] = useState<any>(null);
  // Debug: Log what we receive
  useEffect(() => {
    console.log('AddLeaveApplication received selectedRowData:', selectedRowData);
  }, [selectedRowData]);

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

  // Debounced search for leave types
  const debouncedLeaveTypeSearch = useCallback(
    debounce((searchTerm: string) => {
      setLeaveTypeSearchTerm(searchTerm);
    }, 300),
    []
  );

  const calculateLeaveDays = useCallback((fromDate: Date, toDate: Date) => {
    if (!fromDate || !toDate) return 0;

    const startDate = new Date(fromDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(toDate);
    endDate.setHours(0, 0, 0, 0);

    const timeDifference = endDate.getTime() - startDate.getTime();

    const dayDifference = Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1;

    return Math.max(0, dayDifference);
  }, []);

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
      if (onSave) {
        onSave(null, data.data);
      }
      queryClient.invalidateQueries({ queryKey: ["employeeLeave"] });
      router.push("/self-services/leaves/my-request");
    },
    onError: (error: any) => {
      console.error("API Error:", error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to submit leave application. Please try again.";

      toast.error(errorMessage);
    },
  });

  const editMutation = useMutation({
    mutationFn: editLeaveRequest,
    onSuccess: (_data, variables) => {
      toast.success("Leave application updated successfully!");
      if (onSave) {
        onSave(variables.leave_id?.toString() ?? null, variables);
      }
      queryClient.invalidateQueries({ queryKey: ["employeeLeave"] });
      router.push("/self-services/leaves/my-request");
    },
    onError: (error: any) => {
      console.error("API Error:", error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update leave application. Please try again.";

      toast.error(errorMessage);
    },
  });

  useEffect(() => {
    if (selectedRowData && leaveTypesData?.data) {
      console.log("Loading edit data:", selectedRowData);

      const leaveTypeId = (
        selectedRowData.leave_type_id ||
        selectedRowData.leave_types?.leave_type_id
      )?.toString() || "";

      console.log("Extracted leave_type_id:", leaveTypeId);

      if (leaveTypeId) {
        form.setValue("leave_types", leaveTypeId);
      }

      let fromDate: Date;
      let toDate: Date;

      if (selectedRowData.from_date) {
        if (typeof selectedRowData.from_date === 'string' && selectedRowData.from_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = selectedRowData.from_date.split('-').map(Number);
          fromDate = new Date(year, month - 1, day);
        } else {
          fromDate = new Date(selectedRowData.from_date);
        }
      } else {
        fromDate = new Date();
      }

      if (selectedRowData.to_date) {
        if (typeof selectedRowData.to_date === 'string' && selectedRowData.to_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = selectedRowData.to_date.split('-').map(Number);
          toDate = new Date(year, month - 1, day);
        } else {
          toDate = new Date(selectedRowData.to_date);
        }
      } else {
        toDate = new Date();
      }

      if (!isNaN(fromDate.getTime())) {
        form.setValue("from_date", fromDate);
      }

      if (!isNaN(toDate.getTime())) {
        form.setValue("to_date", toDate);
      }

      form.setValue("employee_remarks", selectedRowData.employee_remarks || "");
      setRemarksLength(selectedRowData.employee_remarks?.length || 0);

      // Store original values for comparison
      setOriginalValues({
        leave_type_id: leaveTypeId,
        from_date: !isNaN(fromDate.getTime()) ? format(fromDate, 'yyyy-MM-dd') : null,
        to_date: !isNaN(toDate.getTime()) ? format(toDate, 'yyyy-MM-dd') : null,
        employee_remarks: selectedRowData.employee_remarks || "",
        has_attachment: selectedRowData.leave_doc_filename_path && selectedRowData.leave_doc_filename_path !== '-'
      });
    }
  }, [selectedRowData, leaveTypesData?.data, form]);

  useEffect(() => {
    if (userInfo && employeeId) {
      const employeeDisplayInfo = getEmployeeDisplayInfoWithLanguage();
      form.setValue("employee", employeeDisplayInfo.displayName);
    } else if (employeeId) {
      const fallbackName = `Employee ${employeeId}`;
      form.setValue("employee", fallbackName);
    }
  }, [userInfo, employeeId, form, language]);

  useEffect(() => {
    return () => {
      debouncedLeaveTypeSearch.cancel();
    };
  }, [debouncedLeaveTypeSearch]);

  if (isChecking) {
    return <InlineLoading message="Loading..." />;
  }

  if (!isAuthenticated || !employeeId) {
    return <InlineLoading message="Loading..." />;
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

  const getLeaveTypeName = (leaveType: any) => {
    return language === "ar" && leaveType.leave_type_arb
      ? leaveType.leave_type_arb
      : leaveType.leave_type_eng || leaveType.leave_type_name;
  };

  const getFilteredLeaveTypes = () => {
    if (!leaveTypesData?.data) return [];

    const types = leaveTypesData.data.filter((item: any) => item.leave_type_id);

    if (leaveTypeSearchTerm) {
      return types.filter((item: any) => {
        const name = getLeaveTypeName(item).toLowerCase();
        return name.includes(leaveTypeSearchTerm.toLowerCase());
      });
    }

    return types;
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const selectedLeaveType = leaveTypesData?.data?.find(
        (leaveType: any) => leaveType.leave_type_id.toString() === values.leave_types
      );

      const fromDateLocal = format(values.from_date, 'yyyy-MM-dd');
      const toDateLocal = format(values.to_date, 'yyyy-MM-dd');
      const numberOfLeaveDays = calculateLeaveDays(values.from_date, values.to_date);

      if (selectedRowData && Object.keys(selectedRowData).length > 0) {
        // EDIT MODE - Send only changed fields
        const leaveId = selectedRowData.employee_leave_id ||
          selectedRowData.leave_id ||
          selectedRowData.id;

        if (!leaveId) {
          console.error("No valid leave ID found. selectedRowData:", selectedRowData);
          toast.error("Unable to update: Leave ID not found. Please try again.");
          setIsSubmitting(false);
          return;
        }

        const payload: any = {
          employee_leave_id: leaveId,
        };

        // Only add fields that have changed
        if (originalValues) {
          // Check leave type
          if (selectedLeaveType?.leave_type_id.toString() !== originalValues.leave_type_id) {
            payload.leave_type_id = selectedLeaveType?.leave_type_id;
          }

          // Check from date
          if (fromDateLocal !== originalValues.from_date) {
            payload.from_date = fromDateLocal;
          }

          // Check to date
          if (toDateLocal !== originalValues.to_date) {
            payload.to_date = toDateLocal;
          }

          // If dates changed, recalculate number of leaves
          if (payload.from_date || payload.to_date) {
            payload.number_of_leaves = numberOfLeaveDays;
          }

          // Check remarks
          const currentRemarks = values.employee_remarks || "";
          if (currentRemarks !== originalValues.employee_remarks) {
            payload.employee_remarks = currentRemarks;
          }

          // Check if new file is uploaded
          if (values.leave_doc_filename_path && values.leave_doc_filename_path instanceof File) {
            payload.leave_doc_filename_path = values.leave_doc_filename_path;
          }
        } else {
          // Fallback: if no original values, send all fields (shouldn't happen)
          payload.leave_type_id = selectedLeaveType?.leave_type_id || null;
          payload.from_date = fromDateLocal;
          payload.to_date = toDateLocal;
          payload.number_of_leaves = numberOfLeaveDays;
          payload.employee_remarks = values.employee_remarks;

          if (values.leave_doc_filename_path && values.leave_doc_filename_path instanceof File) {
            payload.leave_doc_filename_path = values.leave_doc_filename_path;
          }
        }

        // Check if there are any changes to submit
        const hasChanges = Object.keys(payload).length > 1; // More than just employee_leave_id

        if (!hasChanges) {
          setIsSubmitting(false);
          return;
        }

        console.log("Editing leave with ID:", leaveId);
        console.log("Changed fields payload:", payload);

        editMutation.mutate(payload);
      } else {
        // ADD MODE - Send all required fields
        const payload: any = {
          leave_type_id: selectedLeaveType?.leave_type_id || null,
          employee_id: employeeId,
          from_date: fromDateLocal,
          to_date: toDateLocal,
          number_of_leaves: numberOfLeaveDays,
          employee_remarks: values.employee_remarks,
        };

        if (values.leave_doc_filename_path && values.leave_doc_filename_path instanceof File) {
          payload.leave_doc_filename_path = values.leave_doc_filename_path;
        }

        console.log("Adding new leave. Payload:", payload);
        addMutation.mutate(payload);
      }
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
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
                <ExclamationIcon className="mr-2" width="14" height="14" /> Maximum 500 characters only allowed.
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
                        <SelectTrigger className="max-w-[350px] 3xl:max-w-[450px]">
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
                      <SelectContent
                        showSearch={true}
                        searchPlaceholder="Search leave types..."
                        onSearchChange={debouncedLeaveTypeSearch}
                        className="mt-1 max-w-[350px] 3xl:max-w-[450px]"
                      >
                        {getFilteredLeaveTypes().length === 0 ? (
                          <div className="p-3 text-sm text-text-secondary">
                            {leaveTypeSearchTerm ? "No leave types found" : "No leave types available"}
                          </div>
                        ) : (
                          getFilteredLeaveTypes().map((leaveType: any) => (
                            <SelectItem
                              key={leaveType.leave_type_id}
                              value={leaveType.leave_type_id.toString()}
                            >
                              {getLeaveTypeName(leaveType)}
                            </SelectItem>
                          ))
                        )}
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
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date)
                            closePopover('toDate')
                          }}
                          disabled={(date) => {
                            const fromDate = form.getValues("from_date");

                            if (!fromDate) return false;

                            const from = new Date(fromDate);
                            from.setHours(0, 0, 0, 0);

                            const current = new Date(date);
                            current.setHours(0, 0, 0, 0);

                            return current < from;
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
                      {selectedRowData?.leave_doc_filename_path && selectedRowData.leave_doc_filename_path !== '-' && (
                        <span className="text-xs text-gray-500 ml-2">
                          (Current: {selectedRowData.leave_doc_filename_path.split('/').pop()})
                        </span>
                      )}
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
                    {selectedRowData && (
                      <p className="text-xs text-gray-500">
                        Leave empty to keep existing attachment, or upload a new file to replace it
                      </p>
                    )}
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
                        className="max-w-[350px] 3xl:max-w-[450px]"
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
                  disabled={addMutation.isPending || editMutation.isPending}
                >
                  {addMutation.isPending || editMutation.isPending
                    ? selectedRowData
                      ? "Updating..."
                      : "Applying..."
                    : selectedRowData
                      ? "Update"
                      : "Apply"
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