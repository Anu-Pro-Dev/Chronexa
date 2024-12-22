'use client';
import React, { useState, useEffect } from 'react';
import Image from "next/legacy/image";
import { PunchInIcon, PunchOutIcon } from '@/lib/svg/icons';

function TimerCard() {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        // Start the timer
        const interval = setInterval(() => {
            setSeconds((prev) => prev + 1);
        }, 1000);

        // Cleanup the interval on component unmount
        return () => clearInterval(interval);
    }, []);

    // Calculate hours, minutes, and seconds
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return(
        <div className='shadow-card relative rounded-[10px] bg-gradient-to-bl from-[#0078D4] to-[#003E6E] text-white p-4 flex flex-col items-center'>
            <Image
                src="/clock-bg.svg"
                alt="Clock Your Hours"
                objectFit="cover"
                layout="fill"
                style={{position: 'absolute'}}
                className='blur-[2px]'
            />
            <h5 className='text-base font-bold'>Clock your hours</h5>
            <p className='text-[35px] font-bold align-center py-4'>
                {hours.toString().padStart(2, "0")}:
                {minutes.toString().padStart(2, "0")}:
                {remainingSeconds.toString().padStart(2, "0")}
            </p>
            <div className='flex gap-8'>
                <div className='flex text-center items-center flex-col rounded-[10px] bg-[rgba(255,255,255,0.15)] border border-[rgba(255,255,255,0.23)] text-xs px-4 py-2'>
                    <p className='font-semibold pb-1'>Remaining</p>
                    <p className='text-[13px] font-bold'>
                        04:36
                    </p>
                </div>
                <div className='flex text-center items-center flex-col rounded-[10px] bg-[rgba(255,255,255,0.15)] border border-[rgba(255,255,255,0.23)] text-xs px-4 py-2'>
                    <p className='font-semibold pb-1'>Overtime</p>
                    <p className='text-[13px] font-bold'>00:00</p>
                </div>
                <div className='flex text-center items-center flex-col rounded-[10px] bg-[rgba(255,255,255,0.15)] border border-[rgba(255,255,255,0.23)] text-xs px-4 py-2'>
                    <p className='font-semibold pb-1'>Break Time</p>
                    <p className='text-[13px] font-bold'>00:30</p>
                </div>
            </div>
            <div className='w-full pt-5 flex justify-between'>
                <div className='flex items-center gap-2 font-bold text-xs'>
                    {PunchInIcon()}
                    <p>07:30AM</p>
                </div>
                <div className='flex items-center gap-2 font-bold text-xs'>
                    {PunchOutIcon()}
                    <p>_ _ : _ _</p>
                </div>
            </div>
        </div>
    )
}

export default TimerCard;