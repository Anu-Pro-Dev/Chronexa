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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PowerTable from "@/components/custom/power-comps/power-table";
import { AddIcon, CancelIcon2 } from "@/icons/icons";
import Required from "@/components/ui/required";
import { useState } from "react";
import PowerSearch from "@/components/custom/power-comps/power-search";

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


export default function AddGroupMembers ({
    on_open_change,props
  }: {
    on_open_change: any;
    props:any;
  }){

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
                    <h1 className="font-semibold text-sm text-text-secondary pb-2">
                    Select the employees for the group
                    </h1>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                    <div className="flex justify-between gap-2 items-center">
                      <div className="flex items-center gap-2">
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
                                        Organization: 
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
                                    <SelectItem value="1">Organization 1</SelectItem>
                                    <SelectItem value="2">Permissions</SelectItem>
                                    <SelectItem value="3">Missing movements</SelectItem>
                                    <SelectItem value="4">Manual movements</SelectItem>
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                      </div>
                      <div className="flex gap-4">
                        <PowerSearch props={props} />
                        <Button type="submit" variant={"success"} size={"sm"} className="flex items-center space-y-0.5 border border-success">
                            <AddIcon/> Add
                        </Button>
                        <Button
                            variant={"outlineGrey"}
                            type="button"
                            size={"sm"}
                            className="flex items-center gap-1 p-0 pl-1 pr-2 bg-[#F3F3F3] border-[#E7E7E7]"
                            onClick={() => on_open_change(false)}
                        >
                          <CancelIcon2  />  Cancel
                        </Button>
                        
                      </div>
                    </div>
              </div>
            </form>
        </Form>
        <div className="py-3">
          <PowerTable props={props} Data={Data} api={"/self-services/punches/manual/add"} ispageValue5={true} />
        </div>
      </>  
    )
}