"use client"
import { useEffect, useState } from "react"
import {MinusIcon} from "@radix-ui/react-icons"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { cn, getRandomInt } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { USER_TOKEN } from "@/lib/Instance"
import { useRouter } from "next/navigation"
import Required from "@/components/ui/required"
import { RefreshIcon } from "@/icons/icons"
import { IoMdRefresh } from "react-icons/io"
import { Textarea } from "@/components/ui/textarea"
import { DatePickerForm } from "@/components/ui/date-picker"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "@radix-ui/react-icons"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { IoCheckmarkCircle, IoSettingsSharp, IoLockClosed, IoDocumentText } from "react-icons/io5"

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
  description_en: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  description_ar: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  permission_comments_en: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  permission_comments_ar: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
})

const formSchemaSetup = z.object({
  valid_from_date: z.date({
    required_error: "From Date is required.",
  }),
  valid_till_date: z.date({
    required_error: "From Date is required.",
  }),
  workflow: z.string().optional(),
  organisation: z.string().optional(),
  group: z.string().optional(),
  employee: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),

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
        description_en: "",
        description_ar: "",
        reason: "",
        permission_comments_en:"",
        permission_comments_ar:"",

      }
    })

    function onSubmitBasic(values: z.infer<typeof formSchemaBasic>) {
      try {
        console.log(values)
        setPageNumber(1)
      } catch (error) {
        console.error("Form submission error", error)
      }
    }

    const formSetup = useForm<z.infer<typeof formSchemaSetup>>({
      resolver: zodResolver(formSchemaSetup),
      defaultValues: {
        workflow: "",
        organisation: "",
        group: "",
        employee: "",
        gender:"",
        nationality:"",
      }
    })

    function onSubmitSetup(values: z.infer<typeof formSchemaSetup>) {
      try {
        console.log(values)
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
        console.log(values)
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
        console.log(values)
        setPageNumber(3)
      } catch (error) {
        console.error("Form submission error", error)
      }
    }

  
    return (

      <> 

      {pageNumber === 0 && (
      <Form {...formBasic}>
        <form onSubmit={formBasic.handleSubmit(onSubmitBasic)} className="space-y-6 mt-6 bg-white p-6">
          <div className="flex justify-between">
            <div>
                <h2 className="text-2xl font-bold text-primary">Permission Types</h2>
                <p className="text-sm text-muted-foreground text-gray-400">
                Select the basic details to fill
                </p>
            </div>
            
            <div className="flex justify-between items-center pb-4 mb-6 w-6/12">
              
              <div className="flex items-center space-x-3 font-semibold mr-2 ml-2">
                <div className="rounded-full border-2 border-primary p-2 text-primary">
                  <IoCheckmarkCircle className="text-2xl" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400">Step 1 </span>
                  <span >Basic</span>
                  <span className="text-primary">In progress</span>
                </div>
              </div>

              <div className="h-[2px] bg-gray-300 flex-grow mr-2"></div>

              <div className="flex items-center space-x-3 mr-2 ml-2">
                <div className="rounded-full border-2 border-gray-200 p-2">
                  <IoSettingsSharp className="text-2xl text-gray-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 ">Step 2 </span>
                  <span >Setup</span>
                </div>
              </div>

              <div className="h-[2px] bg-gray-300 flex-grow mr-2"></div>

              <div className="flex items-center space-x-3 mr-2 ml-2">
                <div className="rounded-full border-2 border-gray-200 p-2">
                  <IoLockClosed className="text-2xl text-gray-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400">Step 3 </span>
                  <span>Restrictions</span>
                </div>
              </div>

              <div className="h-[2px] bg-gray-300 flex-grow mr-2"></div>

              <div className="flex items-center space-x-3 mr-2 ml-2">
                <div className="rounded-full border-2 border-gray-200 p-2">
                  <IoDocumentText className="text-2xl text-gray-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400">Step 4 </span>
                  <span>Policy</span>
                </div>
              </div>

            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-10  w-11/12 mx-auto bg-white p-4 rounded-md  ">
            <div>
              <FormField
                control={formBasic.control}
                name="reason"
                render={({ field }) => (
                  <FormItem className=" ">
                    <FormLabel>
                      Reason <Required />
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your Code"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
              name="description_en"
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
              name="description_ar"
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
                    Permission Comments (English) <Required />
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter the comments" {...field} />
                  </FormControl>
  
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formBasic.control}
              name="permission_comments_ar"
              render={({ field }) => (
                <FormItem className=" ">
                  <FormLabel>
                    Permission Comments (العربية) <Required />
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter the comments" {...field} />
                  </FormControl>
  
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className=" col-span-2 flex justify-end">
              <div className="flex  gap-2 ">
                <Button
                  variant={"outline"}
                  type="button"
                  size={"lg"}
                  className=" px-10 "
                  onClick={() => router.push("/self-services/manage-permissions/permission-types")}
                >
                  Cancel
                </Button>
                <Button type="submit" size={"lg"} className=" px-10 " >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
      )}

      {pageNumber === 1 && (
        <Form {...formSetup}>
        <form onSubmit={formSetup.handleSubmit(onSubmitSetup)} className="space-y-6 mt-6 bg-white p-6">
          <div className="flex justify-between">
            <div>
                <h2 className="text-2xl font-bold text-primary">Permission Types</h2>
                <p className="text-sm text-muted-foreground text-gray-400">
                Select the setup details to fill
                </p>
            </div>
            
            <div className="flex justify-between items-center pb-4 mb-6 w-6/12">

              <div className="flex items-center space-x-3 font-semibold mr-2 ml-2 ">
                  <IoCheckmarkCircle className="text-5xl text-green-400" />
                <div className="flex flex-col">
                  <span className="text-gray-400">Step 1 </span>
                  <span >Basic</span>
                  <span className="text-green-400">Completed</span>
                </div>
              </div>

              <div className="h-[2px] bg-gray-300 flex-grow mr-2"></div>

              <div className="flex items-center space-x-3 mr-2 ml-2">
                <div className="rounded-full border-2 border-primary p-2">
                  <IoSettingsSharp className="text-2xl text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 ">Step 2 </span>
                  <span >Setup</span>
                  <span className="text-primary">In progress</span>
                </div>
              </div>

              <div className="h-[2px] bg-gray-300 flex-grow mr-2"></div>

              <div className="flex items-center space-x-3 mr-2 ml-2">
                <div className="rounded-full border-2 border-gray-200 p-2">
                  <IoLockClosed className="text-2xl text-gray-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400">Step 3 </span>
                  <span>Restrictions</span>
                </div>
              </div>

              <div className="h-[2px] bg-gray-300 flex-grow mr-2"></div>

              <div className="flex items-center space-x-3 mr-2 ml-2">
                <div className="rounded-full border-2 border-gray-200 p-2">
                  <IoDocumentText className="text-2xl text-gray-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400">Step 4 </span>
                  <span>Policy</span>
                </div>
              </div>

            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-10  w-11/12 mx-auto bg-white p-4 rounded-md ">
          <FormField
            control={formSetup.control}
            name="workflow"
            render={({ field }) => (
            <FormItem>
              <FormLabel>
                Workflow <Required />
              </FormLabel>
              <Select onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="choose workflow" />
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
            name="organisation"
            render={({ field }) => (
            <FormItem>
              <FormLabel>
              Organisation
              </FormLabel>
              <Select onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="choose organisation" />
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
                    <SelectValue placeholder="choose group" />
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
                    <SelectValue placeholder="choose employee" />
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
            name="gender"
            render={({ field }) => (
            <FormItem>
              <FormLabel>
                Gender 
              </FormLabel>
              <Select onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="choose gender" />
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
            name="nationality"
            render={({ field }) => (
            <FormItem>
              <FormLabel>
              Nationality 
              </FormLabel>
              <Select onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="choose nationality" />
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

          <div>
            <FormField
              control={formSetup.control}
              name="valid_from_date"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>Valid From</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal rounded-2xl",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Select date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        // disabled={(date) =>
                        //   date > new Date() || date < new Date("1900-01-01")
                        // }
                      />
                    </PopoverContent>
                  </Popover>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <FormField
              control={formSetup.control}
              name="valid_till_date"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>Valid Till</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal rounded-2xl",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Select date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        // disabled={(date) =>
                        //   date > new Date() || date < new Date("1900-01-01")
                        // }
                      />
                    </PopoverContent>
                  </Popover>
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
                  onClick={() => setPageNumber(0)}
                >
                  Back
                </Button>
                <Button type="submit" size={"lg"} className=" px-10 " >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
      )}

      {pageNumber === 2 && (
        <Form {...formRestriction}>
          <form onSubmit={formRestriction.handleSubmit(onSubmitRestriction)} className="space-y-6 mt-6 bg-white p-6">
            <div className="flex justify-between">
              <div>
                  <h2 className="text-2xl font-bold text-primary">Permission Types</h2>
                  <p className="text-sm text-muted-foreground text-gray-400">
                  Select the restriction details to fill
                  </p>
              </div>
              
              <div className="flex justify-between items-center pb-4 mb-6 w-6/12">
                
                <div className="flex items-center space-x-3 font-semibold mr-2 ml-2 ">
                  <IoCheckmarkCircle className="text-5xl text-green-400" />
                  <div className="flex flex-col">
                    <span className="text-gray-400">Step 1 </span>
                    <span >Basic</span>
                    <span className=" text-green-400">Completed</span>
                  </div>
                </div>

                <div className="h-[2px] bg-gray-300 flex-grow mr-2"></div>

                <div className="flex items-center space-x-3 font-semibold mr-2 ml-2 ">
                  <IoCheckmarkCircle className="text-5xl text-green-400" />
                  <div className="flex flex-col">
                    <span className="text-gray-400">Step 2 </span>
                    <span >Setup</span>
                    <span className=" text-green-400">Completed</span>
                  </div>
                </div>

                <div className="h-[2px] bg-gray-300 flex-grow mr-2"></div>

                <div className="flex items-center space-x-3 mr-2 ml-2">
                  <div className="rounded-full border-2 border-primary p-2">
                    <IoLockClosed className="text-2xl text-gray-400 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400">Step 3 </span>
                    <span>Restrictions</span>
                    <span className="text-primary">In progress</span>
                  </div>
                </div>

                <div className="h-[2px] bg-gray-300 flex-grow mr-2"></div>

                <div className="flex items-center space-x-3 mr-2 ml-2">
                  <div className="rounded-full border-2 border-gray-200 p-2">
                    <IoDocumentText className="text-2xl text-gray-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400">Step 4 </span>
                    <span>Policy</span>
                  </div>
                </div>

              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-10  w-11/12 mx-auto bg-white p-4 rounded-md  ">
              <div>
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
              <FormField
                control={formRestriction.control}
                name="max_permissions_per_day"
                render={({ field }) => (
                  <FormItem className=" ">
                    <FormLabel>
                      Max. No. Of Permissions Per Day <Required />
                    </FormLabel>
                    <FormControl>
                      <Input  type="number" placeholder="Enter the count" {...field} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                          value={field.value ?? ""} />
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
                      <Input type="number" 
                      placeholder="Enter the minutes" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                          value={field.value ?? ""}/>
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
                      <Input type="number" placeholder="Enter the count" {...field} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                          value={field.value ?? ""}/>
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
                      <Input type="number" placeholder="Enter the time" {...field} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                          value={field.value ?? ""}/>
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
                      <Input type="number" placeholder="Enter the time" {...field} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                          value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className=" col-span-2 flex justify-end">
                <div className="flex  gap-2 ">
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
            </div>
          </form>
        </Form>
      )}

      {pageNumber === 3 && (
        <Form {...formPolicy}>
          <form onSubmit={formPolicy.handleSubmit(onSubmitPolicy)} className="space-y-6 mt-6 bg-white p-6">
            <div className="flex justify-between">
              <div>
                  <h2 className="text-2xl font-bold text-primary">Permission Types</h2>
                  <p className="text-sm text-muted-foreground text-gray-400">
                  Select the policy details to fill
                  </p>
              </div>
              
              <div className="flex justify-between items-center pb-4 mb-6 w-6/12">
                
                <div className="flex items-center space-x-3 font-semibold mr-2 ml-2 ">
                  <IoCheckmarkCircle className="text-5xl text-green-400" />
                  <div className="flex flex-col">
                    <span className="text-gray-400">Step 1 </span>
                    <span> Basic </span>
                    <span className=" text-green-400">Completed</span>
                  </div>
                </div>

                <div className="h-[2px] bg-gray-300 flex-grow mr-2"></div>

                <div className="flex items-center space-x-3 font-semibold mr-2 ml-2 ">
                  <IoCheckmarkCircle className="text-5xl text-green-400" />
                  <div className="flex flex-col">
                    <span className="text-gray-400">Step 2 </span>
                    <span> Setup </span>
                    <span className=" text-green-400">Completed</span>
                  </div>
                </div>

                <div className="h-[2px] bg-gray-300 flex-grow mr-2"></div>

                <div className="flex items-center space-x-3 font-semibold mr-2 ml-2 ">
                  <IoCheckmarkCircle className="text-5xl text-green-400" />
                  <div className="flex flex-col">
                    <span className="text-gray-400">Step 3 </span>
                    <span> Restrictions </span>
                    <span className=" text-green-400">Completed</span>
                  </div>
                </div>

                <div className="h-[2px] bg-gray-300 flex-grow mr-2"></div>

                <div className="flex items-center space-x-3 mr-2 ml-2">
                  <div className="rounded-full border-2 border-primary p-2">
                    <IoDocumentText className="text-2xl text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400"> Step 4 </span>
                    <span> Policy </span>
                    <span className="text-primary"> In progress </span>
                  </div>
                </div>
                
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-10  w-11/12 mx-auto bg-white p-4 rounded-md ">
            
            <FormField
              control={formPolicy.control}
              name="permission_attributes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel><div className="mb-6">Permission Attributes</div></FormLabel>
                  <FormControl >
                    <div className="grid grid-cols-2  gap-y-5">
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
                                  : field.value.filter((item: string) => item !== option) // Remove from array
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
                  <FormLabel><div className="mb-6">Permission Types:</div></FormLabel>
                  <FormControl>
                    <div className="flex flex-col gap-5">
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
    )
}

