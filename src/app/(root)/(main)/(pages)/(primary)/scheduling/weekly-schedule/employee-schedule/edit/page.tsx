"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import { useLanguage } from "@/src/providers/LanguageProvider";
import AddEmployeeSchedule from "@/src/components/custom/modules/scheduling/AddEmployeeSchedule";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useEmpScheduleEditStore } from "@/src/stores/empScheduleEditStore";
import { getEmpScheduleByID } from "@/src/lib/apiHandler";
import { InlineLoading } from "@/src/app/loading";

export default function EmpScheduleEditPage() {  
  const { modules } = useLanguage();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const clearSelectedRowData = useEmpScheduleEditStore((state) => state.clearSelectedRowData);
  const storedSelectedRowData = useEmpScheduleEditStore((state) => state.selectedRowData);
  
  const id = searchParams.get("id");

  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ["employeeSchedule", id],
    queryFn: () => getEmpScheduleByID(Number(id)),
    enabled: !!id,
  });

  let selectedRowData = null;
  
  if (storedSelectedRowData?.id) {
    selectedRowData = storedSelectedRowData;
  } else if (apiData) {
    if (apiData.data) {
      selectedRowData = {
        id: apiData.data.employee_schedule_id,
        employee_schedule_id: apiData.data.employee_schedule_id,
        employee_id: apiData.data.employee_id,
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
    } else if (apiData.employee_schedule_id) {
      selectedRowData = {
        id: apiData.employee_schedule_id,
        employee_schedule_id: apiData.employee_schedule_id,
        employee_id: apiData.employee_id,
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
    queryClient.invalidateQueries({ queryKey: ["employeeSchedule"] });
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
        <AddEmployeeSchedule 
          selectedRowData={selectedRowData}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}