"use client"
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn, getRandomInt } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Required from "@/components/ui/required";
import { useRouter } from "next/navigation"
import { CalendarIcon } from "@/icons/icons";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { BasicIcon, SetupIcon, RestrictIcon, PolicyIcon, CheckMark } from "@/icons/icons";

const formSchemaBasic = z.object({
  code: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  reason: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  descriptionEng: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  descriptionArb: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  permission_comments_en: z
    .string(),
  permission_comments_ar: z
    .string(),
})

const formSchemaSetup = z.object({
  workflows: z.string().min(1, { message: "Required" }).max(100),
  organization: z.string().optional(),
  group: z.string().optional(),
  employee: z.string().optional(),
  sex: z.string().optional(),
  citizenship: z.string().optional(),
  valid_from_date:  z.date().optional(),
  valid_till_date: z.date().optional(),
})

const formSchemaRestriction = z.object({
  max_minutes_per_day: z
    .number()
    .min(1, {
      message: "Required",
    })
    .max(1000),
  max_permissions_per_day: z
    .number()
    .min(1, {
      message: "Required",
    })
    .max(1000),
  max_minutes_per_month: z
    .number()
    .min(1, {
      message: "Required",
    })
    .max(1000),
  max_permissions_per_month: z
    .number()
    .min(1, {
      message: "Required",
    })
    .max(1000),
  min_permission_time: z
    .number()
    .min(1, {
      message: "Required",
    })
    .max(1000),
  max_permission_time: z
    .number()
    .min(1, {
      message: "Required",
    })
    .max(1000),
})

const formSchemaPolicy = z.object({

  permission_attributes: z.
  array(z.string()).optional(),
  permission_type: z
  .string().optional(),
})

