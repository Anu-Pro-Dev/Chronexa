'use client';
import React, { useEffect, useState } from 'react';
import VerificationTab from "./VerificationTab";
import PendingTab from "./PendingTab";

function TabAction({currentTab, setCurrentTab }: { currentTab: string, setCurrentTab: any }) {

    
    const tabs = [
        { name: 'Verification', content: <VerificationTab/> },
        { name: 'Pending', content: <PendingTab/> },
    ];

    const handleTabChange = (tab: string) => {
        setCurrentTab(tab);
    }

    return (
        <div className="bg-foreground rounded-[20px] mx-6 p-6 pb-0">
            <header className='mb-6'>
                <h1 className='text-primary font-bold text-xl'>{currentTab} Approval</h1>
                <p className='text-text-secondary font-regular text-sm'><span className='capitalize'>{currentTab}</span> approval can be viewed in this tab</p>
            </header>
            <div className='tab-container'>
                <div className="tab-headers flex gap-20 border-b border-border-accent">
                    {tabs.map((tab, index) => (
                        <div key={index}
                            className={`tab-header cursor-pointer text-base relative py-3 px-2
                                ${currentTab === tab.name
                                    ? 'font-semibold text-primary after:content-[""] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[3px] after:rounded-full after:bg-primary'
                                    : 'text-secondary font-semibold'
                                }`}
                        onClick={() => handleTabChange(tab.name)}
                        >
                            {tab.name}
                        </div>
                    ))}
                </div>
                <div className="tab-content py-8">
                    {tabs.find((tab) => tab.name === currentTab)?.content}
                </div>
            </div>
        </div>
    )
} 

export default TabAction