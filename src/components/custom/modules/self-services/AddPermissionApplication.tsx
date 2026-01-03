
"use client";
import { useEffect, useState, useCallback } from "react"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { debounce } from "lodash";
import * as z from "zod";
import { cn } from "@/src/lib/utils";
import { useRouter } from "next/navigation";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Calendar } from "@/src/components/ui/calendar";
import { CalendarIcon, ClockIcon, ExclamationIcon } from "@/src/icons/icons";
import { format } from "date-fns";
import { TimePicker } from "@/src/components/ui/time-picker";
import Required from "@/src/components/ui/required";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { addShortPermissionRequest, editShortPermissionRequest } from "@/src/lib/apiHandler";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { InlineLoading } from "@/src/app/loading";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";

const formSchema = z.object({
  employee: z
    .string()
    .min(1, {
      message: "employee_required",
    })
    .max(100, {
      message: "employee_max_length",
    }),
  permission_types: z
    .string()
    .min(1, {
      message: "permission_type_required",
    })
    .max(100, {
      message: "permission_type_max_length",
    }),
  from_date: z.date({
    required_error: "from_date_required",
  }),
  to_date: z.date({
    required_error: "to_date_required",
  }),
  from_time: z.date({
    required_error: "from_time_required",
  }),
  to_time: z.date({
    required_error: "to_time_required",
  }),
  remarks: z
    .string()
    .min(1, {
      message: "remarks_required",
    })
    .max(500, {
      message: "remarks_max_length",
    }),
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
  message: "to_time_must_be_after_from_time",
  path: ["to_time"],
});

interface AddPermissionApplicationProps {
  selectedRowData?: any;
  onSave?: (id: string | null, newData: any) => void;
  prefillEmployee?: boolean;
  pageTitle?: string;
}

