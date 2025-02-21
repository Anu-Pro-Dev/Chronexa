"use client";
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useLanguage } from "@/providers/LanguageProvider"
import PowerHeader from "@/components/custom/power-comps/power-header"
import PowerMultiStepForm from "@/components/custom/power-comps/power-multi-step-form"
import PowerForm from "@/components/custom/power-comps/power-form"
import PersonalForm from "@/forms/employee-master/PersonalForm"
import BusinessForm from "@/forms/employee-master/BusinessForm"
import FlagsForm from "@/forms/employee-master/FlagsForm";


export default function Page() {
  const { modules } = useLanguage();
  // const [Data, SetData] = useState<any>([]);

  const [fields, set_fields] = useState<any>([]);

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
  )

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

  // function onSubmit(values: z.infer<typeof formSchema>) {
  //   try {
  //     console.log(values);
  //   } catch (error) {
  //     console.error("Form submission error", error);
  //   }
  // }

  const [Page, SetPage] = useState<string>("personal-form")

  const flagsFormSchema = z.object({
    active: z.boolean(),
    punch: z.boolean(),
    overtime: z.boolean(),
    inpayroll: z.boolean(),
    email_notification: z.boolean(),
    open_shift: z.boolean(),
    monthly_missed_hours: z.boolean(),
    exclude_from_integration: z.boolean(),
    shift: z.boolean(),
    on_report: z.boolean(),
    share_roster: z.boolean(),
    include_in_email: z.boolean(),
    web_punch: z.boolean(),
    check_selfie: z.boolean(),
  });

  const flagForm = useForm<z.infer<typeof flagsFormSchema>>({
    resolver: zodResolver(flagsFormSchema),
    defaultValues: {
      active: false,
      punch: false,
      overtime: false,
      inpayroll: false,
      email_notification: false,
      open_shift: false,
      monthly_missed_hours: false,
      exclude_from_integration: false,
      shift: false,
      on_report: false,
      share_roster: false,
      include_in_email: false,
      web_punch: false,
      check_selfie: false,
    },
  });

  const buisnessFormSchema = z.object({
    employee_type: z
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
    region: z
      .string()
      .min(1, {
        message: "Required",
      })
      .max(100),
    buildings: z
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
    grade: z
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
    nationality: z
      .string()
      .min(1, {
        message: "Required",
      })
      .max(100),
    manager_flag: z.boolean(),
  });

  const buisnessForm = useForm<z.infer<typeof buisnessFormSchema>>({
    resolver: zodResolver(buisnessFormSchema),
    defaultValues: {
      employee_type: "",
      designation: "",
      region: "",
      buildings: "",
      manager: "",
      grade: "",
      schedule_type: "",
      nationality: "",
      manager_flag: false,
    },
  });

  const personalFormSchema = z.object({
    organization: z
      .string()
      .min(1, {
        message: "Required",
      })
      .max(100),
    code: z
      .string()
      .min(1, {
        message: "Required",
      })
      .max(100),
    card_number: z
      .string()
      .min(1, {
        message: "Required",
      })
      .max(100),
    pin: z
      .string()
      .min(1, {
        message: "Required",
      })
      .max(100),
    username: z
      .string()
      .min(1, {
        message: "Required",
      })
      .max(100),
    password: z
      .string()
      .min(1, {
        message: "Required",
      })
      .max(100),
    name_en: z
      .string()
      .min(1, {
        message: "Required",
      })
      .max(100),
    name_ar: z
      .string()
      .min(1, {
        message: "Required",
      })
      .max(100),
    mobile: z
      .string()
      .min(1, {
        message: "Required",
      })
      .max(100),
    sex: z
      .string()
      .min(1, {
        message: "Required",
      })
      .max(100),
    email: z
      .string()
      .min(1, {
        message: "Required",
      })
      .max(100),
    remarks: z
      .string()
      .min(1, {
        message: "Required",
      })
      .max(100),
    employee_system_activation: z.date({
      required_error: "Employee system activation Date is required.",
    }),
    join_date: z.date({
      required_error: "Join Date is required.",
    }),
    inactive_date: z.date({
      required_error: "Inactive Date is required.",
    }),
  });

  const  personalForm = useForm<z.infer<typeof personalFormSchema>>({
    resolver: zodResolver(personalFormSchema),
    defaultValues: {
      organization: "", 
      code: "", 
      card_number: "", 
      pin: "", 
      username: "", 
      password: "", 
      name_en: "", 
      name_ar: "", 
      mobile: "", 
      sex: "",
      email: "",
      remarks: "", 
      employee_system_activation: undefined, 
      join_date: undefined,
      inactive_date: undefined, 
    },
  });


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
                <PersonalForm
                  Page={Page}
                  SetPage={SetPage}
                  personalFormSchema = {personalFormSchema}
                  personalForm = {personalForm}
                />
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
                <BusinessForm 
                  Page={Page}
                  SetPage={SetPage}
                  buisnessFormSchema = {buisnessFormSchema}
                  buisnessForm = {buisnessForm} />
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
                <FlagsForm 
                flagForm = {flagForm}
                flagsFormSchema = {flagsFormSchema}
                />
              ),
            },
          ]}
        />
      </>
    </div>
  );
}
