"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLanguage } from "@/providers/LanguageProvider";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerMultiStepForm from "@/components/custom/power-comps/power-multi-step-form";
import PersonalForm from "@/forms/employee-master/PersonalForm";
import CredentialsForm from "@/forms/employee-master/CredentialsForm";
import BusinessForm from "@/forms/employee-master/BusinessForm";
import FlagsForm from "@/forms/employee-master/FlagsForm";

export default function Page() {
  const { modules } = useLanguage();

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

  const [Page, SetPage] = useState<string>("personal-form");

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
      .string().optional(),
    name_en: z
      .string().optional(),
    name_ar: z
      .string().optional(),
    mobile: z
      .string().optional(),
    sex: z
      .string()
      .min(1, {
        message: "Required",
      })
      .max(100),
    email: z
    .string().optional(),
    passport_number: z
      .string()
      .min(6, {
        message: "Required",
      })
      .max(9),
    passport_expiry:  z.date().optional(),
    passport_issued: z
      .string()
      .min(1, {
        message: "Required",
      })
      .max(100),
    national_id_number: z
      .string()
      .min(6, {
        message: "Required",
      })
      .max(25),
    national_id_expiry:  z.date().optional(),
    inactive_date: z.date().optional(),
  });

  const  personalForm = useForm<z.infer<typeof personalFormSchema>>({
    resolver: zodResolver(personalFormSchema),
    defaultValues: {
      organization: "", 
      code: "", 
      card_number: "", 
      pin: "",  
      name_en: "", 
      name_ar: "", 
      mobile: "", 
      sex: "",
      email: "",
      passport_number: "",
      passport_issued: "",
      national_id_number: "",
      inactive_date: undefined,
    },
  });

  const credentialsFormSchema = z.object({
    username: z
      .string()
      .min(6, {
        message: "Required",
      })
      .max(25),
    password: z
      .string()
      .min(8, {
        message: "Required",
      })
      .max(20),
  });

  const  credentialsForm = useForm<z.infer<typeof credentialsFormSchema>>({
    resolver: zodResolver(credentialsFormSchema),
    defaultValues: {
      username: "", 
      password: "",
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
    organization_type: z
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
    employee_system_activation: z.date().optional(),
    join_date: z.date().optional(),
    inactive_date: z.date().optional(),
    manager_flag: z.boolean(),
  });

  const buisnessForm = useForm<z.infer<typeof buisnessFormSchema>>({
    resolver: zodResolver(buisnessFormSchema),
    defaultValues: {
      employee_type: "",
      designation: "",
      region: "",
      manager: "",
      grade: "",
      organization_type: "",
      nationality: "",
      manager_flag: false,
      employee_system_activation: undefined, 
      join_date: undefined,
      inactive_date: undefined, 
    },
  });

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

  const validateCurrentForm = async () => {
    switch (Page) {
      case "personal-form":
        return await personalForm.trigger();
      case "credentials-form":
        return await credentialsForm.trigger();
      case "business-form":
        return await buisnessForm.trigger();
      case "flags-form":
        return await flagForm.trigger();
      default:
        return true;
    }
  };

  const Pages = [
    { 
      title: "Personal",
      // description: "Enter the personal information for the process",
      state_route: "personal-form",
      disable: false,
      component: <PersonalForm Page={Page} SetPage={SetPage} personalFormSchema={personalFormSchema} personalForm={personalForm} /> 
    },
    { 
      title: "Credentials",
      // description: "Enter the personal information for the process",
      state_route: "credentials-form",
      disable: false,
      component: <CredentialsForm Page={Page} SetPage={SetPage} credentialsFormSchema={credentialsFormSchema} credentialsForm={credentialsForm} /> 
    },
    { 
      title: "Business",
      // description: "Enter the business information for the process",
      state_route: "business-form",
      disable: false,
      component: <BusinessForm Page={Page} SetPage={SetPage} buisnessFormSchema={buisnessFormSchema} buisnessForm={buisnessForm} /> 
    },
    { 
      title: "Flags",
      // description: "Enter the flags information for the process",
      state_route: "flags-form",
      disable: false, 
      component: <FlagsForm flagForm={flagForm} flagsFormSchema={flagsFormSchema} /> 
    },
  ];  

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
          validateCurrentForm={validateCurrentForm}
          Pages={Pages}
        />
      </>
    </div>
  );
}
