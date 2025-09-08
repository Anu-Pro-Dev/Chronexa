"use client";
import PowerHeader from "@/src/components/custom/power-comps/power-header"
import React, { useState } from "react"
import { useLanguage } from "@/src/providers/LanguageProvider"
import AddLeaveTypes from "@/src/components/custom/modules/self-services/AddLeaveTypes";

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