"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { useRouter } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Label } from "@/src/components/ui/label";
import { useFormContext } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { addScheduleRequest, editScheduleRequest } from "@/src/lib/apiHandler";
import { useScheduleEditStore } from "@/src/stores/scheduleEditStore";
import { useLanguage } from "@/src/providers/LanguageProvider"

export default function PolicyForm() {
  const form = useFormContext();
  const router = useRouter();
  const { clearSelectedRowData, selectedRowData } = useScheduleEditStore();
  const { translations } = useLanguage();
  const isEditMode = Boolean(selectedRowData?.schedule_id);
  const [loading, setLoading] = useState(false);

  const addMutation = useMutation({
    mutationFn: addScheduleRequest,
    onSuccess: () => {
      setLoading(false);
      toast.success("Schedule added successfully!");
      clearSelectedRowData();
      router.push("/scheduling/schedules/");
    },
    onError: (error: any) => {
      setLoading(false);
      console.error("Add Error", error);
      toast.error(error?.response?.data?.message || "Failed to add schedule.");
    },
  });

  const editMutation = useMutation({
    mutationFn: editScheduleRequest,
    onSuccess: () => {
      setLoading(false);
      toast.success("Schedule updated successfully!");
      clearSelectedRowData();
      router.push("/scheduling/schedules/");
    },
    onError: (error: any) => {
      setLoading(false);
      console.error("Edit Error", error);
      toast.error(error?.response?.data?.message || "Failed to update schedule.");
    },
  });

  const handleSave = (values: any) => {
    setLoading(true);
    if (selectedRowData?.schedule_id) {
      editMutation.mutate({
        schedule_id: selectedRowData.schedule_id,
        ...values,
      });
    } else {
      addMutation.mutate(values);
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
                                <FormLabel htmlFor="show_on_report" className="text-sm font-semibold mr-4 w-32">Show on report : </FormLabel>
                                <RadioGroup
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    className="flex justify-center items-center gap-6"
                                    >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="first-in-last-out" id="show-first" />
                                        <Label htmlFor="show-first" className="text-sm">First IN/Last Out</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="all-transactions" id="show-all" />
                                        <Label htmlFor="show-all" className="text-sm">All Transactions</Label>
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
                                <FormLabel htmlFor="email_notification" className="text-sm font-semibold mr-4 w-32">Email notification : </FormLabel>
                                <RadioGroup
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    className="flex justify-center items-center gap-6"
                                    >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="first-in-last-out" id="show-first" />
                                        <Label htmlFor="show-first" className="text-sm">First IN/Last Out</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="all-transactions" id="show-all" />
                                        <Label htmlFor="show-all" className="text-sm">All Transactions</Label>
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
                            <FormLabel htmlFor="calculate_worked_hrs_flag" className="text-sm font-semibold">Calculate Worked Hours From Schedule Start Time</FormLabel>
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
                        <FormLabel htmlFor="default_overtime_flag" className="text-sm font-semibold">Enable Default Overtime</FormLabel>
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
                        <FormLabel htmlFor="default_break_hrs_flag" className="text-sm font-semibold"> Enable Default Break Hours</FormLabel>
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
                        <FormLabel htmlFor="override_schedule_on_holiday_flag" className="text-sm font-semibold">Overide Schedule On Holiday</FormLabel>
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
                        <FormLabel htmlFor="reduce_required_hrs_flag" className="text-sm font-semibold">Reduce Required Hours if Personal Permission is approved</FormLabel>
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
              onClick={() => router.push("/scheduling/schedules/")}
            >
              {translations.buttons.cancel}
            </Button>
            <Button 
              type="button" 
              size={"lg"} 
              className="w-full"
              onClick={form.handleSubmit(handleSave)}
            >
              {loading ? (isEditMode ? "Updating..." : "Saving...") : (isEditMode ? "Update" : "Save")}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
