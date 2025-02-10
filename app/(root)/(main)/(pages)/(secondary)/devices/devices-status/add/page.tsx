"use client";
import AutoPathMapper from "@/components/custom/auto-path-mapper";
import PowerHeader from "@/components/custom/power-comps/power-header";
import AddDevicesStatus from "@/forms/devices/AddDevicesStatus";

import React from "react";

import { useLanguage } from "@/providers/LanguageProvider";
export default function Page() {
  const { modules } = useLanguage();
  return (
    <div>
      <PowerHeader
        items={modules?.devices.items}
        disableFeatures
        isAddNewPagePath="/devices/devices-status/add"
      />

      <div className="pt-4">
        <AddDevicesStatus />
      </div>
    </div>
  );
}
