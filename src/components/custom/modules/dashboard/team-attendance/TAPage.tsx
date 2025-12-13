"use client";
import React from 'react';
import { TeamAttendanceDataProvider } from './TeamAttendanceDataProvider';
import EmployeeCard from './EmployeeCard';
import LeaveAnalyticsCard from './LeaveAnalyticsCard';
import ViolationsCard from './ViolationsCard';

function TeamAttendancePage() {

    return (
        <TeamAttendanceDataProvider>
            <div className='flex flex-col gap-4'>
                <div className="widget-group-1 flex justify-between gap-4">
                    <div className="card-widget w-full h-auto flex flex-col gap-4">
                        <EmployeeCard />
                    </div>
                </div>
                <div className="widget-group-2 flex justify-between gap-4">
                    <div className='card-widget max-w-[50%] w-full h-auto flex flex-col gap-4'>
                        <LeaveAnalyticsCard/>
                    </div>
                    <div className="card-widget max-w-[50%] w-full h-auto flex flex-col gap-4">
                        <ViolationsCard/>
                    </div>
                </div>
            </div>
        </TeamAttendanceDataProvider>
    );
}

export default TeamAttendancePage;