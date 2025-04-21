"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import { PolicyForm } from "./policy-form";
import { FormType, ScheduleSettingsProps } from "./types";
import { ScheduleForm } from "./schedule-form";

const defaultNormalData = {
  organization: "",
  scheduleTimes: "",
  code: "",
  color: "#9D50DD",
  timeEntries: [
    {
      inTime: "",
      outTime: "",
      requiredWorkHours: "",
      openShift: false,
      nightShift: false,
    },
    {
      inTime: "",
      outTime: "",
      requiredWorkHours: "",
      openShift: false,
      nightShift: false,
    },
    {
      inTime: "",
      outTime: "",
      requiredWorkHours: "",
      openShift: false,
      nightShift: false,
    },
  ],
  graceInMinutes: 0,
  graceOutMinutes: 0,
  flexibleMinutes: 0,
};

const defaultPolicyData = {
  showOnReport: "first-in-last-out",
  emailNotification: "first-in-last-out",
  calculateWorkedHours: false,
  enableDefaultOvertime: false,
  enableDefaultBreakHours: false,
  overrideScheduleOnHoliday: false,
  reduceRequiredHours: false,
};

export function ScheduleSettings({
  initialData,
  onSubmit,
  onCancel,
}: ScheduleSettingsProps) {
  const [activeTab, setActiveTab] = React.useState<FormType>("normal");
  const [formData, setFormData] = React.useState<any>({
    normal: initialData?.normal || defaultNormalData,
    ramadan: initialData?.ramadan || defaultNormalData,
    policy: initialData?.policy || defaultPolicyData,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-accent p-6 rounded-2xl">
      <div>
        <h2 className="font-bold text-xl text-primary">Schedule settings</h2>
        <p className="font-semibold text-sm text-text-secondary">
          Select the information for employee schedule
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as FormType)}
      >
        <TabsList className="">
          <TabsTrigger value="normal" className="border-none">Normal</TabsTrigger>
          <TabsTrigger value="ramadan" className="border-none">Ramadan</TabsTrigger>
          <TabsTrigger value="policy" className="border-none">Policy</TabsTrigger>
        </TabsList>
      
        <TabsContent value="normal">
          <ScheduleForm
            data={formData.normal}
            onChange={(data) => setFormData({ ...formData, normal: data })}
          />
        </TabsContent>

        <TabsContent value="ramadan">
          <ScheduleForm
            data={formData.ramadan}
            onChange={(data) => setFormData({ ...formData, ramadan: data })}
          />
        </TabsContent>

        <TabsContent value="policy">
          <PolicyForm
            data={formData.policy}
            onChange={(data) => setFormData({ ...formData, policy: data })}
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
