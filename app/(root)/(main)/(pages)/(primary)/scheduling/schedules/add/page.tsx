"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLanguage } from "@/providers/LanguageProvider";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerMultiStepForm from "@/components/custom/power-comps/power-multi-step-form";
import NormalForm from "@/forms/scheduling/NormalForm";
import RamadanForm from "@/forms/scheduling/RamadanForm";
import PolicyForm from "@/forms/scheduling/PolicyForm";

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
      return;
    } catch (error) {
      console.error("Form submission error", error);
    }
  }
  const [Page, SetPage] = useState<string>("normal-schedule");
  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        items={modules?.scheduling.items}
        disableFeatures
      />
      <>
        <PowerMultiStepForm
          SetPage={SetPage}
          Page={Page}
          Pages={[
            {
              title: "Normal",
              state_route: "normal-schedule",
              disable: false,
              component: (
                <NormalForm/>
              ),
            },
            {
              title: "Ramadan",
              state_route: "ramadan-schedule",
              disable: false,
              component: (
                <RamadanForm />
              ),
            },
            {
              title: "Policy",
              state_route: "policy-schedule",
              disable: false,
              component: (
                <PolicyForm />
              ),
            },
          ]}
        />
      </>
    </div>
  );
}