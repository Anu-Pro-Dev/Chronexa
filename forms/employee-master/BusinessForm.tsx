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

const formSchema = z.object({
  employee_type: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  designation: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  region: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  buildings: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  manager: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  grade: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  schedule_type: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  nationality: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  manager_flag: z.boolean(),
});

export default function BusinessForm({
  on_open_change,
}: {
  on_open_change?: any;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_type: "",
      designation: "",
      region: "",
      buildings: "",
      manager: "",
      grade: "",
      schedule_type: "",
      nationality: "",
      manager_flag: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(values);
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-11/12 mx-auto">
        <div className="flex flex-col gap-6">
          <div className="p-5 flex flex-col">
            <div className="pb-5">
              <FormField
                control={form.control}
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
            <div className="flex justify-between items-start gap-20">
              <div className="flex flex-col flex-1 gap-5">
                <FormField
                  control={form.control}
                  name="employee_type"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Employee type <Required/> </FormLabel>
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

                      <FormMessage />
                  </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="designation"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Designation <Required/> </FormLabel>
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

                      <FormMessage />
                  </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Region <Required/> </FormLabel>
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

                      <FormMessage />
                  </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="buildings"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Buildings</FormLabel>
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

                      <FormMessage />
                  </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col flex-1 gap-5">
                <FormField
                  control={form.control}
                  name="manager"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Manager <Required/> </FormLabel>
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

                      <FormMessage />
                  </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Grade <Required/> </FormLabel>
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

                      <FormMessage />
                  </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="schedule_type"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Schedule type <Required/> </FormLabel>
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

                      <FormMessage />
                  </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nationality"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Nationality <Required/> </FormLabel>
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

                      <FormMessage />
                  </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 items-center pb-5">
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
        </div>
      </form>
    </Form>
  );
}
