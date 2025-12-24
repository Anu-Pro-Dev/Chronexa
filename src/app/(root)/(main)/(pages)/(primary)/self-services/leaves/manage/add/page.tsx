"use client";
import PowerHeader from "@/src/components/custom/power-comps/power-header"
import AddLeaveTypes from "@/src/components/custom/modules/self-services/AddLeaveTypes";
import React, { useState, useEffect } from "react"
import { useLanguage } from "@/src/providers/LanguageProvider"
import { InlineLoading } from "@/src/app/loading";

export default function Page() {
  const { modules } = useLanguage()
  const [editData, setEditData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedData = sessionStorage.getItem('editLeavesData')
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData)
        setEditData(parsedData)
        sessionStorage.removeItem('editLeavesData')
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
      <AddLeaveTypes selectedRowData={editData} />
    </div>
  )
}