"use client";
import { useEffect, useState } from "react"
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/src/lib/utils";
import { useRouter } from "next/navigation";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Calendar } from "@/src/components/ui/calendar";
import { CalendarIcon, ClockIcon, ExclamationIcon, RefreshIcon } from "@/src/icons/icons";
import { format } from "date-fns";
import { TimePicker } from "@/src/components/ui/time-picker";
import Required from "@/src/components/ui/required";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { addShortPermissionRequest, editShortPermissionRequest } from "@/src/lib/apiHandler";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";

const formSchema = z.object({
  employee: z
    .string()
    .min(1, {
      message: "Employee is required.",
    })
    .max(100),
  permission_types: z
    .string()
    .min(1, {
      message: "Permission type is required.",
    })
    .max(100),
  from_date: z.date({
    required_error: "From Date is required.",
  }),
  to_date: z.date({
    required_error: "To Date is required.",
  }),
  from_time: z.date({
    required_error: "From Time is required.",
  }),
  to_time: z.date({
    required_error: "To Time is required.",
  }),
  remarks: z.string().optional(),
}).refine((data) => {
  if (data.from_date && data.to_date && data.from_time && data.to_time) {
    const fromDateStr = format(data.from_date, "yyyy-MM-dd");
    const toDateStr = format(data.to_date, "yyyy-MM-dd");
    
    if (fromDateStr === toDateStr) {
      const fromTimeStr = format(data.from_time, "HH:mm:ss");
      const toTimeStr = format(data.to_time, "HH:mm:ss");
      return toTimeStr >= fromTimeStr;
    }
    
    const fromDateTime = new Date(data.from_date);
    fromDateTime.setHours(data.from_time.getHours(), data.from_time.getMinutes(), data.from_time.getSeconds());
    
    const toDateTime = new Date(data.to_date);
    toDateTime.setHours(data.to_time.getHours(), data.to_time.getMinutes(), data.to_time.getSeconds());
    
    return toDateTime >= fromDateTime;
  }
  return true;
}, {
  message: "To time must be greater than or equal to from time",
  path: ["to_time"],
});

