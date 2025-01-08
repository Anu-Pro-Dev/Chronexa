"use client";

import PowerHeader from "@/components/custom/power-comps/power-header";
import { ScheduleSettings } from "@/components/custom/schedule-times/schedule-settings";
import { useLanguage } from "@/providers/LanguageProvider";

export default function Page() {
  const { modules } = useLanguage();
  return (
    <div className="">
      <PowerHeader items={modules?.taMaster.items} disableFeatures />
      <ScheduleSettings
        onSubmit={(data: any) => {
          console.log("Form submitted:", data);
        }}
        onCancel={() => {
          console.log("Form cancelled");
        }}
      />
    </div>
  );
}
