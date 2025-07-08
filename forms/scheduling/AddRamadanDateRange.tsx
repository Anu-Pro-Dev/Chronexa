// "use client";
// import { useEffect, useState } from "react";

// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { cn, getRandomInt } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import Link from "next/link";
// import { USER_TOKEN } from "@/utils/constants";
// import { useRouter } from "next/navigation";
// import Required from "@/components/ui/required";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { CalendarIcon } from "@/icons/icons";
// import { Calendar } from "@/components/ui/calendar";
// import { format } from "date-fns";
// const formSchema = z.object({
//   remarks: z
//     .string()
//     .min(1, {
//       message: "Required",
//     })
//     .max(100),
//   descriptionEng: z
//     .string()
//     .min(1, {
//       message: "Required",
//     })
//     .max(100),
//   descriptionArb: z
//     .string()
//     .min(1, {
//       message: "Required",
//     })
//     .max(100),
//   to_date: z.date({
//     required_error: "To Date is required.",
//   }),
//   from_date: z.date({
//     required_error: "From Date is required.",
//   }),
// });

// export default function AddRamadanDateRange({
//   on_open_change,
// }: {
//   on_open_change: any;
// }) {
//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       descriptionEng: "",
//       descriptionArb: "",
//       remarks: "",
//     },
//   });

//   const router = useRouter();
//   function onSubmit(values: z.infer<typeof formSchema>) {
//     try {
//       return;
//     } catch (error) {
//       console.error("Form submission error", error);
//     }
//   }

//   return (
//     <Form {...form}>
//        <form onSubmit={form.handleSubmit(onSubmit)}>
//         <div className="flex flex-col gap-6">
//           <div className="py-5 flex flex-col">
//             <div className="flex flex-col gap-4">
//               <div className="grid grid-cols-2 gap-16 gap-y-4">
//               <FormField
//                   control={form.control}
//                   name="descriptionEng"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>
//                         Ramadan Date (English) <Required />
//                       </FormLabel>
//                       <FormControl>
//                         <Input placeholder="Enter description in english" type="text" {...field} />
//                       </FormControl>

//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="descriptionArb"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>
//                         Ramadan Date (العربية) <Required />
//                       </FormLabel>
//                       <FormControl>
//                         <Input placeholder="Enter description in arabic" type="text" {...field} />
//                       </FormControl>

//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="from_date"
//                   render={({ field }) => (
//                     <FormItem className="">
//                       <FormLabel>
//                         From Date <Required />
//                       </FormLabel>
//                       <Popover>
//                         <PopoverTrigger asChild>
//                           <FormControl>
//                             <Button size={"lg"} variant={"outline"}
//                               className="w-full max-w-[350px] bg-accent px-3 flex justify-between text-text-primary"
//                             >
//                               {field.value ? (
//                                 format(field.value, "dd/MM/yy")
//                               ) : (
//                                 <span className="font-normal text-sm text-text-secondary">Choose date</span>
//                               )}
//                               <CalendarIcon />
//                             </Button>
//                           </FormControl>
//                         </PopoverTrigger>
//                         <PopoverContent className="w-auto p-0" align="start">
//                           <Calendar
//                             mode="single"
//                             selected={field.value}
//                             onSelect={field.onChange}
//                             // disabled={(date) =>
//                             //   date > new Date() || date < new Date("1900-01-01")
//                             // }
//                           />
//                         </PopoverContent>
//                       </Popover>

//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="to_date"
//                   render={({ field }) => (
//                     <FormItem className="">
//                       <FormLabel>
//                         To Date <Required />
//                       </FormLabel>
//                       <Popover>
//                         <PopoverTrigger asChild>
//                           <FormControl>
//                             <Button size={"lg"} variant={"outline"}
//                               className="w-full max-w-[350px] bg-accent px-3 flex justify-between text-text-primary"
//                             >
//                               {field.value ? (
//                                 format(field.value, "dd/MM/yy")
//                               ) : (
//                                 <span className="font-normal text-sm text-text-secondary">Choose date</span>
//                               )}
//                               <CalendarIcon />
//                             </Button>
//                           </FormControl>
//                         </PopoverTrigger>
//                         <PopoverContent className="w-auto p-0" align="start">
//                           <Calendar
//                             mode="single"
//                             selected={field.value}
//                             onSelect={field.onChange}
//                             // disabled={(date) =>
//                             //   date > new Date() || date < new Date("1900-01-01")
//                             // }
//                           />
//                         </PopoverContent>
//                       </Popover>

