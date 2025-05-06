"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";

import React from "react";

import { useLanguage } from "@/providers/LanguageProvider";
import Reprocess from "@/forms/configuration/Reprocess";
export default function Page() {
  const { modules } = useLanguage();
  return (
    <div className="flex flex-col gap-4">
      <PowerHeader disableFeatures items={modules?.configuration?.items} />
      <Reprocess />
    </div>
  );
}
