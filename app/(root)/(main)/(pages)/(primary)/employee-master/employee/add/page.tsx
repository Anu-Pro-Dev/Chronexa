"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLanguage } from "@/providers/LanguageProvider";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerMultiStepCard from "@/components/custom/power-comps/power-multi-step-card";
import PersonalForm from "@/forms/employee-master/PersonalForm";
import CredentialsForm from "@/forms/employee-master/CredentialsForm";
import OfficialForm from "@/forms/employee-master/OfficialForm";
import FlagsForm from "@/forms/employee-master/FlagsForm";

export default function Page() {
  const { modules } = useLanguage();
  const [fields, set_fields] = useState<any>([]);
  const [loading, setLoading] = useState(false);

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
    emp_no: z
      .string()
      .min(1, {
        message: "Required",
      })
      .max(100),
    emp_id: z
      .string()
      .min(1, {
        message: "Required",
      })
      .max(100),
    firstname: z
      .string()
      .min(1, {
        message: "Required",
      })
      .max(100),
    lastname: z
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
    email: z
      .string()
      .min(1, {
        message: "Required",
      })
      .max(100),
    join_date: z.date({
      required_error: "Join Date is required.",
    }),
    inactive_date: z.date({
      required_error: "Inactive Date is required.",
    }),
    card_number: z.string().optional(),
    pin: z.string().optional(),
    gender: z.string().optional(),
    passport_number: z.string().optional(),
    passport_expiry: z.date().optional(),
    passport_issued: z.string().optional(),
    national_id_number: z.string().optional(),
    national_id_expiry: z.date().optional(),
    remarks: z.string().optional(),
    employee_system_activation: z.date().optional(),
  });

  const  personalForm = useForm<z.infer<typeof personalFormSchema>>({
    resolver: zodResolver(personalFormSchema),
    defaultValues: {
      emp_no: "", 
      emp_id: "", 
      firstname: "", 
      lastname: "",
      mobile: "",
      email: "",
      join_date: undefined,
      inactive_date: undefined,
      card_number: "",
      pin: "",
      gender: "",
      passport_number: "",
      passport_expiry: undefined,
      passport_issued: "",
      national_id_number: "",
      national_id_expiry: undefined,
      remarks: "",
      employee_system_activation: undefined,
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

  const officialFormSchema = z.object({
    user_type: z
      .string()
      .min(1, {
        message: "Required",
      })
      .max(100),
    location: z
      .string()
      .min(1, {
        message: "Required",
      })
      .max(100),
    // citizenship: z.object({
    //   code: z.string(),
    //   name: z.string(),
    //   nameAr: z.string(),
    //   flag: z.string(),
    // }).nullable().refine(val => val !== null, {
    //   message: "Citizenship is required",
    // }),
    citizenship: z
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
    organization: z
      .string()
      .min(1, {
        message: "Required",
      })
      .max(100),
    manager: z.string().optional(),
    manager_flag: z.boolean(),
  });

  const officialForm = useForm<z.infer<typeof officialFormSchema>>({
    resolver: zodResolver(officialFormSchema),
    defaultValues: {
      user_type: "",
      location: "",
      citizenship: undefined,
      designation: "",
      grade: "",
      organization_type: "",
      organization: "",
      manager: "",
      manager_flag: false,
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
    geo_fench: z.boolean(),
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
      case "official-form":
        return await officialForm.trigger();
      case "flags-form":
        return await flagForm.trigger();
      default:
        return true;
    }
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
  
    const isPersonalValid = await personalForm.trigger();
    const isCredentialsValid = await credentialsForm.trigger();
    const isOfficialValid = await officialForm.trigger();
    const isFlagsValid = await flagForm.trigger();
  
    if (isPersonalValid && isCredentialsValid && isOfficialValid && isFlagsValid) {
      const allFormData = {
        ...personalForm.getValues(),
        ...credentialsForm.getValues(),
        ...officialForm.getValues(),
        ...flagForm.getValues(),
      };
  
      try {
        const response = await fetch("/api/employee", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(allFormData),
        });
  
        if (!response.ok) throw new Error("Submission failed");
    
        personalForm.reset();
        credentialsForm.reset();
        officialForm.reset();
        flagForm.reset();
  
        SetPage("personal-form");
      } catch (err) {
        console.error("Submit error", err);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const Pages = [
    { 
      title: "Personal",
      state_route: "personal-form",
      disable: false,
      component: <PersonalForm Page={Page} SetPage={SetPage} personalFormSchema={personalFormSchema} personalForm={personalForm} /> 
    },
    { 
      title: "Credentials",
      state_route: "credentials-form",
      disable: false,
      component: <CredentialsForm Page={Page} SetPage={SetPage} credentialsFormSchema={credentialsFormSchema} credentialsForm={credentialsForm} /> 
    },
    { 
      title: "Official",
      state_route: "official-form",
      disable: false,
      component: <OfficialForm Page={Page} SetPage={SetPage} officialFormSchema={officialFormSchema} officialForm={officialForm} /> 
    },
    { 
      title: "Flags",
      state_route: "flags-form",
      disable: false, 
      component: <FlagsForm flagForm={flagForm} flagsFormSchema={flagsFormSchema} handleFinalSubmit={handleFinalSubmit} loading={loading}/> 
    },
  ];  

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        items={modules?.employeeMaster.items}
        disableFeatures
        modal_title="Employee"
      />
      <>
        <PowerMultiStepCard
          SetPage={SetPage}
          Page={Page}
          validateCurrentForm={validateCurrentForm}
          Pages={Pages}
        />
      </>
    </div>
  );
}
