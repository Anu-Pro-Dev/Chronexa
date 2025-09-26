"use client";

import PowerHeader from "@/src/components/custom/power-comps/power-header";
import React from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import dynamic from "next/dynamic";

const Geolocation = dynamic(() => import("@/src/components/custom/modules/dashboard/geo-fence/Geolocation"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center relative">
      <div className="w-full" style={{ height: "500px", width: "100%" }}>
        <div className="h-full w-full bg-gray-200 flex items-center justify-center rounded-lg">
          <p>Loading geolocation...</p>
        </div>
      </div>
    </div>
  ),
});

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
