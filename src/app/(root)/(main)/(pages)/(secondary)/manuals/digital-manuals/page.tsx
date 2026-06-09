"use client";
import React from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import { useLanguage } from "@/src/providers/LanguageProvider";

export default function Page() {
  const { modules, translations } = useLanguage();
  const t = translations?.modules?.manuals || {};

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader disableFeatures items={modules?.manuals?.items} />
      <div className="flex flex-col items-center justify-center min-h-[400px] text-text-secondary">
        <p className="text-lg">{t.digital_manuals || "Digital Manuals"} content will be displayed here</p>
      </div>
    </div>
  );
}
