"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLanguage } from "@/providers/LanguageProvider";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerMultiStepForm from "@/components/custom/power-comps/power-multi-step-form";
import PowerForm from "@/components/custom/power-comps/power-form";
import PersonalForm from "@/forms/employee-master/PersonalForm";
import BusinessForm from "@/forms/employee-master/BusinessForm";
import FlagsForm from "@/forms/employee-master/FlagsForm";

export default function Page() {
  const { modules } = useLanguage();
  // const [Data, SetData] = useState<any>([]);

  const [fields, set_fields] = useState<any>([]);

  // useEffect(() => {
  //   set_fields([
  //     {
  //       label: "Organization",
  //       name: "organization",
  //       type: "select",
  //       state_route: "personal-form",
  //       placeholder: "Choose your organization",
  //       items: [
  //         { value: "Org1", label: "Org1" },
  //         { value: "Org2", label: "Org2" },
  //         { value: "Org3", label: "Org3" },
  //       ],
  //       validations: [
  //         {
  //           logic: z.string().min(1, { message: "Organization is required" }),
  //           message: "Please select an organization",
  //         },
  //       ],
  //     },
  //     {
  //       label: "Code",
  //       name: "code",
  //       type: "input",
  //       state_route: "personal-form",
  //       validations: [
  //         {
  //           logic: z.string().min(1, { message: "Code is required" }),
  //           message: "Please enter a valid code",
  //         },
  //       ],
  //     },
  //     {
  //       label: "Card number",
  //       name: "card_number",
  //       type: "input",
  //       validations: [
  //         {
  //           logic: z.string().min(1, { message: "Card number is required" }),
  //           message: "Please enter a valid Card number",
  //         },
  //       ],
  //       state_route: "personal-form",
  //     },
  //     {
  //       label: "Pin",
  //       name: "pin",
  //       type: "input",
  //       state_route: "personal-form",
  //       validations: [
  //         {
  //           logic: z.string().min(1, { message: "Pin is required" }),
  //           message: "Please enter a valid Pin",
  //         },
  //       ],
  //     },
  //     {
  //       label: "Username",
  //       name: "username",
  //       type: "input",
  //       state_route: "personal-form",
  //       validations: [
  //         {
  //           logic: z.string().min(1, { message: "username is required" }),
  //           message: "Please enter a username",
  //         },
  //       ],
  //     },
  //     {
  //       label: "Password",
  //       name: "password",
  //       type: "input",
  //       input_type: "password",
  //       state_route: "personal-form",
  //     },
  //     {
  //       label: "Name",
  //       name: "name",
  //       type: "input",
  //       state_route: "personal-form",
  //     },
  //     {
  //       label: "Name [العربية]",
  //       name: "name_ar",
  //       type: "input",
  //       state_route: "personal-form",
  //     },
  //     {
  //       label: "Mobile",
  //       name: "mobile",
  //       type: "input",
  //       state_route: "personal-form",
  //     },
  //     {
  //       label: "Sex",
  //       name: "sex",
  //       type: "select",
  //       state_route: "personal-form",
  //       items: [
  //         { value: "Male", label: "Male" },
  //         { value: "Female", label: "Female" },
  //         { value: "Other", label: "Other" },
  //       ],
  //     },
  //     {
  //       label: "Email",
  //       name: "email",
  //       type: "input",
  //       state_route: "personal-form",
  //       validations: [
  //         {
  //           logic: z.string().email({ message: "Invalid email address" }),
  //           message: "Please enter a valid email address",
  //         },
  //       ],
  //     },
  //     {
  //       label: "Join date",
  //       name: "join_date",
  //       type: "date",
  //       state_route: "personal-form",
  //       validations: [
  //         {
  //           logic: z
  //             .date()
  //             .refine((val) => val instanceof Date && !isNaN(val.getTime()), {
  //               message: "Please select a valid date",
  //             }),
  //           message: "Please enter a valid join date",
  //         },
  //       ],
  //     },

  //     {
  //       label: "Active",
  //       name: "active",
  //       type: "checkbox",
  //       state_route: "flags-form",
  //     },
  //     {
  //       label: "Exclude From Integration",
  //       name: "exclude",
  //       type: "checkbox",
  //       state_route: "flags-form",
  //     },
  //     {
  //       label: "Punch",
  //       name: "punch",
  //       type: "checkbox",
  //       state_route: "flags-form",
  //     },
  //     {
  //       label: "Shift",
  //       name: "shift",
  //       type: "checkbox",
  //       state_route: "flags-form",
  //     },
  //     {
  //       label: "Overtime",
  //       name: "overtime",
  //       type: "checkbox",
  //       state_route: "flags-form",
  //     },
  //     {
  //       label: "On Report",
  //       name: "onreport",
  //       type: "checkbox",
  //       state_route: "flags-form",
  //     },
  //     {
  //       label: "Inpayroll",
  //       name: "inpayroll",
  //       type: "checkbox",
  //       state_route: "flags-form",
  //     },
  //     {
  //       label: "Share Roaster",
  //       name: "share_roster",
  //       type: "checkbox",
  //       state_route: "flags-form",
  //     },
  //     {
  //       label: "Email notification",
  //       name: "email_notification",
  //       type: "checkbox",
  //       state_route: "flags-form",
  //     },
  //     {
  //       label: "Include in Email Notifications",
  //       name: "include_in_email",
  //       type: "checkbox",
  //       state_route: "flags-form",
  //     },
  //     {
  //       label: "Open shift",
  //       name: "open_shift",
  //       type: "checkbox",
  //       state_route: "flags-form",
  //     },
  //     {
  //       label: "Web Punch",
  //       name: "web_punch",
  //       type: "checkbox",
  //       state_route: "flags-form",
  //     },

  //     {
  //       label: "Calculate monthly missed hours",
  //       name: "monthly_missed_hours",
  //       type: "checkbox",
  //       state_route: "flags-form",
  //     },
  //     {
  //       label: "Check In/Out Selfie",
  //       name: "check_in",
  //       type: "checkbox",
  //       state_route: "flags-form",
  //     },
  //     {
  //       label: "Employee type",
  //       name: "employee_type",
  //       type: "select",
  //       state_route: "business-form",
  //       items: [
  //         { value: "full-time", label: "Full Time" },
  //         { value: "half-time", label: "Half-Time" },
  //       ],
  //     },
  //     {
  //       label: "Manager",
  //       name: "manager_type",
  //       type: "select",
  //       state_route: "business-form",
  //       items: [
  //         { value: "full-time", label: "Full Time" },
  //         { value: "half-time", label: "Half-Time" },
  //       ],
  //     },
  //     {
  //       label: "Designation",
  //       name: "designation",
  //       type: "select",
  //       state_route: "business-form",
  //       items: [
  //         { value: "full-time", label: "Full Time" },
  //         { value: "half-time", label: "Half-Time" },
  //       ],
  //     },
  //     {
  //       label: "Grade",
  //       name: "grade",
  //       type: "select",
  //       state_route: "business-form",
  //       items: [
  //         { value: "full-time", label: "Full Time" },
  //         { value: "half-time", label: "Half-Time" },
  //       ],
  //     },
  //     {
  //       label: "Region",
  //       name: "region",
  //       type: "select",
  //       state_route: "business-form",
  //       items: [
  //         { value: "full-time", label: "Full Time" },
  //         { value: "half-time", label: "Half-Time" },
  //       ],
  //     },
  //     {
  //       label: "Schedule type",
  //       name: "schedule-type",
  //       type: "select",
  //       state_route: "business-form",
  //       items: [
  //         { value: "full-time", label: "Full Time" },
  //         { value: "half-time", label: "Half-Time" },
  //       ],
  //     },

  //     {
  //       label: "Schedule type",
  //       name: "schedule-type",
  //       type: "select",
  //       state_route: "business-form",
  //       items: [
  //         { value: "full-time", label: "Full Time" },
  //         { value: "half-time", label: "Half-Time" },
  //       ],
  //     },
  //     {
  //       label: "Buildings",
  //       name: "buildings",
  //       type: "select",
  //       state_route: "business-form",
  //       items: [
  //         { value: "full-time", label: "Full Time" },
  //         { value: "half-time", label: "Half-Time" },
  //       ],
  //     },

  //     {
  //       label: "Nationality",
  //       name: "nationality",
  //       type: "select",
  //       state_route: "business-form",
  //       items: [
  //         { value: "full-time", label: "Full Time" },
  //         { value: "half-time", label: "Half-Time" },
  //       ],
  //     },
  //     {
  //       label: "Manager flag",
  //       name: "manager_flag",
  //       type: "checkbox",
  //       state_route: "business-form",
  //     },
  //   ]);
  // }, []);

  const formSchema = z.object(
    fields.reduce((acc: any, field: any) => {
      let validationChain: any = z.string().optional(); // Default to string

      if (field.type === "checkbox") {
        validationChain = z.boolean().optional();
      } else if (field.type === "date") {
        validationChain = z.date().optional();
      } else if (field.validations) {
        field.validations.forEach((validation: any) => {
          validationChain = validation.logic;
        });
      }

      acc[field.name] = validationChain;

      return acc;
    }, {})
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: fields.reduce((acc: any, field: any) => {
      if (field.type === "checkbox") {
        acc[field.name] = false;
      } else {
        acc[field.name] = "";
      }
      return acc;
    }, {}),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(values);
    } catch (error) {
      console.error("Form submission error", error);
    }
  }
  const [Page, SetPage] = useState<string>("personal-form");
  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        items={modules?.employeeMaster.items}
        disableFeatures
        modal_title="Employee"
        modal_description="Select the Employee types of the company"
      />
      <>
        <PowerMultiStepForm
          SetPage={SetPage}
          Page={Page}
          Pages={[
            {
              title: "Personal",
              description: "Enter the personal information for the process",
              state_route: "personal-form",
              disable: false,
              component: (
                // <PowerForm
                //   fields={fields}
                //   form={form}
                //   onSubmit={onSubmit}
                //   state_route="personal-form"
                //   form_class="grid lg:grid-cols-2 gap-10"
                //   next_route="business-form"
                //   setPage={SetPage}
                // />
                <PersonalForm/>
              ),
            },
            {
              title: "Business",
              description: "Enter the business information for the process",
              state_route: "business-form",
              disable: false,
              component: (
                // <PowerForm
                //   fields={fields}
                //   form={form}
                //   onSubmit={onSubmit}
                //   state_route="business-form"
                //   form_class="grid grid-cols-2 gap-10"
                //   next_route="flags-form"
                //   setPage={SetPage}
                // />
                <BusinessForm />
              ),
            },
            {
              title: "Flags",
              description: "Enter the flags information for the process",
              state_route: "flags-form",
              disable: false,
              component: (
                // <PowerForm
                //   fields={fields}
                //   form={form}
                //   onSubmit={onSubmit}
                //   state_route="flags-form"
                //   form_class="grid lg:grid-cols-2 gap-10"
                // />
                <FlagsForm />
              ),
            },
          ]}
        />
      </>
    </div>
  );
}
