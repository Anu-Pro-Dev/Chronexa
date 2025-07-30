"use client";
import * as z from "zod";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Required from "@/components/ui/required";
import { useRouter } from "next/navigation";
import { CalendarIcon } from "@/icons/icons";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import CountryDropdown from "@/components/custom/country-dropdown";
import { useLanguage } from "@/providers/LanguageProvider";
import { useCountries, Country } from "@/hooks/useCountries";

export default function PersonalForm({
  Page, SetPage,personalFormSchema,personalForm
}: {
  Page?: any;
  SetPage?:any;
  personalFormSchema:any;
  personalForm:any
}) {
 
  const {language } = useLanguage();
  const { countries } = useCountries();

  function onSubmit(values: z.infer<typeof personalFormSchema>) {
    try {
      SetPage("credentials-form");
      toast.success("Data Saved!");
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
              <FormItem>
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
            name="join_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">Join date <Required /></FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button size={"lg"} variant={"outline"}
                        className="w-full bg-accent px-3 flex justify-between text-text-primary text-sm font-normal max-w-[350px]"
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
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage className="mt-1"/>
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="firstname"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  className="flex gap-1">
                  {language === "ar"
                    ? "Firstname (العربية) "
                    : "Firstname (English) "}
                  <Required />
                </FormLabel>
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
              <FormItem>
                <FormLabel
                  className="flex gap-1">
                  {language === "ar"
                    ? "Lastname (العربية) "
                    : "Lastname (English) "}
                  <Required />
                </FormLabel>
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
              <FormItem>
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
              <FormItem>
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
            name="active_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">Employee system activation </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button size={"lg"} variant={"outline"}
                        className="w-full bg-accent px-3 flex justify-between text-text-primary text-sm font-normal max-w-[350px]"
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
                      disabled={(date) =>
                        personalForm.watch("join_date")
                          ? date < personalForm.watch("join_date")
                          : false
                      }
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
              <FormItem>
                <FormLabel className="flex gap-1 text-right">Inactive date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button size={"lg"} variant={"outline"}
                        className="w-full bg-accent px-3 flex justify-between text-text-primary text-sm font-normal max-w-[350px]"
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
                      disabled={(date) =>
                        personalForm.watch("active_date")
                          ? date < personalForm.watch("active_date")
                          : false
                      }
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage className="mt-1"/>
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="card_number"
            render={({ field }) => (
                <FormItem>
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
              <FormItem>
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
            name="national_id"
            render={({ field }) => (
              <FormItem>
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
            name="national_id_expiry_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1 text-right">National ID expiry date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button size={"lg"} variant={"outline"}
                        className="w-full bg-accent px-3 flex justify-between text-text-primary text-sm font-normal max-w-[350px]"
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
              <FormItem>
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
            name="passport_expiry_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1 text-right">Passport expiry date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button size={"lg"} variant={"outline"}
                        className="w-full bg-accent px-3 flex justify-between text-text-primary text-sm font-normal max-w-[350px]"
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
            name="passport_issue_country_id"
            render={({ field }) => {
              const selectedCountry = countries.find(
                (c) => c.country_id === field.value
              ) ?? null;

              return (
                <FormItem>
                  <FormLabel className="flex gap-1">Passport issued</FormLabel>
                  <CountryDropdown
                    countries={countries}
                    value={selectedCountry} // Type now guaranteed to be Country | null
                    displayMode="code"
                    onChange={(country) => field.onChange(country?.country_id ?? "")}
                  />
                  <FormMessage className="mt-1" />
                </FormItem>
              );
            }}
          />
          <FormField
            control={personalForm.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">Gender</FormLabel>
                <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                >
                <FormControl>
                    <SelectTrigger>
                    <SelectValue placeholder="Choose Gender" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    <SelectItem value="F">Female</SelectItem>
                    <SelectItem value="M">Male</SelectItem>
                </SelectContent>
                </Select>
                <FormMessage className="mt-1"/>
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="remarks"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">Remarks</FormLabel>
                <FormControl>
                  <Input placeholder="Enter the remarks" type="text" {...field} />
                </FormControl>
                <FormMessage className="mt-1"/>
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-2 items-center py-5 pt-10">
          <div className="flex gap-4 px-5">
            <Button
              variant={"outline"}
              type="button"
              size={"lg"}
              className="w-full"
              onClick={() => router.push("/employee-master/employee")}
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
