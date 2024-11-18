"use client";
import React, { useEffect, useState } from 'react';
import PersonalTab from "./PersonalTab";
import BusinessTab from "./BusinessTab";
import FlagsTab from "./FlagsTab";
import CustomButton from '@/components/ui/CustomButton';

let currIndex = 0;

function AddButtonAction({ setTab, tab }: { setTab: any, tab: any }) {
    const tabs = [
        { name: 'Personal', content: <PersonalTab onValidityChange={(isValid: boolean) => handleValidityChange('Personal', isValid)} /> },
        { name: 'Business', content: <BusinessTab onValidityChange={(isValid: boolean) => handleValidityChange('Business', isValid)} /> },
        { name: 'Flags', content: <FlagsTab /> },
    ];

    const [currentTab, setCurrentTab] = useState<string>(tabs[currIndex].name);
    const [formValidity, setFormValidity] = useState({
        Personal: false,
        Business: false,
        Flags: false,
    });

    const handleValidityChange = (tabName: string, isValid: boolean) => {
        setFormValidity(prevState => {
            // Only update state if validity has changed
            if (prevState[tabName as keyof typeof prevState] !== isValid) {
                return { ...prevState, [tabName]: isValid };
            }
            return prevState;
        });
    };

    const handleEmployeesAddClose = () => {
        setTab(tab.replace("#add", ""));
    };

    const handleNextClick = () => {
        const currentIndex = tabs.findIndex(t => t.name === currentTab);
        currIndex = currentIndex + 1;

        if (currentIndex < tabs.length - 1 && formValidity[currentTab as keyof typeof formValidity]) {
            setCurrentTab(tabs[currentIndex + 1].name);
        } else if (!formValidity[currentTab as keyof typeof formValidity]) {
            alert('Please complete the form before moving to the next step.');
        }
    };

    return (
        <div className="bg-foreground rounded-[20px] mx-6 p-6 pb-0">
            <header className='mb-6'>
                <h1 className='text-primary font-bold text-xl'>{currentTab}</h1>
                <p className='text-text-secondary font-regular text-sm'>Enter the <span className='lowercase'>{currentTab}</span> information for the process</p>
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
                        >
                            {tab.name}
                        </div>
                    ))}
                </div>
                <div className="tab-content py-8">
                    {tabs.find((tab) => tab.name === currentTab)?.content}
                    <div className='w-full flex gap-5 justify-end mt-6'>
                        <CustomButton
                            variant="outline"
                            borderRadius="full"
                            width="145px"
                            height="45px"
                            onClick={handleEmployeesAddClose}
                            btnText='Cancel'
                        />
                        
                        <CustomButton
                            variant="primary"
                            borderRadius="full"
                            width="145px"
                            height="45px"
                            onClick={currIndex !== 2 ? handleNextClick : handleEmployeesAddClose}
                            btnText={currIndex === 2 ? "Save" : "Next"}
                            disabled={currIndex === 2 ? false : !formValidity[currentTab as keyof typeof formValidity]}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddButtonAction;