//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="remarks"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Remarks</FormLabel>
//                       <FormControl>
//                         <Input placeholder="Enter the remark" type="text" {...field} />
//                       </FormControl>

//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//         <div className="flex justify-end gap-2 items-center pb-5">
//           <div className="flex gap-4 px-5">
//             <Button
//               variant={"outline"}
//               type="button"
//               size={"lg"}
//               className="w-full"
//               onClick={() => on_open_change(false)}
//             >
//               Cancel
//             </Button>
//             <Button type="submit" size={"lg"} className="w-full">
//               Save
//             </Button>
//           </div>
//         </div>
//       </form>
//     </Form>
//   );
// }

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
import { CalendarIcon } from "@/icons/icons";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useLanguage } from "@/providers/LanguageProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addRamadanScheduleRequest, editRamadanScheduleRequest } from "@/lib/apiHandler";

const formSchema = z.object({
  ramadan_name: z.string().default(""),
  from_date: z.date().nullable().optional(),
  to_date: z.date().nullable().optional(),
  remarks: z.string().optional(),
});

export default function AddRamadanDateRange({
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
      ramadan_name: "",
      from_date: null,
      to_date: null,
      remarks:"",
    },
  });
  
  useEffect(() => {
    if (selectedRowData) {
      form.reset({
        ramadan_name:
          language === "en"
            ? selectedRowData.ramadan_name_eng ?? ""
            : selectedRowData.ramadan_name_arb ?? "",
        from_date: selectedRowData.from_date
          ? new Date(selectedRowData.from_date): null,
        to_date: selectedRowData.to_date
          ? new Date(selectedRowData.to_date)  : null,
        remarks: selectedRowData.remarks ?? "",
      });
    } else {
      form.reset(); // clears on add
    }
  }, [selectedRowData, language]);

  const addMutation = useMutation({
    mutationFn: addRamadanScheduleRequest,
    onSuccess: (data) => {
      toast.success("Ramadan dates added successfully!");
      onSave(null, data.data);
      on_open_change(false);
      queryClient.invalidateQueries({ queryKey: ["ramadanDates"] });
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
    mutationFn: editRamadanScheduleRequest,
    onSuccess: (_data, variables) => {
      toast.success("Ramadan dates updated successfully!");
      onSave(variables.ramadan_id?.toString() ?? null, variables);
      queryClient.invalidateQueries({ queryKey: ["ramadanDates"] });
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
        from_date: values.from_date
          ? format(values.from_date, "yyyy-MM-dd"): null,
        to_date: values.to_date
          ? format(values.to_date, "yyyy-MM-dd"): null,  
        remarks: values.remarks,
      };

      console.log("Payload being sent - ramadan date:", payload);

      // Add only the language-specific name being edited
      if (language === "en") {
        payload.ramadan_name_eng = values.ramadan_name;
      } else {
        payload.ramadan_name_arb = values.ramadan_name;
      }

      if (selectedRowData) {
        editMutation.mutate({
          ramadan_id: selectedRowData.id,
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
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-16 gap-y-4 pl-7">
                <FormField
                  control={form.control}
                  name="ramadan_name"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>
                        {language === "ar"
                          ? "Ramadan Name (العربية) "
                          : "Ramadan Name (English) "}
                        <Required />
                      </FormLabel>
                      <FormControl>
                      <Input placeholder="Enter ramadan name" type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                  </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the remark" type="text" {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="from_date"
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
                          />
                        </PopoverContent>
                      </Popover>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="to_date"
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
                              const ramadanStartDate = form.getValues("from_date");
                              
                              if (!ramadanStartDate) {
                                // If no start date is selected, disable all dates
                                return true;
                              }
                              
                              // Create a new date for comparison to avoid time issues
                              const startDate = new Date(ramadanStartDate);
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