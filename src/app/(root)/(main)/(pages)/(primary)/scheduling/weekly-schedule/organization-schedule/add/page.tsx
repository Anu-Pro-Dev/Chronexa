"use client";
import React, { useEffect } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import { useLanguage } from "@/src/providers/LanguageProvider";
import AddOrganizationSchedule from "@/src/components/custom/modules/scheduling/AddOrganizationSchedule";
import { useQueryClient } from "@tanstack/react-query";
import { useOrgScheduleEditStore } from "@/src/store/useOrgScheduleEditStore";

export default function OrgScheduleAddPage() {  
  const { modules } = useLanguage();
  const queryClient = useQueryClient();
  const clearSelectedRowData = useOrgScheduleEditStore((state) => state.clearSelectedRowData);
  const selectedRowData = useOrgScheduleEditStore((state) => state.selectedRowData);

  useEffect(() => {
    if (!selectedRowData?.id) {
      clearSelectedRowData();
    }
  }, [selectedRowData, clearSelectedRowData]);

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
        <AddOrganizationSchedule 
          selectedRowData={null}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}