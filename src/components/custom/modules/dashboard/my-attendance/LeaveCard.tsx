"use client";
import React, { useState } from 'react';
import { LeaveCardData } from './LeaveCardData';
import { LeaveCardHeader } from './LeaveCardHeader';

function LeaveCard() {
    const [page, setPage] = useState("Leaves");

    return (
        <div className='shadow-card rounded-[10px] bg-accent p-2'>
            <LeaveCardHeader page={page} setPage={setPage} />
            <LeaveCardData page={page} />
        </div>
    );
}

export default LeaveCard;