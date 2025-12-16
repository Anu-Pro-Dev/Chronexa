"use client";
import React from "react";
import { AttendanceDataProvider } from "../my-attendance/AttendanceData";
import LeaveCard from "./LeaveCard";
import LeaveAnalyticsCard from "./LeaveAnalyticsCard";
import ViolationsCard from "./ViolationsCard";
import WorkTrendsCard from "./WorkTrendsCard";
import ScheduleCard from "./ScheduleCard";
import InsightsCard from "./InsightsCard";

function MyAttendancePage() {
  return (
    <AttendanceDataProvider>
      <div className="space-y-4">
        {/* Mobile & Tablet Layout (< 1024px) */}
        <div className="3xl:hidden space-y-4">
          {/* Widget Group 1 */}
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="w-full md:max-w-[calc(100vh/3*4)] h-auto flex flex-col gap-4">
              <LeaveCard />
              <LeaveAnalyticsCard />
            </div>
            <div className="w-full md:max-w-[calc(100vh/1*4)] h-auto flex flex-col gap-4">
              {/* <TimerCard /> */}
              <ViolationsCard />
              <ScheduleCard />
            </div>
          </div>

          {/* Widget Group 2 */}
          <div className="flex justify-between gap-4">
            <div className="w-full h-auto flex flex-col gap-4">
              <WorkTrendsCard />
              <InsightsCard />
            </div>
          </div>
        </div>

        {/* Desktop Layout (≥ 1024px) */}
        <div className="hidden 3xl:block space-y-4">
          {/* Row 1: 3 Columns - LeaveCard | ViolationsCard | ScheduleCard + InsightsCard */}
          <div className="grid grid-cols-3 gap-4 auto-rows-fr">
            <div className="w-full min-h-full">
              <LeaveCard />
            </div>
            <div className="w-full min-h-full">
              <ViolationsCard />
            </div>
            <div className="w-full min-h-full flex flex-col gap-4">
              <div className="flex-1">
                <ScheduleCard />
              </div>
              <div className="flex-1">
                <InsightsCard />
              </div>
            </div>
          </div>

          {/* Row 2: 2 Columns - LeaveAnalyticsCard | WorkTrendsCard */}
          <div className="grid grid-cols-2 gap-4">
            <div className="w-full">
              <LeaveAnalyticsCard />
            </div>
            <div className="w-full">
              <WorkTrendsCard />
            </div>
          </div>
        </div>
      </div>
    </AttendanceDataProvider>
  );
}

export default MyAttendancePage;