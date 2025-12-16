"use client"
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { cn, getRandomInt } from "@/src/lib/utils";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import Required from "@/src/components/ui/required";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { CalendarIcon } from "@/src/icons/icons";
import { Calendar } from "@/src/components/ui/calendar";
import { format } from "date-fns";
import { BasicIcon, SetupIcon, RestrictIcon, PolicyIcon, CheckMark } from "@/src/icons/icons";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addPermissionTypeRequest, editPermissionTypeRequest } from "@/src/lib/apiHandler";

const formSchemaBasciSetup = z.object({
  permission_type_code: z
    .string({ required_error: "Permission type code is required" })
    .min(1, { message: "Permission type code is required" })
    .transform((val) => val.toUpperCase()),
  permission_type_name: z
    .string({ required_error: "Permission type name is required" })
    .min(1, { message: "Permission type name is required" }),
  workflows: z.string().min(1, { message: "Workflow is required." }).max(100),
  specific_gender:z.string().optional(),
  max_minutes_per_day: z
    .number({
      required_error: "Max minutes per day is required",
      invalid_type_error: "Max minutes per day must be a number",
    })
    .min(1, {
      message: "Max minutes per day must be at least 1",
    })
    .max(1000, {
      message: "Max minutes per day cannot exceed 1000",
    }),
  max_perm_per_day: z
    .number({
      required_error: "Max permissions per day is required",
      invalid_type_error: "Max permissions per day must be a number",
    })
    .min(1, {
      message: "Max permissions per day must be at least 1",
    })
    .max(1000, {
      message: "Max permissions per day cannot exceed 1000",
    }),
  max_minutes_per_month: z
    .number({
      required_error: "Max minutes per month is required",
      invalid_type_error: "Max minutes per month must be a number",
    })
    .min(1, {
      message: "Max minutes per month must be at least 1",
    })
    .max(1000, {
      message: "Max minutes per month cannot exceed 1000",
    }),
  max_perm_per_month: z
    .number({
      required_error: "Max permissions per month is required",
      invalid_type_error: "Max permissions per month must be a number",
    })
    .min(1, {
      message: "Max permissions per month must be at least 1",
    })
    .max(1000, {
      message: "Max permissions per month cannot exceed 1000",
    }),
})

const formSchemaPolicy = z.object({
  permission_attributes: z.array(z.string()).optional(),
  permission_type: z.string().optional(),
})

