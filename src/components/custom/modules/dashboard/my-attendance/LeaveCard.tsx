"use client";
import React, { useState } from 'react';
import LeaveCardData from './LeaveCardData';
import { LeaveCardHeader } from './LeaveCardHeader';

function LeaveCard() {
    const [page, setPage] = useState<"Leaves" | "Permissions">("Leaves");

    return (
        <div className='shadow-card rounded-[10px] bg-accent p-2 h-full flex flex-col justify-between'>
            <LeaveCardHeader page={page} setPage={setPage} />
            <LeaveCardData page={page} />
        </div>
    );
}

export default LeaveCard;