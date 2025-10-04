"use client";
import React, { useState, useEffect } from "react";
import { FormProvider } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/src/providers/LanguageProvider";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerMultiStepForm from "@/src/components/custom/power-comps/power-multi-step-form";
import { useScheduleForm } from "@/src/components/custom/modules/scheduling/hooks/useScheduleSchema";
import NormalForm from "@/src/components/custom/modules/scheduling/NormalForm";
import RamadanForm from "@/src/components/custom/modules/scheduling/RamadanForm";
import PolicyForm from "@/src/components/custom/modules/scheduling/PolicyForm";
import { useScheduleEditStore } from "@/src/stores/scheduleEditStore";

export default function Page() {
  const { modules } = useLanguage();
  const router = useRouter();
  const { form, selectedRowData } = useScheduleForm();
  const clearSelectedRowData = useScheduleEditStore((state) => state.clearSelectedRowData);
  const [currentPage, setCurrentPage] = useState<string>("normal-schedule");
  
  // Watch the ramadan_flag to conditionally show the Ramadan tab
  const isRamadanEnabled = form.watch("ramadan_flag");

  useEffect(() => {
    if (!selectedRowData?.schedule_id) {
      clearSelectedRowData();
    }
  }, [selectedRowData, clearSelectedRowData]);

  // If Ramadan flag is disabled and user is on Ramadan tab, redirect to Policy
  useEffect(() => {
    if (!isRamadanEnabled && currentPage === "ramadan-schedule") {
      setCurrentPage("policy-schedule");
    }
  }, [isRamadanEnabled, currentPage]);

  // Build pages array
  const pages = [];
  
  pages.push({
    title: "Normal",
    state_route: "normal-schedule",
    disable: false,
    component: <NormalForm SetPage={setCurrentPage} />,
  });

  // Only add Ramadan tab if the flag is enabled
  if (isRamadanEnabled) {
    pages.push({
      title: "Ramadan",
      state_route: "ramadan-schedule",
      disable: false,
      component: <RamadanForm SetPage={setCurrentPage} />,
    });
  }

  // Always add Policy tab at the end
  pages.push({
    title: "Policy",
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