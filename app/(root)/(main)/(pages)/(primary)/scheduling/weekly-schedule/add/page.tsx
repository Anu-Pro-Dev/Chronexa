"use client";
import React, { useState } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import { useLanguage } from "@/providers/LanguageProvider";
import AddWeeklySchedule from "@/forms/scheduling/AddWeeklySchedule";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/hooks/useFetchAllEntity";

export default function Page() {
  const { modules } = useLanguage();
  const [Data, SetData] = useState<any>([]);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const queryClient = useQueryClient();

  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ["organizationSchedule"] });
  };

  return (
    <div>
      <PowerHeader
        items={modules?.scheduling.items}
        disableFeatures
      />
      <div className="pt-4">
        <AddWeeklySchedule 
            selectedRowData={selectedRowData}
            onSave={handleSave}
        />
      </div>
      {/* </div> */}
    </div>
  );
}
