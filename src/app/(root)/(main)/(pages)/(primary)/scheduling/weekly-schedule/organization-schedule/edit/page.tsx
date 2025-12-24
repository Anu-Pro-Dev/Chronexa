"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import { useLanguage } from "@/src/providers/LanguageProvider";
import AddOrganizationSchedule from "@/src/components/custom/modules/scheduling/AddOrganizationSchedule";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useOrgScheduleEditStore } from "@/src/store/useOrgScheduleEditStore";
import { getOrgScheduleByID } from "@/src/lib/apiHandler";
import { InlineLoading } from "@/src/app/loading";

export default function OrgScheduleEditPage() {  
  const { modules } = useLanguage();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const clearSelectedRowData = useOrgScheduleEditStore((state) => state.clearSelectedRowData);
  const storedSelectedRowData = useOrgScheduleEditStore((state) => state.selectedRowData);
  
  const id = searchParams.get("id");

  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ["organizationSchedule", id],
    queryFn: () => getOrgScheduleByID(Number(id)),
    enabled: !!id,
  });

  let selectedRowData = null;
  
  if (storedSelectedRowData?.id) {
    selectedRowData = storedSelectedRowData;
  } else if (apiData) {
    if (apiData.data) {
      selectedRowData = {
        id: apiData.data.organization_schedule_id,
        organization_schedule_id: apiData.data.organization_schedule_id,
        organization_id: apiData.data.organization_id,
        schedule_id: apiData.data.schedule_id,
        from_date: apiData.data.from_date,
        to_date: apiData.data.to_date,
        monday_schedule_id: apiData.data.monday_schedule_id,
        tuesday_schedule_id: apiData.data.tuesday_schedule_id,
        wednesday_schedule_id: apiData.data.wednesday_schedule_id,
        thursday_schedule_id: apiData.data.thursday_schedule_id,
        friday_schedule_id: apiData.data.friday_schedule_id,
        saturday_schedule_id: apiData.data.saturday_schedule_id,
        sunday_schedule_id: apiData.data.sunday_schedule_id,
      };
    } else if (apiData.organization_schedule_id) {
      selectedRowData = {
        id: apiData.organization_schedule_id,
        organization_schedule_id: apiData.organization_schedule_id,
        organization_id: apiData.organization_id,
        schedule_id: apiData.schedule_id,
        from_date: apiData.from_date,
        to_date: apiData.to_date,
        monday_schedule_id: apiData.monday_schedule_id,
        tuesday_schedule_id: apiData.tuesday_schedule_id,
        wednesday_schedule_id: apiData.wednesday_schedule_id,
        thursday_schedule_id: apiData.thursday_schedule_id,
        friday_schedule_id: apiData.friday_schedule_id,
        saturday_schedule_id: apiData.saturday_schedule_id,
        sunday_schedule_id: apiData.sunday_schedule_id,
      };
    }
  }

  useEffect(() => {
    return () => {
      clearSelectedRowData();
    };
  }, [clearSelectedRowData]);

  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ["organizationSchedule"] });
  };

  if (error) {
    console.error("Error loading data:", error);
    return (
      <div>
        <PowerHeader
          items={modules?.scheduling.items}
          disableFeatures
        />
        <div className="pt-4 flex justify-center items-center p-8">
          <p className="text-destructive-100">Error loading data. Please try again.</p>
        </div>
      </div>
    );
  }

  if (isLoading && !storedSelectedRowData?.id) {
    return (
      <div>
        <PowerHeader
          items={modules?.scheduling.items}
          disableFeatures
        />
        <div className="pt-4 flex justify-center items-center p-8">
          <InlineLoading message="Loading Schedule data..." />
        </div>
      </div>
    );
  }

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