"use client";
import React from 'react';
import { TeamAttendanceDataProvider } from './TeamAttendanceDataProvider';
import EmployeeCard from './EmployeeCard';
import LeaveAnalyticsCard from './LeaveAnalyticsCard';
import ViolationsCard from './ViolationsCard';
import WeeklyViolationSummary from './WeeklyViolationSummary';
import WeeklyReportCard from './TeamReportCard';
import TeamReportCard from './TeamReportCard';

function TeamAttendancePage() {
    return (
        <TeamAttendanceDataProvider>
            <div className='flex flex-col gap-4'>
                {/* Employee Attendance Section */}
                <div className="widget-group-1 flex justify-between gap-4">
                    <div className="card-widget w-full h-auto flex flex-col gap-4">
                        <EmployeeCard />
                    </div>
                </div>
                
                {/* Weekly Violations + Leave Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-4 items-stretch">
                    <WeeklyViolationSummary />
                    <LeaveAnalyticsCard />
                </div>

                {/* Violations Section */}
                <div className="widget-group-3 flex justify-between gap-4">
                    <div className="card-widget max-w-[100%] w-full h-auto flex flex-col gap-4">
                        <ViolationsCard />
                    </div>
                </div>

                <TeamReportCard />
            </div>
        </TeamAttendanceDataProvider>
    );
}

export default TeamAttendancePage;