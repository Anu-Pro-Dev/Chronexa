"use client"
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { cn, getRandomInt } from "@/src/utils/utils";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
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
import { addLeaveTypeRequest, editLeaveTypeRequest } from "@/src/lib/apiHandler";

const formSchemaBasciSetup = z.object({
  leave_type_code: z
    .string({ required_error: "Leave type code is required" })
    .min(1, { message: "Leave type code is required" })
    .transform((val) => val.toUpperCase()),
  leave_type_name: z
    .string({ required_error: "Leave type name is required" })
    .min(1, { message: "Leave type name is required" }),
  workflows: z.string().min(1, { message: "Workflow is required." }).max(100),
  specific_gender:z.string().optional(),
  total_entitled_days: z
    .number({
      invalid_type_error: "Total entitled days must be a number.",
    }).optional(),
  apply_prior_to_days: z
    .number({
      invalid_type_error: "Apply prior to days must be a number.",
    }).optional(),
  full_pay_days: z
    .number({
      invalid_type_error: "Full pay days must be a number.",
    }).optional(),
  half_pay_days: z
    .number({
      invalid_type_error: "Half pay days must be a number.",
    }).optional(),
  unpaid_days: z
    .number({
      invalid_type_error: "Unpaid days must be a number.",
    }).optional(),
})

const formSchemaPolicy = z.object({
  leave_attributes: z.array(z.string()).optional(),
})

