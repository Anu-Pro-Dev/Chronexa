// "use client";

// import PowerHeader from "@/components/custom/power-comps/power-header";
// import { ScheduleSettings } from "@/components/custom/schedule-times/schedule-settings";
// import { useLanguage } from "@/providers/LanguageProvider";

// export default function Page() {
//   const { modules } = useLanguage();
//   return (
//     <div className="">
//       <PowerHeader items={modules?.taMaster.items} disableFeatures />
//       <ScheduleSettings
//         onSubmit={(data: any) => {
//           console.log("Form submitted:", data);
//         }}
//         onCancel={() => {
//           console.log("Form cancelled");
//         }}
//       />
//     </div>
//   );
// }

"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLanguage } from "@/providers/LanguageProvider";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerMultiStepForm from "@/components/custom/power-comps/power-multi-step-form";
import NormalForm from "@/forms/ta-master/NormalForm";
import RamadanForm from "@/forms/ta-master/RamadanForm";
import PolicyForm from "@/forms/ta-master/PolicyForm";

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
      console.log(values);
    } catch (error) {
      console.error("Form submission error", error);
    }
  }
  const [Page, SetPage] = useState<string>("personal-form");
  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        items={modules?.taMaster.items}
        disableFeatures
      />
      <>
        <PowerMultiStepForm
          SetPage={SetPage}
          Page={Page}
          Pages={[
            {
              title: "Normal",
              description: "Enter the personal information for the process",
              state_route: "personal-form",
              disable: false,
              component: (
                <NormalForm/>
              ),
            },
            {
              title: "Ramadan",
              description: "Enter the business information for the process",
              state_route: "business-form",
              disable: false,
              component: (
                <RamadanForm />
              ),
            },
            {
              title: "Policy",
              description: "Enter the flags information for the process",
              state_route: "flags-form",
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