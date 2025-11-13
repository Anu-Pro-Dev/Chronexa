"use client";
import React, { useEffect } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import { useLanguage } from "@/src/providers/LanguageProvider";
import AddEmployeeSchedule from "@/src/components/custom/modules/scheduling/AddEmployeeSchedule";
import { useQueryClient } from "@tanstack/react-query";
import { useEmpScheduleEditStore } from "@/src/stores/empScheduleEditStore";

export default function EmpScheduleAddPage() {  
  const { modules } = useLanguage();
  const queryClient = useQueryClient();
  const clearSelectedRowData = useEmpScheduleEditStore((state) => state.clearSelectedRowData);
  const selectedRowData = useEmpScheduleEditStore((state) => state.selectedRowData);

  useEffect(() => {
    if (!selectedRowData?.id) {
      clearSelectedRowData();
    }
  }, [selectedRowData, clearSelectedRowData]);

  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ["employeeSchedule"] });
  };

  return (
    <div>
      <PowerHeader
        items={modules?.scheduling.items}
        disableFeatures
      />
      <div className="pt-4">
        <AddEmployeeSchedule 
          selectedRowData={null}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}