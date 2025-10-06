"use client";
import React, { useState, useEffect } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import { useLanguage } from "@/src/providers/LanguageProvider";
import AddOrganizationSchedule from "@/src/components/custom/modules/scheduling/AddOrganizationSchedule";
import { useQueryClient } from "@tanstack/react-query";

export default function Page({ mode, id }: { mode: "add" | "edit"; id?: string | null }) {  
  const { modules } = useLanguage();
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Get data from sessionStorage
    const storedData = sessionStorage.getItem('editOrgSchedule');
    if (storedData) {
      setSelectedRowData(JSON.parse(storedData));
      // Clear after reading
      sessionStorage.removeItem('editOrgSchedule');
    }
  }, []);

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
            selectedRowData={selectedRowData}
            onSave={handleSave}
        />
      </div>
    </div>
  );
}