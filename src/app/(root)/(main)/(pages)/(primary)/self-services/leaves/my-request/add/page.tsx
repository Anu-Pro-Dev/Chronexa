"use client";
import PowerHeader from "@/src/components/custom/power-comps/power-header"
import AddLeaveApplication from "@/src/components/custom/modules/self-services/AddLeaveApplication";
import React, { useState, useEffect } from "react"
import { useLanguage } from "@/src/providers/LanguageProvider"
import { InlineLoading } from "@/src/app/loading";

export default function Page() {
  const { modules } = useLanguage()
  const [editData, setEditData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedData = sessionStorage.getItem('editLeaveRequestData')
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData)
        setEditData(parsedData)
        sessionStorage.removeItem('editLeaveRequestData')
      } catch (error) {
        console.error("Error parsing edit data:", error)
      }
    }
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return <InlineLoading message="Loading..." />
  }

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader items={modules?.selfServices.items} disableFeatures />
      <AddLeaveApplication selectedRowData={editData} />
    </div>
  )
}