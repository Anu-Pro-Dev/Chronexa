'use client';
import React, { useEffect, useState } from 'react';
import TypesTab from "./TypesTab";
import ApplicationTab from "./ApplicationTab";
import ApprovalTab from "./ApprovalTab";
function TabAction({ setTab, tab }: { setTab: any, tab: any }) {

    const [currentTab, setCurrentTab] = useState<string>('Types');

    const tabs = [
        { name: 'Types', content: <TypesTab/> },
        { name: 'Application', content: <ApplicationTab/> },
        { name: "Approval", content: <ApprovalTab/> },
    ];

    const handleTabChange = (tab: string) => {
        setCurrentTab(tab);
    }

    return (
        <div className="bg-foreground rounded-[20px] mx-6 p-6 pb-0">
            <header className='mb-6'>
                <h1 className='text-primary font-bold text-xl'>Permission {currentTab}</h1>
                <p className='text-text-secondary font-regular text-sm'>Permission <span className='lowercase'>{currentTab}</span>  can be viewed in this tab</p>
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