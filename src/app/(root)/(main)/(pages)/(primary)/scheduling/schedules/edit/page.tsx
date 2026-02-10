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
import { useScheduleEditStore } from "@/src/store/useScheduleEditStore";
import { getScheduleByID } from "@/src/lib/apiHandler";
import { InlineLoading } from "@/src/app/loading";

export default function ScheduleEditPage() {
  const { modules, translations } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { form, selectedRowData } = useScheduleForm();
  const { clearSelectedRowData, setSelectedRowData } = useScheduleEditStore();
  const [currentPage, setCurrentPage] = useState<string>("normal-schedule");
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const t = translations?.modules?.scheduling || {};

  const mode = "edit";
  const id = searchParams.get("id");

  const isRamadanEnabled = form.watch("ramadan_flag");

  useEffect(() => {
    const fetchScheduleData = async () => {
      if (mode === "edit" && id) {
        setIsLoadingSchedule(true);
        try {
          const res = await getScheduleByID(Number(id));
          const schedule = res?.data;

          if (schedule) {
            let scheduleData = { ...schedule };

            if (schedule.ramadan_flag && schedule.ramadan_schedule) {

              const ramadanSchedule = schedule.ramadan_schedule;

              scheduleData = {
                ...scheduleData,
                ramadan_in_time: ramadanSchedule.in_time,
                ramadan_out_time: ramadanSchedule.out_time,
                ramadan_required_work_hours: ramadanSchedule.required_work_hours,
                ramadan_flexible_min: ramadanSchedule.flexible_min,
                ramadan_grace_in_min: ramadanSchedule.grace_in_min,
                ramadan_grace_out_min: ramadanSchedule.grace_out_min,
              };
            }
            setSelectedRowData(scheduleData);
          }
        } catch (error) {
          console.error('Error fetching schedule:', error);
        } finally {
          setIsLoadingSchedule(false);
        }
      }
    };

    fetchScheduleData();
  }, [mode, id, setSelectedRowData]);

  useEffect(() => {
    return () => {
      clearSelectedRowData();
    };
  }, [clearSelectedRowData]);

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

  if (isLoadingSchedule) {
    return (
      <div className="flex flex-col gap-4">
        <PowerHeader items={modules?.scheduling.items} disableFeatures />
        <div className="pt-4 flex justify-center items-center p-8">
          <InlineLoading message="Loading Schedule data..." />
        </div>
      </div>
    );
  }

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