"use client";
import PowerHeader from "@/src/components/custom/power-comps/power-header";

import React from "react";

import { useLanguage } from "@/src/providers/LanguageProvider";
import Reprocess from "@/src/components/custom/modules/configuration/Reprocess";
export default function Page() {
  const { modules } = useLanguage();
  return (
    <div className="flex flex-col gap-4">
      <PowerHeader disableFeatures items={modules?.configuration?.items} />
      <Reprocess />
    </div>
  );
}
