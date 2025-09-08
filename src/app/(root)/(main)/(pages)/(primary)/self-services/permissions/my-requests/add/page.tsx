
"use client";
import PowerHeader from "@/src/components/custom/power-comps/power-header"
import PowerTable from "@/src/components/custom/power-comps/power-table"
import AddEmployeeGroup from "@/src/components/custom/modules/employee-master/AddEmployeeGroup"
import React, { useState } from "react"
import { useLanguage } from "@/src/providers/LanguageProvider"
import AddPermissionApplication from "@/src/components/custom/modules/self-services/AddPermissionApplication";


export default function Page() {
  const { modules } = useLanguage()
  const [Data, SetData] = useState<any>([])

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader items={modules?.selfServices.items} disableFeatures />
      <AddPermissionApplication />
    </div>
  )
}