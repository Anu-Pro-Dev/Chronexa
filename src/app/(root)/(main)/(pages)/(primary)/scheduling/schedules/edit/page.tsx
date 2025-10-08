"use client";
import React, { useState, useEffect } from "react";
import { FormProvider } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/src/providers/LanguageProvider";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerMultiStepForm from "@/src/components/custom/power-comps/power-multi-step-form";
import { useScheduleForm } from "@/src/components/custom/modules/scheduling/hooks/useScheduleSchema";
import NormalForm from "@/src/components/custom/modules/scheduling/NormalForm";
import RamadanForm from "@/src/components/custom/modules/scheduling/RamadanForm";
import PolicyForm from "@/src/components/custom/modules/scheduling/PolicyForm";
import { useScheduleEditStore } from "@/src/stores/scheduleEditStore";
import { getScheduleByID } from "@/src/lib/apiHandler";

export default function ScheduleEditPage() {
  const { modules, translations } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { form, selectedRowData } = useScheduleForm();
  const clearSelectedRowData = useScheduleEditStore((state) => state.clearSelectedRowData);
  const [currentPage, setCurrentPage] = useState<string>("normal-schedule");
  const t = translations?.modules?.scheduling || {};
  
  const mode = "edit"; // Always edit mode for this page
  const id = searchParams.get("id");
  
  const isRamadanEnabled = form.watch("ramadan_flag");

  useEffect(() => {
    if (!selectedRowData?.schedule_id) {
      clearSelectedRowData();
    }
  }, [selectedRowData, clearSelectedRowData]);

  useEffect(() => {
    if (mode === "edit" && id) {
      getScheduleByID(Number(id)).then(res => {
        const schedule = res?.data;
        if (schedule) {
          form.setValue("organization_id", schedule.organization_id);
          form.setValue("schedule_location", schedule.schedule_location);
          // Load other fields as needed
        }
      });
    }
  }, [mode, id, form]);

  useEffect(() => {
    if (!isRamadanEnabled && currentPage === "ramadan-schedule") {
      setCurrentPage("policy-schedule");
    }
  }, [isRamadanEnabled, currentPage]);

  const pages = [];
  
  pages.push({
    title: t.normal || "Normal",
    state_route: "normal-schedule",
    disable: false,
    component: <NormalForm SetPage={setCurrentPage} />,
  });

  if (isRamadanEnabled) {
    pages.push({
      title: t.ramadan_name || "Ramadan",
      state_route: "ramadan-schedule",
      disable: false,
      component: <RamadanForm SetPage={setCurrentPage} />,
    });
  }

  pages.push({
    title: t.policy || "Policy",
    state_route: "policy-schedule",
    disable: false,
    component: <PolicyForm SetPage={setCurrentPage} />,
  });
  
  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        items={modules?.scheduling.items}
        disableFeatures
      />
      <FormProvider {...form}>
        <PowerMultiStepForm
          SetPage={setCurrentPage}
          Page={currentPage}
          Pages={pages}
        />
      </FormProvider>
    </div>
  );
}