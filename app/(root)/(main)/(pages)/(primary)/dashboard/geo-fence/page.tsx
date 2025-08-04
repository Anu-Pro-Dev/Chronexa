"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import React from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import Geolocation from "@/components/custom/dashboard-comps/geo-fence/Geolocation";

export default function Page() {
  const { modules } = useLanguage();

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        disableAdd
        disableDelete
        disableSearch
        items={modules?.dashboard.items}
      />
      <div>
        <Geolocation />
      </div>
    </div>
  );
}
