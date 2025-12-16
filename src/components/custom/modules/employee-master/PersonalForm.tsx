"use client";
import React, { useState } from "react";
import * as z from "zod";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/src/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Input } from "@/src/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import Required from "@/src/components/ui/required";
import { useRouter } from "next/navigation";
import { CalendarIcon } from "@/src/icons/icons";
import { Calendar } from "@/src/components/ui/calendar";
import { format } from "date-fns";
import CountryDropdown from "@/src/components/custom/common/country-dropdown";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useCountries } from "@/src/hooks/useCountries";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";

export default function PersonalForm({
  Page, SetPage, personalFormSchema, personalForm
}: {
  Page?: any;
  SetPage?: any;
  personalFormSchema: any;
  personalForm: any;
}) {
 
  const { language, translations } = useLanguage();
  const { countries } = useCountries();
  const showToast = useShowToast();
  const t = translations?.modules?.employeeMaster || {};
  const errT = translations?.formErrors || {};
  
  const [popoverStates, setPopoverStates] = useState({
    joinDate: false,
    activeDate: false,
    inactiveDate: false,
    nationalIdExpiryDate: false,
    passportExpiryDate: false,
  });

  const closePopover = (key: string) => {
    setPopoverStates(prev => ({ ...prev, [key]: false }));
  };

  function onSubmit(values: z.infer<typeof personalFormSchema>) {
    try {
      SetPage("credentials-form");
      showToast("success", "data_saved");
    } catch (error) {
      console.error("Form submission error", error);
      showToast("error", "formsubmission_error");
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
                <FormLabel className="flex gap-1">
                  {t.emp_no || "Emp No"} <Required />
                </FormLabel>
                <FormControl>
                  <Input placeholder={t.placeholder_emp_no || "Enter the employee No"} type="text" {...field} />
                </FormControl>
                <TranslatedError fieldError={personalForm.formState.errors.emp_no} translations={errT} />
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="join_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">
                  {t.join_date || "Join date"} <Required />
                </FormLabel>
                <Popover open={popoverStates.joinDate} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, joinDate: open }))}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button size={"lg"} variant={"outline"}
                        className="w-full bg-accent px-3 flex justify-between text-text-primary text-sm font-normal  max-w-[350px] 3xl:max-w-[450px] "
                      >
                        {field.value && field.value instanceof Date && !isNaN(field.value.getTime()) ? (
                          format(field.value, "dd/MM/yy")
                        ) : (
                          <span className="font-normal text-sm text-text-secondary">
                            {t.placeholder_date || "Choose date"}
                          </span>
                        )}
                        <CalendarIcon />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        closePopover('joinDate');
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <TranslatedError fieldError={personalForm.formState.errors.join_date} translations={errT} />
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="firstname"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">
                  {language === "ar"
                    ? `${t.first_name || "Firstname"} (العربية)`
                    : `${t.first_name || "Firstname"} (English)`}
                  <Required />
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t.placeholder_firstname || "Enter your firstname"} 
                    type="text" 
                    {...field} 
                  />
                </FormControl>
                <TranslatedError fieldError={personalForm.formState.errors.firstname} translations={errT} />
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="lastname"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">
                  {language === "ar"
                    ? `${t.last_name || "Lastname"} (العربية)`
                    : `${t.last_name || "Lastname"} (English)`}
                  <Required />
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t.placeholder_lastname || "Enter your lastname"} 
                    type="text" 
                    {...field} 
                  />
                </FormControl>
                <TranslatedError fieldError={personalForm.formState.errors.lastname} translations={errT} />
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="mobile"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">
                  {t.mobile || "Mobile"} 
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t.placeholder_mobile_number || "Enter the mobile number"} 
                    type="text" 
                    {...field} 
                  />
                </FormControl>
                <TranslatedError fieldError={personalForm.formState.errors.mobile} translations={errT} />
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">
                  {t.email || "Email"} <Required />
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t.placeholder_email_add || "Enter the email address"} 
                    type="text" 
                    {...field} 
                  />
                </FormControl>
                <TranslatedError fieldError={personalForm.formState.errors.email} translations={errT} />
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="active_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">
                  {t.emp_system_active || "Employee system activation"}
                </FormLabel>
                <Popover open={popoverStates.activeDate} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, activeDate: open }))}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button size={"lg"} variant={"outline"}
                        className="w-full bg-accent px-3 flex justify-between text-text-primary text-sm font-normal  max-w-[350px] 3xl:max-w-[450px] "
                      >
                        {field.value && field.value instanceof Date && !isNaN(field.value.getTime()) ? (
                          format(field.value, "dd/MM/yy")
                        ) : (
                          <span className="font-normal text-sm text-text-secondary">
                            {t.placeholder_date || "Choose date"}
                          </span>
                        )}
                        <CalendarIcon />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        closePopover('activeDate');
                      }}
                      disabled={(date) =>
                        personalForm.watch("join_date")
                          ? date < personalForm.watch("join_date")
                          : false
                      }
                    />
                  </PopoverContent>
                </Popover>
                <TranslatedError fieldError={personalForm.formState.errors.active_date} translations={errT} />
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="inactive_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1 text-right">
                  {t.inactive_date || "Inactive date"}
                </FormLabel>
                <Popover open={popoverStates.inactiveDate} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, inactiveDate: open }))}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button size={"lg"} variant={"outline"}
                        className="w-full bg-accent px-3 flex justify-between text-text-primary text-sm font-normal  max-w-[350px] 3xl:max-w-[450px] "
                      >
                        {field.value && field.value instanceof Date && !isNaN(field.value.getTime()) ? (
                          format(field.value, "dd/MM/yy")
                        ) : (
                          <span className="font-normal text-sm text-text-secondary">
                            {t.placeholder_date || "Choose date"}
                          </span>
                        )}
                        <CalendarIcon />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        closePopover('inactiveDate');
                      }}
                      disabled={(date) =>
                        personalForm.watch("active_date")
                          ? date < personalForm.watch("active_date")
                          : false
                      }
                    />
                  </PopoverContent>
                </Popover>
                <TranslatedError fieldError={personalForm.formState.errors.inactive_date} translations={errT} />
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="card_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">{t.card || "Card"}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t.placeholder_card_number || "Enter the card number"} 
                    type="text" 
                    {...field} 
                  />
                </FormControl>
                <TranslatedError fieldError={personalForm.formState.errors.card_number} translations={errT} />
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="pin"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">{t.pin || "Pin"}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t.placeholder_pin || "Enter the pin"} 
                    type="text" 
                    {...field} 
                  />
                </FormControl>
                <TranslatedError fieldError={personalForm.formState.errors.pin} translations={errT} />
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="national_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">{t.national_id || "National ID"}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t.placeholder_national_id || "Enter the national id"} 
                    type="text" 
                    {...field} 
                  />
                </FormControl>
                <TranslatedError fieldError={personalForm.formState.errors.national_id} translations={errT} />
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="national_id_expiry_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1 text-right">
                  {t.national_id_exp_date || "National ID expiry date"}
                </FormLabel>
                <Popover open={popoverStates.nationalIdExpiryDate} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, nationalIdExpiryDate: open }))}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button size={"lg"} variant={"outline"}
                        className="w-full bg-accent px-3 flex justify-between text-text-primary text-sm font-normal  max-w-[350px] 3xl:max-w-[450px] "
                      >
                        {field.value && field.value instanceof Date && !isNaN(field.value.getTime()) ? (
                          format(field.value, "dd/MM/yy")
                        ) : (
                          <span className="font-normal text-sm text-text-secondary">
                            {t.placeholder_date || "Choose date"}
                          </span>
                        )}
                        <CalendarIcon />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        closePopover('nationalIdExpiryDate');
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <TranslatedError fieldError={personalForm.formState.errors.national_id_expiry_date} translations={errT} />
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="passport_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">
                  {t.passport_number || "Passport number"}
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t.placeholder_passport_number || "Enter the passport number"} 
                    type="text" 
                    {...field} 
                  />
                </FormControl>
                <TranslatedError fieldError={personalForm.formState.errors.passport_number} translations={errT} />
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="passport_expiry_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1 text-right">
                  {t.passport_exp_date || "Passport expiry date"}
                </FormLabel>
                <Popover open={popoverStates.passportExpiryDate} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, passportExpiryDate: open }))}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button size={"lg"} variant={"outline"}
                        className="w-full bg-accent px-3 flex justify-between text-text-primary text-sm font-normal  max-w-[350px] 3xl:max-w-[450px] "
                      >
                        {field.value && field.value instanceof Date && !isNaN(field.value.getTime()) ? (
                          format(field.value, "dd/MM/yy")
                        ) : (
                          <span className="font-normal text-sm text-text-secondary">
                            {t.placeholder_date || "Choose date"}
                          </span>
                        )}
                        <CalendarIcon />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        closePopover('passportExpiryDate');
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <TranslatedError fieldError={personalForm.formState.errors.passport_expiry_date} translations={errT} />
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
                  <FormLabel className="flex gap-1">
                    {t.passport_issued || "Passport issued"}
                  </FormLabel>
                  <CountryDropdown
                    countries={countries}
                    value={selectedCountry}
                    displayMode="code"
                    onChange={(country) => field.onChange(country?.country_id ?? "")}
                  />
                  <TranslatedError fieldError={personalForm.formState.errors.passport_issue_country_id} translations={errT} />
                </FormItem>
              );
            }}
          />
          <FormField
            control={personalForm.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">{t.gender || "Gender"}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="max-w-[350px] 3xl:max-w-[450px]">
                      <SelectValue placeholder={t.placeholder_gender || "Choose Gender"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="F">Female</SelectItem>
                    <SelectItem value="M">Male</SelectItem>
                  </SelectContent>
                </Select>
                <TranslatedError fieldError={personalForm.formState.errors.gender} translations={errT} />
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="remarks"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">{t.remarks || "Remarks"}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t.placeholder_remarks || "Enter the remarks"} 
                    type="text" 
                    {...field} 
                  />
                </FormControl>
                <TranslatedError fieldError={personalForm.formState.errors.remarks} translations={errT} />
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
              {translations.buttons.cancel}
            </Button>
            <Button type="submit" size={"lg"} className="w-full">
              {translations.buttons.next || "Next"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}