"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Required from "@/components/ui/required";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "@/icons/icons";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useLanguage } from "@/providers/LanguageProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addEmployeeGroupRequest, editEmployeeGroupRequest, apiRequest } from "@/lib/apiHandler";

const formSchema = z.object({
  group_code: z.string().default("").transform((val) => val.toUpperCase()),
  group_name: z.string().default(""),
  group_start_Date: z.date().nullable().optional(),
  group_end_Date: z.date().nullable().optional(),
  schedule_flag: z.boolean().optional().default(false),
  reporting_group_flag: z.boolean().optional().default(false),
  reporting_person: z.string().optional(),
});

export default function AddEmployeeGroups({
  on_open_change,
  selectedRowData,
  onSave,
}: {
  on_open_change: any;
  selectedRowData?: any;
  onSave: (id: string | null, newData: any) => void;
}) {

  const {language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      group_code:"",
      group_name: "",
      group_start_Date: null,
      group_end_Date: null,
      schedule_flag: false,
      reporting_group_flag: false,
      reporting_person: "",
    },
  });

  const reportingGroupChecked = form.watch("reporting_group_flag");

  // Fetch employees with manager flag
  const { data: managerEmployees, isLoading: isManagersLoading } = useQuery({
    queryKey: ["managerEmployees"],
    queryFn: async () => {
      // Adjust the endpoint as per your API
      return apiRequest("/employee/all?manager_flag=true", "GET");
    },
  });

  useEffect(() => {
    if (selectedRowData) {
      console.log("selectedRowData.reporting_person:", selectedRowData.reporting_person);
      console.log("managerEmployees:", managerEmployees?.data);
    
      form.reset({
        group_code: selectedRowData.group_code ?? "",
        group_name:
          language === "en"
            ? selectedRowData.group_name_eng ?? ""
            : selectedRowData.group_name_arb ?? "",
        group_start_Date: selectedRowData.group_start_Date
          ? new Date(selectedRowData.group_start_Date): null,
        group_end_Date: selectedRowData.group_end_Date
          ? new Date(selectedRowData.group_end_Date)  : null,
        schedule_flag: selectedRowData.schedule_flag ?? false,
        reporting_group_flag: selectedRowData.reporting_group_flag ?? false,
        reporting_person: selectedRowData.reporting_person != null 
        ? String(selectedRowData.reporting_person) 
        : "",
      });
    } else {
      form.reset(); // clears on add
    }
  }, [selectedRowData, language]);

  const addMutation = useMutation({
    mutationFn: addEmployeeGroupRequest,
    onSuccess: (data) => {
      toast.success("Employee type added successfully!");
      onSave(null, data.data);
      on_open_change(false);
      queryClient.invalidateQueries({ queryKey: ["employeeGroup"] });
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
    mutationFn: editEmployeeGroupRequest,
    onSuccess: (_data, variables) => {
      toast.success("Employee type updated successfully!");
      onSave(variables.employee_group_id?.toString() ?? null, variables);
      queryClient.invalidateQueries({ queryKey: ["employeeGroup"] });
      on_open_change(false);
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        toast.error("Duplicate data detected. Please use different values.");
      } else {
        toast.error("Form submission error.");
      }
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const payload: any = {
        group_code: values.group_code,
        group_start_Date: values.group_start_Date
          ? format(values.group_start_Date, "yyyy-MM-dd"): null,
        group_end_Date: values.group_end_Date
          ? format(values.group_end_Date, "yyyy-MM-dd"): null,  
        schedule_flag: values.schedule_flag,
        reporting_group_flag: values.reporting_group_flag,        
        reporting_person: values.reporting_person,
      };

      // Add only the language-specific name being edited
      if (language === "en") {
        payload.group_name_eng = values.group_name;
      } else {
        payload.group_name_arb = values.group_name;
      }

      if (selectedRowData) {
        editMutation.mutate({
          employee_group_id: selectedRowData.id,
          ...payload,
        });
      } else {
        addMutation.mutate(payload);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <div className="py-5 flex flex-col">
            <div className="flex gap-10 items-center p-7 pt-0">
              <FormField
                control={form.control}
                name="schedule_flag"
                render={({ field }) => (
                  <FormItem className=" ">
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="schedule_flag"
                          checked={!!field.value}
                          onCheckedChange={field.onChange}
                        />
                        <FormLabel htmlFor="schedule_flag" className="text-sm font-semibold">Schedule flag</FormLabel>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reporting_group_flag"
                render={({ field }) => (
                  <FormItem className=" ">
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="reporting_group_flag"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <FormLabel htmlFor="reporting_group_flag" className="text-sm font-semibold">Reporting group</FormLabel>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-16 gap-y-4 pl-7">
                <FormField
                  control={form.control}
                  name="group_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Group code<Required />
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter employee group code"
                          {...field}
                          className={`uppercase placeholder:lowercase ${
                            language === 'ar' ? 'text-right' : 'text-left'
                          }`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="group_name"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>
                        {language === "ar"
                          ? "Group Name (العربية) "
                          : "Group Name (English) "}
                        <Required />
                      </FormLabel>
                      <FormControl>
                      <Input placeholder="Enter employee group name" type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                  </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="group_start_Date"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel>
                        From Date <Required />
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button size={"lg"} variant={"outline"}
                              className="w-full bg-accent px-3 flex justify-between text-text-primary max-w-[350px] text-sm font-normal"
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yy")
                              ) : (
                                <span className="font-normal text-sm text-text-secondary">Choose date</span>
                              )}
                              <CalendarIcon />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? field.value : undefined}
                            onSelect={field.onChange}
                            disabled={(date) => {
                              // Get today's date at start of day for comparison
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              
                              // Disable dates before today
                              return date < today;
                            }}
                          />
                        </PopoverContent>
                      </Popover>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="group_end_Date"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel>
                        To Date <Required />
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button size={"lg"} variant={"outline"}
                              className="w-full bg-accent px-3 flex justify-between text-text-primary max-w-[350px] text-sm font-normal"
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yy")
                              ) : (
                                <span className="font-normal text-sm text-text-secondary">Choose date</span>
                              )}
                              <CalendarIcon />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? field.value : undefined}
                            onSelect={field.onChange}
                            disabled={(date) => {
                              const groupStartDate = form.getValues("group_start_Date");
                              
                              if (!groupStartDate) {
                                // If no start date is selected, disable all dates
                                return true;
                              }
                              
                              // Create a new date for comparison to avoid time issues
                              const startDate = new Date(groupStartDate);
                              startDate.setHours(0, 0, 0, 0);
                              
                              const compareDate = new Date(date);
                              compareDate.setHours(0, 0, 0, 0);
                              return compareDate <= startDate;
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {reportingGroupChecked && (
                  <>
                    <FormField
                      control={form.control}
                      name="reporting_person"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reporting Person <Required /></FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isManagersLoading}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={isManagersLoading ? "Loading..." : "Choose employee"} />
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
                    {/* <FormField
                      control={form.control}
                      name="refresh_member"
                      render={({ field }) => (
                        <FormItem className=" ">
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id="refresh_member"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              <FormLabel htmlFor="refresh_member" className="text-sm font-semibold">Auto Refresh Membership by Organization</FormLabel>
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    /> */}
                  </>
                )}
              </div>
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
              onClick={() => on_open_change(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size={"lg"} className="w-full">
              Save
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}