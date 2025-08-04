"use client";
import React from "react";
import LeaveCard from "./LeaveCard";
import TimerCard from "./TimerCard";
import LeaveAnalyticsCard from "./LeaveAnalyticsCard";
import ViolationsCard from "./ViolationsCard";
import WorkTrendsCard from "./WorkTrendsCard";
import ScheduleCard from "./ScheduleCard";
import InsightsCard from "./InsightsCard";

function MyAttendancePage() {
  return (
    <>
      <div className="widget-group-1 flex justify-between gap-4">
        <div className="card-widget max-w-[calc(100vh / 3 * 4)] w-full h-auto flex flex-col gap-4">
          <LeaveCard />
          <LeaveAnalyticsCard />
        </div>
        <div className="card-widget max-w-[calc(100vh / 1 * 4)] w-full h-auto flex flex-col gap-4">
          <TimerCard />
          <ViolationsCard />
        </div>
      </div>
      <div className="widget-group-2 flex justify-between gap-4">
        <div className="card-widget w-full h-auto flex flex-col gap-4">
          <WorkTrendsCard />
        </div>
        <div className="card-widget max-w-[35%] w-full h-auto flex flex-col gap-4">
          <ScheduleCard />
          <InsightsCard />
        </div>
      </div>
    </>
  );
}

export default MyAttendancePage;