export default function AddPermissionTypes({
  on_open_change,
  selectedRowData,
  onSave,
}: {
  on_open_change?: any;
  selectedRowData?: any;
  onSave?: (id: string | null, newData: any) => void;
}) {
  const { language, translations } = useLanguage();
  const [pageNumber, setPageNumber] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [basicFormData, setBasicFormData] = useState<any>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: workflowData, isLoading: isWorkflowLoading, error: workflowError } = useFetchAllEntity("workflowType");

  const addMutation = useMutation({
    mutationFn: addPermissionTypeRequest,
    onSuccess: (data) => {
      toast.success("Permission type added successfully!");
      formBasciSetup.reset();
      formPolicy.reset();
      setBasicFormData(null);
      setPageNumber(0);

      if (onSave) onSave(null, data.data);
      if (on_open_change) on_open_change(false);
      else router.push("/self-services/permissions/manage");
      queryClient.invalidateQueries({ queryKey: ["permissionType"] });
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
    mutationFn: editPermissionTypeRequest,
    onSuccess: (_data, variables) => {
      toast.success("Permission type updated successfully!");
      if (onSave) {
        onSave(variables.permission_type_id?.toString() ?? null, variables);
      }
      queryClient.invalidateQueries({ queryKey: ["permissionType"] });
      if (on_open_change) {
        on_open_change(false);
      } else {
        router.push("/self-services/permissions/manage");
      }
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        toast.error("Duplicate data detected. Please use different values.");
      } else {
        toast.error("Form submission error.");
      }
    },
  });

  const formBasciSetup = useForm<z.infer<typeof formSchemaBasciSetup>>({
    resolver: zodResolver(formSchemaBasciSetup),
    defaultValues: {
      permission_type_code: "",
      permission_type_name: "",
      workflows: "",
      specific_gender: "",
      max_minutes_per_day: undefined,
      max_minutes_per_month: undefined,
      max_perm_per_day: undefined,
      max_perm_per_month: undefined,
    }
  })

  function onSubmitBasic(values: z.infer<typeof formSchemaBasciSetup>) {
    try {
      const selectedWorkflow = workflowData?.data?.find(
        (workflow: any) => workflow.workflow_id.toString() === values.workflows
      );

      let genderCode = "";
      if (values.specific_gender === "ALL") genderCode = "A";
      else if (values.specific_gender === "Female") genderCode = "F";
      else if (values.specific_gender === "Male") genderCode = "M";
      else genderCode = values.specific_gender || "";

      const basicData = {
        permission_type_code: values.permission_type_code,
        permission_type_name: values.permission_type_name,
        workflow_id: selectedWorkflow?.workflow_id || null,
        specific_gender: genderCode,
        max_minutes_per_day: values.max_minutes_per_day,
        max_perm_per_day: values.max_perm_per_day,
        max_minutes_per_month: values.max_minutes_per_month,
        max_perm_per_month: values.max_perm_per_month,
      };

      setBasicFormData(basicData);
      
      setPageNumber(1);
    } catch (error) {
      console.error("Form submission error", error);
    }
  }

  const formPolicy = useForm<z.infer<typeof formSchemaPolicy>>({
    resolver: zodResolver(formSchemaPolicy),
    defaultValues: {
      permission_attributes: [],
      permission_type: ''
    }
  })

  useEffect(() => {
    if (!selectedRowData) {
      formBasciSetup.reset({
        permission_type_code: "",
        permission_type_name: "",
        workflows: "",
        specific_gender: "",
        max_minutes_per_day: undefined,
        max_minutes_per_month: undefined,
        max_perm_per_day: undefined,
        max_perm_per_month: undefined,
      });
      formPolicy.reset({
        permission_attributes: [],
        permission_type: "",
      });
      setBasicFormData(null);
      setPageNumber(0);
    }
  }, [selectedRowData, formBasciSetup, formPolicy]);

  async function onSubmitPolicy(values: z.infer<typeof formSchemaPolicy>) {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const permissionAttributes = values.permission_attributes || [];
      const permissionType = values.permission_type;

      const combinedPayload: any = {
        permission_type_code: basicFormData.permission_type_code,
        workflow_id: basicFormData.workflow_id,
        specific_gender: basicFormData.specific_gender,
        max_minutes_per_day: basicFormData.max_minutes_per_day,
        max_perm_per_day: basicFormData.max_perm_per_day,
        max_minutes_per_month: basicFormData.max_minutes_per_month,
        max_perm_per_month: basicFormData.max_perm_per_month,
        
        group_apply_flag: permissionAttributes.includes("Group Apply"),
        status_flag: permissionAttributes.includes("Status"),
        official_flag: permissionAttributes.includes("Official"),
        medical_pass_flag: permissionAttributes.includes("Medical Pass Attachment"),
        mandatory_comments_flag: permissionAttributes.includes("Mandatory Comments"),
        mandatory_attachment_flag: permissionAttributes.includes("Mandatory Attachment"),
        apply_ramadan_restriction_flag: permissionAttributes.includes("Apply Ramadan Restriction"),
        
        minutes_permission_flag: permissionType === "by_minutes_permission",
        from_to_time_permission_flag: permissionType === "by_from_to_time_permission",
        weekdays_permission_flag: permissionType === "by_weekdays_permission",
        full_day_permission_flag: permissionType === "by_fulldays_permission",
      };

      if (language === "en") {
        combinedPayload.permission_type_eng = basicFormData.permission_type_name;
      } else {
        combinedPayload.permission_type_arb = basicFormData.permission_type_name;
      }

      if (selectedRowData) {
        editMutation.mutate({
          permission_type_id: selectedRowData.id,
          ...combinedPayload,
        });
      } else {
        addMutation.mutate(combinedPayload);
      }
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("An error occurred while saving.");
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (selectedRowData && workflowData?.data) {
      formBasciSetup.setValue("permission_type_code", selectedRowData.permission_type_code || "");
      formBasciSetup.setValue("permission_type_name", 
        language === "en"
          ? selectedRowData.permission_type_eng || ""
          : selectedRowData.permission_type_arb || ""
      );
      formBasciSetup.setValue("workflows", selectedRowData.workflow_id?.toString() || "");
      formBasciSetup.setValue("specific_gender", selectedRowData.specific_gender?.toString() || "");
      formBasciSetup.setValue("max_minutes_per_day", selectedRowData.max_minutes_per_day || undefined);
      formBasciSetup.setValue("max_perm_per_day", selectedRowData.max_perm_per_day || undefined);
      formBasciSetup.setValue("max_minutes_per_month", selectedRowData.max_minutes_per_month || undefined);
      formBasciSetup.setValue("max_perm_per_month", selectedRowData.max_perm_per_month || undefined);

      const permissionAttributes: string[] = [];
      if (selectedRowData.group_apply_flag) permissionAttributes.push("Group Apply");
      if (selectedRowData.status_flag) permissionAttributes.push("Status");
      if (selectedRowData.official_flag) permissionAttributes.push("Official");
      if (selectedRowData.medical_pass_flag) permissionAttributes.push("Medical Pass Attachment");
      if (selectedRowData.mandatory_comments_flag) permissionAttributes.push("Mandatory Comments");
      if (selectedRowData.mandatory_attachment_flag) permissionAttributes.push("Mandatory Attachment");
      if (selectedRowData.apply_ramadan_restriction_flag) permissionAttributes.push("Apply Ramadan Restriction");

      let permissionType = "";
      if (selectedRowData.minutes_permission_flag) permissionType = "by_minutes_permission";
      else if (selectedRowData.from_to_time_permission_flag) permissionType = "by_from_to_time_permission";
      else if (selectedRowData.weekdays_permission_flag) permissionType = "by_weekdays_permission";
      else if (selectedRowData.full_day_permission_flag) permissionType = "by_fulldays_permission";

      formPolicy.setValue("permission_attributes", permissionAttributes);
      formPolicy.setValue("permission_type", permissionType);

      setBasicFormData({
        permission_type_code: selectedRowData.permission_type_code || "",
        permission_type_name: language === "en"
          ? selectedRowData.permission_type_eng || ""
          : selectedRowData.permission_type_arb || "",
        workflow_id: selectedRowData.workflow_id || null,
        specific_gender: selectedRowData.specific_gender,
        max_minutes_per_day: selectedRowData.max_minutes_per_day || undefined,
        max_perm_per_day: selectedRowData.max_perm_per_day || undefined,
        max_minutes_per_month: selectedRowData.max_minutes_per_month || undefined,
        max_perm_per_month: selectedRowData.max_perm_per_month || undefined,
      });
    }
  }, [selectedRowData, workflowData?.data, language, formBasciSetup, formPolicy]);

  return (
    <>
      {pageNumber === 0 && (
        <Form {...formBasciSetup}>
          <form onSubmit={formBasciSetup.handleSubmit(onSubmitBasic)} className="bg-accent rounded-2xl p-6">
            <div className="flex justify-between">
              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex justify-center items-center rounded-full border border-primary w-9 h-9 text-primary">
                    <SetupIcon />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold text-text-secondary">Step 1 </span>
                    <span className="font-semibold text-base text-text-primary">Basic Setup</span>
                    <span className="text-primary text-[13px]">In progress</span>
                  </div>
                </div>

                <div className="w-8 h-[2px] bg-secondary"></div>

                <div className="flex items-center gap-2">
                  <div className="flex justify-center items-center rounded-full border border-secondary w-9 h-9 text-secondary">
                    <PolicyIcon />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold text-text-secondary">Step 2 </span>
                    <span className="font-semibold text-base text-text-primary">Policy</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-5 gap-10 px-8 pt-8">
              <FormField
                control={formBasciSetup.control}
                name="permission_type_code"
                render={({ field }) => (
                  <FormItem className=" ">
                    <FormLabel>
                      Permission type code <Required />
                    </FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Enter the code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formBasciSetup.control}
                name="permission_type_name"
                render={({ field }) => (
                  <FormItem className=" ">
                    <FormLabel>
                      {language === "ar"
                        ? "Permission type (العربية) "
                        : "Permission type (English) "}
                      <Required />
                    </FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Enter the name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formBasciSetup.control}
                name="workflows"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Workflows <Required />
                    </FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                      disabled={isWorkflowLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="max-w-[350px] 3xl:max-w-[450px] 3xl:max-w-[450px]">
                          <SelectValue 
                            placeholder={
                              isWorkflowLoading 
                                ? "Loading workflows..." 
                                : workflowError 
                                ? "Error loading workflows" 
                                : "Choose workflows"
                            } 
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {workflowData?.data?.map((workflow: any) => (
                          <SelectItem
                            key={workflow.workflow_id}
                            value={workflow.workflow_id.toString()}
                          >
                            {language === "ar" && workflow.workflow_name_arb 
                              ? workflow.workflow_name_arb 
                              : workflow.workflow_name_eng
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
                control={formBasciSetup.control}
                name="specific_gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Gender
                    </FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="max-w-[350px] 3xl:max-w-[450px] 3xl:max-w-[450px]">
                          <SelectValue 
                            placeholder="Choose Gender"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ALL">All</SelectItem>
                        <SelectItem value="F">Female</SelectItem>
                        <SelectItem value="M">Male</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formBasciSetup.control}
                name="max_minutes_per_day"
                render={({ field }) => (
                  <FormItem className=" ">
                    <FormLabel>
                      Max. Minutes Per Day <Required />
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter the minutes"
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={formBasciSetup.control}
                name="max_perm_per_day"
                render={({ field }) => (
                  <FormItem className=" ">
                    <FormLabel>
                      Max. No. Of Permissions Per Day <Required />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Enter the count"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={formBasciSetup.control}
                name="max_minutes_per_month"
                render={({ field }) => (
                  <FormItem className=" ">
                    <FormLabel>
                      Max. Minutes Per Month <Required />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Enter the minutes"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={formBasciSetup.control}
                name="max_perm_per_month"
                render={({ field }) => (
                  <FormItem className=" ">
                    <FormLabel>
                      Max. No. Of Permissions Per Month <Required />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Enter the count"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 items-center pb-5 pt-8">
              <div className="flex gap-4 px-5">
                <Button
                  variant={"outline"}
                  type="button"
                  size={"lg"}
                  className=" px-10 "
                  onClick={() => {
                    if (on_open_change) {
                      on_open_change(false);
                    } else {
                      router.push("/self-services/permissions/manage");
                    }
                  }}
                >
                  {translations?.buttons?.cancel}
                </Button>
                <Button type="submit" size={"lg"} className=" px-10 " >
                  {translations?.buttons?.continue}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      )}

      {pageNumber === 1 && (
        <Form {...formPolicy}>
          <form onSubmit={formPolicy.handleSubmit(onSubmitPolicy)} className="bg-accent rounded-2xl p-6">
            <div className="flex justify-between px-5 py-6">
              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex justify-center items-center rounded-full border border-success bg-success w-9 h-9">
                    <CheckMark />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold text-text-secondary">Step 1 </span>
                    <span className="font-semibold text-base text-text-primary">Basic Setup</span>
                    <span className="text-success text-[13px]">Completed</span>
                  </div>
                </div>

                <div className="w-8 h-[2px] bg-secondary"></div>

                <div className="flex items-center gap-2">
                  <div className="flex justify-center items-center rounded-full border border-primary w-9 h-9 text-primary">
                    <PolicyIcon />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold text-text-secondary">Step 2 </span>
                    <span className="font-semibold text-base text-text-primary">Policy</span>
                    <span className="text-primary text-[13px]">In progress</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-3 relative">
              <p className="text-xs text-primary border border-blue-200 rounded-md px-2 py-1 font-semibold bg-blue-400 bg-opacity-10 absolute -top-[75px] right-0">
                Note: Status flag should be enabled.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 w-full mx-auto bg-accent p-5 rounded-md ">
              <FormField
                control={formPolicy.control}
                name="permission_attributes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel><div className="mb-6 font-bold text-[15px]">Permission Attributes:</div></FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 gap-y-5 text-sm">
                        {["Group Apply", "Medical Pass Attachment", "Status", "Mandatory Comments", "Official", "Mandatory Attachment", "Apply Ramadan Restriction"].map((option) => (
                          <FormField
                            key={option}
                            control={formPolicy.control}
                            name="permission_attributes"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Checkbox
                                    id={option}
                                    checked={field.value?.includes(option)}
                                    onCheckedChange={(checked) => {
                                      const updated = checked
                                        ? [...(field.value || []), option]
                                        : field.value?.filter((item: string) => item !== option);
                                      field.onChange(updated);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel
                                  htmlFor={option}
                                  className="text-sm text-text-primary font-semibold !mt-0"
                                >
                                  {option}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-center">
                <FormField
                  control={formPolicy.control}
                  name="permission_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel><div className="mb-6 font-bold text-[15px]">Permission Types:</div></FormLabel>
                      <FormControl>
                        <div className="flex flex-col gap-5 text-sm">
                          <div>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                className="custom-radio"
                                value="by_minutes_permission"
                                checked={field.value === "by_minutes_permission"}
                                onChange={() => field.onChange("by_minutes_permission")}
                              />
                              <span>By Minutes Permission</span>
                            </label>
                          </div>
                          <div>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                className="custom-radio"
                                value="by_from_to_time_permission"
                                checked={field.value === "by_from_to_time_permission"}
                                onChange={() => field.onChange("by_from_to_time_permission")}
                              />
                              <span> By From Time / To Time Permisisons </span>
                            </label>
                          </div>
                          <div>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                className="custom-radio"
                                value="by_weekdays_permission"
                                checked={field.value === "by_weekdays_permission"}
                                onChange={() => field.onChange("by_weekdays_permission")}
                              />
                              <span> By Weekdays Permisisons </span>
                            </label>
                          </div>
                          <div>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                className="custom-radio"
                                value="by_fulldays_permission"
                                checked={field.value === "by_fulldays_permission"}
                                onChange={() => field.onChange("by_fulldays_permission")}
                              />
                              <span> By Full Day Permisisons </span>
                            </label>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className=" col-span-2 flex justify-end">
                <div className="flex gap-2 ">
                  <Button
                    variant={"outline"}
                    type="button"
                    size={"lg"}
                    className=" px-10 "
                    onClick={() => setPageNumber(0)}
                  >
                    {translations?.buttons?.back}
                  </Button>
                  <Button type="submit" size={"lg"} className=" px-10 " disabled={isSubmitting}>
                    {isSubmitting
                      ? selectedRowData
                        ? "Updating..."
                        : "Saving..."
                      : translations?.buttons?.save
                    }
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      )}
    </>
  );
}