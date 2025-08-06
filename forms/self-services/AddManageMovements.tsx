"use client";
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

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import PowerTable from "@/components/custom/power-comps/power-table";
import { Calendar } from "@/components/ui/calendar";
import { AddIcon, CalendarIcon, CancelIcon, CancelIcon2, ClockIcon, SearchIcon } from "@/icons/icons";
import { format } from "date-fns";
import { TimePicker } from "@/components/ui/time-picker";
import Required from "@/components/ui/required";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const formSchema = z.object({
    join_date: z.date({
      required_error: "From Date is required.",
    }),
    name: z
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
    designation: z
      .string()
      .min(1, {
        message: "Required",
      })
      .max(100), 
    organization: z
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
  });


export default function AddManageMovements ({
  on_open_change,
  selectedRowData,
  onSave,
  // props,
}: {
  on_open_change: any;
  selectedRowData?: any;
  onSave: (id: string | null, newData: any) => void;
  // props: any;
}) {
    
  const [Data, SetData] = useState<any>([]);
  

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
         
    },
  });

  const [isChecked, setIsChecked] = useState(false)


  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
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

    return(
      <>
      
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="bg-accent rounded-2xl ">
              <div className="flex justify-between">
                <div className="pb-6">
                    <h1 className="font-bold text-xl text-primary pb-2">Employees</h1>
                    {/* <h1 className="font-semibold text-sm text-text-secondary pb-2">
                    Choose the employees for further process
                    </h1> */}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-8 lg:gap-x-10 px-5">

                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full bg-accent px-3 flex justify-between text-text-primary border-grey">
                                  <p>
                                    <FormLabel className="font-normal text-secondary">
                                      Name <Required />
                                    </FormLabel>
                                    <span className="px-1 text-sm text-text-primary">
                                      {field.value ? (
                                        // Display the selected workflow label
                                        field.value === "1" ? "Leaves" :
                                        field.value === "2" ? "Permissions" :
                                        field.value === "3" ? "Missing movements" :
                                        field.value === "4" ? "Manual movements" :
                                        "Choose workflows"
                                      ) : (
                                        <span className="">Choose Employee</span>
                                      )}
                                    </span>
                                  </p>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">Leaves</SelectItem>
                                <SelectItem value="2">Permissions</SelectItem>
                                <SelectItem value="3">Missing movements</SelectItem>
                                <SelectItem value="4">Manual movements</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="manager"
                        render={({ field }) => (
                          <FormItem>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full bg-accent px-3 flex justify-between text-text-primary border-grey">
                                  <p>
                                    <FormLabel className="font-normal text-secondary">
                                      Manager <Required />
                                    </FormLabel>
                                    <span className="px-1 text-sm text-text-primary">
                                      {field.value ? (
                                        // Display the selected workflow label
                                        field.value === "1" ? "Leaves" :
                                        field.value === "2" ? "Permissions" :
                                        field.value === "3" ? "Missing movements" :
                                        field.value === "4" ? "Manual movements" :
                                        "Choose workflows"
                                      ) : (
                                        <span className="">Choose Manager</span>
                                      )}
                                    </span>
                                  </p>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">Leaves</SelectItem>
                                <SelectItem value="2">Permissions</SelectItem>
                                <SelectItem value="3">Missing movements</SelectItem>
                                <SelectItem value="4">Manual movements</SelectItem>
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
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full bg-accent px-3 flex justify-between text-text-primary border-grey">
                                  <p>
                                    <FormLabel className="font-normal text-secondary">
                                      Designation <Required />
                                    </FormLabel>
                                    <span className="px-1 text-sm text-text-primary">
                                      {field.value ? (
                                        // Display the selected workflow label
                                        field.value === "1" ? "Leaves" :
                                        field.value === "2" ? "Permissions" :
                                        field.value === "3" ? "Missing movements" :
                                        field.value === "4" ? "Manual movements" :
                                        "Choose workflows"
                                      ) : (
                                        <span className="">Choose Designation</span>
                                      )}
                                    </span>
                                  </p>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">Leaves</SelectItem>
                                <SelectItem value="2">Permissions</SelectItem>
                                <SelectItem value="3">Missing movements</SelectItem>
                                <SelectItem value="4">Manual movements</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="organization"
                        render={({ field }) => (
                          <FormItem>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full bg-accent px-3 flex justify-between text-text-primary border-grey">
                                  <p>
                                    <FormLabel className="font-normal text-secondary">
                                      Organization <Required />
                                    </FormLabel>
                                    <span className="px-1 text-sm text-text-primary">
                                      {field.value ? (
                                        // Display the selected workflow label
                                        field.value === "1" ? "Leaves" :
                                        field.value === "2" ? "Permissions" :
                                        field.value === "3" ? "Missing movements" :
                                        field.value === "4" ? "Manual movements" :
                                        "Choose workflows"
                                      ) : (
                                        <span className="">Choose Organization</span>
                                      )}
                                    </span>
                                  </p>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">Leaves</SelectItem>
                                <SelectItem value="2">Permissions</SelectItem>
                                <SelectItem value="3">Missing movements</SelectItem>
                                <SelectItem value="4">Manual movements</SelectItem>
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
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full bg-accent px-3 flex justify-between text-text-primary border-grey">
                                  <p>
                                    <FormLabel className="font-normal text-secondary">
                                      Schedule Type <Required />
                                    </FormLabel>
                                    <span className="px-1 text-sm text-text-primary">
                                      {field.value ? (
                                        // Display the selected workflow label
                                        field.value === "1" ? "Leaves" :
                                        field.value === "2" ? "Permissions" :
                                        field.value === "3" ? "Missing movements" :
                                        field.value === "4" ? "Manual movements" :
                                        "Choose workflows"
                                      ) : (
                                        <span className="">Choose Schedule Type</span>
                                      )}
                                    </span>
                                  </p>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">Leaves</SelectItem>
                                <SelectItem value="2">Permissions</SelectItem>
                                <SelectItem value="3">Missing movements</SelectItem>
                                <SelectItem value="4">Manual movements</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="join_date"
                        render={({ field }) => (
                          <FormItem className="">
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    size={"lg"}
                                    variant={"outline"}
                                    className="w-full bg-accent px-3 flex justify-between text-text-primary border-grey"
                                  >
                                    <p>
                                      <FormLabel className="font-normal text-secondary">
                                        Join Date <Required />
                                      </FormLabel>
                                      <span className="px-1 text-sm text-text-primary">
                                        {field.value ? format(field.value, "dd/MM/yy") : "Choose date"}
                                      </span>
                                    </p>
                                    <CalendarIcon />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                        
                    </div>
                    <div className="flex justify-between gap-2 items-center py-5">
                      <div className="flex items-center gap-2 px-5">
                        <Input type="checkbox" checked={isChecked} onChange={(e) => setIsChecked(e.target.checked)}/>
                        <p className="text-sm">Active</p>
                      </div>
                      <div className="flex gap-4 px-5">
                        <Button type="submit" size={"lg"} className="w-full rounded-lg px-4">
                          <SearchIcon/>  Search
                        </Button>
                        <Button type="submit" size={"lg"} className="w-full rounded-lg px-4" variant={"success"}>
                            <AddIcon/> Add
                        </Button>
                        <Button

                            variant={"outlineGrey"}
                            type="button"
                            size={"lg"}
                            className="w-full rounded-lg px-4 bg-gray-100 border-gray-300"
                            onClick={() => on_open_change(false)}
                        >
                          <CancelIcon2  />  Cancel
                        </Button>
                        
                      </div>
                    </div>
              </div>
            </form>
        </Form>
        {/* <div >
          <PowerTable api={"/self-services/punches/manual/add"} ispageValue5={true} />
        </div> */}
      </>  
    )
}