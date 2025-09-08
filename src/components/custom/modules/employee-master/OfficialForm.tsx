"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import * as z from "zod";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Checkbox } from "@/src/components/ui/checkbox";
import Required from "@/src/components/ui/required";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getManagerEmployees } from "@/src/lib/apiHandler";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";

export default function OfficialForm({
  Page,
  SetPage,
  officialFormSchema,
  officialForm,
}: {
  Page?: any;
  SetPage?: any;
  officialFormSchema: any;
  officialForm: any;
}) {
  const router = useRouter();
  const managerFlagChecked = officialForm.watch("manager_flag");
  const [step, setStep] = useState(1);

  // Dynamic fetches
  const { data: employeeTypes } = useFetchAllEntity("employeeType");
  const { data: locations } = useFetchAllEntity("location");
  const { data: citizenships } = useFetchAllEntity("citizenship");
  const { data: designations } = useFetchAllEntity("designation");
  const { data: organizations } = useFetchAllEntity("organization");
  const { data: grades } = useFetchAllEntity("grade");

  // Manager list
  const { data: managerEmployees } = useQuery({
    queryKey: ["managerEmployees"],
    queryFn: getManagerEmployees,
  });

  function onSubmit(values: z.infer<typeof officialFormSchema>) {
    try {
      SetPage("flags-form");
      toast.success("Data Saved!");
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <Form {...officialForm}>
      <form onSubmit={officialForm.handleSubmit(onSubmit)}>
        <div className="p-8">
          <FormField
            control={officialForm.control}
            name="manager_flag"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="manager_flag"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <FormLabel htmlFor="manager_flag" className="text-sm font-semibold">
                      Manager flag
                    </FormLabel>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-y-5 gap-10 px-8 pb-5">
          {/* Employee Type */}
          <FormField
            control={officialForm.control}
            name="employee_type_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">Employee Type <Required /></FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value !== undefined ? String(field.value) : ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose employee type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(employeeTypes?.data || []).map((item: any) => {
                      if (!item.employee_type_id || item.employee_type_id.toString().trim() === '') return null;
                      return (
                        <SelectItem key={item.employee_type_id} value={item.employee_type_id.toString()}>
                          {item.employee_type_eng}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Location */}
          <FormField
            control={officialForm.control}
            name="location_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">Location <Required /></FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value !== undefined ? String(field.value) : ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose location" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(locations?.data || []).map((item: any) => {
                      if (!item.location_id || item.location_id.toString().trim() === '') return null;
                      return (
                        <SelectItem key={item.location_id} value={item.location_id.toString()}>
                          {item.location_eng}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Citizenship */}
          <FormField
            control={officialForm.control}
            name="citizenship_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">Citizenship <Required /></FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value !== undefined ? String(field.value) : ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose citizenship" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                     {(citizenships?.data || []).map((item: any) => {
                      if (!item.citizenship_id || item.citizenship_id.toString().trim() === '') return null;
                      return (
                        <SelectItem key={item.citizenship_id} value={item.citizenship_id.toString()}>
                          {item.citizenship_eng}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Designation */}
          <FormField
            control={officialForm.control}
            name="designation_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">Designation <Required /></FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value !== undefined ? String(field.value) : ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose designation" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                     {(designations?.data || []).map((item: any) => {
                      if (!item.designation_id || item.designation_id.toString().trim() === '') return null;
                      return (
                        <SelectItem key={item.designation_id} value={item.designation_id.toString()}>
                          {item.designation_eng}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Organization */}
          <FormField
            control={officialForm.control}
            name="organization_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">Organization <Required /></FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value !== undefined ? String(field.value) : ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose organization" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                     {(organizations?.data || []).map((item: any) => {
                      if (!item.organization_id || item.organization_id.toString().trim() === '') return null;
                      return (
                        <SelectItem key={item.organization_id} value={item.organization_id.toString()}>
                          {item.organization_eng}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Grade */}
          <FormField
            control={officialForm.control}
            name="grade_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">Grade <Required /></FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value !== undefined ? String(field.value) : ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose grade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(grades?.data || []).map((item: any) => {
                      if (!item.grade_id || item.grade_id.toString().trim() === '') return null;
                      return (
                        <SelectItem key={item.grade_id} value={item.grade_id.toString()}>
                          {item.grade_eng || item.grade_name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Manager (conditionally shown if manager_flag is false) */}
          {/* {!managerFlagChecked && ( */}
            <FormField
              control={officialForm.control}
              name="manager_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-1">Manager</FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    value={field.value !== undefined ? String(field.value) : ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose manager" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {managerEmployees?.data?.length > 0 &&
                        managerEmployees.data
                          .filter((emp: any) => emp.employee_id != null)
                          .map((emp: any) => (
                            <SelectItem key={emp.employee_id} value={emp.employee_id.toString()}>
                              {emp.firstname_eng}
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          {/* )} */}
        </div>

        <div className="flex justify-end gap-2 items-center py-5">
          <div className="flex gap-4 px-5">
            <Button variant="outline" type="button" size="lg" className="w-full" onClick={() => setStep((prev) => prev - 1)}>
              Back
            </Button>
            <Button type="submit" size="lg" className="w-full">
              Next
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}