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
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";

const formSchemaBasciSetup = z.object({
  leave_type_code: z
    .string({ required_error: "leave_type_code_required" })
    .min(1, { message: "leave_type_code_required" })
    .transform((val) => val.toUpperCase()),
  leave_type_name: z
    .string({ required_error: "leave_type_name_required" })
    .min(1, { message: "leave_type_name_required" }),
  workflows: z.string().optional(),
  specific_gender: z.string().optional(),
  total_entitled_days: z
    .number({
      invalid_type_error: "total_entitled_days_invalid",
    }).optional(),
  apply_prior_to_days: z
    .number({
      invalid_type_error: "apply_prior_to_days_invalid",
    }).optional(),
  full_pay_days: z
    .number({
      invalid_type_error: "full_pay_days_invalid",
    }).optional(),
  half_pay_days: z
    .number({
      invalid_type_error: "half_pay_days_invalid",
    }).optional(),
  unpaid_days: z
    .number({
      invalid_type_error: "unpaid_days_invalid",
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
  const showToast = useShowToast();
  const t = translations?.modules?.selfServices || {};
  const formErrors = translations?.formErrors || {};
  const { data: workflowData, isLoading: isWorkflowLoading, error: workflowError } = useFetchAllEntity("workflowType");

  const addMutation = useMutation({
    mutationFn: addLeaveTypeRequest,
    onSuccess: (data) => {
      showToast("success", "add_leavetype_success");
      formBasciSetup.reset();
      formPolicy.reset();
      setBasicFormData(null);
      setPageNumber(0);

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
        showToast("error", "findduplicate_error");
      } else {
        showToast("error", "formsubmission_error");
      }
    },
  });

  const editMutation = useMutation({
    mutationFn: editLeaveTypeRequest,
    onSuccess: (_data, variables) => {
      showToast("success", "update_leavetype_success");
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
        showToast("error", "findduplicate_error");
      } else {
        showToast("error", "formsubmission_error");
      }
    },
  });

  const formBasciSetup = useForm<z.infer<typeof formSchemaBasciSetup>>({
    resolver: zodResolver(formSchemaBasciSetup),
    defaultValues: {
      leave_type_code: "",
      leave_type_name: "",
      workflows: undefined,
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

      let genderCode = null;
      if (values.specific_gender === "ALL") genderCode = "A";
      else if (values.specific_gender === "F") genderCode = "F";
      else if (values.specific_gender === "M") genderCode = "M";

      const basicData: any = {
        leave_type_code: values.leave_type_code,
        leave_type_name: values.leave_type_name,
        specific_gender: genderCode,
        total_entitled_days: values.total_entitled_days,
        apply_prior_to_days: values.apply_prior_to_days,
        full_pay_days: values.full_pay_days,
        half_pay_days: values.half_pay_days,
        unpaid_days: values.unpaid_days,
      };

      if (selectedWorkflow?.workflow_id !== null && selectedWorkflow?.workflow_id !== undefined) {
        basicData.workflow_id = selectedWorkflow.workflow_id;
      }

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

      if (basicFormData.workflow_id !== null && basicFormData.workflow_id !== undefined) {
        combinedPayload.workflow_id = basicFormData.workflow_id;
      }

      if (basicFormData.specific_gender && ['A', 'F', 'M'].includes(basicFormData.specific_gender)) {
        combinedPayload.specific_gender = basicFormData.specific_gender;
      }

      if (language === "en") {
        combinedPayload.leave_type_eng = basicFormData.leave_type_name;
      } else {
        combinedPayload.leave_type_arb = basicFormData.leave_type_name;
      }

      if (selectedRowData) {
        editMutation.mutate({
          leave_type_id: selectedRowData.id || selectedRowData.leave_type_id,
          ...combinedPayload,
        });
      } else {
        addMutation.mutate(combinedPayload);
      }
    } catch (error) {
      console.error("Form submission error", error);
      showToast("error", "formsubmission_error");
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

      let genderValue = "";
      if (selectedRowData.specific_gender === "A") genderValue = "ALL";
      else if (selectedRowData.specific_gender === "F") genderValue = "F";
      else if (selectedRowData.specific_gender === "M") genderValue = "M";
      else if (selectedRowData.specific_gender) genderValue = selectedRowData.specific_gender;

      formBasciSetup.setValue("specific_gender", genderValue);
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

      const basicData: any = {
        leave_type_code: selectedRowData.leave_type_code || "",
        leave_type_name: language === "en"
          ? selectedRowData.leave_type_eng || ""
          : selectedRowData.leave_type_arb || "",
        specific_gender: selectedRowData.specific_gender,
        total_entitled_days: selectedRowData.total_entitled_days || undefined,
        apply_prior_to_days: selectedRowData.apply_prior_to_days || undefined,
        full_pay_days: selectedRowData.full_pay_days || undefined,
        half_pay_days: selectedRowData.half_pay_days || undefined,
        unpaid_days: selectedRowData.unpaid_days || undefined,
      };

      if (selectedRowData.workflow_id) {
        basicData.workflow_id = selectedRowData.workflow_id;
      }

      setBasicFormData(basicData);
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
                    <span className="text-[13px] font-semibold text-text-secondary">{t.step1 || "Step 1"} </span>
                    <span className="font-semibold text-base text-text-primary">{t.basic_setup || "Basic Setup"}</span>
                    <span className="text-primary text-[13px]">{t.in_progress || "In progress"}</span>
                  </div>
                </div>

                <div className="w-8 h-[2px] bg-secondary"></div>

                <div className="flex items-center gap-2">
                  <div className="flex justify-center items-center rounded-full border border-secondary w-9 h-9 text-secondary">
                    <PolicyIcon />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold text-text-secondary">{t.step2 || "Step 2"} </span>
                    <span className="font-semibold text-base text-text-primary">{t.policy || "Policy"}</span>
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
                      {t.leave_type_code || "Leave type code"} <Required />
                    </FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t.Placeholder_code || "Enter the code"} {...field} />
                    </FormControl>
                    <TranslatedError
                      fieldError={formBasciSetup.formState.errors.leave_type_code}
                      translations={formErrors}
                    />
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
                        ? t.leave_type_name_arb || "Leave type (العربية)"
                        : t.leave_type_name_eng || "Leave type (English)"}
                      <Required />
                    </FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t.placeholder_name || "Enter the name"} {...field} />
                    </FormControl>
                    <TranslatedError
                      fieldError={formBasciSetup.formState.errors.leave_type_name}
                      translations={formErrors}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={formBasciSetup.control}
                name="workflows"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t.workflows || "Workflows"}
                    </FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isWorkflowLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="max-w-[350px] 3xl:max-w-[450px]">
                          <SelectValue
                            placeholder={
                              isWorkflowLoading
                                ? t.loading_workflows || "Loading workflows..."
                                : workflowError
                                  ? t.error_loading_workflows || "Error loading workflows"
                                  : t.placeholder_workflows || "Choose workflows"
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
                    <TranslatedError
                      fieldError={formBasciSetup.formState.errors.workflows}
                      translations={formErrors}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={formBasciSetup.control}
                name="specific_gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t.gender || "Gender"}
                    </FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="max-w-[350px] 3xl:max-w-[450px]">
                          <SelectValue
                            placeholder={t.placeholder_gender || "Choose Gender"}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ALL">{t.gender_all || "All"}</SelectItem>
                        <SelectItem value="F">{t.gender_female || "Female"}</SelectItem>
                        <SelectItem value="M">{t.gender_male || "Male"}</SelectItem>
                      </SelectContent>
                    </Select>
                    <TranslatedError
                      fieldError={formBasciSetup.formState.errors.specific_gender}
                      translations={formErrors}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={formBasciSetup.control}
                name="total_entitled_days"
                render={({ field }) => (
                  <FormItem className=" ">
                    <FormLabel>
                      {t.total_entitled_days || "Total entitled days"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t.placeholder_days || "Enter the days"}
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <TranslatedError
                      fieldError={formBasciSetup.formState.errors.total_entitled_days}
                      translations={formErrors}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={formBasciSetup.control}
                name="apply_prior_to_days"
                render={({ field }) => (
                  <FormItem className=" ">
                    <FormLabel>
                      {t.Apply_prior_days || "Apply prior to days"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder={t.placeholder_days || "Enter the days"}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <TranslatedError
                      fieldError={formBasciSetup.formState.errors.apply_prior_to_days}
                      translations={formErrors}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={formBasciSetup.control}
                name="full_pay_days"
                render={({ field }) => (
                  <FormItem className=" ">
                    <FormLabel>
                      {t.full_pay_days || "Full Pay Days"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder={t.placeholder_days || "Enter the days"}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <TranslatedError
                      fieldError={formBasciSetup.formState.errors.full_pay_days}
                      translations={formErrors}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={formBasciSetup.control}
                name="half_pay_days"
                render={({ field }) => (
                  <FormItem className=" ">
                    <FormLabel>
                      {t.half_pay_days || "Half Pay Days"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder={t.placeholder_days || "Enter the days"}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <TranslatedError
                      fieldError={formBasciSetup.formState.errors.half_pay_days}
                      translations={formErrors}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={formBasciSetup.control}
                name="unpaid_days"
                render={({ field }) => (
                  <FormItem className=" ">
                    <FormLabel>
                      {t.unpaid_days || "Unpaid Days"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder={t.placeholder_days || "Enter the days"}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <TranslatedError
                      fieldError={formBasciSetup.formState.errors.unpaid_days}
                      translations={formErrors}
                    />
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
                    <span className="text-[13px] font-semibold text-text-secondary">{t.step1 || "Step 1"} </span>
                    <span className="font-semibold text-base text-text-primary">{t.basic_setup || "Basic Setup"}</span>
                    <span className="text-success text-[13px]">{t.completed || "Completed"}</span>
                  </div>
                </div>

                <div className="w-8 h-[2px] bg-secondary"></div>

                <div className="flex items-center gap-2">
                  <div className="flex justify-center items-center rounded-full border border-primary w-9 h-9 text-primary">
                    <PolicyIcon />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold text-text-secondary">{t.step2 || "Step 2"} </span>
                    <span className="font-semibold text-base text-text-primary">{t.policy || "Policy"}</span>
                    <span className="text-primary text-[13px]">{t.in_progress || "In progress"}</span>
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
                    <FormLabel><div className="mb-6 font-bold text-[15px]">{t.leave_attributes || "Leave Attributes:"}</div></FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-3 gap-y-3 text-sm">
                        {[
                          { key: "Need Approval", label: t.need_approval || "Need Approval" },
                          { key: "Official", label: t.official || "Official" },
                          { key: "Status", label: t.status || "Status" },
                          { key: "Carryforward", label: t.carryforward || "Carryforward" },
                          { key: "Allow Attachment", label: t.allow_attachments || "Allow Attachment" },
                          { key: "Mandatory Justification", label: t.mandatory_justification || "Mandatory Justification" },
                          { key: "Annual Leave", label: t.annual_leaves || "Annual Leave" },
                          { key: "Sick Leave", label: t.sick_leave || "Sick Leave" },
                          { key: "Exclude Holiday", label: t.exclude_holiday || "Exclude Holiday" },
                          { key: "Exclude Weekend", label: t.exclude_weekend || "Exclude Weekend" },
                          { key: "Validation Mandatory", label: t.validation_mandatory || "Validation Mandatory" },
                          { key: "Leave by Overtime", label: t.leave_by_overtime || "Leave by overtime" },
                          { key: "Apply Not Later than Days", label: t.Apply_not_later || "Apply Not Later Than Days" }
                        ].map((option) => (
                          <FormField
                            key={option.key}
                            control={formPolicy.control}
                            name="leave_attributes"
                            render={({ field }) => (
                              <FormItem className={cn(
                                "flex items-center",
                                language === "ar" ? "space-x-reverse space-x-2" : "space-x-2"
                              )}>
                                <FormControl>
                                  <Checkbox
                                    id={option.key}
                                    checked={field.value?.includes(option.key)}
                                    onCheckedChange={(checked) => {
                                      const updated = checked
                                        ? [...(field.value || []), option.key]
                                        : field.value?.filter((item: string) => item !== option.key);
                                      field.onChange(updated);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel
                                  htmlFor={option.key}
                                  className="text-sm text-text-primary font-semibold !mt-0"
                                >
                                  {option.label}
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
                  <Button
                    type="submit"
                    size={"lg"}
                    className=" px-10 "
                    disabled={addMutation.isPending || editMutation.isPending}
                  >
                    {addMutation.isPending || editMutation.isPending
                      ? selectedRowData
                        ? translations.buttons?.updating || "Updating..."
                        : translations.buttons?.saving || "Saving..."
                      : selectedRowData
                        ? translations.buttons?.update || "Update"
                        : translations.buttons?.save || "Save"
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