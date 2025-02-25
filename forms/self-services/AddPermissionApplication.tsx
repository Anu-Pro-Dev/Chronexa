"use client"
import { useEffect, useState } from "react"
import { MinusIcon } from "@radix-ui/react-icons"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { cn } from "@/lib/utils"
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
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { USER_TOKEN } from "@/lib/Instance"
import { useRouter } from "next/navigation"
import Required from "@/components/ui/required"
import { ClockIcon, ClockIcon2, ExclamationIcon, RefreshIcon } from "@/icons/icons"
import { IoMdRefresh } from "react-icons/io"
import { Textarea } from "@/components/ui/textarea"
import { DatePickerForm } from "@/components/ui/date-picker"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { Calendar1Icon } from "@/icons/icons";
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"


const formSchema = z.object({
  employee: z.string().min(1, { message: "Required" }).max(100),
  permission_types: z.string().min(1, { message: "Required" }).max(100),
  from_date: z.string().min(1, { message: "Required" }).max(100),
  to_date: z.string().min(1, { message: "Required" }).max(100),
  from_time: z.string().min(1, { message: "Required" }).max(100),
  to_time: z.string().min(1, { message: "Required" }).max(100),
  justification: z.string().min(1, { message: "Required" }).max(500, {
    message: "Maximum 500 characters allowed",
  }),
})

export default function AddPermissionApplication() {
  const router = useRouter()
  const [selectedPermission, setSelectedPermission] = useState<string | null>(null)
  const [justificationLength, setJustificationLength] = useState(0)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee: "",
      permission_types: "",
      from_date: "",
      to_date: "",
      from_time:"",
      to_time:"",
      justification: "",
    },
  })

  const { watch, setValue } = form
  const justificationValue = watch("justification")

  useEffect(() => {
    setJustificationLength(justificationValue.length)
  }, [justificationValue])

  function onSubmitBasic(values: z.infer<typeof formSchema>) {
    try {
      console.log(values)
    } catch (error) {
      console.error("Form submission error", error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitBasic)} className="space-y-6 mt-6 bg-white p-6">
        <div className="flex justify-between">
            <div>
                <h2 className="text-2xl font-bold text-primary">Permission Types</h2>
                <p className="text-sm text-muted-foreground text-gray-400">
                Select the basic details to fill
                </p>
            </div>
            <div>
                {selectedPermission === "personal permission" && (
                <p className="text-sm text-primary mt-2 border border-blue-200 rounded-md px-2 py-1 font-semibold bg-blue-400 bg-opacity-10 ">
                    Note: Personal permission is allowed for a maximum of 8 Hours per month
                </p>
                )}
                {justificationLength > 500 && (
                <p className="text-sm text-primary mt-2 border border-blue-200 rounded-md px-2 py-1 font-semibold bg-blue-400 bg-opacity-10 flex items-center ">
                    <ExclamationIcon className="mr-2" /> Maximum 500 characters only allowed
                </p>
                )}
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-10 w-11/12 mx-auto bg-white p-4 rounded-md">
        <FormField
        control={form.control}
        name="employee"
        render={({ field }) => (
            <FormItem>
            <FormLabel>
                Employee <Required />
            </FormLabel>
            <Select onValueChange={field.onChange}>
                <FormControl>
                <SelectTrigger className={`border border-border-grey ${!field.value ? "text-text-secondary" : ""}`}>
                    <SelectValue  placeholder="Choose employee" />
                </SelectTrigger>
                </FormControl>
                <SelectContent>
                <SelectItem value="1">Sample Text 1</SelectItem>
                <SelectItem value="2">Sample Text 2</SelectItem>
                </SelectContent>
            </Select>
            <FormMessage />
            </FormItem>
        )}
        />
        <FormField
        control={form.control}
        name="permission_types"
        render={({ field }) => (
            <FormItem>
            <FormLabel>
                Permission Types <Required />
            </FormLabel>
            <Select
                onValueChange={(value) => {
                field.onChange(value)
                setSelectedPermission(value)
                }}
            >
                <FormControl>
                <SelectTrigger className={`border border-border-grey ${!field.value ? "text-text-secondary" : ""}`}>
                    <SelectValue placeholder="Choose permission types" />
                </SelectTrigger>
                </FormControl>
                <SelectContent>
                <SelectItem value="1">Sample Text 1</SelectItem>
                <SelectItem value="personal permission">Personal permission</SelectItem>
                </SelectContent>
            </Select>
            <FormMessage />
            </FormItem>
        )}
        />
        <FormField
        control={form.control}
        name="from_date"
        render={({ field }) => (
            <FormItem>
            <FormLabel>From Date <Required /></FormLabel>
            <Popover>
                <PopoverTrigger asChild>
                <FormControl>
                    <Button
                    variant={"outline"}
                    className={cn(
                        "w-full pl-3 text-left font-normal rounded-2xl border border-border-grey",
                        !field.value && "text-muted-foreground"
                    )}
                    >
                    {field.value ? (
                        format(field.value, "PPP")
                    ) : (
                        <span className="text-text-secondary text-sm">Select date</span>
                    )}
                    <Calendar1Icon color="#0078d4" className="ml-auto h-4 w-4 text-primary" />
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
        control={form.control}
        name="to_date"
        render={({ field }) => (
            <FormItem>
            <FormLabel>To Date <Required /></FormLabel>
            <Popover>
                <PopoverTrigger asChild>
                <FormControl>
                    <Button
                    variant={"outline"}
                    className={cn(
                        "w-full pl-3 text-left font-normal rounded-2xl border border-border-grey",
                        !field.value && "text-muted-foreground"
                    )}
                    >
                    {field.value ? (
                        format(field.value, "PPP")
                    ) : (
                        <span className="text-text-secondary text-sm">Select date</span>
                    )}
                    <Calendar1Icon color="#0078d4" className="ml-auto h-4 w-4 text-primary" />
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
            control={form.control}
            name="from_time"
            render={({ field }) => (
                <FormItem className=" ">
                <FormLabel>From Time <Required /></FormLabel>
                <FormControl>
                    <div className="relative">
                    <Input
                        type="text"
                        {...field}
                        placeholder="Select time"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ClockIcon2 />
                    </div>
                    </div>
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="to_time"
            render={({ field }) => (
                <FormItem>
                <FormLabel>To Time <Required /></FormLabel>
                <FormControl>
                    <div className="relative">
                    <Input
                        type="text"
                        {...field}
                        placeholder="Select time"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ClockIcon2 />
                    </div>
                    </div>
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        </div>
        <div className="grid w-11/12 mx-auto bg-white p-4 rounded-md">
          <FormField
            control={form.control}
            name="justification"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Justification <Required />
                </FormLabel>
                <FormControl>
                  <Textarea
                  className="border border-border-grey"
                    placeholder="Enter the justification"
                    {...field}
                    rows={6}
                    onChange={(e) => {
                      field.onChange(e)
                      setJustificationLength(e.target.value.length)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-2 flex justify-end">
          <div className="flex gap-2">
            <Button
              variant={"outline"}
              type="button"
              size={"lg"}
              className="px-10"
              onClick={() => router.push("/self-services/manage-permissions/permission-application")}
            >
              Cancel
            </Button>
            <Button type="submit" size={"lg"} className="px-10">
              Apply
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}