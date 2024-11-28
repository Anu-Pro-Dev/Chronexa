"use client";
import AutoPathMapper from "@/components/custom/auto-path-mapper";
import PowerHeader from "@/components/custom/power-comps/power-header";
import AddReaderDevices from "@/forms/AddReaderDevices";
import { devices } from "@/lib/routes";
import React from "react";

export default function Page() {
  return (
    <div>
      <PowerHeader
        items={devices.items}
        disableFeatures
        isAddNewPagePath="/devices/readers/add"
      />

      <AddReaderDevices />
    </div>
  );
}
