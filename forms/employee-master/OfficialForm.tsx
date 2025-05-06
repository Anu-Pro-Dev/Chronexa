"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Required from "@/components/ui/required";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "@/icons/icons";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import CitizenshipDropdown from "@/components/custom/CitizenshipDropdown";

export default function OfficialForm({
  Page,
  SetPage,
  officialFormSchema,
  officialForm
}: {
  Page?: any;
  SetPage?:any;
  officialFormSchema:any;
  officialForm:any
}) {
  

  function onSubmit(values: z.infer<typeof officialFormSchema>) {
    try {
      console.log(values);
      SetPage("flags-form");
      toast.success("Data Saved!");
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  const router = useRouter();
  const managerFlagChecked = officialForm.watch("manager_flag");
  const [step, setStep] = useState(1);

  return (
    <Form {...officialForm}>
      <form onSubmit={officialForm.handleSubmit(onSubmit)}>
        <div className="p-8">
          <FormField
            control={officialForm.control}
            name="manager_flag"
            render={({ field }) => (
              <FormItem className=" ">
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="manager_flag"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <FormLabel htmlFor="manager_flag" className="text-sm font-semibold">Manager flag</FormLabel>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-y-5 gap-10 px-8 pb-5">
          <FormField
            control={officialForm.control}
            name="user_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">Employee type <Required/> </FormLabel>
                <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                >
                <FormControl>
                    <SelectTrigger>
                    <SelectValue placeholder="Choose employee type" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    <SelectItem value="1">Employee 1</SelectItem>
                </SelectContent>
                </Select>
                <FormMessage className="mt-1"/>
              </FormItem>
            )}
          />
          <FormField
            control={officialForm.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">Location <Required/> </FormLabel>
                <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                >
                <FormControl>
                    <SelectTrigger>
                    <SelectValue placeholder="Choose region" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    <SelectItem value="1">RYD</SelectItem>
                    <SelectItem value="2">Not defined</SelectItem>
                </SelectContent>
                </Select>
                <FormMessage className="mt-1"/>
              </FormItem>
            )}
          />
          <FormField
            control={officialForm.control}
            name="citizenship"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel className="flex gap-1">Citizenship <Required/> </FormLabel>
                <CitizenshipDropdown value={field.value} onChange={field.onChange} />
                <FormMessage className="mt-1"/>
              </FormItem>
            )}
          />
          <FormField
            control={officialForm.control}
            name="designation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">Designation <Required/> </FormLabel>
                <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                >
                <FormControl>
                    <SelectTrigger>
                    <SelectValue placeholder="Choose designation" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    <SelectItem value="1">Unknown</SelectItem>
                    <SelectItem value="2">A/ Executive Director Corporate Support Services Centre</SelectItem>
                </SelectContent>
                </Select>
                <FormMessage className="mt-1"/>
              </FormItem>
            )}
          />
          <FormField
            control={officialForm.control}
            name="organization_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">Organization type <Required/> </FormLabel>
                <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                >
                <FormControl>
                    <SelectTrigger>
                    <SelectValue placeholder="Choose schedule type" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    <SelectItem value="1">Miscellaneous</SelectItem>
                    <SelectItem value="2">Calendar Days</SelectItem>
                    <SelectItem value="3">Working Days</SelectItem>
                </SelectContent>
                </Select>
                <FormMessage className="mt-1"/>
              </FormItem>
            )}
          />
          <FormField
            control={officialForm.control}
            name="organization"
            render={({ field }) => (
            <FormItem>
                <FormLabel className="flex gap-1">Organization <Required/></FormLabel>
                <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
                >
                <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose organization" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    <SelectItem value="1">organization 1</SelectItem>
                </SelectContent>
                </Select>
                <FormMessage className="mt-1"/>
            </FormItem>
            )}
          />
          
          <FormField
            control={officialForm.control}
            name="grade"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">Grade <Required/> </FormLabel>
                <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                >
                <FormControl>
                    <SelectTrigger>
                    <SelectValue placeholder="Choose grade" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    <SelectItem value="1">grade 1</SelectItem>
                </SelectContent>
                </Select>
                <FormMessage className="mt-1"/>
              </FormItem>
            )}
          />
          {!managerFlagChecked && (
            <FormField
              control={officialForm.control}
              name="manager"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-1">Manager </FormLabel>
                  <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  >
                  <FormControl>
                      <SelectTrigger>
                      <SelectValue placeholder="Choose manager" />
                      </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                      <SelectItem value="1">ADMIN - ADMIN</SelectItem>
                  </SelectContent>
                  </Select>
                  <FormMessage className="mt-1"/>
                </FormItem>
              )}
            />
          )}         
        </div>
        <div className="flex justify-end gap-2 items-center py-5">
          <div className="flex gap-4 px-5">
            <Button
              variant={"outline"}
              type="button"
              size={"lg"}
              className="w-full"
              onClick={() => setStep((prev) => prev - 1)}
            >
              Back
            </Button>
            <Button type="submit" size={"lg"} className="w-full">
              Next
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
