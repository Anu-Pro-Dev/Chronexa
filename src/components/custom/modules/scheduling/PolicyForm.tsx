"use client";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/src/components/ui/form";
import { useRouter } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Label } from "@/src/components/ui/label";
import { useFormContext } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { addScheduleRequest, editScheduleRequest } from "@/src/lib/apiHandler";
import { useScheduleEditStore } from "@/src/stores/scheduleEditStore";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useShowToast } from "@/src/utils/toastHelper";
import { format } from "date-fns";

interface PolicyFormProps {
  SetPage?: (page: string) => void;
}

const formatTimeToString = (value: any): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value instanceof Date) return format(value, "HH:mm:ss");
  return "";
};

export default function PolicyForm({ SetPage }: PolicyFormProps) {
  const form = useFormContext();
  const router = useRouter();
  const { clearSelectedRowData, selectedRowData } = useScheduleEditStore();
  const { translations } = useLanguage();
  const showToast = useShowToast();
  const t = translations?.modules?.scheduling || {};
  const isEditMode = Boolean(selectedRowData?.schedule_id);
  const [loading, setLoading] = useState(false);

  const addMutation = useMutation({
    mutationFn: addScheduleRequest,
    onSuccess: () => {
      setLoading(false);
      showToast("success", "data_saved");
      clearSelectedRowData();
      router.push("/scheduling/schedules/");
    },
    onError: (error: any) => {
      setLoading(false);
      console.error("Add Error", error);
      showToast("error", "form_error");
    },
  });

  const editMutation = useMutation({
    mutationFn: editScheduleRequest,
    onSuccess: () => {
      setLoading(false);
      showToast("success", "data_saved");
      clearSelectedRowData();
      router.push("/scheduling/schedules/");
    },
    onError: (error: any) => {
      setLoading(false);
      console.error("Edit Error", error);
      showToast("error", "form_error");
    },
  });

  const handleSave = async (values: any) => {
    if (loading) return;
    setLoading(true);

    try {
      const formattedValues = {
        ...values,
        in_time: formatTimeToString(values.in_time),
        out_time: formatTimeToString(values.out_time),
        required_work_hours: values.required_work_hours || "",
        ramadan_in_time: formatTimeToString(values.ramadan_in_time),
        ramadan_out_time: formatTimeToString(values.ramadan_out_time),
        ramadan_break_time: formatTimeToString(values.ramadan_break_time),
        ramadan_prayer_time: formatTimeToString(values.ramadan_prayer_time),
      };

      if (selectedRowData?.schedule_id) {
        editMutation.mutate({
          schedule_id: selectedRowData.schedule_id,
          ...formattedValues,
        });
      } else {
        addMutation.mutate(formattedValues);
      }
    } catch (error) {
      setLoading(false);
      console.error("Form submission error", error);
      showToast("error", "formsubmission_error");
    }
  };

  return (
    <Form {...form}>
      <form>
        <div className="flex p-5">
            <div className="flex flex-col gap-6 items-start">
                <FormField
                    control={form.control}
                    name="show_on_report"
                    render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <div className="flex items-center gap-2">
                                <FormLabel htmlFor="show_on_report" className="text-sm font-semibold mr-4 w-32">
                                  {t.show_report || "Show on report"} :
                                </FormLabel>
                                <RadioGroup
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    className="flex justify-center items-center gap-6"
                                    >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="first-in-last-out" id="show-first" />
                                        <Label htmlFor="show-first" className="text-sm">
                                          {t.first_in_last_out || "First IN/Last Out"}
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="all-transactions" id="show-all" />
                                        <Label htmlFor="show-all" className="text-sm">
                                          {t.all_trans || "All Transactions"}
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </FormControl>
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email_notification"
                    render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <div className="flex items-center gap-2">
                                <FormLabel htmlFor="email_notification" className="text-sm font-semibold mr-4 w-32">
                                  {t.email_notification || "Email notification"} :
                                </FormLabel>
                                <RadioGroup
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    className="flex justify-center items-center gap-6"
                                    >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="first-in-last-out" id="email-first" />
                                        <Label htmlFor="email-first" className="text-sm">
                                          {t.first_in_last_out || "First IN/Last Out"}
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="all-transactions" id="email-all" />
                                        <Label htmlFor="email-all" className="text-sm">
                                          {t.all_trans || "All Transactions"}
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </FormControl>
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="calculate_worked_hrs_flag"
                    render={({ field }) => (
                    <FormItem className=" ">
                    <FormControl>
                        <div className="flex items-center gap-2">
                            <Checkbox
                            id="calculate_worked_hrs_flag"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                            <FormLabel htmlFor="calculate_worked_hrs_flag" className="text-sm font-semibold">
                              {t.cal_worked_hrs || "Calculate Worked Hours From Schedule Start Time"}
                            </FormLabel>
                        </div>
                    </FormControl>
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="default_overtime_flag"
                    render={({ field }) => (
                    <FormItem className=" ">
                    <FormControl>
                    <div className="flex items-center gap-2">
                        <Checkbox
                        id="default_overtime_flag"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                        <FormLabel htmlFor="default_overtime_flag" className="text-sm font-semibold">
                          {t.enable_overtime || "Enable Default Overtime"}
                        </FormLabel>
                    </div>
                    </FormControl>
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="default_break_hrs_flag"
                    render={({ field }) => (
                    <FormItem className=" ">
                    <FormControl>
                    <div className="flex items-center gap-2">
                        <Checkbox
                        id="default_break_hrs_flag"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                        <FormLabel htmlFor="default_break_hrs_flag" className="text-sm font-semibold">
                          {t.enable_break_hrs || "Enable Default Break Hours"}
                        </FormLabel>
                    </div>
                    </FormControl>
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="override_schedule_on_holiday_flag"
                    render={({ field }) => (
                    <FormItem className=" ">
                    <FormControl>
                    <div className="flex items-center gap-2">
                        <Checkbox
                        id="override_schedule_on_holiday_flag"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                        <FormLabel htmlFor="override_schedule_on_holiday_flag" className="text-sm font-semibold">
                          {t.overide_schedule || "Override Schedule On Holiday"}
                        </FormLabel>
                    </div>
                    </FormControl>
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="reduce_required_hrs_flag"
                    render={({ field }) => (
                    <FormItem className=" ">
                    <FormControl>
                    <div className="flex items-center gap-2">
                        <Checkbox
                        id="reduce_required_hrs_flag"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                        <FormLabel htmlFor="reduce_required_hrs_flag" className="text-sm font-semibold">
                          {t.reduce_required_hrs || "Reduce Required Hours if Personal Permission is approved"}
                        </FormLabel>
                    </div>
                    </FormControl>
                    </FormItem>
                    )}
                />
            </div>
        </div>
        <div className="flex justify-end gap-2 items-center py-5">
          <div className="flex gap-4 px-5">
            <Button
              variant={"outline"}
              type="button"
              size={"lg"}
              className="w-full"
              onClick={() => {
                clearSelectedRowData();
                router.push("/scheduling/schedules/");
              }}
            >
              {translations?.buttons?.cancel || "Cancel"}
            </Button>
            <Button 
              type="button" 
              size={"lg"} 
              className="w-full"
              onClick={form.handleSubmit(handleSave)}
              disabled={loading}
            >
              {loading 
                ? (isEditMode ? (translations?.buttons?.updating || "Updating...") : (translations?.buttons?.saving || "Saving..."))
                : (isEditMode ? (translations?.buttons?.update || "Update") : (translations?.buttons?.save || "Save"))
              }
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}