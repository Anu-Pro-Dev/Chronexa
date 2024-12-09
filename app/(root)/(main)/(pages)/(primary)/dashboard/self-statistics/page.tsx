"use client";
import ClockYourHours from "@/components/custom/dashboard-elements/ClockYourHours";
import LeaveAnalytics from "@/components/custom/dashboard-elements/LeaveAnalytics";
import LeavesAndAttendance from "@/components/custom/dashboard-elements/LeavesAndAttendance";
import Schedule from "@/components/custom/dashboard-elements/Schedule";
import TimeOffSights from "@/components/custom/dashboard-elements/TimeOffSights";
import Violations from "@/components/custom/dashboard-elements/Violations";
import WorkTrends from "@/components/custom/dashboard-elements/WorkTrends";
import PowerHeader from "@/components/custom/power-comps/power-header";
import { CalendarIcon } from "@/icons/icons";
import { useLanguage } from "@/providers/LanguageProvider";
import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const { modules } = useLanguage();
  const [LeaveAndAttendanceElements, SetLeaveAndAttendance] = useState<any>([]);

  useEffect(() => {
    SetLeaveAndAttendance([
      {
        label: "Working Days",
        icon: <CalendarIcon color="#0078D4" />,
        value: "212",
      },
      {
        label: "Total leaves",
        icon: <CalendarIcon color="#0078D4" />,
        value: "09",
      },
      {
        label: "Leaves Taken",
        icon: <CalendarIcon color="#0078D4" />,
        value: "06",
      },
      {
        label: "Leaves Absent",
        icon: <CalendarIcon color="#0078D4" />,
        value: "03",
      },
      {
        label: "Approved leaves",
        icon: <CalendarIcon color="#0078D4" />,
        value: "02",
      },
      {
        label: "Pending leaves",
        icon: <CalendarIcon color="#0078D4" />,
        value: "01",
      },
    ]);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <PowerHeader
          disableAdd
          disableDelete
          disableSearch
          items={modules?.dashboard.items}
        />
      </div>
      <div className="grid grid-cols-12  gap-10">
        <div className="col-span-7 flex flex-col gap-4">
          <LeavesAndAttendance data={LeaveAndAttendanceElements} />
          <LeaveAnalytics />
        </div>
        <div className="col-span-4 flex flex-col gap-4">
          <ClockYourHours />
          <Violations />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-10">
        <WorkTrends />
        <Schedule />
      </div>
      <div className="grid grid-cols-2 gap-10">
        <LeaveAnalytics />
        <TimeOffSights />
      </div>
    </div>
  );
}
