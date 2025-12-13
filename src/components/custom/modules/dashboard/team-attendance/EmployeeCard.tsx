"use client";
import React from 'react';
import { TeamAttendanceDataProvider } from "./TeamAttendanceDataProvider";
import EmployeeCardData from './EmployeeCardData';
import { EmployeeCardHeader } from './EmployeeCardHeader';

function EmployeeCard() {
    return (
        <div className='shadow-card rounded-[10px] bg-accent p-2'>
           <TeamAttendanceDataProvider>
                <EmployeeCardHeader />
                <EmployeeCardData />
            </TeamAttendanceDataProvider>
        </div>
    );
}

export default EmployeeCard;
