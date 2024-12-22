"use client";

import PowerHeader from "@/components/custom/power-comps/power-header";


import React from "react";

import { useLanguage } from "@/providers/LanguageProvider";
import AddAnnoucement from "@/forms/settings/AddAnnoucement";
export default function Page() {
  const { modules } = useLanguage();
  return (
    <div>
      <PowerHeader items={modules?.settings?.items} disableFeatures />

      <div className="pt-4">
        <AddAnnoucement />
      </div>
    </div>
  );
}
