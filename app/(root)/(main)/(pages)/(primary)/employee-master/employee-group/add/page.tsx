"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
// import AddUserGroups from "@/forms/employee-master/AddUserGroups";

import React, { useState } from "react";

import { useLanguage } from "@/providers/LanguageProvider";
export default function Page() {
  const { modules } = useLanguage();
  const [Data, SetData] = useState<any>([]);

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader items={modules?.employeeMaster.items} disableFeatures />
      {/* <AddUserGroups /> */}
    </div>
  );
}
