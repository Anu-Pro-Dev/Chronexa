'use client';
import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/Checkbox';

function FlagsTab() {

    return (
        <div>
            <div className='flex justify-evenly gap-20'>
                <div className='flex flex-col items-start'>
                    <div className='py-2.5 flex text-left flex-row gap-3 items-center'>
                        <Checkbox
                            className='table-checkbox outline-none border-[2.4px] border-border-grey w-4 h-4 flex  justify-center items-center p-[0.45rem]'
                        />
                        <div className='font-semibold text-sm text-text-primary'>
                            Active
                        </div>
                    </div>
                    <div className='py-2.5 flex text-left flex-row gap-3 items-center'>
                        <Checkbox
                            className='table-checkbox outline-none border-[2.4px] border-border-grey w-4 h-4 flex  justify-center items-center p-[0.45rem]'
                        />
                        <div className='font-semibold text-sm text-text-primary'>
                            Punch
                        </div>
                    </div>
                    <div className='py-2.5 flex text-left flex-row gap-3 items-center'>
                        <Checkbox
                            className='table-checkbox outline-none border-[2.4px] border-border-grey w-4 h-4 flex  justify-center items-center p-[0.45rem]'
                        />
                        <div className='font-semibold text-sm text-text-primary'>
                            Overtime
                        </div>
                    </div>
                    <div className='py-2.5 flex text-left flex-row gap-3 items-center'>
                        <Checkbox
                            className='table-checkbox outline-none border-[2.4px] border-border-grey w-4 h-4 flex  justify-center items-center p-[0.45rem]'
                        />
                        <div className='font-semibold text-sm text-text-primary'>
                            Inpayroll
                        </div>
                    </div>
                    <div className='py-2.5 flex text-left flex-row gap-3 items-center'>
                        <Checkbox
                            className='table-checkbox outline-none border-[2.4px] border-border-grey w-4 h-4 flex  justify-center items-center p-[0.45rem]'
                        />
                        <div className='font-semibold text-sm text-text-primary'>
                            Email Notification
                        </div>
                    </div>
                    <div className='py-2.5 flex text-left flex-row gap-3 items-center'>
                        <Checkbox
                            className='table-checkbox outline-none border-[2.4px] border-border-grey w-4 h-4 flex  justify-center items-center p-[0.45rem]'
                        />
                        <div className='font-semibold text-sm text-text-primary'>
                            Open Shift
                        </div>
                    </div>
                    <div className='py-2.5 flex text-left flex-row gap-3 items-center'>
                        <Checkbox
                            className='table-checkbox outline-none border-[2.4px] border-border-grey w-4 h-4 flex  justify-center items-center p-[0.45rem]'
                        />
                        <div className='font-semibold text-sm text-text-primary'>
                            Calculate Monthly Missed Hours
                        </div>
                    </div>
                </div>
                <div className='flex flex-col items-start'>
                    <div className='py-2.5 flex text-left flex-row gap-3 items-center'>
                        <Checkbox
                            className='table-checkbox outline-none border-[2.4px] border-border-grey w-4 h-4 flex  justify-center items-center p-[0.45rem]'
                        />
                        <div className='font-semibold text-sm text-text-primary'>
                            	Exclude from Integration
                        </div>
                    </div>
                    <div className='py-2.5 flex text-left flex-row gap-3 items-center'>
                        <Checkbox
                            className='table-checkbox outline-none border-[2.4px] border-border-grey w-4 h-4 flex  justify-center items-center p-[0.45rem]'
                        />
                        <div className='font-semibold text-sm text-text-primary'>
                            Shift
                        </div>
                    </div>
                    <div className='py-2.5 flex text-left flex-row gap-3 items-center'>
                        <Checkbox
                            className='table-checkbox outline-none border-[2.4px] border-border-grey w-4 h-4 flex  justify-center items-center p-[0.45rem]'
                        />
                        <div className='font-semibold text-sm text-text-primary'>
                            On Report
                        </div>
                    </div>
                    <div className='py-2.5 flex text-left flex-row gap-3 items-center'>
                        <Checkbox
                            className='table-checkbox outline-none border-[2.4px] border-border-grey w-4 h-4 flex  justify-center items-center p-[0.45rem]'
                        />
                        <div className='font-semibold text-sm text-text-primary'>
                            Share Roster
                        </div>
                    </div>
                    <div className='py-2.5 flex text-left flex-row gap-3 items-center'>
                        <Checkbox
                            className='table-checkbox outline-none border-[2.4px] border-border-grey w-4 h-4 flex  justify-center items-center p-[0.45rem]'
                        />
                        <div className='font-semibold text-sm text-text-primary'>
                            Include in Email Notifications
                        </div>
                    </div>
                    <div className='py-2.5 flex text-left flex-row gap-3 items-center'>
                        <Checkbox
                            className='table-checkbox outline-none border-[2.4px] border-border-grey w-4 h-4 flex  justify-center items-center p-[0.45rem]'
                        />
                        <div className='font-semibold text-sm text-text-primary'>
                            Web Punch
                        </div>
                    </div>
                    <div className='py-2.5 flex text-left flex-row gap-3 items-center'>
                        <Checkbox
                            className='table-checkbox outline-none border-[2.4px] border-border-grey w-4 h-4 flex  justify-center items-center p-[0.45rem]'
                        />
                        <div className='font-semibold text-sm text-text-primary'>
                            Check In / Out Selfie
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 

export default FlagsTab
