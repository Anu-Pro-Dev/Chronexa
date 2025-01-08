"use client";
import AutoPathMapper from "@/components/custom/auto-path-mapper";
import PowerHeader from "@/components/custom/power-comps/power-header";
import AddReaderDevices from "@/forms/devices/AddReaderDevices";

import React from "react";

import { useLanguage } from "@/providers/LanguageProvider";
export default function Page() {
  const { modules } = useLanguage();
  return (
    <div>
      <PowerHeader
        items={modules?.devices.items}
        disableFeatures
        isAddNewPagePath="/devices/readers/add"
      />

      <div className="pt-4">
        <AddReaderDevices />
      </div>
    </div>
  );
}