export default function AddLeaveTypes({
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
    mutationFn: addLeaveTypeRequest,
    onSuccess: (data) => {
      toast.success("Leave type added successfully!");
      if (onSave) {
        onSave(null, data.data);
      }
      if (on_open_change) {
        on_open_change(false);
      } else {
        router.push("/self-services/leaves/manage");
      }
      queryClient.invalidateQueries({ queryKey: ["leaveType"] });
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
    mutationFn: editLeaveTypeRequest,
    onSuccess: (_data, variables) => {
      toast.success("Leave type updated successfully!");
      if (onSave) {
        onSave(variables.leave_type_id?.toString() ?? null, variables);
      }
      queryClient.invalidateQueries({ queryKey: ["leaveType"] });
      if (on_open_change) {
        on_open_change(false);
      } else {
        router.push("/self-services/leaves/manage");
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
      leave_type_code: "",
      leave_type_name: "",
      workflows: "",
      specific_gender: "",
      total_entitled_days: undefined,
      full_pay_days: undefined,
      apply_prior_to_days: undefined,
      half_pay_days: undefined,
      unpaid_days: undefined,
    }
  })

  function onSubmitBasic(values: z.infer<typeof formSchemaBasciSetup>) {
    try {
      const selectedWorkflow = workflowData?.data?.find(
        (workflow: any) => workflow.workflow_id.toString() === values.workflows
      );

      const basicData = {
        leave_type_code: values.leave_type_code,
        leave_type_name: values.leave_type_name,
        workflow_id: selectedWorkflow?.workflow_id || null,
        specific_gender: values?.specific_gender || "",
        total_entitled_days: values.total_entitled_days,
        apply_prior_to_days: values.apply_prior_to_days,
        full_pay_days: values.full_pay_days,
        half_pay_days: values.half_pay_days,
        unpaid_days: values.unpaid_days,
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
      leave_attributes: [],
    }
  })

  async function onSubmitPolicy(values: z.infer<typeof formSchemaPolicy>) {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const leaveAttributes = values.leave_attributes || [];

      const combinedPayload: any = {
        leave_type_code: basicFormData.leave_type_code,
        workflow_id: basicFormData.workflow_id,
        specific_gender: basicFormData.specific_gender,
        total_entitled_days: basicFormData.total_entitled_days,
        apply_prior_to_days: basicFormData.apply_prior_to_days,
        full_pay_days: basicFormData.full_pay_days,
        half_pay_days: basicFormData.half_pay_days,
        unpaid_days: basicFormData.unpaid_days,
        need_approval_flag: leaveAttributes.includes("Need Approval"),
        status_flag: leaveAttributes.includes("Status"),
        official_flag: leaveAttributes.includes("Official"),
        carryforward_flag: leaveAttributes.includes("Carryforward"),
        is_AL_flag: leaveAttributes.includes("Annual Leave"),
        is_SL_flag: leaveAttributes.includes("Sick Leave"),
        exclude_holiday_flag: leaveAttributes.includes("Exclude Holiday"),
        exclude_weekend_flag: leaveAttributes.includes("Exclude Weekend"),
        mandatory_justification_flag: leaveAttributes.includes("Mandatory Justification"),
        allow_attachment_flag: leaveAttributes.includes("Allow Attachment"),
        validation_mandatory_flag: leaveAttributes.includes("Validation Mandatory"),
        leave_by_overtime_flag: leaveAttributes.includes("Leave by Overtime"),
        apply_not_laterthandays_flag: leaveAttributes.includes("Apply Not Later than Days"),
      };

      if (language === "en") {
        combinedPayload.leave_type_eng = basicFormData.leave_type_name;
      } else {
        combinedPayload.leave_type_arb = basicFormData.leave_type_name;
      }

      if (selectedRowData) {
        editMutation.mutate({
          leave_type_id: selectedRowData.id,
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
      formBasciSetup.setValue("leave_type_code", selectedRowData.leave_type_code || "");
      formBasciSetup.setValue("leave_type_name", 
        language === "en"
          ? selectedRowData.leave_type_eng || ""
          : selectedRowData.leave_type_arb || ""
      );
      formBasciSetup.setValue("workflows", selectedRowData.workflow_id?.toString() || "");
      formBasciSetup.setValue("specific_gender", selectedRowData.specific_gender?.toString() || "");
      formBasciSetup.setValue("total_entitled_days", selectedRowData.total_entitled_days || undefined);
      formBasciSetup.setValue("apply_prior_to_days", selectedRowData.apply_prior_to_days || undefined);
      formBasciSetup.setValue("full_pay_days", selectedRowData.full_pay_days || undefined);
      formBasciSetup.setValue("half_pay_days", selectedRowData.half_pay_days || undefined);
      formBasciSetup.setValue("unpaid_days", selectedRowData.unpaid_days || undefined);
      const leaveAttributes: string[] = [];
      if (selectedRowData.need_approval_flag) leaveAttributes.push("Need Approval");
      if (selectedRowData.status_flag) leaveAttributes.push("Status");
      if (selectedRowData.official_flag) leaveAttributes.push("Official");
      if (selectedRowData.carryforward_flag) leaveAttributes.push("Carryforward");
      if (selectedRowData.is_AL_flag) leaveAttributes.push("Annual Leave");
      if (selectedRowData.is_SL_flag) leaveAttributes.push("Sick Leave");
      if (selectedRowData.exclude_holiday_flag) leaveAttributes.push("Exclude Holiday");
      if (selectedRowData.exclude_weekend_flag) leaveAttributes.push("Exclude Weekend");
      if (selectedRowData.mandatory_justification_flag) leaveAttributes.push("Mandatory Justification");
      if (selectedRowData.allow_attachment_flag) leaveAttributes.push("Allow Attachment");
      if (selectedRowData.validation_mandatory_flag) leaveAttributes.push("Validation Mandatory");
      if (selectedRowData.leave_by_overtime_flag) leaveAttributes.push("Leave by Overtime");
      if (selectedRowData.apply_not_laterthandays_flag) leaveAttributes.push("Apply Not Later than Days");
      formPolicy.setValue("leave_attributes", leaveAttributes);

      setBasicFormData({
        leave_type_code: selectedRowData.leave_type_code || "",
        leave_type_name: language === "en"
          ? selectedRowData.leave_type_eng || ""
          : selectedRowData.leave_type_arb || "",
        workflow_id: selectedRowData.workflow_id || null,
        specific_gender: selectedRowData.specific_gender,
        total_entitled_days: selectedRowData.total_entitled_days || undefined,
        apply_prior_to_days: selectedRowData.apply_prior_to_days || undefined,
        full_pay_days: selectedRowData.full_pay_days || undefined,
        half_pay_days: selectedRowData.half_pay_days || undefined,
        unpaid_days: selectedRowData.unpaid_days || undefined,
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
                name="leave_type_code"
                render={({ field }) => (
                  <FormItem className=" ">
                    <FormLabel>
                      Leave type code <Required />
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
                name="leave_type_name"
                render={({ field }) => (
                  <FormItem className=" ">
                    <FormLabel>
                      {language === "ar"
                        ? "Leave type (العربية) "
                        : "Leave type (English) "}
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
                        <SelectTrigger>
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
                        <SelectTrigger>
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
                name="total_entitled_days"
                render={({ field }) => (
                  <FormItem className=" ">
                    <FormLabel>
                      Total entitled days
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter the days"
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
                name="apply_prior_to_days"
                render={({ field }) => (
                  <FormItem className=" ">
                    <FormLabel>
                      Apply prior to days
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Enter the days"
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
                name="full_pay_days"
                render={({ field }) => (
                  <FormItem className=" ">
                    <FormLabel>
                      Full Pay Days
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Enter the days"
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
                name="half_pay_days"
                render={({ field }) => (
                  <FormItem className=" ">
                    <FormLabel>
                      Half Pay Days
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Enter the days"
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
                name="unpaid_days"
                render={({ field }) => (
                  <FormItem className=" ">
                    <FormLabel>
                      Unpaid Days
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Enter the days"
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
                      router.push("/self-services/leaves/manage");
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
            <div className="flex justify-between p-6">
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

            <div className="w-11/12 mx-auto bg-accent p-4 rounded-md ">
              <FormField
                control={formPolicy.control}
                name="leave_attributes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel><div className="mb-6 font-bold text-[15px]">Leave Attributes:</div></FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-3 gap-y-3 text-sm">
                        {["Need Approval", "Official", "Status", "Carryforward", "Allow Attachment", "Mandatory Justification", "Annual Leave", "Sick Leave", "Exclude Holiday", "Exclude Weekend", "Validation Mandatory", "Leave by Overtime", "Apply Not Later than Days"].map((option) => (
                          <FormField
                            key={option}
                            control={formPolicy.control}
                            name="leave_attributes"
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

              <div className=" col-span-2 flex justify-end pt-5">
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