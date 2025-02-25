"use client";
import { useEffect, useState } from "react"
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, ClockIcon, ExclamationIcon, RefreshIcon } from "@/icons/icons";
import { format } from "date-fns";
import { TimePicker } from "@/components/ui/time-picker";
import Required from "@/components/ui/required";

const formSchema = z.object({
  employee: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  permission_types: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  from_date: z.date({
    required_error: "From Date is required.",
  }),
  to_date: z.date({
    required_error: "To Date is required.",
  }),
  from_time: z.date({
    required_error: "From Time is required.",
  }),
  to_time: z.date({
    required_error: "To Time is required.",
  }),
  justification: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(500, {
      message: "Maximum 500 characters only allowed",
    }),
});

export default function AddPermissionApplication() {
  const router = useRouter()
  const [selectedPermission, setSelectedPermission] = useState<string | null>(null)
  const [justificationLength, setJustificationLength] = useState(0)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee: "",
      permission_types: "",
      justification: "",
    },
  });

  const { watch, setValue } = form
  const justificationValue = watch("justification")

  useEffect(() => {
    setJustificationLength(justificationValue.length)
  }, [justificationValue])

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white p-6 rounded-2xl">
        <div className="flex justify-between">
          <div className="pb-6">
            <h1 className="font-bold text-xl text-primary">Permission Application</h1>
            <h1 className="font-semibold text-sm text-text-secondary">
              Fill the permission application form
            </h1>
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
        <div className="flex flex-col gap-3">
          <div className="grid sm:grid-cols-2 gap-y-3 gap-x-16 md:px-5 [&>*]:max-w-[350px] [&>*:nth-child(2n)]:justify-self-end md:[&>*:nth-child(2n)]:min-w-[350px]">
            <FormField
              control={form.control}
              name="employee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Employee <Required />
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Emp 109</SelectItem>
                      <SelectItem value="2">OG123</SelectItem>
                      <SelectItem value="3">Emp 213</SelectItem>
                      <SelectItem value="4">Employee 02</SelectItem>
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
                  <FormLabel>Permission types <Required /></FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      setSelectedPermission(value)
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose permission types" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="personal permission">Personal permission</SelectItem>
                      <SelectItem value="mission permission">Mission Permission</SelectItem>
                      <SelectItem value="remote permission">Remote working</SelectItem>
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
                <FormItem className="">
                  <FormLabel>
                    From Date <Required />
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button size={"lg"} variant={"outline"}
                          className="w-full bg-white px-3 flex justify-between text-text-primary"
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
                          className="w-full bg-white px-3 flex justify-between text-text-primary"
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
            <FormField
              control={form.control}
              name="from_time"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>From time <Required/></FormLabel>
                  <Popover>
                    <FormControl>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "flex justify-between h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "HH:mm")
                          ) : (
                            <span className="text-text-secondary">Choose time</span>
                          )}
                          <ClockIcon />
                        </Button>
                      </PopoverTrigger>
                    </FormControl>
                    <PopoverContent className="w-auto p-0">
                        <TimePicker
                          setDate={field.onChange}
                          date={field.value}
                        />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="to_time"
              render={({ field }) => (
                <FormItem className="">
                <FormLabel>To time <Required/></FormLabel>
                  <Popover>
                    <FormControl>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "flex justify-between h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "HH:mm")
                          ) : (
                            <span className="text-text-secondary">Choose time</span>
                          )}
                          <ClockIcon />
                        </Button>
                      </PopoverTrigger>
                    </FormControl>
                    <PopoverContent className="w-auto p-0">
                        <TimePicker
                          setDate={field.onChange}
                          date={field.value}
                        />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="px-5">
            <FormField
              control={form.control}
              name="justification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Justification </FormLabel>
                  <FormControl>
                    <Textarea
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
          <div className="flex justify-end gap-2 items-center py-5">
            <div className="flex gap-4 px-5">
              <Button
                variant={"outline"}
                type="button"
                size={"lg"}
                className="w-full"
                onClick={() => router.push("/self-services/manage-permissions/permission-application")}
              >
                Cancel
              </Button>
              <Button type="submit" size={"lg"} className="w-full">
                Apply
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
