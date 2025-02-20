"use client";
import PowerHeader from "@/components/custom/power-comps/power-header"
import PowerTable from "@/components/custom/power-comps/power-table"
import AddEmployeeGroup from "@/forms/employee-master/AddEmployeeGroup"
import React, { useState } from "react"
import { useLanguage } from "@/providers/LanguageProvider"
import AddLeaveTypes from "@/forms/self-services/AddLeaveTypes";

export default function Page() {
  const { modules } = useLanguage()
  const [Data, SetData] = useState<any>([])

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader items={modules?.selfServices.items} disableFeatures />
      <AddLeaveTypes />
    </div>
  )
}