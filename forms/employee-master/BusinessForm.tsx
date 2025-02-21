"use client";
import { useState } from "react";
import { toast } from "sonner";
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
import { nationalities_columns } from "@/data/cm.data";



export default function BusinessForm({
  Page,
  SetPage,
  buisnessFormSchema,
  buisnessForm
}: {
  Page?: any;
  SetPage?:any;
  buisnessFormSchema:any;
  buisnessForm:any
}) {
  

  function onSubmit(values: z.infer<typeof buisnessFormSchema>) {
    try {
      console.log(values)
      SetPage("flags-form")
      toast(
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      );
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  const router = useRouter();

  return (
    <Form {...buisnessForm}>
      <form onSubmit={buisnessForm.handleSubmit(onSubmit)}>
        <div className="px-5 pt-5">
          <FormField
            control={buisnessForm.control}
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
        <div className="flex justify-evenly gap-10 p-5">
          <div className="flex flex-col flex-1 items-end">
            <FormField
              control={buisnessForm.control}
              name="employee_type"
              render={({ field }) => (
                <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                  <div className="flex justify-end pr-2">
                    <FormLabel className="flex gap-1">Employee type <Required/> </FormLabel>
                  </div>
                  <div>
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
                  </div> 
                </FormItem>
              )}
            />
            <FormField
              control={buisnessForm.control}
              name="designation"
              render={({ field }) => (
                <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                  <div className="flex justify-end pr-2">
                  <FormLabel className="flex gap-1">Designation <Required/> </FormLabel>
                  </div>
                  <div>
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
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={buisnessForm.control}
              name="region"
              render={({ field }) => (
                <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                  <div className="flex justify-end pr-2">
                    <FormLabel className="flex gap-1">Region <Required/> </FormLabel>
                  </div>
                  <div>
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
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={buisnessForm.control}
              name="buildings"
              render={({ field }) => (
                <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                  <div className="flex justify-end pr-2">
                    <FormLabel className="flex gap-1">Buildings</FormLabel>
                  </div>
                  <div>
                    <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    >
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Choose buildings" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="1">DGS - Abu Dhabi Office</SelectItem>
                        <SelectItem value="2">DGS - Al Ain Office</SelectItem>
                        <SelectItem value="3">SJI - SEWA HO</SelectItem>
                        <SelectItem value="4">KEMP - KEMPSTON</SelectItem>
                        <SelectItem value="5">UK - London</SelectItem>
                    </SelectContent>
                    </Select>
                    <FormMessage className="mt-1"/>
                  </div>
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col flex-1 items-end">
            <FormField
              control={buisnessForm.control}
              name="manager"
              render={({ field }) => (
                <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                  <div className="flex justify-end pr-2">
                    <FormLabel className="flex gap-1">Manager <Required/> </FormLabel>
                  </div>
                  <div>
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
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={buisnessForm.control}
              name="grade"
              render={({ field }) => (
                <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                  <div className="flex justify-end pr-2">
                    <FormLabel className="flex gap-1">Grade <Required/> </FormLabel>
                  </div>
                  <div>
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
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={buisnessForm.control}
              name="schedule_type"
              render={({ field }) => (
                <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                  <div className="flex justify-end pr-2">
                    <FormLabel className="flex gap-1">Schedule type <Required/> </FormLabel>
                  </div>
                  <div>
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
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={buisnessForm.control}
              name="nationality"
              render={({ field }) => (
                <FormItem className="w-full py-2 grid grid-cols-2 gap-y-2 items-center space-y-0">
                  <div className="flex justify-end pr-2">
                    <FormLabel className="flex gap-1">Nationality <Required/> </FormLabel>
                  </div>
                  <div>
                    <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    >
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Choose nationality" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="1">American</SelectItem>
                        <SelectItem value="2">Bharin</SelectItem>
                    </SelectContent>
                    </Select>
                    <FormMessage className="mt-1"/>
                  </div>
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
              onClick={() => router.push("/employee-master/employees")}
            >
              Cancel
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
