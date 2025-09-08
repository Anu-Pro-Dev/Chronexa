"use client";
import React, { useState } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import { useLanguage } from "@/src/providers/LanguageProvider";
import AddWeeklySchedule from "@/src/components/custom/modules/scheduling/AddWeeklySchedule";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";

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