export default function AddPermissionTypes () {

  const[pageNumber, setPageNumber] = useState(0)
  const router = useRouter()

  const formBasic = useForm<z.infer<typeof formSchemaBasic>>({
    resolver: zodResolver(formSchemaBasic),
    defaultValues: {
      code: "",
      descriptionEng: "",
      descriptionArb: "",
      reason: "",
      permission_comments_en:"",
      permission_comments_ar:"",

    }
  })

  function onSubmitBasic(values: z.infer<typeof formSchemaBasic>) {
    try {
      setPageNumber(1)
    } catch (error) {
      console.error("Form submission error", error)
    }
  }

  const formSetup = useForm<z.infer<typeof formSchemaSetup>>({
    resolver: zodResolver(formSchemaSetup),
    defaultValues: {
      workflows: "",
      organization: "",
      group: "",
      employee: "",
      sex:"",
      citizenship:"",
    }
  })

  function onSubmitSetup(values: z.infer<typeof formSchemaSetup>) {
    try {
      setPageNumber(2)
    } catch (error) {
      console.error("Form submission error", error)
    }
  }

  const formRestriction = useForm<z.infer<typeof formSchemaRestriction>>({
    resolver: zodResolver(formSchemaRestriction),
    defaultValues: {
      max_minutes_per_day: undefined,
      max_minutes_per_month: undefined,
      max_permissions_per_day: undefined,
      max_permissions_per_month: undefined,
      min_permission_time:undefined,
      max_permission_time:undefined,

    }
  })

  function onSubmitRestriction(values: z.infer<typeof formSchemaRestriction>) {
    try {
      setPageNumber(3)
    } catch (error) {
      console.error("Form submission error", error)
    }
  }

  const formPolicy = useForm<z.infer<typeof formSchemaPolicy>>({
    resolver: zodResolver(formSchemaPolicy),
    defaultValues: {
      permission_attributes:[],
      permission_type:''

    }
  })

  function onSubmitPolicy(values: z.infer<typeof formSchemaPolicy>) {
    try {
      setPageNumber(3)
    } catch (error) {
      console.error("Form submission error", error)
    }
  }

  return (

    <> 

    {pageNumber === 0 && (
      <Form {...formBasic}>
        <form onSubmit={formBasic.handleSubmit(onSubmitBasic)} className="bg-accent rounded-2xl p-6">
          <div className="flex justify-between">
            {/* <div>
              <h2 className="font-bold text-xl text-primary">Manage Permission</h2>
            </div> */}
            
            <div className="flex justify-between items-center gap-2">
              
              <div className="flex items-center gap-2">
                <div className="flex justify-center items-center rounded-full border border-primary w-9 h-9 text-primary">
                  <BasicIcon/>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-text-secondary">Step 1 </span>
                  <span className="font-semibold text-base text-text-primary">Basic</span>
                  <span className="text-primary text-[13px]">In progress</span>
                </div>
              </div>

              <div className="w-8 h-[2px] bg-secondary"></div>

              <div className="flex items-center gap-2">
                <div className="flex justify-center items-center rounded-full border border-secondary w-9 h-9 text-secondary">
                  <SetupIcon/>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-text-secondary">Step 2 </span>
                  <span className="font-semibold text-base text-text-primary">Setup</span>
                </div>
              </div>

              <div className="w-8 h-[2px] bg-secondary"></div>

              <div className="flex items-center gap-2">
                <div className="flex justify-center items-center rounded-full border border-secondary w-9 h-9 text-secondary">
                  <RestrictIcon/>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-text-secondary">Step 3 </span>
                  <span className="font-semibold text-base text-text-primary">Restrictions</span>
                </div>
              </div>

              <div className="w-8 h-[2px] bg-secondary"></div>

              <div className="flex items-center gap-2">
                <div className="flex justify-center items-center rounded-full border border-secondary w-9 h-9 text-secondary">
                  <PolicyIcon/>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-text-secondary">Step 4 </span>
                  <span className="font-semibold text-base text-text-primary">Policy</span>
                </div>
              </div>

            </div>
          </div>

          <div className="w-11/12 mx-auto grid md:grid-cols-2 gap-y-3 gap-x-16 md:px-5 [&>*]:max-w-[350px] md:[&>*:nth-child(2n)]:justify-self-end md:[&>*:nth-child(2n)]:min-w-[350px] py-10">
            <FormField
              control={formBasic.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Reason <Required />
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Normal In</SelectItem>
                      <SelectItem value="2">Normal Out</SelectItem>
                      <SelectItem value="3">Business Arrival</SelectItem>
                      <SelectItem value="4">Business Departure</SelectItem>
                    </SelectContent>
                  </Select>


                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formBasic.control}
              name="code"
              render={({ field }) => (
                <FormItem className=" ">
                  <FormLabel>
                    code <Required />
                  </FormLabel>
                  <FormControl>
                    <Input  type="text" placeholder="Personal permission" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formBasic.control}
              name="descriptionEng"
              render={({ field }) => (
                <FormItem className=" ">
                  <FormLabel>
                    Description (English) <Required />
                  </FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Enter the description" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formBasic.control}
              name="descriptionArb"
              render={({ field }) => (
                <FormItem className=" ">
                  <FormLabel>
                    Description (العربية) <Required />
                  </FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Enter the description" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formBasic.control}
              name="permission_comments_en"
              render={({ field }) => (
                <FormItem className=" ">
                  <FormLabel>
                    Permission Comments (English)
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter the comments" {...field} rows={5} />
                  </FormControl>

                </FormItem>
              )}
            />
            <FormField
              control={formBasic.control}
              name="permission_comments_ar"
              render={({ field }) => (
                <FormItem className=" ">
                  <FormLabel>
                    Permission Comments (العربية)
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter the comments" {...field} rows={5} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-2 items-center pb-5">
            <div className="flex gap-4 px-5">
              <Button
                variant={"outline"}
                type="button"
                size={"lg"}
                className=" px-10 "
                onClick={() => router.push("/self-services/permissions/manage")}
              >
                Cancel
              </Button>
              <Button type="submit" size={"lg"} className=" px-10 " >
                Continue
              </Button>
            </div>
          </div>
        </form>
      </Form>
    )}

    {pageNumber === 1 && (
      <Form {...formSetup}>
        <form onSubmit={formSetup.handleSubmit(onSubmitSetup)} className="bg-accent rounded-2xl p-6">
          <div className="flex justify-between">
            {/* <div>
              <h2 className="font-bold text-xl text-primary">Manage Permission</h2>
            </div> */}
            
            <div className="flex justify-between items-center gap-2">
              
              <div className="flex items-center gap-2">
                <div className="flex justify-center items-center rounded-full border border-success bg-success w-9 h-9">
                  <CheckMark/>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-text-secondary">Step 1 </span>
                  <span className="font-semibold text-base text-text-primary">Basic</span>
                  <span className="text-success text-[13px]">Completed</span>
                </div>
              </div>

              <div className="w-8 h-[2px] bg-secondary"></div>

              <div className="flex items-center gap-2">
                <div className="flex justify-center items-center rounded-full border border-primary w-9 h-9 text-primary">
                  <SetupIcon/>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-text-secondary">Step 2 </span>
                  <span className="font-semibold text-base text-text-primary">Setup</span>
                  <span className="text-primary text-[13px]">In progress</span>
                </div>
              </div>

              <div className="w-8 h-[2px] bg-secondary"></div>

              <div className="flex items-center gap-2">
                <div className="flex justify-center items-center rounded-full border border-secondary w-9 h-9 text-secondary">
                  <RestrictIcon />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-text-secondary">Step 3 </span>
                  <span className="font-semibold text-base text-text-primary">Restrictions</span>
                </div>
              </div>

              <div className="w-8 h-[2px] bg-secondary"></div>

              <div className="flex items-center gap-2">
                <div className="flex justify-center items-center rounded-full border border-secondary w-9 h-9 text-secondary">
                  <PolicyIcon />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-text-secondary">Step 4 </span>
                  <span className="font-semibold text-base text-text-primary">Policy</span>
                </div>
              </div>

            </div>
          </div>

          <div className="w-11/12 mx-auto grid md:grid-cols-2 gap-y-3 gap-x-16 md:px-5 [&>*]:max-w-[350px] md:[&>*:nth-child(2n)]:justify-self-end md:[&>*:nth-child(2n)]:min-w-[350px] py-10">
            <FormField
              control={formSetup.control}
              name="workflows"
              render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Workflows <Required />
                </FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose workflows" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Employee leaves</SelectItem>
                    <SelectItem value="2">Missing movements</SelectItem>
                    <SelectItem value="3">Manual movements</SelectItem>
                    <SelectItem value="4">PermLine manager</SelectItem>
                    <SelectItem value="5">Nursing permission</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
              )}
            />

            <FormField
              control={formSetup.control}
              name="organization"
              render={({ field }) => (
              <FormItem>
                <FormLabel>
                Organization
                </FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose organization" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Time Groups </SelectItem>
                    <SelectItem value="2">WorK Groups</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
              )}
            />

            <FormField
              control={formSetup.control}
              name="group"
              render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Group 
                </FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose group" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Time Groups </SelectItem>
                    <SelectItem value="2">WorK Groups</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
              )}
            />

            <FormField
              control={formSetup.control}
              name="employee"
              render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Employee 
                </FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose employee" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Time Groups </SelectItem>
                    <SelectItem value="2">WorK Groups</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
              )}
            />

            <FormField
              control={formSetup.control}
              name="sex"
              render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Sex 
                </FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose sex" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Male </SelectItem>
                    <SelectItem value="2">Female </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
              )}
            />

            <FormField
              control={formSetup.control}
              name="citizenship"
              render={({ field }) => (
              <FormItem>
                <FormLabel>
                Citizenship 
                </FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose citizenship" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Time Groups </SelectItem>
                    <SelectItem value="2">WorK Groups</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
              )}
            />
            <FormField
              control={formSetup.control}
              name="valid_from_date"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>
                    Valid From
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button size={"lg"} variant={"outline"}
                          className="w-full bg-accent px-3 flex justify-between text-text-primary"
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yy")
                          ) : (
                            <span className="font-normal text-sm text-text-secondary">Choose date</span>
                          )}
                          <CalendarIcon className="text-primary"/>
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
            <FormField
              control={formSetup.control}
              name="valid_till_date"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>
                    Valid Till
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button size={"lg"} variant={"outline"}
                          className="w-full bg-accent px-3 flex justify-between text-text-primary"
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
          
          <div className="flex justify-end gap-2 items-center pb-5">
            <div className="flex gap-4 px-5">
              <Button
                variant={"outline"}
                type="button"
                size={"lg"}
                className=" px-10 "
                onClick={() => setPageNumber(0)}
              >
                Back
              </Button>
              <Button type="submit" size={"lg"} className=" px-10 " >
                Continue
              </Button>
            </div>
          </div>

        </form>
      </Form>
    )}

    {pageNumber === 2 && (
      <Form {...formRestriction}>
        <form onSubmit={formRestriction.handleSubmit(onSubmitRestriction)} className="bg-accent rounded-2xl p-6">
          <div className="flex justify-between">
            {/* <div>
              <h2 className="font-bold text-xl text-primary">Manage Permission</h2>
            </div> */}
            
            <div className="flex justify-between items-center gap-2">
              
              <div className="flex items-center gap-2">
                <div className="flex justify-center items-center rounded-full border border-success bg-success w-9 h-9">
                  <CheckMark/>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-text-secondary">Step 1 </span>
                  <span className="font-semibold text-base text-text-primary">Basic</span>
                  <span className="text-success text-[13px]">Completed</span>
                </div>
              </div>

              <div className="w-8 h-[2px] bg-secondary"></div>

              <div className="flex items-center gap-2">
                <div className="flex justify-center items-center rounded-full border border-success bg-success w-9 h-9">
                  <CheckMark/>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-text-secondary">Step 2 </span>
                  <span className="font-semibold text-base text-text-primary">Setup</span>
                  <span className="text-success text-[13px]">Completed</span>
                </div>
              </div>

              <div className="w-8 h-[2px] bg-secondary"></div>

              <div className="flex items-center gap-2">
              <div className="flex justify-center items-center rounded-full border border-primary w-9 h-9 text-primary">
                  <RestrictIcon />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-text-secondary">Step 3 </span>
                  <span className="font-semibold text-base text-text-primary">Restrictions</span>
                  <span className="text-primary text-[13px]">In progress</span>
                </div>
              </div>

              <div className="w-8 h-[2px] bg-secondary"></div>

              <div className="flex items-center gap-2">
                <div className="flex justify-center items-center rounded-full border border-secondary w-9 h-9 text-secondary">
                  <PolicyIcon />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-text-secondary">Step 4 </span>
                  <span className="font-semibold text-base text-text-primary">Policy</span>
                </div>
              </div>

            </div>
          </div>

          <div className="w-11/12 mx-auto grid md:grid-cols-2 gap-y-3 gap-x-16 md:px-5 [&>*]:max-w-[350px] md:[&>*:nth-child(2n)]:justify-self-end md:[&>*:nth-child(2n)]:min-w-[350px] py-10">
            <FormField
              control={formRestriction.control}
              name="max_minutes_per_day"
              render={({ field }) => (
                <FormItem className=" ">
                  <FormLabel>
                    Max. Minutes Per Day <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter the minutes"
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formRestriction.control}
              name="max_permissions_per_day"
              render={({ field }) => (
                <FormItem className=" ">
                  <FormLabel>
                    Max. No. Of Permissions Per Day <Required />
                  </FormLabel>
                  <FormControl>
                    <Input  
                      type="number" 
                      min="0" 
                      placeholder="Enter the count" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                      value={field.value ?? ""} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formRestriction.control}
              name="max_minutes_per_month"
              render={({ field }) => (
                <FormItem className=" ">
                  <FormLabel>
                    Max. Minutes Per Month <Required />
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0"
                      placeholder="Enter the minutes" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formRestriction.control}
              name="max_permissions_per_month"
              render={({ field }) => (
                <FormItem className=" ">
                  <FormLabel>
                    Max. No. Of Permissions Per Month <Required />  
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0"
                      placeholder="Enter the count" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formRestriction.control}
              name="min_permission_time"
              render={({ field }) => (
                <FormItem className=" ">
                  <FormLabel>
                    Min. Permission Time <Required />
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0"
                      placeholder="Enter the time" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formRestriction.control}
              name="max_permission_time"
              render={({ field }) => (
                <FormItem className=" ">
                  <FormLabel>
                    Max. Permission Time <Required />
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      min="0"
                      placeholder="Enter the time" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                      value={field.value ?? ""} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-2 items-center pb-5">
            <div className="flex gap-4 px-5">
              <Button
                variant={"outline"}
                type="button"
                size={"lg"}
                className=" px-10 "
                onClick={() => setPageNumber(1)}
              >
                Back
              </Button>
              <Button type="submit" size={"lg"} className=" px-10 " >
                Continue
              </Button>
            </div>
          </div>

        </form>
      </Form>
    )}

    {pageNumber === 3 && (
      <Form {...formPolicy}>
        <form onSubmit={formPolicy.handleSubmit(onSubmitPolicy)} className="bg-accent rounded-2xl p-6">
          <div className="flex justify-between p-6">
            {/* <div>
              <h2 className="font-bold text-xl text-primary">Manage Permission</h2>
            </div> */}
            
            <div className="flex justify-between items-center gap-2">
              
              <div className="flex items-center gap-2">
                <div className="flex justify-center items-center rounded-full border border-success bg-success w-9 h-9">
                  <CheckMark/>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-text-secondary">Step 1 </span>
                  <span className="font-semibold text-base text-text-primary">Basic</span>
                  <span className="text-success text-[13px]">Completed</span>
                </div>
              </div>

              <div className="w-8 h-[2px] bg-secondary"></div>

              <div className="flex items-center gap-2">
                <div className="flex justify-center items-center rounded-full border border-success bg-success w-9 h-9">
                  <CheckMark/>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-text-secondary">Step 2 </span>
                  <span className="font-semibold text-base text-text-primary">Setup</span>
                  <span className="text-success text-[13px]">Completed</span>
                </div>
              </div>

              <div className="w-8 h-[2px] bg-secondary"></div>

              <div className="flex items-center gap-2">
                <div className="flex justify-center items-center rounded-full border border-success bg-success w-9 h-9">
                  <CheckMark/>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-text-secondary">Step 3 </span>
                  <span className="font-semibold text-base text-text-primary">Restrictions</span>
                  <span className="text-success text-[13px]">Completed</span>
                </div>
              </div>

              <div className="w-8 h-[2px] bg-secondary"></div>

              <div className="flex items-center gap-2">
                <div className="flex justify-center items-center rounded-full border border-primary w-9 h-9 text-primary">
                  <PolicyIcon />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-text-secondary">Step 4 </span>
                  <span className="font-semibold text-base text-text-primary">Policy</span>
                  <span className="text-primary text-[13px]">In progress</span>
                </div>
              </div>

            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-10  w-11/12 mx-auto bg-accent p-4 rounded-md ">
          
          <FormField
            control={formPolicy.control}
            name="permission_attributes"
            render={({ field }) => (
              <FormItem>
                <FormLabel><div className="mb-6 font-bold text-[15px]">Permission Attributes:</div></FormLabel>
                <FormControl>
                  <div className="grid grid-cols-2 gap-y-5 text-sm">
                    {["Group Apply", "Medical Pass Attachment", "Official", "Mandatory Comments", "Mandatory Attachment", "Apply Ramadan Restriction"].map((option) => (
                      <label key={option} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={field.value?.includes(option)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            field.onChange(
                              checked
                                ? [...(field.value || []), option] // Add to array
                                : field?.value?.filter((item: string) => item !== option) // Remove from array
                            );
                          }}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-center">
          <FormField
            control={formPolicy.control}
            name="permission_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel><div className="mb-6 font-bold text-[15px]">Permission Types:</div></FormLabel>
                <FormControl>
                  <div className="flex flex-col gap-5 text-sm">
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          value="by_minutes_permission"
                          checked={field.value === "by_minutes_permission"}
                          onChange={() => field.onChange("by_minutes_permission")}
                        />
                        <span>By Minutes Permission</span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          value="by_from_to_time_permission"
                          checked={field.value === "by_from_to_time_permission"}
                          onChange={() => field.onChange("by_from_to_time_permission")}
                        />
                        <span> By From Time / To Time Permisisons </span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          value="by_weekdays_permission"
                          checked={field.value === "by_weekdays_permission"}
                          onChange={() => field.onChange("by_weekdays_permission")}
                        />
                        <span> By Weekdays Permisisons </span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          value="by_fulldays_permission"
                          checked={field.value === "by_fulldays_permission"}
                          onChange={() => field.onChange("by_fulldays_permission")}
                        />
                        <span> By Full Day Permisisons </span>
                      </label>
                    </div>
                    
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>

            <div className=" col-span-2 flex justify-end">
              <div className="flex  gap-2 ">
                <Button
                  variant={"outline"}
                  type="button"
                  size={"lg"}
                  className=" px-10 "
                  onClick={() => setPageNumber(2)}
                >
                  Back
                </Button>
                <Button type="submit" size={"lg"} className=" px-10 " >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    )}

    </>
  );
}