export default function AddPermissionApplication({
  selectedRowData,
  onSave,
}: {
  selectedRowData?: any;
  onSave?: (id: string | null, newData: any) => void;
}) {

  const { employeeId, userInfo, isAuthenticated, isChecking } = useAuthGuard();
  
  const { data: permissionTypesData, isLoading: isPermissionTypesLoading, error: permissionTypesError } = useFetchAllEntity("permissionType");

  const { language, translations } = useLanguage();
  const router = useRouter();
  const [selectedPermission, setSelectedPermission] = useState<string | null>(null);
  const [remarksLength, setRemarksLength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const [popoverStates, setPopoverStates] = useState({
    fromDate: false,
    toDate: false,
    fromTime: false,
    toTime: false,
  });
  const closePopover = (key: string) => {
    setPopoverStates(prev => ({ ...prev, [key]: false }));
  };
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee: "",
      permission_types: "",
      remarks: "",
    },
  });

  const { watch, setValue } = form;

  const addMutation = useMutation({
    mutationFn: addShortPermissionRequest,
    onSuccess: (data) => {
      toast.success("Permission application submitted successfully!");
      if (onSave) {
        onSave(null, data.data);
      }
      queryClient.invalidateQueries({ queryKey: ["employeeShortPermission"] });
      router.push("/self-services/permissions/my-request");
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        toast.error("Duplicate permission request detected. Please use different values.");
      } else {
        toast.error("Failed to submit permission application. Please try again.");
      }
    },
  });

  const editMutation = useMutation({
    mutationFn: editShortPermissionRequest,
    onSuccess: (_data, variables) => {
      toast.success("Permission application updated successfully!");
      if (onSave) {
        onSave(variables.short_permission_id?.toString() ?? null, variables);
      }
      queryClient.invalidateQueries({ queryKey: ["employeeShortPermission"] });
      router.push("/self-services/permissions/my-request");
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        toast.error("Duplicate permission request detected. Please use different values.");
      } else {
        toast.error("Failed to update permission application. Please try again.");
      }
    },
  });

  useEffect(() => {
    if (selectedRowData && permissionTypesData?.data) {
      const permissionTypeId = selectedRowData.permission_type_id?.toString() || "";
      
      form.setValue("permission_types", permissionTypeId);
      form.setValue("from_date", selectedRowData.from_date ? new Date(selectedRowData.from_date) : new Date());
      form.setValue("to_date", selectedRowData.to_date ? new Date(selectedRowData.to_date) : new Date());
      form.setValue("from_time", selectedRowData.from_time ? new Date(selectedRowData.from_time) : new Date());
      form.setValue("to_time", selectedRowData.to_time ? new Date(selectedRowData.to_time) : new Date());
      form.setValue("remarks", selectedRowData.remarks || "");
      
      setRemarksLength(selectedRowData.remarks?.length || 0);
      setSelectedPermission(permissionTypeId);
    }
  }, [selectedRowData, permissionTypesData?.data, form]);

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

  const calculatePermissionMinutes = (fromTime: Date, toTime: Date) => {
    const diffMs = toTime.getTime() - fromTime.getTime();
    return Math.round(diffMs / (1000 * 60));
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const selectedPermissionType = permissionTypesData?.data?.find(
        (permType: any) => permType.permission_type_id.toString() === values.permission_types
      );

      const fromDateString = `${values.from_date.getFullYear()}-${(values.from_date.getMonth() + 1).toString().padStart(2, '0')}-${values.from_date.getDate().toString().padStart(2, '0')}`;

      const toDateString = `${values.to_date.getFullYear()}-${(values.to_date.getMonth() + 1).toString().padStart(2, '0')}-${values.to_date.getDate().toString().padStart(2, '0')}`;

      const fromTimeString = `${values.from_time.getHours().toString().padStart(2, '0')}:${values.from_time.getMinutes().toString().padStart(2, '0')}:${values.from_time.getSeconds().toString().padStart(2, '0')}`;

      const toTimeString = `${values.to_time.getHours().toString().padStart(2, '0')}:${values.to_time.getMinutes().toString().padStart(2, '0')}:${values.to_time.getSeconds().toString().padStart(2, '0')}`;
      const actualFromDateTime = new Date(values.from_date);
      actualFromDateTime.setHours(values.from_time.getHours(), values.from_time.getMinutes(), values.from_time.getSeconds());
      
      const actualToDateTime = new Date(values.to_date);
      actualToDateTime.setHours(values.to_time.getHours(), values.to_time.getMinutes(), values.to_time.getSeconds());
      
      const permMinutes = calculatePermissionMinutes(actualFromDateTime, actualToDateTime);

      const payload: any = {
        permission_type_id: selectedPermissionType?.permission_type_id || null,
        employee_id: employeeId,
        from_date: fromDateString,
        to_date: toDateString,
        from_time: fromTimeString,
        to_time: toTimeString,  
        perm_minutes: permMinutes,
        remarks: values.remarks || "",
      };

      if (selectedRowData) {
        editMutation.mutate({
          short_permission_id: selectedRowData.short_permission_id,
          ...payload,
        });
      } else {
        addMutation.mutate(payload);
      }
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
            My Permission Request
          </h1>
          <div>
            {selectedPermission === "Personal" && ( 
              <p className="text-xs text-primary border border-blue-200 rounded-md px-2 py-1 font-semibold bg-blue-400 bg-opacity-10 ">
                Note: Personal permission is allowed for a maximum of 8 hours per month.
              </p>
            )}
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
                name="permission_types"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permission types <Required /></FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        const selectedPermissionType = permissionTypesData?.data?.find(
                          (permType: any) => permType.permission_type_id.toString() === value
                        );
                        if (selectedPermissionType) {
                          const permissionName = language === "ar" && selectedPermissionType.permission_type_arb 
                            ? selectedPermissionType.permission_type_arb 
                            : selectedPermissionType.permission_type_eng || selectedPermissionType.permission_type_name;
                          setSelectedPermission(permissionName);
                        } else {
                          setSelectedPermission(null);
                        }
                      }}
                      disabled={isPermissionTypesLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="max-w-[350px]">
                          <SelectValue 
                            placeholder={
                              isPermissionTypesLoading 
                                ? "Loading permission types..." 
                                : permissionTypesError 
                                ? "Error loading permission types" 
                                : "Choose permission types"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {permissionTypesData?.data?.map((permissionType: any) => (
                          <SelectItem
                            key={permissionType.permission_type_id}
                            value={permissionType.permission_type_id.toString()}
                          >
                            {language === "ar" && permissionType.permission_type_arb 
                              ? permissionType.permission_type_arb 
                              : permissionType.permission_type_eng || permissionType.permission_type_name
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
                name="from_time"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>From time <Required/></FormLabel>
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
                name="to_time"
                render={({ field }) => (
                  <FormItem className="">
                  <FormLabel>To time <Required/></FormLabel>
                    <Popover open={popoverStates.toTime} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, toTime: open }))}>
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
            </div>
            <div className="px-8 pt-5 md:pr-24">
              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks </FormLabel>
                    <FormControl>
                      <Textarea
                        className="w-full"
                        placeholder="Enter the remarks"
                        {...field}
                        rows={4}
                        onChange={(e) => {
                          field.onChange(e)
                          setRemarksLength(e.target.value.length)
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
                  onClick={() => router.push("/self-services/permissions/my-request")}
                >
                  {translations.buttons.cancel}
                </Button>
                <Button 
                  type="submit" 
                  size={"lg"} 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting
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