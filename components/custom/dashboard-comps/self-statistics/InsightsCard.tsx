'use client';
import React from 'react';
import Link from 'next/link';

function InsightsCard() {
    return(
        <div className='shadow-card rounded-[10px] bg-white p-6'>
            <div className='flex flex-row justify-between'>
                <h5 className='text-lg text-text-primary font-bold'>Important</h5>
                <Link href="/settings" className='text-primary text-sm font-medium flex items-center justify-center gap-1'>
                    Show all
                </Link>
            </div> 
            <div className='shadow-searchbar bg-transparent py-2 mt-2 flex gap-4 items-center'>
                <div className="w-12 h-12 rounded-full bg-backdrop flex justify-center items-center">
                    <div className="text-primary font-semibold text-sm">HR</div>
                </div>
                <div className='h-12 w-auto flex flex-col justify-evenly'>
                    <p className='text-sm font-bold text-text-primary'>You're leave request has been</p>
                    <p className='text-xs font-medium text-text-secondary'>02:10PM | 05 Dec 2024</p>
                </div>
            </div>
        </div>
    )
}

export default InsightsCard;