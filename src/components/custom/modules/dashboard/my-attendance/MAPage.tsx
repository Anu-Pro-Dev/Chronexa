"use client";
import React, { Suspense } from "react";
import { AttendanceDataProvider } from "../my-attendance/AttendanceData";
import LeaveCard from "./LeaveCard";
import LeaveAnalyticsCard from "./LeaveAnalyticsCard";
import ViolationsCard from "./ViolationsCard";
import WorkTrendsCard from "./WorkTrendsCard";
import ScheduleCard from "./ScheduleCard";
import InsightsCard from "./InsightsCard";
import { InlineLoading } from "@/src/app/loading";

function MyAttendancePage() {
  return (
    <AttendanceDataProvider>
      <Suspense fallback={<InlineLoading message="Loading dashboard..." />}>
        <div className="space-y-4">
          {/* Mobile / Tablet */}
          <div className="3xl:hidden space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="w-full md:max-w-[calc(100vh/3*4)] h-auto flex flex-col gap-4">
                <LeaveCard />
                <LeaveAnalyticsCard />
              </div>
              <div className="w-full md:max-w-[calc(100vh/1*4)] h-auto flex flex-col gap-4">
                <ViolationsCard />
                <ScheduleCard />
              </div>
            </div>
            <div className="flex justify-between gap-4">
              <div className="w-full h-auto flex flex-col gap-4">
                <WorkTrendsCard />
                <InsightsCard />
              </div>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden 3xl:block space-y-4">
            <div className="grid grid-cols-3 gap-4 auto-rows-fr">
              <div className="w-full min-h-full">
                <LeaveCard />
              </div>
              <div className="w-full min-h-full">
                <ViolationsCard />
              </div>
              <div className="w-full min-h-full flex flex-col gap-4">
                <ScheduleCard />
                <InsightsCard />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <LeaveAnalyticsCard />
              <WorkTrendsCard />
            </div>
          </div>
        </div>
      </Suspense>
    </AttendanceDataProvider>
  );
}

export default MyAttendancePage;
