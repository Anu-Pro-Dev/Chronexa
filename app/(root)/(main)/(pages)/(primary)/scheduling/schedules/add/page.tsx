"use client";
import React, { useState, useEffect} from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLanguage } from "@/providers/LanguageProvider";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerMultiStepForm from "@/components/custom/power-comps/power-multi-step-form";
import { useScheduleForm } from "@/forms/scheduling/hooks/useScheduleSchema";
import NormalForm from "@/forms/scheduling/NormalForm";
import RamadanForm from "@/forms/scheduling/RamadanForm";
import PolicyForm from "@/forms/scheduling/PolicyForm";
import { addScheduleRequest, editScheduleRequest } from "@/lib/apiHandler";
import { useScheduleEditStore } from "@/stores/scheduleEditStore";

export default function Page() {
  const { modules } = useLanguage();
  const router = useRouter();
  const { form, selectedRowData } = useScheduleForm();
  const clearSelectedRowData = useScheduleEditStore((state) => state.clearSelectedRowData);

  const [fields, set_fields] = useState<any>([]);

  // async function onSubmit(values: any) {
  //   try {
  //     await addScheduleRequest(values);
  //     toast.success("Schedule added successfully!");
  //     router.push("/scheduling/schedules/");
  //   } catch (error: any) {
  //     console.error("Form submission error", error);
  //     toast.error(error?.response?.data?.message || "Failed to submit the form. Please try again.");
  //   }
  // }

  useEffect(() => {
    if (!selectedRowData?.schedule_id) {
      clearSelectedRowData();
    }
  }, []);

  const [Page, SetPage] = useState<string>("normal-schedule");
  
  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        items={modules?.scheduling.items}
        disableFeatures
      />
      <FormProvider {...form}>
        <PowerMultiStepForm
          SetPage={SetPage}
          Page={Page}
          // onSubmit={form.handleSubmit(onSubmit)}
          Pages={[
            {
              title: "Normal",
              state_route: "normal-schedule",
              disable: false,
              component: (
                <NormalForm SetPage={SetPage}/>
              ),
            },
            // {
            //   title: "Ramadan",
            //   state_route: "ramadan-schedule",
            //   disable: false,
            //   component: (
            //     <RamadanForm />
            //   ),
            // },
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
      </FormProvider>
    </div>
  );
}