export default function AddPermissionApplication({
  selectedRowData,
  onSave,
  prefillEmployee = true,
  pageTitle
}: AddPermissionApplicationProps) {

  const { employeeId, userInfo, isAuthenticated, isChecking } = useAuthGuard();
  const { language, translations } = useLanguage();
  const router = useRouter();
  const queryClient = useQueryClient();
  const showToast = useShowToast();

  const t = translations?.modules?.selfServices || {};
  const formErrors = translations?.formErrors || {};

  const { data: permissionTypesData, isLoading: isPermissionTypesLoading, error: permissionTypesError } = useFetchAllEntity("permissionType", {
    removeAll: true,
  });

  const { data: employeesData, isLoading: isEmployeesLoading, error: employeesError } = useFetchAllEntity("employee", {
    removeAll: true,
    enabled: !prefillEmployee,
  });

  const [selectedPermission, setSelectedPermission] = useState<string | null>(null);
  const [remarksLength, setRemarksLength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissionTypeSearchTerm, setPermissionTypeSearchTerm] = useState("");
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [originalValues, setOriginalValues] = useState<any>(null);
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

  const debouncedPermissionTypeSearch = useCallback(
    debounce((searchTerm: string) => {
      setPermissionTypeSearchTerm(searchTerm);
    }, 300),
    []
  );

  const debouncedEmployeeSearch = useCallback(
    debounce((searchTerm: string) => {
      setEmployeeSearchTerm(searchTerm);
    }, 300),
    []
  );

  const addMutation = useMutation({
    mutationFn: addShortPermissionRequest,
    onSuccess: (data) => {
      showToast("success", "addpermission_success");
      if (onSave) {
        onSave(null, data.data);
      }
      queryClient.invalidateQueries({ queryKey: ["employeeShortPermission"] });
      router.push("/self-services/permissions/my-request");
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        showToast("error", "findduplicate_error");
      } else {
        showToast("error", "addpermission_error");
      }
      setIsSubmitting(false);
    },
  });

  const editMutation = useMutation({
    mutationFn: editShortPermissionRequest,
    onSuccess: (_data, variables) => {
      showToast("success", "updatepermission_success");
      if (onSave) {
        onSave(variables.short_permission_id?.toString() ?? null, variables);
      }
      queryClient.invalidateQueries({ queryKey: ["employeeShortPermission"] });
      router.push("/self-services/permissions/my-request");
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        showToast("error", "findduplicate_error");
      } else {
        showToast("error", "updatepermission_error");
      }
      setIsSubmitting(false);
    },
  });

  const parseTimeToDate = (time: string) => {
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return new Date(1970, 0, 1, hours, minutes, seconds ?? 0);
  };

  useEffect(() => {
    if (selectedRowData && permissionTypesData?.data) {
      const permissionTypeId = selectedRowData.permission_type_id?.toString() || "";

      form.setValue("permission_types", permissionTypeId);

      const fromDate = selectedRowData.from_date ? new Date(selectedRowData.from_date) : new Date();
      const toDate = selectedRowData.to_date ? new Date(selectedRowData.to_date) : new Date();

      if (!isNaN(fromDate.getTime())) {
        form.setValue("from_date", fromDate);
      } else {
        form.setValue("from_date", new Date());
      }

      if (!isNaN(toDate.getTime())) {
        form.setValue("to_date", toDate);
      } else {
        form.setValue("to_date", new Date());
      }

      let fromTime: Date | undefined;
      let toTime: Date | undefined;

      if (selectedRowData.from_time) {
        fromTime = parseTimeToDate(selectedRowData.from_time);
      }

      if (selectedRowData.to_time) {
        toTime = parseTimeToDate(selectedRowData.to_time);
      }

      if (fromTime) form.setValue("from_time", fromTime);
      if (toTime) form.setValue("to_time", toTime);

      form.setValue("remarks", selectedRowData.remarks || "");

      setRemarksLength(selectedRowData.remarks?.length || 0);
      setSelectedPermission(permissionTypeId);

      const fromDateString = !isNaN(fromDate.getTime())
        ? `${fromDate.getFullYear()}-${(fromDate.getMonth() + 1).toString().padStart(2, '0')}-${fromDate.getDate().toString().padStart(2, '0')}`
        : null;

      const toDateString = !isNaN(toDate.getTime())
        ? `${toDate.getFullYear()}-${(toDate.getMonth() + 1).toString().padStart(2, '0')}-${toDate.getDate().toString().padStart(2, '0')}`
        : null;

      const fromTimeString = fromTime
        ? `${fromTime.getHours().toString().padStart(2, '0')}:${fromTime.getMinutes().toString().padStart(2, '0')}:${fromTime.getSeconds().toString().padStart(2, '0')}`
        : null;

      const toTimeString = toTime
        ? `${toTime.getHours().toString().padStart(2, '0')}:${toTime.getMinutes().toString().padStart(2, '0')}:${toTime.getSeconds().toString().padStart(2, '0')}`
        : null;

      setOriginalValues({
        permission_type_id: permissionTypeId,
        from_date: fromDateString,
        to_date: toDateString,
        from_time: fromTimeString,
        to_time: toTimeString,
        remarks: selectedRowData.remarks || "",
      });
    }
  }, [selectedRowData, permissionTypesData?.data, form]);

  useEffect(() => {
    if (prefillEmployee && userInfo && employeeId) {
      const employeeDisplayInfo = getEmployeeDisplayInfoWithLanguage();
      form.setValue("employee", employeeDisplayInfo.displayName);
    } else if (prefillEmployee && employeeId) {
      const fallbackName = `Employee ${employeeId}`;
      form.setValue("employee", fallbackName);
    }
  }, [userInfo, employeeId, form, language, prefillEmployee]);

  useEffect(() => {
    return () => {
      debouncedPermissionTypeSearch.cancel();
      debouncedEmployeeSearch.cancel();
    };
  }, [debouncedPermissionTypeSearch, debouncedEmployeeSearch]);

  if (isChecking && prefillEmployee) {
    return <InlineLoading message={translations?.buttons?.loading || "Loading..."} />;
  }

  if (prefillEmployee && (!isAuthenticated || !employeeId)) {
    return <InlineLoading message={translations?.buttons?.loading || "Loading..."} />;
  }

  const getEmployeeDisplayInfo = () => {
    if (userInfo) {
      let employeeName = "Unknown Employee";
      let employeeCode = employeeId?.toString() || "Unknown Code";

      if (userInfo.employeename) {
        if (userInfo.employeename.firsteng && userInfo.employeename.lasteng) {
          employeeName = `${userInfo.employeename.firsteng} ${userInfo.employeename.lasteng}`.trim();
        }
        else if (userInfo.employeename.firstarb && userInfo.employeename.lastarb) {
          employeeName = `${userInfo.employeename.firstarb} ${userInfo.employeename.lastarb}`.trim();
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

  const getEmployeeDisplayInfoWithLanguage = () => {
    if (userInfo) {
      let employeeName = "Unknown Employee";
      let employeeCode = employeeId?.toString() || "Unknown Code";

      if (userInfo.employeenumber) {
        employeeCode = userInfo.employeenumber.toString();
      }

      if (userInfo.employeename) {
        if (language === "ar") {
          if (userInfo.employeename.firstarb && userInfo.employeename.lastarb) {
            employeeName = `${userInfo.employeename.firstarb} ${userInfo.employeename.lastarb}`.trim();
          } else if (userInfo.employeename.firsteng && userInfo.employeename.lasteng) {
            employeeName = `${userInfo.employeename.firsteng} ${userInfo.employeename.lasteng}`.trim();
          } else if (userInfo.employeename.firstarb) {
            employeeName = userInfo.employeename.firstarb;
          } else if (userInfo.employeename.firsteng) {
            employeeName = userInfo.employeename.firsteng;
          }
        } else {
          if (userInfo.employeename.firsteng && userInfo.employeename.lasteng) {
            employeeName = `${userInfo.employeename.firsteng} ${userInfo.employeename.lasteng}`.trim();
          } else if (userInfo.employeename.firstarb && userInfo.employeename.lastarb) {
            employeeName = `${userInfo.employeename.firstarb} ${userInfo.employeename.lastarb}`.trim();
          } else if (userInfo.employeename.firsteng) {
            employeeName = userInfo.employeename.firsteng;
          } else if (userInfo.employeename.firstarb) {
            employeeName = userInfo.employeename.firstarb;
          }
        }
      }
      else if (userInfo.first_name || userInfo.last_name || userInfo.name || userInfo.employee_name) {
        if (userInfo.first_name && userInfo.last_name) {
          employeeName = `${userInfo.first_name} ${userInfo.last_name}`.trim();
        } else if (userInfo.name) {
          employeeName = userInfo.name;
        } else if (userInfo.employee_name) {
          employeeName = userInfo.employee_name;
        } else if (userInfo.first_name) {
          employeeName = userInfo.first_name;
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

  const getPermissionTypeName = (permissionType: any) => {
    return language === "ar" && permissionType.permission_type_arb
      ? permissionType.permission_type_arb
      : permissionType.permission_type_eng || permissionType.permission_type_name;
  };

  const getEmployeeName = (employee: any) => {
    if (!employee) return "";

    let name = "";
    let code = employee.employee_id?.toString() || employee.emp_no?.toString() || "";

    if (language === "ar") {
      if (employee.firstname_arb && employee.lastname_arb) {
        name = `${employee.firstname_arb} ${employee.lastname_arb}`.trim();
      } else if (employee.firstname_eng && employee.lastname_eng) {
        name = `${employee.firstname_eng} ${employee.lastname_eng}`.trim();
      } else if (employee.employeename?.firstarb && employee.employeename?.lastarb) {
        name = `${employee.employeename.firstarb} ${employee.employeename.lastarb}`.trim();
      } else if (employee.employeename?.firsteng && employee.employeename?.lasteng) {
        name = `${employee.employeename.firsteng} ${employee.employeename.lasteng}`.trim();
      } else if (employee.firstname_arb) {
        name = employee.firstname_arb;
      } else if (employee.firstname_eng) {
        name = employee.firstname_eng;
      } else {
        name = employee.employee_name || employee.name || `Employee ${code}`;
      }
    } else {
      if (employee.firstname_eng && employee.lastname_eng) {
        name = `${employee.firstname_eng} ${employee.lastname_eng}`.trim();
      } else if (employee.firstname_arb && employee.lastname_arb) {
        name = `${employee.firstname_arb} ${employee.lastname_arb}`.trim();
      } else if (employee.employeename?.firsteng && employee.employeename?.lasteng) {
        name = `${employee.employeename.firsteng} ${employee.employeename.lasteng}`.trim();
      } else if (employee.employeename?.firstarb && employee.employeename?.lastarb) {
        name = `${employee.employeename.firstarb} ${employee.employeename.lastarb}`.trim();
      } else if (employee.firstname_eng) {
        name = employee.firstname_eng;
      } else if (employee.firstname_arb) {
        name = employee.firstname_arb;
      } else {
        name = employee.employee_name || employee.name || `Employee ${code}`;
      }
    }

    return code ? `${name} (${code})` : name;
  };

  const getFilteredPermissionTypes = () => {
    if (!permissionTypesData?.data) return [];

    const types = permissionTypesData.data.filter((item: any) => item.permission_type_id);

    if (permissionTypeSearchTerm) {
      return types.filter((item: any) => {
        const name = getPermissionTypeName(item).toLowerCase();
        return name.includes(permissionTypeSearchTerm.toLowerCase());
      });
    }

    return types;
  };

  const getFilteredEmployees = () => {
    if (!employeesData?.data) return [];

    const employees = employeesData.data.filter((item: any) => item.employee_id);

    if (employeeSearchTerm) {
      return employees.filter((item: any) => {
        const name = getEmployeeName(item).toLowerCase();
        return name.includes(employeeSearchTerm.toLowerCase());
      });
    }

    return employees;
  };

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

      let targetEmployeeId: number;
      if (prefillEmployee) {
        targetEmployeeId = employeeId!;
      } else {
        targetEmployeeId = parseInt(values.employee);
      }

      const fromDateString = `${values.from_date.getFullYear()}-${(values.from_date.getMonth() + 1).toString().padStart(2, '0')}-${values.from_date.getDate().toString().padStart(2, '0')}`;
      const toDateString = `${values.to_date.getFullYear()}-${(values.to_date.getMonth() + 1).toString().padStart(2, '0')}-${values.to_date.getDate().toString().padStart(2, '0')}`;
      const fromTimeString = `${values.from_time.getHours().toString().padStart(2, '0')}:${values.from_time.getMinutes().toString().padStart(2, '0')}:${values.from_time.getSeconds().toString().padStart(2, '0')}`;
      const toTimeString = `${values.to_time.getHours().toString().padStart(2, '0')}:${values.to_time.getMinutes().toString().padStart(2, '0')}:${values.to_time.getSeconds().toString().padStart(2, '0')}`;

      const actualFromDateTime = new Date(values.from_date);
      actualFromDateTime.setHours(values.from_time.getHours(), values.from_time.getMinutes(), values.from_time.getSeconds());

      const actualToDateTime = new Date(values.to_date);
      actualToDateTime.setHours(values.to_time.getHours(), values.to_time.getMinutes(), values.to_time.getSeconds());

      const permMinutes = calculatePermissionMinutes(actualFromDateTime, actualToDateTime);

      if (selectedRowData) {
        const payload: any = {
          short_permission_id: selectedRowData.short_permission_id,
        };

        if (originalValues) {
          if (selectedPermissionType?.permission_type_id.toString() !== originalValues.permission_type_id) {
            payload.permission_type_id = selectedPermissionType?.permission_type_id;
          }

          if (fromDateString !== originalValues.from_date) {
            payload.from_date = fromDateString;
          }

          if (toDateString !== originalValues.to_date) {
            payload.to_date = toDateString;
          }

          if (fromTimeString !== originalValues.from_time) {
            payload.from_time = fromTimeString;
          }

          if (toTimeString !== originalValues.to_time) {
            payload.to_time = toTimeString;
          }

          if (payload.from_date || payload.to_date || payload.from_time || payload.to_time) {
            payload.perm_minutes = permMinutes;
          }

          const currentRemarks = values.remarks || "";
          if (currentRemarks !== originalValues.remarks) {
            payload.remarks = currentRemarks;
          }
        } else {
          payload.permission_type_id = selectedPermissionType?.permission_type_id || null;
          payload.employee_id = targetEmployeeId;
          payload.from_date = fromDateString;
          payload.to_date = toDateString;
          payload.from_time = fromTimeString;
          payload.to_time = toTimeString;
          payload.perm_minutes = permMinutes;
          payload.remarks = values.remarks || "";
        }

        const hasChanges = Object.keys(payload).length > 1;

        if (!hasChanges) {
          setIsSubmitting(false);
          return;
        }

        editMutation.mutate(payload);
      } else {
        const payload: any = {
          permission_type_id: selectedPermissionType?.permission_type_id || null,
          employee_id: targetEmployeeId,
          from_date: fromDateString,
          to_date: toDateString,
          from_time: fromTimeString,
          to_time: toTimeString,
          perm_minutes: permMinutes,
          remarks: values.remarks || "",
        };

        addMutation.mutate(payload);
      }
    } catch (error) {
      console.error("Form submission error", error);
      showToast("error", "formsubmission_error");
      setIsSubmitting(false);
    }
  }

  const displayPageTitle = t.perm_my_requests || "My Permission Requests";
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-accent transition-all duration-300 rounded-xl p-6">
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-xl text-primary flex items-center justify-between">
            {displayPageTitle}
          </h1>
          <div>
            {selectedPermission === "Personal" && (
              <p className="text-xs text-primary border border-blue-200 rounded-md px-2 py-1 font-semibold bg-blue-400 bg-opacity-10 ">
                {t.personal_permission_note || "Note: Personal permission is allowed for a maximum of 6 hours per month."}
              </p>
            )}
            {remarksLength > 500 && (
              <p className="text-xs text-destructive border border-red-200 rounded-md px-2 py-1 font-semibold bg-red-400 bg-opacity-10 flex items-center ">
                <ExclamationIcon className="mr-2" width="14" height="14" />
                {formErrors.remarks_max_length || "Maximum 500 characters only allowed."}
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
                      {t.employee || "Employee"} <Required />
                    </FormLabel>
                    {prefillEmployee ? (
                      <FormControl>
                        <Input
                          {...field}
                          value={employeeDisplayInfo.displayName}
                          readOnly
                          className="bg-gray-50 cursor-not-allowed"
                        />
                      </FormControl>
                    ) : (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isEmployeesLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="max-w-[350px] 3xl:max-w-[450px]">
                            <SelectValue
                              placeholder={
                                isEmployeesLoading
                                  ? t.loading_employees || "Loading employees..."
                                  : employeesError
                                    ? t.error_loading_employees || "Error loading employees"
                                    : t.placeholder_emp || "Choose employee"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent
                          showSearch={true}
                          searchPlaceholder={t.search_employees || "Search employees..."}
                          onSearchChange={debouncedEmployeeSearch}
                          className="mt-1 max-w-[350px] 3xl:max-w-[450px]"
                        >
                          {getFilteredEmployees().length === 0 ? (
                            <div className="p-3 text-sm text-text-secondary">
                              {employeeSearchTerm
                                ? t.no_employees_found || "No employees found"
                                : t.no_employees_available || "No employees available"}
                            </div>
                          ) : (
                            getFilteredEmployees().map((employee: any) => (
                              <SelectItem
                                key={employee.employee_id}
                                value={employee.employee_id.toString()}
                              >
                                {getEmployeeName(employee)}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                    <TranslatedError
                      fieldError={form.formState.errors.employee}
                      translations={formErrors}
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="permission_types"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.permission_types} <Required /></FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        const selectedPermissionType = permissionTypesData?.data?.find(
                          (permType: any) => permType.permission_type_id.toString() === value
                        );
                        if (selectedPermissionType) {
                          const permissionName = getPermissionTypeName(selectedPermissionType);
                          setSelectedPermission(permissionName);
                        } else {
                          setSelectedPermission(null);
                        }
                      }}
                      disabled={isPermissionTypesLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="max-w-[350px] 3xl:max-w-[450px]">
                          <SelectValue
                            placeholder={
                              isPermissionTypesLoading
                                ? t.loading_permission_types
                                : permissionTypesError
                                  ? t.error_loading_permission_types
                                  : t.placeholder_permission_types
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent
                        showSearch={true}
                        searchPlaceholder={t.search_permission_types}
                        onSearchChange={debouncedPermissionTypeSearch}
                        className="mt-1 max-w-[350px] 3xl:max-w-[450px]"
                      >
                        {getFilteredPermissionTypes().length === 0 ? (
                          <div className="p-3 text-sm text-text-secondary">
                            {permissionTypeSearchTerm ? t.no_permission_types_found : t.no_permission_types_available}
                          </div>
                        ) : (
                          getFilteredPermissionTypes().map((permissionType: any) => (
                            <SelectItem
                              key={permissionType.permission_type_id}
                              value={permissionType.permission_type_id.toString()}
                            >
                              {getPermissionTypeName(permissionType)}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <TranslatedError
                      fieldError={form.formState.errors.permission_types}
                      translations={formErrors}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="from_date"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>
                      {t.from_date} <Required />
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
                              <span className="font-normal text-sm text-text-secondary">{t.placeholder_date}</span>
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
                      translations={formErrors}
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
                      {t.to_date} <Required />
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
                              <span className="font-normal text-sm text-text-secondary">{t.placeholder_date}</span>
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
                    <TranslatedError
                      fieldError={form.formState.errors.to_date}
                      translations={formErrors}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="from_time"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>{t.from_time} <Required /></FormLabel>
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
                              : <span className="text-text-secondary">{t.placeholder_time}</span>
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
                      fieldError={form.formState.errors.from_time}
                      translations={formErrors}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="to_time"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>{t.to_time} <Required /></FormLabel>
                    <Popover open={popoverStates.toTime} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, toTime: open }))}>
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
                              : <span className="text-text-secondary">{t.placeholder_time}</span>
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
                      fieldError={form.formState.errors.to_time}
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
                    <FormLabel>{t.remarks}</FormLabel>
                    <FormControl>
                      <Textarea
                        className="max-w-[350px] 3xl:max-w-[450px]"
                        placeholder={t.placeholder_remarks}
                        {...field}
                        rows={4}
                        onChange={(e) => {
                          field.onChange(e)
                          setRemarksLength(e.target.value.length)
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
                  disabled={addMutation.isPending || editMutation.isPending}
                >
                  {addMutation.isPending || editMutation.isPending
                    ? selectedRowData
                      ? translations.buttons.updating
                      : translations.buttons.applying
                    : selectedRowData
                      ? translations.buttons.update
                      : translations.buttons.apply
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