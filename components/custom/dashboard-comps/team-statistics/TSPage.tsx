"use client";

import React from 'react';
import EmployeeCard from './EmployeeCard';
import TeamAnalyticsCard from './TeamAnalyticsCard';
import LeaveAnalyticsCard from './LeaveAnalyticsCard';
import VoilationCard from './VoilationCard';

function TeamStatisticsPage() {
    const [tab, setTab] = React.useState<string>("");

    return (
        <>
            <div className="widget-group-1 flex justify-between mx-6 gap-4">
                <div className="card-widget max-w-[calc(100vh / 3 * 4)] w-full h-auto flex flex-1">
                    <EmployeeCard/>
                </div>
                <div className='card-widget max-w-[calc(100vh / 1 * 4)] w-full h-auto'>
                    <TeamAnalyticsCard/>
                </div>
            </div>
            <div className="widget-group-2 flex justify-between mx-6 gap-4 my-4">
                <div className='card-widget max-w-[50%] w-full h-auto flex flex-col gap-4'>
                    <LeaveAnalyticsCard/>
                </div>
                <div className="card-widget max-w-[50%] w-full h-auto flex flex-col gap-4">
                    <VoilationCard/>
                </div>
            </div>
        </>
    );
}

export default TeamStatisticsPage;