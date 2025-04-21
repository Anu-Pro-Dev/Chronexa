"use client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";



export default function FlagsForm({
  flagForm,
  flagsFormSchema
}: {
  flagForm:any,
  flagsFormSchema:any
}) {
  

  function onSubmit(values: z.infer<typeof flagsFormSchema>) {
    try {
      console.log(values);
      toast(
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-accent">{JSON.stringify(values, null, 2)}</code>
        </pre>
      );
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  const router = useRouter();

  return (
    <Form {...flagForm}>
      <form onSubmit={flagForm.handleSubmit(onSubmit)} className="w-11/12 mx-auto">
        <div className="flex flex-col gap-6">
          <div className="p-5 flex flex-col">
            <div className="flex justify-between items-start gap-20">
              <div className="flex flex-col flex-1 gap-5">
                <FormField
                  control={flagForm.control}
                  name="active"
                  render={({ field }) => (
                  <FormItem className=" ">
                    <FormControl>
                    <div className="flex items-center gap-2">
                        <Checkbox
                        id="active"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                        <FormLabel htmlFor="active" className="text-sm font-semibold">Active</FormLabel>
                    </div>
                    </FormControl>
                  </FormItem>
                  )}
                />
                <FormField
                  control={flagForm.control}
                  name="punch"
                  render={({ field }) => (
                  <FormItem className=" ">
                    <FormControl>
                    <div className="flex items-center gap-2">
                        <Checkbox
                        id="punch"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                        <FormLabel htmlFor="manager_flag" className="text-sm font-semibold">Punch</FormLabel>
                    </div>
                    </FormControl>
                  </FormItem>
                  )}
                />
                <FormField
                  control={flagForm.control}
                  name="overtime"
                  render={({ field }) => (
                  <FormItem className=" ">
                    <FormControl>
                    <div className="flex items-center gap-2">
                        <Checkbox
                        id="overtime"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                        <FormLabel htmlFor="overtime" className="text-sm font-semibold">Overtime</FormLabel>
                    </div>
                    </FormControl>
                  </FormItem>
                  )}
                />
                <FormField
                  control={flagForm.control}
                  name="inpayroll"
                  render={({ field }) => (
                  <FormItem className=" ">
                    <FormControl>
                    <div className="flex items-center gap-2">
                        <Checkbox
                        id="inpayroll"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                        <FormLabel htmlFor="inpayroll" className="text-sm font-semibold">Inpayroll</FormLabel>
                    </div>
                    </FormControl>
                  </FormItem>
                  )}
                />
                <FormField
                  control={flagForm.control}
                  name="email_notification"
                  render={({ field }) => (
                  <FormItem className=" ">
                    <FormControl>
                    <div className="flex items-center gap-2">
                        <Checkbox
                        id="email_notification"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                        <FormLabel htmlFor="email_notification" className="text-sm font-semibold">Email notification</FormLabel>
                    </div>
                    </FormControl>
                  </FormItem>
                  )}
                />
                <FormField
                  control={flagForm.control}
                  name="open_shift"
                  render={({ field }) => (
                  <FormItem className=" ">
                    <FormControl>
                    <div className="flex items-center gap-2">
                        <Checkbox
                        id="open_shift"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                        <FormLabel htmlFor="open_shift" className="text-sm font-semibold">Open shift</FormLabel>
                    </div>
                    </FormControl>
                  </FormItem>
                  )}
                />
                <FormField
                  control={flagForm.control}
                  name="monthly_missed_hours"
                  render={({ field }) => (
                  <FormItem className=" ">
                    <FormControl>
                    <div className="flex items-center gap-2">
                        <Checkbox
                        id="monthly_missed_hours"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                        <FormLabel htmlFor="monthly_missed_hours" className="text-sm font-semibold">Calculate monthly missed hours</FormLabel>
                    </div>
                    </FormControl>
                  </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col flex-1 gap-5">
                <FormField
                  control={flagForm.control}
                  name="exclude_from_integration"
                  render={({ field }) => (
                  <FormItem className=" ">
                    <FormControl>
                    <div className="flex items-center gap-2">
                        <Checkbox
                        id="exclude_from_integration"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                        <FormLabel htmlFor="exclude_from_integration" className="text-sm font-semibold">Exclude from integration</FormLabel>
                    </div>
                    </FormControl>
                  </FormItem>
                  )}
                />
                <FormField
                  control={flagForm.control}
                  name="on_report"
                  render={({ field }) => (
                  <FormItem className=" ">
                    <FormControl>
                    <div className="flex items-center gap-2">
                        <Checkbox
                        id="on_report"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                        <FormLabel htmlFor="on_report" className="text-sm font-semibold">On report</FormLabel>
                    </div>
                    </FormControl>
                  </FormItem>
                  )}
                />
                <FormField
                  control={flagForm.control}
                  name="share_roster"
                  render={({ field }) => (
                  <FormItem className=" ">
                    <FormControl>
                    <div className="flex items-center gap-2">
                        <Checkbox
                        id="share_roster"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                        <FormLabel htmlFor="share_roster" className="text-sm font-semibold">Share roster</FormLabel>
                    </div>
                    </FormControl>
                  </FormItem>
                  )}
                />
                <FormField
                  control={flagForm.control}
                  name="include_in_email"
                  render={({ field }) => (
                  <FormItem className=" ">
                    <FormControl>
                    <div className="flex items-center gap-2">
                        <Checkbox
                        id="include_in_email"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                        <FormLabel htmlFor="include_in_email" className="text-sm font-semibold">Include in email</FormLabel>
                    </div>
                    </FormControl>
                  </FormItem>
                  )}
                />
                <FormField
                  control={flagForm.control}
                  name="web_punch"
                  render={({ field }) => (
                  <FormItem className=" ">
                    <FormControl>
                    <div className="flex items-center gap-2">
                        <Checkbox
                        id="web_punch"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                        <FormLabel htmlFor="web_punch" className="text-sm font-semibold">Web punch</FormLabel>
                    </div>
                    </FormControl>
                  </FormItem>
                  )}
                />
                <FormField
                  control={flagForm.control}
                  name="shift"
                  render={({ field }) => (
                  <FormItem className=" ">
                    <FormControl>
                    <div className="flex items-center gap-2">
                        <Checkbox
                        id="shift"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                        <FormLabel htmlFor="shift" className="text-sm font-semibold">Shift</FormLabel>
                    </div>
                    </FormControl>
                  </FormItem>
                  )}
                />
                <FormField
                  control={flagForm.control}
                  name="check_selfie"
                  render={({ field }) => (
                  <FormItem className=" ">
                    <FormControl>
                    <div className="flex items-center gap-2">
                        <Checkbox
                        id="check_selfie"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                        <FormLabel htmlFor="check_selfie" className="text-sm font-semibold">Check In/Out selfie</FormLabel>
                    </div>
                    </FormControl>
                  </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 items-center py-5">
            <div className="flex gap-4 px-5">
              <Button
                variant={"outline"}
                type="button"
                size={"lg"}
                className="w-full"
                onClick={() => router.push("/employee-master/employees")}
              >
                Cancel
              </Button>
              <Button type="submit" size={"lg"} className="w-full">
                Save
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
