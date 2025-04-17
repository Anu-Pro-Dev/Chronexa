"use client";
import { useState } from "react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import Required from "@/components/ui/required"
import { useRouter } from "next/navigation"
import { CalendarIcon } from "@/icons/icons"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"

export default function PersonalForm({
  Page, SetPage,personalFormSchema,personalForm
}: {
  Page?: any;
  SetPage?:any;
  personalFormSchema:any;
  personalForm:any
}) {
 

  function onSubmit(values: z.infer<typeof personalFormSchema>) {
    try {
      console.log(values)
      SetPage("credentials-form")
      toast.success("Data Saved!")
      // console.log(1)
      // toast(
      //   <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
      //     <code className="text-white">{JSON.stringify(values, null, 2)}</code>
      //   </pre>
      // );
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  const router = useRouter();

  return (
    <Form {...personalForm}>
      <form onSubmit={personalForm.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-y-5 gap-10 px-8 pt-8">
          <FormField
            control={personalForm.control}
            name="emp_no"
            render={({ field }) => (
              <FormItem >
                <FormLabel className="flex gap-1">Emp No <Required /></FormLabel>
                <FormControl>
                <Input placeholder="Enter the employee No" type="text" {...field} />
                </FormControl>
                <FormMessage className="mt-1"/>
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="emp_id"
            render={({ field }) => (
              <FormItem >
                <FormLabel className="flex gap-1">Emp ID <Required /></FormLabel>
                <FormControl>
                <Input placeholder="Enter the employee ID" type="text" {...field} />
                </FormControl>
                <FormMessage className="mt-1"/>
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="firstname"
            render={({ field }) => (
              <FormItem >
                <FormLabel className="flex gap-1">Firstname <Required/></FormLabel>
                <FormControl>
                  <Input placeholder="Enter your firstname" type="text" {...field} />
                </FormControl>
                <FormMessage className="mt-1"/>
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="lastname"
            render={({ field }) => (
              <FormItem >
                <FormLabel className="flex gap-1">Lastname <Required/> </FormLabel>
                <FormControl>
                  <Input placeholder="Enter your lastname" type="text" {...field} />
                </FormControl>
                <FormMessage className="mt-1"/>
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="mobile"
            render={({ field }) => (
              <FormItem >
                <FormLabel className="flex gap-1">Mobile <Required/></FormLabel>
                <FormControl>
                  <Input placeholder="Enter the mobile number" type="text" {...field} />
                </FormControl>
                <FormMessage className="mt-1"/>
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="email"
            render={({ field }) => (
              <FormItem >
                <FormLabel className="flex gap-1">Email <Required/></FormLabel>
                <FormControl>
                  <Input placeholder="Enter the email address" type="text" {...field} />
                </FormControl>
                <FormMessage className="mt-1"/>
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="join_date"
            render={({ field }) => (
              <FormItem >
                <FormLabel className="flex gap-1">Join date <Required/></FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button size={"lg"} variant={"outline"}
                        className="w-full bg-white px-3 flex justify-between text-text-primary text-sm font-normal max-w-[350px]"
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
                <FormMessage className="mt-1"/>
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="inactive_date"
            render={({ field }) => (
              <FormItem >
                <FormLabel className="flex gap-1">Inactive date <Required/></FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button size={"lg"} variant={"outline"}
                        className="w-full bg-white px-3 flex justify-between text-text-primary text-sm font-normal max-w-[350px]"
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
                <FormMessage className="mt-1"/>
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="organization"
            render={({ field }) => (
            <FormItem >
                <FormLabel className="flex gap-1">Organization </FormLabel>
                <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
                >
                <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose organization" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    <SelectItem value="1">organization 1</SelectItem>
                </SelectContent>
                </Select>
                <FormMessage className="mt-1"/>
            </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="sex"
            render={({ field }) => (
              <FormItem >
                <FormLabel className="flex gap-1">Sex</FormLabel>
                <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                >
                <FormControl>
                    <SelectTrigger>
                    <SelectValue placeholder="Choose Sex" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    <SelectItem value="1">Female</SelectItem>
                    <SelectItem value="2">Male</SelectItem>
                </SelectContent>
                </Select>
                <FormMessage className="mt-1"/>
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="card_number"
            render={({ field }) => (
                <FormItem >
                  <FormLabel className="flex gap-1"> Card </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter the card number" type="text" {...field} />
                  </FormControl>
                  <FormMessage className="mt-1"/>
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="pin"
            render={({ field }) => (
              <FormItem >
                <FormLabel className="flex gap-1">Pin</FormLabel>
                <FormControl>
                  <Input placeholder="Enter the pin" type="text" {...field} />
                </FormControl>
                <FormMessage className="mt-1"/>
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="national_id_number"
            render={({ field }) => (
              <FormItem >
                <FormLabel className="flex gap-1">National ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter the national id" type="text" {...field} />
                </FormControl>
                <FormMessage className="mt-1"/>
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="national_id_expiry"
            render={({ field }) => (
              <FormItem >
                <FormLabel className="flex gap-1 text-right">National ID expiry date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button size={"lg"} variant={"outline"}
                        className="w-full bg-white px-3 flex justify-between text-text-primary text-sm font-normal max-w-[350px]"
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
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage className="mt-1"/>
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="passport_number"
            render={({ field }) => (
              <FormItem >
                <FormLabel className="flex gap-1">Passport number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter the passport number" type="text" {...field} />
                </FormControl>
                <FormMessage className="mt-1"/>
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="passport_expiry"
            render={({ field }) => (
              <FormItem >
                <FormLabel className="flex gap-1 text-right">Passport expiry date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button size={"lg"} variant={"outline"}
                        className="w-full bg-white px-3 flex justify-between text-text-primary text-sm font-normal max-w-[350px]"
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
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage className="mt-1"/>
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="passport_issued"
            render={({ field }) => (
              <FormItem >
                <FormLabel className="flex gap-1">Passport issued</FormLabel>
                <FormControl>
                  <Input placeholder="Passport issued country" type="text" {...field} />
                </FormControl>
                <FormMessage className="mt-1"/>
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="employee_system_activation"
            render={({ field }) => (
              <FormItem >
                <FormLabel className="flex gap-1 text-right">Employee system activation</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button size={"lg"} variant={"outline"}
                        className="w-full bg-white px-3 flex justify-between text-text-primary text-sm font-normal max-w-[350px]"
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
                      // disabled={(date) =>
                      //   date > new Date() || date < new Date("1900-01-01")
                      // }
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage className="mt-1"/>
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="remarks"
            render={({ field }) => (
              <FormItem >
                <FormLabel className="flex gap-1">Remarks</FormLabel>
                <FormControl>
                  <Input placeholder="Enter the remarks" type="text" {...field} />
                </FormControl>
                <FormMessage className="mt-1"/>
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
              onClick={() => router.push("/user-management/users")}
            >
              Cancel
            </Button>
            <Button type="submit" size={"lg"} className="w-full">
              Next
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
